/**
 * "Prepare my file": which guide sections make the checklist for each procedure and situation, and the pure
 * builder that turns the person's details into a packet (checklist, cover letter, details sheet, official links).
 * Client-safe: no corpus or fs access here (see lib/prepare-data.ts for the server side).
 * Privacy: the details never leave the browser; nothing in this file does I/O.
 */

/** Who the cover letter is addressed to. "online" = no letter; the procedure is done on an official portal. */
export type OfficeKind = "consulate" | "apc" | "court" | "online";
export type LetterLang = "en" | "fr" | "ar";
export const LETTER_LANGS: LetterLang[] = ["fr", "ar", "en"];

/** Where the person lives: the Prepare page asks first and only shows the situations for that place. */
export type Place = "algeria" | "abroad";
export interface SituationConfig { id: string; sections: string[]; office: OfficeKind; place: Place | "any" }
export interface ProcedureConfig { slug: string; base: string[]; situations: SituationConfig[] }

/** Guide slugs (lib/guides) with the sections that apply to each situation. `base` sections apply to all of them. */
export const PROCEDURES: ProcedureConfig[] = [
  { slug: "passport", base: [], situations: [
    { id: "passport-algeria-first", sections: ["in-algeria"], office: "apc", place: "algeria" },
    { id: "passport-algeria-renewal", sections: ["in-algeria-renewal"], office: "apc", place: "algeria" },
    { id: "passport-first", sections: ["how", "documents"], office: "consulate", place: "abroad" },
    { id: "passport-renewal", sections: ["documents", "renewal"], office: "consulate", place: "abroad" },
    { id: "passport-minor", sections: ["documents", "minors"], office: "consulate", place: "abroad" },
    { id: "cni", sections: ["cni"], office: "online", place: "abroad" },
  ] },
  { slug: "birth-12s", base: ["what"], situations: [
    { id: "12s-abroad", sections: ["abroad"], office: "online", place: "abroad" },
    { id: "12s-born-abroad", sections: ["born-abroad"], office: "consulate", place: "abroad" },
    { id: "12s-algeria", sections: ["in-algeria"], office: "apc", place: "algeria" },
  ] },
  { slug: "criminal-record", base: ["language-fees"], situations: [
    { id: "record-online", sections: ["online"], office: "online", place: "any" },
    { id: "record-abroad", sections: ["abroad"], office: "consulate", place: "abroad" },
    { id: "record-algeria", sections: ["in-algeria"], office: "court", place: "algeria" },
  ] },
  { slug: "nationality", base: ["cases"], situations: [
    { id: "nationality-abroad", sections: ["abroad", "attestation"], office: "consulate", place: "abroad" },
    { id: "nationality-algeria", sections: ["in-algeria"], office: "court", place: "algeria" },
  ] },
  { slug: "consular-registration", base: ["who"], situations: [
    { id: "registration-first", sections: ["first"], office: "consulate", place: "abroad" },
    { id: "registration-renewal", sections: ["renewal-transfer"], office: "consulate", place: "abroad" },
    { id: "registration-ending", sections: ["ending"], office: "consulate", place: "abroad" },
  ] },
  { slug: "civil-status", base: ["why"], situations: [
    { id: "transcribe-birth", sections: ["birth"], office: "consulate", place: "abroad" },
    { id: "transcribe-marriage", sections: ["marriage"], office: "consulate", place: "abroad" },
    { id: "family-book", sections: ["family-book"], office: "consulate", place: "abroad" },
    { id: "civil-update", sections: ["changes"], office: "consulate", place: "abroad" },
  ] },
  { slug: "national-service", base: ["rule"], situations: [
    { id: "service-census", sections: ["census"], office: "consulate", place: "abroad" },
    { id: "service-deferment", sections: ["deferment"], office: "consulate", place: "abroad" },
    { id: "service-exemption", sections: ["exemption"], office: "consulate", place: "abroad" },
  ] },
];

export const PREPARE_SLUGS = PROCEDURES.map((p) => p.slug);

