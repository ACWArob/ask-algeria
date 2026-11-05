"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/dates";
import { fmt, type Dict, type Locale } from "@/lib/i18n";
import { ExternalIcon } from "./Icon";
import { detectMultiPostCountry, detectPost } from "@/lib/posts";

export interface MissionView {
  id: string;
  name: string;
  altName: string;
  country: string;
  city: string;
  type: string;
  unverified: boolean;
  website: string;
  address: string;
  phones: { label: string | null; display: string; tel: string | null }[];
  emails: string[];
  hours: string;
  jurisdiction: string;
  appointment: string;
  sourceUrl: string;
  checked: string;
  faxNote: boolean;
  note: string;
  haystack: string;
}

export interface CountryGroup {
  country: string;
  missions: MissionView[];
}

function fold(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/^ال(?=\S{3,})/, "");
}

const TYPE_STYLE: Record<string, string> = {
  Embassy: "bg-brand text-brand-ink",
  "Consulate General": "bg-brand-soft text-brand",
  Consulate: "border border-brand/40 text-brand",
  "Permanent Mission": "border border-line text-muted",
};

export function EmbassiesClient({
  dict,
  locale,
  groups,
  offices,
}: {
  dict: Dict;
  locale: Locale;
  groups: CountryGroup[];
  offices: Record<string, { id: string; post: string }>;
}) {
  const t = dict.embassies;
  const types = t.types as Record<string, string>;
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [where, setWhere] = useState("");
  const [highlight, setHighlight] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const n = fold(q.trim());
    return groups
      .map((g) => ({
        ...g,
        missions: g.missions.filter((m) => (type === "all" || m.type === type) && (!n || m.haystack.includes(n) || fold(g.country).includes(n))),
      }))
      .filter((g) => g.missions.length > 0);
  }, [q, type, groups]);
  const total = filtered.reduce((a, g) => a + g.missions.length, 0);

  // Any city, state or country, in any language (same rules as the chat).
  const found = useMemo(() => {
    const text = where.trim();
    if (text.length < 2) return null;
    const hit = detectPost(text);
    if (hit?.inAlgeria) return { kind: "algeria" as const };
    if (hit) {
      const office = hit.domains.map((d) => offices[d.replace(/^www\./, "")]).find(Boolean);
      return office ? { kind: "office" as const, place: text, ...office } : { kind: "unknown" as const };
    }
    const country = detectMultiPostCountry(text);
    if (country) return { kind: "city" as const };
    return { kind: "unknown" as const };
  }, [where, offices]);

  function showMission(id: string) {
    setQ("");
    setType("all");
    setHighlight(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(`m-${id}`);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      el?.focus({ preventScroll: true });
    });
  }

  return (
    <div>
      <section aria-labelledby="find-office" className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <h2 id="find-office" className="display text-lg font-semibold">{t.usTitle}</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-80">
            <label htmlFor="where" className="mb-1.5 block text-sm font-semibold">{t.usLabel}</label>
            <input
              id="where"
              type="text"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && found?.kind === "office") showMission(found.id);
              }}
              placeholder={t.usChoose}
              className="field bg-paper"
              autoComplete="off"
            />
          </div>
          {found && (
            <p className="flex-1 pb-2.5 text-[0.9375rem]" role="status">
              {found.kind === "office" && (
                <>
                  {fmt(t.usResult, { state: found.place, post: found.post })}{" "}
                  <button type="button" className="link font-semibold" onClick={() => showMission(found.id)}>
                    {t.show}
                  </button>
                </>
              )}
              {found.kind === "algeria" && t.findAlgeria}
              {found.kind === "city" && t.findCity}
              {found.kind === "unknown" && t.findUnknown}
            </p>
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <div>
          <label htmlFor="m-search" className="mb-1.5 block font-semibold">{t.search}</label>
          <input id="m-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder} className="field" dir="auto" />
        </div>
        <div>
          <label htmlFor="m-type" className="mb-1.5 block font-semibold">{t.type}</label>
          <select id="m-type" value={type} onChange={(e) => setType(e.target.value)} className="field">
            <option value="all">{t.allTypes}</option>
            {Object.keys(types).map((k) => (
              <option key={k} value={k}>{types[k]}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted" aria-live="polite">{fmt(t.count, { n: total, c: filtered.length })}</p>

      {filtered.length === 0 && <p className="mt-10 text-lg">{fmt(t.empty, { q })}</p>}

      <div className="mt-8 space-y-10">
        {filtered.map((g) => (
          <section key={g.country} aria-labelledby={`c-${g.missions[0].id}`}>
            <h2 id={`c-${g.missions[0].id}`} className="display flex items-baseline gap-3 border-b-2 border-ink pb-2 text-2xl font-semibold">
              {g.country}
              {g.missions.length > 1 && <span className="text-base font-normal text-muted">{g.missions.length}</span>}
            </h2>
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {g.missions.map((m) => (
                <li
                  key={m.id}
                  id={`m-${m.id}`}
                  tabIndex={-1}
                  className={`scroll-mt-24 rounded-2xl border bg-paper p-4 transition-shadow focus:outline-none sm:p-5 ${
                    highlight === m.id ? "border-brand shadow-[0_0_0_3px_rgb(var(--brand)/0.25)]" : "border-line"
                  }`}
                >
                  <MissionCard m={m} dict={dict} locale={locale} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-x-3 py-1.5 text-[0.9375rem] sm:grid-cols-[7.5rem_minmax(0,1fr)]">
      <dt className="text-sm text-muted sm:text-[0.9375rem]">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function MissionCard({ m, dict, locale }: { m: MissionView; dict: Dict; locale: Locale }) {
  const t = dict.embassies;
  const types = t.types as Record<string, string>;
  return (
    <article>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">
            <Link href={`/embassies/${encodeURIComponent(m.id)}`} className="underline decoration-brand/40 underline-offset-[3px] hover:text-brand hover:decoration-brand">{m.name}</Link>
          </h3>
          {m.altName && <p className="text-sm text-muted"><bdi>{m.altName}</bdi></p>}
          {!m.name.includes(m.city) && <p className="mt-0.5 text-sm text-muted"><bdi>{m.city}</bdi></p>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_STYLE[m.type] ?? TYPE_STYLE["Permanent Mission"]}`}>
          {types[m.type] ?? m.type}
        </span>
      </div>

      {m.unverified ? (
        <p className="mt-3 rounded-xl border border-line border-s-4 border-s-accent/70 px-3 py-2 text-sm text-muted">
          {t.unverified}{" "}
          <a href="https://www.mfa.gov.dz" target="_blank" rel="noopener noreferrer" className="link font-semibold">
            {t.mfa}
          </a>
          {m.website && (
            <>
              {" · "}
              <a href={m.website} target="_blank" rel="noopener noreferrer" className="link" dir="ltr">{host(m.website)}</a>
            </>
          )}
        </p>
      ) : (
        <dl className="mt-3 divide-y divide-line/70">
          {m.address && <Row label={t.address}><bdi>{m.address}</bdi></Row>}
          {m.phones.length > 0 && (
            <Row label={t.phone}>
              <ul className="space-y-0.5">
                {m.phones.map((p, i) => (
                  <li key={i}>
                    {p.label && <span className="text-muted">{p.label}: </span>}
                    {p.tel ? (
                      <a href={`tel:${p.tel}`} className="link"><bdi dir="ltr">{p.display}</bdi></a>
                    ) : (
                      <bdi dir="ltr">{p.display}</bdi>
                    )}
                  </li>
                ))}
              </ul>
              {m.faxNote && <p className="mt-1 text-xs text-muted">{t.faxNote}</p>}
            </Row>
          )}
          {m.emails.length > 0 && (
            <Row label={t.email}>
              <ul className="space-y-0.5">
                {m.emails.map((e) => (
                  <li key={e}><a href={`mailto:${e}`} className="link [overflow-wrap:anywhere]"><bdi dir="ltr">{e}</bdi></a></li>
                ))}
              </ul>
            </Row>
          )}
          {m.hours && <Row label={t.hours}><bdi>{m.hours}</bdi></Row>}
          {m.jurisdiction && <Row label={t.jurisdiction}><bdi>{m.jurisdiction}</bdi></Row>}
          {m.note && <Row label={t.note}><bdi className="text-muted">{m.note}</bdi></Row>}
        </dl>
      )}

      {(m.website || m.appointment) && !m.unverified && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {m.website && (
            <a href={m.website} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-[40px] items-center gap-1 font-semibold">
              {t.website} <ExternalIcon />
            </a>
          )}
          {m.appointment && (
            <a href={m.appointment} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-[40px] items-center gap-1 font-semibold">
              {t.appointment} <ExternalIcon />
            </a>
          )}
        </div>
      )}

      {m.sourceUrl && m.checked && (
        <p className="mt-3 text-xs text-muted">
          <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">
            {fmt(t.source, { date: formatDate(m.checked, locale) })}
          </a>
        </p>
      )}
    </article>
  );
}

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
