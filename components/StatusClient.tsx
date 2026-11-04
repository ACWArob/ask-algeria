"use client";

import { useCallback, useEffect, useState } from "react";
import { fmt, type Locale } from "@/lib/i18n";
import type { StatusStrings } from "@/lib/i18n-status";
import type { CheckResult, InsideResult, StatusPayload } from "@/lib/portal-status";
import { ExternalIcon } from "./Icon";

export interface PortalView {
  id: string;
  name: string;
  url: string;
  host: string;
  purpose: string;
  inside: InsideResult;
  /** Already formatted for the locale; "" when the tester has no result yet. */
  insideDate: string;
}

type Tone = "ok" | "bad" | "neutral";

const TONE: Record<Tone, string> = {
  ok: "bg-brand-soft text-brand",
  bad: "border border-alert/50 text-alert",
  neutral: "border border-line text-muted",
};

/** Shape + text carry the meaning; colour only repeats it. */
function Mark({ tone }: { tone: Tone | "lock" }) {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {tone === "ok" && <path d="M3.5 8.5l3 3 6-7" />}
      {tone === "bad" && <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />}
      {tone === "neutral" && <><path d="M6 6.2a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9v.5" /><path d="M8 12h.01" /></>}
      {tone === "lock" && <><rect x="3.5" y="7" width="9" height="6.5" rx="1.2" /><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" /></>}
    </svg>
  );
}

function Pill({ tone, icon, children }: { tone: Tone; icon?: "lock"; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold ${TONE[tone]}`}>
      <Mark tone={icon ?? tone} />
      {children}
    </span>
  );
}

function clock(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tag = locale === "en" ? "en-GB" : locale === "fr" ? "fr-FR" : "ar-DZ";
  try {
    return new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", numberingSystem: "latn" }).format(d);
  } catch {
    return d.toISOString().slice(11, 16);
  }
}

function reason(r: CheckResult, t: StatusStrings, timeoutS: number): string {
  if (r.error === "timeout") return fmt(t.reasonTimeout, { s: timeoutS });
  if (r.error === "dns") return t.reasonDns;
  if (r.error === "tls") return t.reasonTls;
  if (r.error === "network") return t.reasonNetwork;
  if (r.code === 403 || r.code === 451) return fmt(t.reasonBlocked, { code: r.code });
  if (r.code && r.code >= 500) return fmt(t.reasonServer, { code: r.code });
  return r.code ? fmt(t.reasonHttp, { code: r.code }) : t.reasonNetwork;
}

type Load = { state: "loading" } | { state: "error"; rateLimited: boolean } | { state: "ok" };

export function StatusClient({
  t,
  locale,
  portals,
  ttlMs,
  timeoutS,
}: {
  t: StatusStrings;
  locale: Locale;
  portals: PortalView[];
  ttlMs: number;
  timeoutS: number;
}) {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [load, setLoad] = useState<Load>({ state: "loading" });

  const refresh = useCallback(async () => {
    setLoad({ state: "loading" });
    try {
      // The server answers from its 10-minute cache, so pressing "Check now" never hammers the portals.
      const res = await fetch("/api/status", { cache: "no-store" });
      if (!res.ok) {
        setLoad({ state: "error", rateLimited: res.status === 429 });
        return;
      }
      const body = (await res.json()) as StatusPayload;
      if (!body || !Array.isArray(body.results)) throw new Error("bad payload");
      setData(body);
      setLoad({ state: "ok" });
    } catch {
      setLoad({ state: "error", rateLimited: false });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const byId = new Map((data?.results ?? []).map((r) => [r.id, r]));
  const time = data ? clock(data.checkedAt, locale) : "";
  const next = data ? clock(new Date(Date.parse(data.checkedAt) + ttlMs).toISOString(), locale) : "";
  const upCount = data ? portals.filter((p) => byId.get(p.id)?.outside === "up").length : 0;
  const loading = load.state === "loading";

  const insidePill = (p: PortalView) => {
    if (p.inside === "works") return <Pill tone="ok">{t.insideWorks}</Pill>;
    if (p.inside === "not_working") return <Pill tone="bad">{t.insideNotWorking}</Pill>;
    if (p.inside === "login_only") return <Pill tone="neutral" icon="lock">{t.insideLogin}</Pill>;
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2">
        <Pill tone="neutral">{t.insideUnknown}</Pill>
        <span className="text-sm text-muted">{t.notTested}</span>
      </span>
    );
  };

  const outsidePill = (p: PortalView) => {
    const r = byId.get(p.id);
    if (!r) return <Pill tone="neutral">{loading ? t.checking : t.insideUnknown}</Pill>;
    if (r.outside === "up") {
      return (
        <span className="inline-flex flex-wrap items-center gap-x-2">
          <Pill tone="ok">{t.up}</Pill>
          {r.ms != null && <span className="text-sm text-muted">{fmt(t.responseTime, { ms: r.ms })}</span>}
        </span>
      );
    }
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2">
        <Pill tone="bad">{t.notReachable}</Pill>
        <span className="text-sm text-muted">{reason(r, t, timeoutS)}</span>
      </span>
    );
  };

  return (
    <section aria-labelledby="h-portals">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-2">
        <h2 id="h-portals" className="display text-2xl font-semibold">{t.listTitle}</h2>
        <button type="button" className="btn-quiet !min-h-[40px] text-sm" onClick={() => void refresh()} disabled={loading} aria-busy={loading}>
          {loading ? t.checking : t.checkNow}
        </button>
      </div>

      <div className="mt-3 space-y-1 text-[0.9375rem]" role="status" aria-live="polite">
        {load.state === "error" && <p className="font-semibold text-alert">{load.rateLimited ? t.rateLimited : t.checkFailed}</p>}
        {data && (
          <>
            <p className="font-semibold">{fmt(t.summary, { up: upCount, n: portals.length })}</p>
            <p className="text-sm text-muted">{fmt(t.lastChecked, { time, next })}</p>
          </>
        )}
      </div>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {portals.map((p) => (
          <li key={p.id} id={`portal-${p.id}`} className="rounded-2xl border border-line bg-paper p-4 sm:p-5">
            <h3 className="font-semibold leading-snug">
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1" dir="auto">
                {p.name}
                <ExternalIcon />
                <span className="sr-only">({t.opensNew})</span>
              </a>
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted" dir="ltr">{p.host}</p>
            <p className="mt-2 text-[0.9375rem] text-muted">{p.purpose}</p>

            <dl className="mt-3 divide-y divide-line/70">
              <div className="py-2">
                <dt className="text-sm text-muted">{time ? fmt(t.outsideLabel, { time }) : t.outsideLabelPending}</dt>
                <dd className="mt-1">{outsidePill(p)}</dd>
              </div>
              <div className="py-2">
                <dt className="text-sm text-muted">{p.insideDate ? fmt(t.insideLabel, { date: p.insideDate }) : t.insideLabelNoDate}</dt>
                <dd className="mt-1">{insidePill(p)}</dd>
              </div>
            </dl>

            <details className="group mt-2 border-t border-line/70 pt-2">
              <summary className="flex min-h-[40px] cursor-pointer list-none items-center gap-2 text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.5 6L8 10.5 12.5 6" />
                </svg>
                {t.tipsTitle}
              </summary>
              <ul className="mt-2 space-y-2 text-[0.9375rem]">
                {t.tips.map((tip) => (
                  <li key={tip} className="flex gap-3">
                    <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    <p>{tip}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted">{t.tipsNote}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
