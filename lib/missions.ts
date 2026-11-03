/**
 * Algeria's diplomatic and consular missions (data/missions.json).
 * Pure module: used by the /embassies page, the US "which consulate" helper and /api/ask.
 */
import raw from "@/data/missions.json";
import type { Locale } from "@/lib/i18n";

export type MissionType = "Embassy" | "Consulate General" | "Consulate" | "Permanent Mission";
export type MissionStatus = "verified" | "website-only" | "unverified";

export interface Mission {
  id: string;
  country: string;
  country_fr: string;
  country_ar: string;
  city: string;
  type: MissionType | string;
  name_en: string;
  name_fr: string;
  website: string;
  address: string;
  phones: string[];
  emails: string[];
  hours: string;
  jurisdiction: string;
  appointment_url: string;
  source_url: string;
  checked: string;
  status: MissionStatus | string;
  alt_websites?: string[];
  extra_sources?: string[];
  note?: string;
  notes?: string;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

export const MISSIONS: Mission[] = (Array.isArray(raw) ? (raw as unknown[]) : [])
  .filter((m): m is Record<string, unknown> => !!m && typeof m === "object" && typeof (m as { id?: unknown }).id === "string")
  .map((m) => ({
    id: str(m.id),
    country: str(m.country),
    country_fr: str(m.country_fr) || str(m.country),
    country_ar: str(m.country_ar) || str(m.country),
    city: str(m.city),
    type: str(m.type) || "Embassy",
    name_en: str(m.name_en),
    name_fr: str(m.name_fr) || str(m.name_en),
    website: str(m.website),
    address: str(m.address),
    phones: list(m.phones),
    emails: list(m.emails),
    hours: str(m.hours),
    jurisdiction: str(m.jurisdiction),
    appointment_url: str(m.appointment_url),
    source_url: str(m.source_url),
    checked: str(m.checked),
    status: str(m.status) || "unverified",
    alt_websites: list(m.alt_websites),
    extra_sources: list(m.extra_sources),
    note: str(m.note) || str(m.notes) || undefined,
  }));

export const MISSION_TYPES: MissionType[] = ["Embassy", "Consulate General", "Consulate", "Permanent Mission"];

const AR_TYPE: Record<string, (m: Mission) => string> = {
  Embassy: (m) => `سفارة الجزائر في ${m.country_ar}`,
  "Consulate General": (m) => `القنصلية العامة للجزائر في ${m.city}`,
  Consulate: (m) => `قنصلية الجزائر في ${m.city}`,
  "Permanent Mission": (m) => `البعثة الدائمة للجزائر في ${m.city}`,
};

export function missionName(m: Mission, locale: Locale): string {
  if (locale === "fr") return m.name_fr || m.name_en;
  if (locale === "ar" || locale === "dz") return (AR_TYPE[m.type] ?? AR_TYPE.Embassy)(m);
  return m.name_en || m.name_fr;
}

export function missionCountry(m: Mission, locale: Locale): string {
  if (locale === "fr") return m.country_fr;
  if (locale === "ar" || locale === "dz") return m.country_ar;
  return m.country;
}

/** True when the note says the second phone number may be a fax. */
export const FAX_NOTE = /second number may be a fax/i;
/** Notes useful to a visitor (closures, appointments), as opposed to internal crawl notes. */
export const PUBLIC_NOTE = /(closed|appointment|mobile consular|rendez-vous|fermé)/i;

/** Only http(s) links reach an href. */
export function safeUrl(u: string | null | undefined): string {
  return u && /^https?:\/\//i.test(u) ? u : "";
}

/** Splits "Fax: +20 2 7366659" into a label and a dialable number. */
export function parsePhone(entry: string): { label: string | null; display: string; tel: string | null } {
  const m = /^\s*([^:+\d][^:]*):\s*(.+)$/.exec(entry);
  const label = m ? m[1].trim() : null;
  const display = (m ? m[2] : entry).trim();
  // Only the first number is dialable: "+33 1 50 74/75/77" lists several endings, and "a / b" lists two numbers.
  const first = display.split(/\s*(?:\/|;|,|\bor\b|\bou\b|أو)\s*/u)[0];
  const digits = first.replace(/(?!^\+)[^\d]/g, "");
  return { label, display, tel: digits.replace(/\D/g, "").length >= 6 ? digits : null };
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function missionHosts(m: Mission): string[] {
  return [m.website, ...(m.alt_websites ?? [])].map(hostOf).filter(Boolean);
}

/** Lowercase, no Latin accents, unified Arabic letter variants: for search in any language. */
export function foldText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

/* ───────── Chat integration ───────── */

const MISSION_WORD =
  /(embass|consul(?!t)|ambassade|consulat|سفار|قنصل|lqonsoli|l9onsoli|qonsolia|sefara|sifara)/iu;
const CONTACT_WORD =
  /(address|phone|telephone|number|call|email|e-mail|contact|hours|opening|open\b|located|location|where is|where's|how (?:do|can) i (?:reach|get to)|adresse|t[ée]l[ée]phone|num[ée]ro|horaire|heures? d'ouverture|ouvert|joindre|contacter|o[uù] (?:se trouve|est)|courriel|عنوان|العنوان|هاتف|الهاتف|رقم|تيليفون|تلفون|نمرو|أوقات|اوقات|ساعات|توقيت|أين|اين|وين|فين|بريد|إيميل|ايميل|الاتصال|نتصل|اتصل|(?<![\p{L}])win(?![\p{L}])|wach l3onwan|numero)/iu;

const WHICH_WORD = /(which|nearest|closest|quel(?:le)?|le plus proche|la plus proche|أي|اي|أقرب|اقرب|واش من|chkoun|wach men)/iu;

/** Question is about finding or contacting an embassy/consulate (address, phone, hours, where it is, which one). */
export function isMissionContactQuestion(text: string): boolean {
  return MISSION_WORD.test(text) && (CONTACT_WORD.test(text) || WHICH_WORD.test(text));
}

const wordRe = (w: string) => new RegExp(`(?<![\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "iu");

/**
 * Missions relevant to the question: the office from lib/posts (by host), else city then country names.
 * At most `limit`, best match first.
 */
// Names that are also everyday words ("a nice summary", "Jordan needs…", Arabic مالي = "my money"):
// only count them after a locative ("in Nice", "à Nice", "في مالي").
const AMBIGUOUS = new Set(["nice", "chad", "jordan", "mali", "مالي", "georgia", "lima", "gao", "kef"]);
// Checked on the unfolded text so "à Nice" counts but "a nice summary" doesn't.
const LOCATIVE = "(?:in|at|to|near|from|of|for|à|au|aux|en|de|du|des|d'|في|f|fi|fel)\\s+(?:the\\s+|la\\s+|le\\s+|l'|ال)?";
/** Does place name `w` (folded) occur in the question? `t` is folded text, `raw` the lowercased original. */
function placeIn(w: string, t: string, raw: string): boolean {
  if (!AMBIGUOUS.has(w)) return wordRe(w).test(t) || wordRe(`ال${w}`).test(t);
  const esc = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{N}])${LOCATIVE}${esc}(?![\\p{L}\\p{N}])`, "iu").test(raw);
}

function matchByPlace(text: string): Mission[] {
  const t = foldText(text);
  const raw = text.toLowerCase();
  const out: Mission[] = [];
  for (const m of MISSIONS) {
    const city = foldText(m.city.replace(/,.*$/, ""));
    if (city.length >= 3 && placeIn(city, t, raw) && !out.includes(m)) out.push(m);
  }
  if (out.length) return out;
  // Country names: keep the longest match so "Democratic Republic of the Congo" doesn't also pull in "Republic of the Congo".
  const hits: { m: Mission; name: string }[] = [];
  for (const m of MISSIONS) {
    const names = [m.country, m.country_fr, m.country_ar].map(foldText).filter((n) => n.length >= 3);
    const hit = names.filter((n) => placeIn(n, t, raw)).sort((a, b) => b.length - a.length)[0];
    if (hit) hits.push({ m, name: hit });
  }
  const kept = hits.filter((h) => !hits.some((o) => o.name !== h.name && o.name.length > h.name.length && o.name.includes(h.name)));
  // Prefer the embassy, then consulates, for a country-level question.
  return kept
    .map((h) => h.m)
    .sort((a, b) => MISSION_TYPES.indexOf(a.type as MissionType) - MISSION_TYPES.indexOf(b.type as MissionType));
}

/**
 * Missions relevant to the question: the office from lib/posts (by host), else city then country names
 * in the question, else in the earlier conversation (`context`). At most `limit`, best match first.
 */
export function matchMissions(text: string, postDomains: string[] = [], limit = 3, context = ""): Mission[] {
  const out: Mission[] = [];
  if (postDomains.length) {
    const want = new Set(postDomains.map((d) => d.replace(/^www\./, "").toLowerCase()));
    for (const m of MISSIONS) if (missionHosts(m).some((h) => want.has(h)) || want.has(`${m.id}.mfa.gov.dz`)) out.push(m);
  }
  let byPlace = matchByPlace(text);
  if (!byPlace.length && !out.length && context) byPlace = matchByPlace(context);
  for (const m of byPlace) if (!out.includes(m)) out.push(m);
  return out.slice(0, limit);
}

/** Plain-text block given to the model as a citable source. Only known fields. */
export function missionExcerpt(m: Mission): string {
  const lines = [`${m.name_en} (${m.type}), ${m.city}, ${m.country}.`];
  if (m.address) lines.push(`Address: ${m.address}`);
  if (m.phones.length) lines.push(`Phone: ${m.phones.join("; ")}`);
  if (m.note && FAX_NOTE.test(m.note)) lines.push("Note: phone numbers are unlabelled on the official page; the second number may be a fax.");
  else if (m.note && PUBLIC_NOTE.test(m.note)) lines.push(`Note: ${m.note}`);
  if (m.emails.length) lines.push(`Email: ${m.emails.join("; ")}`);
  if (m.hours) lines.push(`Opening hours: ${m.hours}`);
  if (m.jurisdiction) lines.push(`Jurisdiction: ${m.jurisdiction}`);
  if (m.appointment_url) lines.push(`Appointments: ${m.appointment_url}`);
  if (m.website) lines.push(`Website: ${m.website}`);
  if (m.status === "unverified") lines.push("Contact details for this mission have not been verified; refer the reader to https://www.mfa.gov.dz.");
  else if (m.status === "website-only") lines.push("Only the official website is known; address, phone and hours are not listed here.");
  if (m.checked) lines.push(`(Details checked ${m.checked}.)`);
  return lines.join("\n");
}

/**
 * Consulate/embassy sites that must not answer for this person: missions in other countries than theirs
 * (a US fee or postal rule is wrong in France), or every mission when they live in Algeria.
 * The Ministry's own pages (mfa.gov.dz root) stay allowed.
 */
export function foreignMissionHosts(postDomains: string[], inAlgeria = false): string[] {
  const want = new Set(postDomains.map((d) => d.replace(/^www\./, "").toLowerCase()));
  const mine = MISSIONS.find((m) => missionHosts(m).some((h) => want.has(h)) || want.has(`${m.id}.mfa.gov.dz`));
  if (!mine && !inAlgeria) return [];
  const keep = new Set(inAlgeria ? [] : MISSIONS.filter((m) => m.country === mine!.country).flatMap(missionHosts));
  for (const d of want) keep.add(d);
  return [...new Set(MISSIONS.flatMap(missionHosts))].filter((h) => !keep.has(h) && h !== "mfa.gov.dz");
}

/** Same as foreignMissionHosts, for a country named without a city ("France", "the United States"). */
export function foreignMissionHostsForCountry(country: string): string[] {
  const c = country.replace(/^the /, "");
  const keep = new Set(MISSIONS.filter((m) => m.country === c).flatMap(missionHosts));
  if (!keep.size) return [];
  return [...new Set(MISSIONS.flatMap(missionHosts))].filter((h) => !keep.has(h) && h !== "mfa.gov.dz");
}