export const DETAIL_FIELDS = [
  "lastName", "firstName", "nameAr", "birthDate", "birthPlace", "father", "mother",
  "address", "city", "phone", "email", "office", "nin", "consularNo",
] as const;
export type DetailField = (typeof DETAIL_FIELDS)[number];
export type Details = Record<DetailField, string>;
export const OPTIONAL_FIELDS: DetailField[] = ["nameAr", "email", "nin", "consularNo"];

export function emptyDetails(): Details {
  return Object.fromEntries(DETAIL_FIELDS.map((f) => [f, ""])) as Details;
}

/** Keeps only known string fields (for values read back from localStorage). */
export function cleanDetails(v: unknown): Details {
  const d = emptyDetails();
  if (v && typeof v === "object") {
    for (const f of DETAIL_FIELDS) {
      const x = (v as Record<string, unknown>)[f];
      if (typeof x === "string") d[f] = x.slice(0, 300);
    }
  }
  return d;
}

// ───────── Data passed from the server page (built in lib/prepare-data.ts) ─────────

export interface PacketSource { n: number; title: string; url: string; domain: string }
/** `offices`: the consulate cities the point names ("four photos in London"): that office's rule, not everyone's. */
export interface PreparePoint { text: string; match: string; nums: number[]; offices?: string[] }
export interface PrepareSituation {
  id: string;
  label: string;
  office: OfficeKind;
  place: Place | "any";
  groups: { title: string; points: PreparePoint[] }[];
  sources: PacketSource[];
  /** "<guide title> — <situation>" in each letter language. */
  letterSubject: Record<LetterLang, string>;
}
export interface PrepareProcedure {
  slug: string;
  title: string;
  guideHref: string;
  portals: { label: string; url: string }[];
  situations: PrepareSituation[];
}

/** The `prepare.letter` block of one language's dictionary. */
export interface LetterText {
  heading: string;
  from: string;
  to: string;
  placeDate: string;
  subject: string;
  salutation: string;
  intro: string;
  nin: string;
  consular: string;
  enclosed: string;
  contact: string;
  closing: string;
  signature: string;
  blank: string;
  /** Independence / not-an-official-form notice, in the letter's language. */
  notice: string;
  addressee: Record<"consulate" | "apc" | "court", string>;
}

// ───────── Matching the person's office in a point ("mentions your office") ─────────

