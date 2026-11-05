import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalIcon } from "@/components/Icon";
import { corpusById } from "@/lib/corpus";
import { formatDate } from "@/lib/dates";
import { GUIDES } from "@/lib/guides";
import { fmt, getDict, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { MISSION_STRINGS, topicLabel } from "@/lib/i18n-mission";
import { localCity, localHours, localNote } from "@/lib/mission-i18n";
import { findMission, groupByTopic, hasLaissezPasser, missionBadge, missionNotes, missionRecords, toPageLink } from "@/lib/mission-page";
import { missionCountry, missionName, parsePhone, safeUrl } from "@/lib/missions";

// Rendered per request so the page follows the visitor's language cookie.
export const dynamic = "force-dynamic";

const GUIDE_SLUGS = ["passport", "consular-registration", "birth-12s"];

const BADGE_STYLE: Record<string, string> = {
  verified: "bg-brand-soft text-brand",
  archived: "border border-line text-ink",
  "website-only": "border border-line text-muted",
  unverified: "border border-accent/60 text-muted",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const m = findMission((await params).id);
  if (!m) return {};
  const locale = await getLocale();
  const name = missionName(m, locale);
  const city = localCity(m.city, locale);
  // Embassies are named after the country, so the tab title adds the city.
  return { title: city && !name.includes(city) ? `${name} (${city})` : name };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-x-4 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <dt className="text-sm text-muted sm:text-[0.9375rem]">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const m = findMission((await params).id);
  if (!m) notFound();

  const locale: Locale = await getLocale();
  const dict = getDict(locale);
  const e = dict.embassies;
  const s = MISSION_STRINGS[locale];
  const types = e.types as Record<string, string>;
  const sortTag = locale === "ar" || locale === "dz" ? "ar" : locale;

  const badge = missionBadge(m);
  const unverified = badge === "unverified";
  const { faxNote, note } = missionNotes(m);
  const website = safeUrl(m.website);
  const appointment = unverified ? "" : safeUrl(m.appointment_url);
  const sourceUrl = safeUrl(m.source_url);
  const phones = unverified ? [] : m.phones.map(parsePhone);
  const emails = unverified ? [] : m.emails;
  const hasContact = !unverified && Boolean(m.address || phones.length || emails.length || m.hours || m.jurisdiction);

  const records = missionRecords(m, corpusById().values());
  const groups = groupByTopic(records.map(toPageLink), sortTag);
  const laissezPasser = hasLaissezPasser(records);

  const name = missionName(m, locale);
  const altName = locale === "ar" || locale === "dz" ? m.name_fr : "";
  const country = missionCountry(m, locale);
  const tips = [
    s.tipRegistered,
    s.tipEarly,
    s.tipOnePerson,
    s.tipConfirmation,
    phones.length || emails.length ? s.tipContact : s.tipContactMfa,
    ...(laissezPasser ? [s.tipUrgent] : []),
  ];

  return (
    <div className="pt-8 sm:pt-12">
      <Link href="/embassies" className="link inline-flex min-h-[40px] items-center text-sm">{s.back}</Link>

      <header className="mt-4">
        <h1 className="display text-4xl font-semibold sm:text-5xl">{name}</h1>
        {altName && <p className="mt-2 text-lg text-muted"><bdi>{altName}</bdi></p>}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.9375rem]">
          <span className="text-muted">
            <bdi>{localCity(m.city, locale)}</bdi>{locale === "ar" || locale === "dz" ? "، " : ", "}<bdi>{country}</bdi>
          </span>
          <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-brand-ink">{types[m.type] ?? m.type}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_STYLE[badge]}`}>{s.status[badge]}</span>
        </div>
        {sourceUrl && m.checked && (
          <p className="mt-3 text-sm text-muted">
            {fmt(s.checked, { date: formatDate(m.checked, locale) })}
            {" · "}
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="link">
              {s.source}
            </a>
          </p>
        )}
        {appointment && (
          <div className="mt-6">
            <a href={appointment} target="_blank" rel="noopener noreferrer" className="btn-primary">
              {s.book}
              <ExternalIcon />
              <span className="sr-only">({dict.services.opensNew})</span>
            </a>
            <p className="mt-2 text-sm text-muted">{s.bookHint}</p>
          </div>
        )}
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,44rem)_1fr]">
        <div className="space-y-12">
          <section aria-labelledby="h-contact">
            <h2 id="h-contact" className="display text-2xl font-semibold">{s.contactTitle}</h2>
            {unverified ? (
              <p className="mt-4 rounded-xl border border-line border-s-4 border-s-accent/70 px-4 py-3 text-[0.9375rem] text-muted">
                {e.unverified}{" "}
                <a href="https://www.mfa.gov.dz" target="_blank" rel="noopener noreferrer" className="link font-semibold">
                  {e.mfa}
                </a>
              </p>
            ) : hasContact ? (
              <dl className="mt-4 divide-y divide-line/70 border-y border-line/70">
                {m.address && <Row label={e.address}><bdi>{m.address}</bdi></Row>}
                {phones.length > 0 && (
                  <Row label={e.phone}>
                    <ul className="space-y-0.5">
                      {phones.map((p, i) => (
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
                    {faxNote && <p className="mt-1 text-xs text-muted">{e.faxNote}</p>}
                  </Row>
                )}
                {emails.length > 0 && (
                  <Row label={e.email}>
                    <ul className="space-y-0.5">
                      {emails.map((x) => (
                        <li key={x}><a href={`mailto:${x}`} className="link [overflow-wrap:anywhere]"><bdi dir="ltr">{x}</bdi></a></li>
                      ))}
                    </ul>
                  </Row>
                )}
                {m.hours && <Row label={e.hours}><bdi>{localHours(m.hours, locale)}</bdi></Row>}
                {m.jurisdiction && <Row label={s.jurisdiction}><bdi>{m.jurisdiction}</bdi></Row>}
                {note && <Row label={e.note}><bdi className="text-muted">{localNote(note, locale)}</bdi></Row>}
              </dl>
            ) : (
              <p className="mt-4 text-[0.9375rem] text-muted">{s.websiteOnly}</p>
            )}
            {(website || appointment) && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem]">
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-[40px] items-center gap-1 font-semibold">
                    {e.website} <ExternalIcon />
                  </a>
                )}
                {appointment && (
                  <a href={appointment} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-[40px] items-center gap-1 font-semibold">
                    {s.book} <ExternalIcon />
                  </a>
                )}
              </div>
            )}
          </section>

          <section aria-labelledby="h-pages">
            <h2 id="h-pages" className="display text-2xl font-semibold">{s.pagesTitle}</h2>
            {groups.length === 0 ? (
              <p className="mt-4 text-muted">{s.pagesEmpty}</p>
            ) : (
              <>
                <p className="mt-2 max-w-prose text-muted">{s.pagesLead}</p>
                <div className="mt-6 space-y-8">
                  {groups.map((g) => (
                    <section key={g.topic} aria-labelledby={`t-${g.topic}`}>
                      <h3 id={`t-${g.topic}`} className="flex items-baseline gap-2 border-b border-line pb-1.5 font-semibold">
                        {topicLabel(s, g.topic)}
                        <span className="text-sm font-normal text-muted">{g.pages.length}</span>
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {g.pages.map((p) => (
                          <li key={p.id} className="text-[0.9375rem]">
                            <a href={p.url} target="_blank" rel="noopener noreferrer" className="link" dir="auto">
                              {p.title}
                            </a>
                            {p.archived && (
                              <span className="ms-2 text-xs text-muted">{fmt(s.archived, { date: formatDate(p.archived, locale) })}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="h-tips" className="rounded-3xl border border-line border-s-4 border-s-accent bg-surface p-5 sm:p-6">
            <h2 id="h-tips" className="display text-xl font-semibold">{s.tipsTitle}</h2>
            <p className="mt-1 text-sm text-muted">{s.tipsLabel}</p>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
              {tips.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          <nav aria-labelledby="h-guides" className="rounded-3xl border border-line p-5 sm:p-6">
            <h2 id="h-guides" className="display text-xl font-semibold">{s.guidesTitle}</h2>
            <ul className="mt-3 space-y-2">
              {GUIDE_SLUGS.filter((slug) => Object.hasOwn(GUIDES, slug)).map((slug) => (
                <li key={slug}>
                  <Link href={`/services/${slug}`} className="link">{GUIDES[slug].title[locale]}</Link>
                </li>
              ))}
              <li>
                <Link href="/prepare" className="link">{dict.prepare.nav}</Link>
              </li>
              <li>
                <Link href="/embassies" className="link">{s.back}</Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
