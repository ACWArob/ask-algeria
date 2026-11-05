import type { Metadata } from "next";
import { StatusClient, type PortalView } from "@/components/StatusClient";
import { formatDate } from "@/lib/dates";
import { fmt } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { STATUS_STRINGS } from "@/lib/i18n-status";
import { PORTALS, TIMEOUT_MS, TTL_MS } from "@/lib/portal-status";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: STATUS_STRINGS[(await getLocale())].heading };
}

export default async function StatusPage() {
  const locale = await getLocale();
  const t = STATUS_STRINGS[locale];

  const portals: PortalView[] = PORTALS.map((p) => ({
    id: p.id,
    name: p.names[locale],
    url: p.url,
    host: p.domain,
    purpose: p.purpose[locale],
    inside: p.insideAlgeria.result,
    insideDate: p.insideAlgeria.date ? formatDate(p.insideAlgeria.date, locale) : "",
  }));

  return (
    <div className="pt-10 sm:pt-14">
      <h1 className="display text-4xl font-bold sm:text-5xl">{t.heading}</h1>
      <p className="mt-4 max-w-prose text-lg text-muted">{t.sub}</p>

      <p className="mt-6 max-w-prose rounded-2xl border border-line border-s-4 border-s-accent bg-surface px-4 py-3 text-[0.9375rem]" role="note">
        {t.disclaimer}
      </p>

      <section aria-labelledby="h-how" className="mt-6 max-w-prose">
        <h2 id="h-how" className="display text-lg font-semibold">{t.howTitle}</h2>
        <ul className="mt-2 space-y-2 text-[0.9375rem]">
          <li className="flex gap-3">
            <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            <p>{fmt(t.howOutside, { s: TIMEOUT_MS / 1000, m: TTL_MS / 60_000 })}</p>
          </li>
          <li className="flex gap-3">
            <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            <p>{t.howInside}</p>
          </li>
        </ul>
      </section>

      <div className="mt-10">
        <StatusClient t={t} locale={locale} portals={portals} ttlMs={TTL_MS} timeoutS={TIMEOUT_MS / 1000} />
      </div>
    </div>
  );
}