const STOP = new Set([
  "consulat", "consulate", "consulado", "general", "générale", "generale", "général", "embassy", "ambassade", "algeria",
  "algérie", "algerie", "algerian", "algérien", "algérienne", "république", "republic", "office", "bureau", "service",
  "commune", "court", "tribunal", "mairie", "apc", "daira", "daïra", "town", "city", "hall", "people's", "communal", "assembly", "section",
  "قنصلية", "القنصلية", "العامة", "سفارة", "السفارة", "الجزائر", "الجزائرية", "بلدية", "البلدية", "محكمة", "المحكمة",
]);
const WORD = /[\p{L}\p{N}'’-]+/gu;

/** Distinctive words of the office the person typed (e.g. "Consulat général à Lyon" → ["lyon"]). */
export function officeWords(office: string): string[] {
  const words = (office.toLowerCase().match(WORD) ?? []).flatMap((w) => {
    // French elision ("d'algérie" → "algérie").
    const x = w.replace(/^['’-]+|['’-]+$/g, "").replace(/^(?:l|d|j|qu|n|s|c|m|t)['’]/, "");
    // Arabic one-letter prefix ("بلندن" → also "لندن"); keep the original too ("لندن" itself starts with ل).
    const bare = x.replace(/^[بلف](?=[\u0600-\u06FF]{3,})/, "");
    return bare !== x ? [x, bare] : [x];
  });
  return [...new Set(words.filter((w) => w.length >= 3 && !STOP.has(w) && !/^\p{N}+$/u.test(w)))];
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True when `text` names one of the office words as a whole word (Unicode lookarounds, never \b). */
export function mentionsOffice(text: string, words: string[]): boolean {
  if (!words.length) return false;
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${words.map(escapeRe).join("|")})(?![\\p{L}\\p{N}])`, "iu");
  return re.test(text);
}

/** A point that names specific consulates, none of them the person's office (e.g. "London asks for four photos"). */
export function isOtherOffice(p: PreparePoint, words: string[]): boolean {
  return Boolean(p.offices?.length) && !mentionsOffice(p.match, words);
}

// ───────── The packet ─────────

export interface PacketMeta { lang: string; dir: "ltr" | "rtl" }
/** Practical "also bring" tips: our own common sense, never presented as an official requirement. */
export interface PacketExtras { title: string; note: string; items: string[] }

export interface ChecklistDoc extends PacketMeta {
  kind: "checklist"; title: string; intro: string; mineLabel: string; sourcesTitle: string;
  groups: { title: string; items: { text: string; nums: number[]; mine: boolean }[] }[];
  /** Points that only quote other consulates' rules (not the person's office), kept apart so they don't read as required. */
  others?: { title: string; note: string; items: { text: string; nums: number[] }[] };
  /** Separate, clearly labelled section after the official items (no citations). */
  extras?: PacketExtras;
  sources: PacketSource[];
}
export interface LetterDoc extends PacketMeta {
  kind: "letter"; title: string; from: string[]; fromLabel: string; to: string[]; toLabel: string;
  placeDate: string; subjectLabel: string; subject: string; salutation: string; paragraphs: string[];
  closing: string; signatureLabel: string; signatureName: string; notice: string;
}
export interface DetailsDoc extends PacketMeta {
  kind: "details"; title: string; intro: string; rows: { label: string; alt: string; value: string }[];
}
export interface LinksDoc extends PacketMeta {
  kind: "links"; title: string; intro: string; links: { label: string; url: string }[];
}
export type PacketDoc = ChecklistDoc | LetterDoc | DetailsDoc | LinksDoc;

export interface Packet {
  title: string;
  brand: string;
  independent: string;
  notOfficial: string;
  prepared: string;
  docs: PacketDoc[];
}

/** UI strings the builder needs (from `dict.prepare` + `dict.brand`/`dict.strip` of the UI language). */
export interface PacketText {
  brand: string;
  independent: string;
  notOfficial: string;
  prepared: string; // "{date}"
  docs: Record<"checklist" | "letter" | "details" | "links", string>;
  checklistIntro: string;
  mine: string;
  sources: string;
  detailsIntro: string;
  linksIntro: string;
  fields: Record<DetailField, string>;
  /** Heading and note for the points that quote specific consulates other than the person's. */
  otherOffices?: { title: string; note: string };
  /** "Also bring, just in case" tips (lib/i18n-extra.ts `prepareExtras`), in the UI language. */
  extras?: PacketExtras;
}

export interface PacketInput {
  procedure: PrepareProcedure;
  situation: PrepareSituation;
  details: Details;
  uiLang: string; // html lang of the UI ("arq" for Darija)
  uiDir: "ltr" | "rtl";
  text: PacketText;
  letterLang: LetterLang;
  letter: LetterText;
  /** Field labels in French and Arabic, the languages of Algerian official forms. */
  formLabels: { fr: Record<DetailField, string>; ar: Record<DetailField, string> };
  today: Date;
  /** Formats a date for a language tag (en, fr, ar, arq). */
  formatDate: (d: Date, lang: string) => string;
}

export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? vars[k] : `{${k}}`));
}

function isoToDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function buildPacket(i: PacketInput): Packet {
  const { details: d, text: t, letter: L, situation: s } = i;
  const v = (x: string) => x.trim();
  const ui: PacketMeta = { lang: i.uiLang, dir: i.uiDir };
  const prepared = fill(t.prepared, { date: i.formatDate(i.today, i.uiLang) });

  // 1. Checklist: only the guide's cited points for this situation; points naming the person's office go first.
  const words = officeWords(`${d.office} ${d.city}`);
  const others = s.groups.flatMap((g) => g.points.filter((p) => isOtherOffice(p, words)).map((p) => ({ text: p.text, nums: p.nums })));
  const checklist: ChecklistDoc = {
    ...ui, kind: "checklist", title: t.docs.checklist, intro: t.checklistIntro, mineLabel: t.mine, sourcesTitle: t.sources,
    groups: s.groups
      .map((g) => {
        const items = g.points
          .filter((p) => !isOtherOffice(p, words))
          .map((p) => ({ text: p.text, nums: p.nums, mine: mentionsOffice(p.match, words) }));
        return { title: g.title, items: [...items.filter((x) => x.mine), ...items.filter((x) => !x.mine)] };
      })
      .filter((g) => g.items.length),
    ...(others.length && t.otherOffices ? { others: { title: t.otherOffices.title, note: t.otherOffices.note, items: others } } : {}),
    ...(t.extras && t.extras.items.length ? { extras: { title: t.extras.title, note: t.extras.note, items: [...t.extras.items] } } : {}),
    sources: s.sources,
  };

  const docs: PacketDoc[] = [checklist];

  // 2. Cover letter (our own neutral template, not an official form). None when the procedure is online-only.
  if (s.office !== "online") {
    const blank = L.blank;
    // User-typed values go inside first-strong isolates so "+44 7700…" or a Latin name keeps its order in an Arabic letter.
    const iso = (x: string) => (x ? `\u2068${x}\u2069` : x);
    const latin = [v(d.lastName).toUpperCase(), v(d.firstName)].filter(Boolean).join(" ");
    const name = (i.letterLang === "ar" ? v(d.nameAr) || latin : latin || v(d.nameAr)) || blank;
    const birth = isoToDate(v(d.birthDate));
    const paragraphs = [
      fill(L.intro, {
        name: iso(name),
        birthDate: birth ? i.formatDate(birth, i.letterLang) : iso(v(d.birthDate)) || blank,
        birthPlace: iso(v(d.birthPlace)) || blank,
        father: iso(v(d.father)) || blank,
        mother: iso(v(d.mother)) || blank,
        address: iso(v(d.address)) || blank,
        procedure: s.letterSubject[i.letterLang],
      }),
    ];
    const ids = [v(d.nin) && fill(L.nin, { nin: iso(v(d.nin)) }), v(d.consularNo) && fill(L.consular, { number: iso(v(d.consularNo)) })].filter(Boolean);
    if (ids.length) paragraphs.push(ids.join(" "));
    paragraphs.push(L.enclosed);
    const contact = [v(d.phone), v(d.email)].filter(Boolean).map(iso).join(" · ");
    if (contact) paragraphs.push(fill(L.contact, { contact }));

    const letterDir = i.letterLang === "ar" ? "rtl" : "ltr";
    docs.push({
      kind: "letter", lang: i.letterLang, dir: letterDir, title: L.heading,
      fromLabel: L.from, from: [iso(name), iso(v(d.address)), contact].filter(Boolean),
      toLabel: L.to, to: [L.addressee[s.office], iso(v(d.office)) || blank],
      placeDate: fill(L.placeDate, { place: iso(v(d.city)) || blank, date: i.formatDate(i.today, i.letterLang) }),
      subjectLabel: L.subject, subject: s.letterSubject[i.letterLang], salutation: L.salutation, paragraphs,
      closing: L.closing, signatureLabel: L.signature, signatureName: iso(name), notice: L.notice,
    });
  }

  // 3. Details sheet to copy onto the official form (labels also in French and Arabic, the forms' languages).
  const birth = isoToDate(v(d.birthDate));
  docs.push({
    ...ui, kind: "details", title: t.docs.details, intro: t.detailsIntro,
    rows: DETAIL_FIELDS.map((f) => {
      const alt = [i.formLabels.fr[f], i.formLabels.ar[f]].filter((x) => x && x !== t.fields[f]).join(" / ");
      const value = f === "birthDate" && birth ? `${i.formatDate(birth, i.uiLang)} (${v(d.birthDate)})` : v(d[f]);
      return { label: t.fields[f], alt, value };
    }),
  });

  // 4. Official forms and portals from the guide.
  docs.push({ ...ui, kind: "links", title: t.docs.links, intro: t.linksIntro, links: i.procedure.portals });

  return {
    title: `${i.procedure.title} — ${s.label}`,
    brand: t.brand,
    independent: t.independent,
    notOfficial: t.notOfficial,
    prepared,
    docs,
  };
}
