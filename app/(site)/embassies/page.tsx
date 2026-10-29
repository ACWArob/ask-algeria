import type { Metadata } from "next";
import { EmbassiesClient, type CountryGroup, type MissionView } from "@/components/EmbassiesClient";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { FAX_NOTE, MISSION_TYPES, PUBLIC_NOTE, safeUrl, MISSIONS, foldText, missionCountry, missionHosts, missionName, parsePhone } from "@/lib/missions";

export function generateMetadata(): Metadata {
  return { title: getDict(getLocale()).embassies.heading };
}


export default function EmbassiesPage() {
  const locale = getLocale();
  const dict = getDict(locale);
  const sortTag = locale === "ar" || locale === "dz" ? "ar" : locale;

  const views: MissionView[] = MISSIONS.map((m) => {
    const name = missionName(m, locale);
    const country = missionCountry(m, locale);
    const unverified = m.status === "unverified";
    return {
      id: m.id,
      name,
      altName: locale === "ar" || locale === "dz" ? m.name_fr : "",
      country,
      city: m.city,
      type: m.type,
      unverified,
      website: safeUrl(m.website),
      address: unverified ? "" : m.address,
      phones: unverified ? [] : m.phones.map(parsePhone),
      emails: unverified ? [] : m.emails,
      hours: unverified ? "" : m.hours,
      jurisdiction: unverified ? "" : m.jurisdiction,
      appointment: unverified ? "" : safeUrl(m.appointment_url),
      sourceUrl: safeUrl(m.source_url),
      checked: m.source_url ? m.checked : "",
      faxNote: !unverified && m.phones.length > 1 && Boolean(m.note && FAX_NOTE.test(m.note)),
      note: m.note && !FAX_NOTE.test(m.note) && PUBLIC_NOTE.test(m.note) ? m.note : "",
      haystack: foldText([m.country, m.country_fr, m.country_ar, m.city, m.name_en, m.name_fr, name].join(" ")),
    };
  });

  const byCountry = new Map<string, MissionView[]>();
  for (const v of views) {
    if (!byCountry.has(v.country)) byCountry.set(v.country, []);
    byCountry.get(v.country)!.push(v);
  }
  const typeRank = (t: string) => {
    const i = MISSION_TYPES.indexOf(t as (typeof MISSION_TYPES)[number]);
    return i === -1 ? 9 : i;
  };
  const groups: CountryGroup[] = [...byCountry.entries()]
    .map(([country, missions]) => ({
      country,
      missions: missions.sort((a, b) => typeRank(a.type) - typeRank(b.type) || a.city.localeCompare(b.city)),
    }))
    .sort((a, b) => a.country.localeCompare(b.country, sortTag));

  // Office lookup for the "which consulate covers me?" box: website host (or <id>.mfa.gov.dz) → mission.
  const offices: Record<string, { id: string; post: string }> = {};
  for (const m of MISSIONS) {
    for (const h of [...missionHosts(m), `${m.id}.mfa.gov.dz`]) offices[h] ??= { id: m.id, post: missionName(m, locale) };
  }

  return (
    <div className="pt-10 sm:pt-14">
      <h1 className="display text-4xl font-bold sm:text-5xl">{dict.embassies.heading}</h1>
      <p className="mt-4 max-w-prose text-lg text-muted">{dict.embassies.sub}</p>
      <div className="mt-10">
        <EmbassiesClient dict={dict} locale={locale} groups={groups} offices={offices} />
      </div>
    </div>
  );
}
