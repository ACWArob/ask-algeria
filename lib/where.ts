/**
 * "Where do you live?" chosen once, before searching: in Algeria → which wilaya; abroad → which country (and which
 * consulate city when the country has several). Narrows both the free search and the AI answer to that office.
 */
import type { Locale } from "@/lib/i18n";
import { detectPost, WILAYAS, type PostHint } from "@/lib/posts";
import { MISSIONS, missionHosts } from "@/lib/missions";

export type Where = { in: "dz"; wilaya: string } | { in: "abroad"; country: string; city?: string };

export interface WhereOptions {
  wilayas: { value: string; label: string }[];
  countries: { value: string; label: string; cities: string[] }[];
}

const OFFICES = MISSIONS.filter((m) => m.type !== "Permanent Mission");

/** Picker lists in the reader's language (wilaya names in Arabic for ar/dz). */
export function whereOptions(locale: Locale): WhereOptions {
  const arabic = locale === "ar" || locale === "dz";
  const coll = new Intl.Collator(arabic ? "ar" : locale);
  const byCountry = new Map<string, { label: string; cities: Set<string> }>();
  for (const m of OFFICES) {
    const label = arabic ? m.country_ar : locale === "fr" ? m.country_fr : m.country;
    const e = byCountry.get(m.country) ?? { label, cities: new Set<string>() };
    if (m.city) e.cities.add(m.city);
    byCountry.set(m.country, e);
  }
  return {
    wilayas: WILAYAS.map((w) => ({ value: w.name, label: arabic ? w.ar : w.name })),
    countries: [...byCountry.entries()]
      .map(([value, e]) => ({ value, label: e.label, cities: e.cities.size > 1 ? [...e.cities].sort(coll.compare) : [] }))
      .sort((a, b) => coll.compare(a.label, b.label)),
  };
}

/** Validates a client-sent value (never trust the browser). */
export function parseWhere(v: unknown): Where | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (o.in === "dz" && typeof o.wilaya === "string" && WILAYAS.some((w) => w.name === o.wilaya)) return { in: "dz", wilaya: o.wilaya };
  if (o.in === "abroad" && typeof o.country === "string" && OFFICES.some((m) => m.country === o.country)) {
    const city = typeof o.city === "string" && OFFICES.some((m) => m.country === o.country && m.city === o.city) ? o.city : undefined;
    return { in: "abroad", country: o.country, ...(city ? { city } : {}) };
  }
  return null;
}

/** The office that serves someone living there. */
export function resolveWhere(w: Where | null): PostHint | null {
  if (!w) return null;
  if (w.in === "dz") return detectPost(`I live in ${w.wilaya}`);
  const inCountry = OFFICES.filter((m) => m.country === w.country);
  // Known place tables first (they carry the right consulate for a city / US state), then the mission list.
  // The place tables carry the right office for a region (a US state, a French city), but a city that has its
  // own office in data/missions.json (Frankfurt, Dubai, Rome) must get that office, not the tables' nearest one.
  const own = w.city ? inCountry.find((x) => x.city === w.city) : undefined;
  const known = w.city ? detectPost(`I live in ${w.city}`) : null;
  if (known && !known.inAlgeria && (!own || own.name_en === known.post || known.domains.some((d) => missionHosts(own).includes(d)))) return known;
  // Several offices and no city: don't guess one (whereCountry still narrows to the country).
  if (!w.city && new Set(inCountry.map((x) => x.city)).size > 1) return null;
  const m =
    inCountry.find((x) => w.city && x.city === w.city) ??
    inCountry.find((x) => x.type === "Consulate General") ??
    inCountry.find((x) => x.type === "Embassy") ??
    inCountry[0];
  if (!m) return null;
  return { place: w.city ? `${w.city}, ${w.country}` : w.country, post: m.name_en, site: m.website || undefined, domains: missionHosts(m) };
}

/** Country name as the multi-post helpers spell it, for country-level narrowing when no office is known. */
export function whereCountry(w: Where | null): string | null {
  if (!w || w.in !== "abroad") return null;
  return w.country === "United States" ? "the United States" : w.country;
}
