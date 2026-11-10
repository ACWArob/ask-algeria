/**
 * Free "quick answer": the actual facts, not just links. Picks the sentences/bullets of the top official pages
 * that best cover the question (rarer words count more), keeps the person's office first, and cites each one.
 * No model call. Pure function so it can be tested.
 */
import { coversGroup, expandQuery, searchTokens } from "@/lib/synonyms";

export interface QuickPage { title: string; url: string; domain: string; text: string; office?: boolean }
export interface QuickFact { text: string; source: number }
export interface QuickAnswer { facts: QuickFact[]; sources: { n: number; title: string; url: string; domain: string }[] }

/** Lines and sentences of a page, cleaned, 40–320 characters. */
export function units(text: string): string[] {
  const out: string[] = [];
  // "Le dossier se constitue de :" followed by list lines → one unit "Le dossier se constitue de : a ; b ; c".
  const lines: string[] = [];
  let open = false;
  for (const raw of text.split(/\n+/)) {
    const bullet = /^\s*(?:[-*•·]|\d+[.)-])\s*/.test(raw);
    const line = raw.replace(/^\s*(?:[-*•·]|\d+[.)-])\s*/, "").trim();
    if (!line) continue;
    const header = /[:：]$/.test(line);
    if (open && !header && (bullet || line.length < 100) && lines[lines.length - 1].length < 650) {
      const prev = lines[lines.length - 1];
      lines[lines.length - 1] = `${prev}${/[:：]$/.test(prev) ? " " : " ; "}${line.replace(/[;.]\s*$/, "")}`;
      continue;
    }
    lines.push(line);
    open = header;
  }
  for (const line of lines) {
    const parts = line.length > 320 ? line.split(/(?<=[.!?؟])\s+(?=[\p{Lu}\p{Lo}\d"«(])/u) : [line];
    for (const p of parts) {
      const t = p.replace(/\s+/g, " ").trim();
      // A "Required documents: a; b; c" list stays whole (it is the answer), up to ~700 characters.
      const isList = /:\s/.test(t) && (t.match(/;/g) ?? []).length >= 2;
      if (t.length >= 40 && (t.length <= 320 || (isList && t.length <= 700)) && !/^(?:https?:\/\/|www\.)\S+$/.test(t)) out.push(t);
    }
  }
  return out;
}

/** Words that mark an actual fact a person can act on. */
const FACT = /\d|\$|€|£|dz?d|da\b|dinar|fee|frais|tarif|document|pièce|required|requis|must|doit|bring|fournir|appointment|rendez|online|en ligne|form|formulaire|photo|copy|copie|original|days|jours|weeks|semaines|يجب|وثيق|رسوم|موعد|نسخة|صورة|استمارة/i;

/** Is this page about the question at all (its title names one of the question's concepts)? */
/** Concepts that only qualify a question ("renew", "fees"): a page about them alone isn't about the topic. */
const GENERIC = new Set(["renewal", "fees", "documents", "lost", "appointment", "contact", "minors", "abroad", "foreigner"]);

/** Concepts that make a page about a different variant of the procedure ("emergency passport" vs "passport"). */
const VARIANT = new Set(["laissez_passer", "emergency"]);
/** Subjects that share a word with another ("immatriculation" consulaire / du véhicule): a page titled with one the person didn't ask about is off topic. */
const UNASKED_SUBJECT = new Set(["vehicle"]);

export function pageOnTopic(question: string, page: QuickPage): boolean {
  const exp = expandQuery(question);
  // A page about a variant the person didn't ask about (emergency passport) is not their answer.
  if (expandQuery(page.title).concepts.some((c) => VARIANT.has(c) && !exp.concepts.includes(c))) return false;
  const toks = searchTokens(page.title);
  const set = new Set(toks);
  const idx = exp.concepts.map((c, i) => (GENERIC.has(c) ? -1 : i)).filter((i) => i >= 0);
  const want = idx.length ? idx : exp.concepts.map((_, i) => i);
  if (!want.length) return exp.groups.some((g) => coversGroup(toks, set, g));
  return want.some((i) => coversGroup(toks, set, exp.groups[i]));
}

/**
 * Is this page about the question's main subject (a non-GENERIC concept)? Yes when its title names it, or when at
 * least two lines of its text do. Stops a page that only shares a qualifier, or uses the word once in passing
 * ("the label is a passeport to state facilities"), from showing up for "renew my passport".
 */
export function coversTopic(question: string, title: string, text: string): boolean {
  const exp = expandQuery(question);
  const main = exp.concepts.map((c, i) => (GENERIC.has(c) ? -1 : i)).filter((i) => i >= 0);
  if (!main.length) return true;
  if (expandQuery(title).concepts.some((c) => UNASKED_SUBJECT.has(c) && !exp.concepts.includes(c))) return false;
  const hit = (t: string) => {
    const toks = searchTokens(t);
    const set = new Set(toks);
    return main.some((i) => coversGroup(toks, set, exp.groups[i]));
  };
  if (hit(title)) return true;
  let lines = 0;
  for (const line of text.slice(0, 8000).split(/\n+|(?<=[.!?؟])\s+/)) if (line.length > 3 && hit(line) && ++lines >= 2) return true;
  return false;
}

export function quickAnswer(question: string, pages: QuickPage[], maxFacts = 5): QuickAnswer | null {
  const exp = expandQuery(question);
  const groups = exp.groups;
  if (!groups.length || !pages.length) return null;
  const scored: { text: string; page: number; score: number; order: number }[] = [];
  pages.slice(0, 4).forEach((p, pi) => {
    const title = p.title.toLowerCase().replace(/\W+$/, "");
    units(p.text).forEach((u, ui) => {
      if (u.toLowerCase().replace(/\W+$/, "") === title) return; // the page title repeated as its first line
      if (/^[^.:]{0,90} [-–|] (?:Consulate|Embassy|Consulat|Ambassade)\b/i.test(u)) return; // a page heading, not a fact
      if (u.length < 70 && !/[.;!?؟)]$/.test(u) && !/\d/.test(u)) return; // a short heading ("Biometric passport: Renewal"), not a fact
      const list = searchTokens(u);
      const set = new Set(list);
      // Concepts weigh 2, leftover words 1: "renew" + "passport" beats a line that only says "passport".
      const hits = groups.map((g) => coversGroup(list, set, g));
      const cov = hits.reduce((n, h, gi) => n + (h ? (gi < exp.conceptCount ? 2 : 1) : 0), 0);
      if (cov === 0) return;
      // A line that covers every concept of the question ("renew" AND "passport") is what they asked.
      const all = exp.conceptCount > 1 && hits.slice(0, exp.conceptCount).every(Boolean) ? 2 : 0;
      const score = cov + all + (FACT.test(u) ? 1.5 : 0) + (p.office ? 1.5 : 0) - pi * 0.4 - ui * 0.01;
      scored.push({ text: u, page: pi, score, order: pi * 1000 + ui });
    });
  });
  if (!scored.length) return null;
  // The same sentence on two sites of one consulate (quotes, punctuation differ): keep it once.
  const kept: Set<string>[] = [];
  const picked = scored
    .sort((a, b) => b.score - a.score)
    .filter((s) => {
      const toks = new Set(searchTokens(s.text));
      const dup = kept.some((k) => {
        let both = 0;
        for (const t of toks) if (k.has(t)) both++;
        return both / Math.max(1, Math.min(toks.size, k.size)) >= 0.8;
      });
      if (dup) return false;
      kept.push(toks);
      return true;
    })
    .slice(0, maxFacts)
    .sort((a, b) => a.order - b.order); // read in page order
  const used = [...new Set(picked.map((s) => s.page))];
  return {
    facts: picked.map((s) => ({ text: s.text, source: used.indexOf(s.page) + 1 })),
    sources: used.map((pi, i) => ({ n: i + 1, title: pages[pi].title, url: pages[pi].url, domain: pages[pi].domain })),
  };
}

// ───────── From a step-by-step guide (curated, cited, already in the reader's language) ─────────

type L4 = Record<"en" | "fr" | "ar" | "dz", string>;
export interface GuideLike {
  sections: { id: string; title: L4; points: { text: L4; cites: string[] }[] }[];
  fees?: { office: L4; items: L4; payment: L4; cites: string[] }[];
}
export interface GuideAnswer {
  sections: { title: string; points: { text: string; sources: number[] }[] }[];
  fee?: { office: string; items: string; payment: string; sources: number[] };
  sources: { n: number; id: string }[];
}

const wordRe = (w: string) => new RegExp(`(?<![\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "iu");

/**
 * The guide points that answer this question for this person: sections that match the question and where they
 * live, points about their own office or about no office in particular (not another consulate's rules), and
 * their office's fee row if the guide has one.
 */
export function guideAnswer(
  guide: GuideLike,
  question: string,
  locale: keyof L4,
  opts: {
    inAlgeria?: boolean | null;
    officeCities?: string[];
    otherCities?: string[];
    maxPoints?: number;
    /** Sources to leave out (another country's consulate); a point left with no source is dropped. */
    skipSource?: (id: string) => boolean;
  } = {},
): GuideAnswer | null {
  const { inAlgeria = null, officeCities = [], otherCities = [], maxPoints = 6, skipSource = () => false } = opts;
  const exp = expandQuery(question);
  const mine = officeCities.map(wordRe);
  const others = otherCities.filter((c) => !officeCities.some((o) => o.toLowerCase() === c.toLowerCase())).map(wordRe);
  const aboutOther = (t: string) => !mine.some((r) => r.test(t)) && others.some((r) => r.test(t));
  const ranked = guide.sections
    .map((s, i) => {
      const toks = searchTokens(`${s.title.en} ${s.title[locale]} ${s.points.map((p) => p.text.en).join(" ")}`);
      const set = new Set(toks);
      const cov = exp.groups.reduce((n, g, gi) => n + (coversGroup(toks, set, g) ? (gi < exp.conceptCount ? 2 : 1) : 0), 0);
      const titleToks = searchTokens(`${s.title.en} ${s.title[locale]}`);
      const titleHit = exp.groups.some((g) => coversGroup(titleToks, new Set(titleToks), g)) ? 3 : 0;
      let place = 0;
      if (inAlgeria === true) place = /in-algeria|online/.test(s.id) ? 3 : /abroad/.test(s.id) ? -4 : 0;
      if (inAlgeria === false) place = /abroad|first|how/.test(s.id) ? 2 : /in-algeria/.test(s.id) ? -4 : 0;
      return { s, place, score: cov + titleHit + place - i * 0.2 };
    })
    .sort((a, b) => b.score - a.score);
  const ids: string[] = [];
  const num = (id: string) => {
    let i = ids.indexOf(id);
    if (i === -1) i = ids.push(id) - 1;
    return i + 1;
  };
  const out: GuideAnswer["sections"] = [];
  let left = maxPoints;
  // The two best sections that still have points once other consulates' points are left out, so an empty top
  // section doesn't leave the person with nothing (Lyon: the documents points cite US/UK consulates; the Ministry's
  // list for everyone abroad comes next). Past the first two, a section for the other side (in Algeria vs abroad)
  // is skipped; word match isn't required there, since an Arabic question matches the sections' words less.
  for (const [rank, { s, place }] of ranked.entries()) {
    if (out.length >= 2 || left <= 0) break;
    if (rank >= 2 && place < 0) continue;
    const pts = s.points
      .map((p) => ({ ...p, cites: p.cites.filter((c) => !skipSource(c)) }))
      .filter((p) => p.cites.length && !aboutOther(p.text.en));
    // Points about the person's own office first.
    pts.sort((a, b) => Number(mine.some((r) => r.test(b.text.en))) - Number(mine.some((r) => r.test(a.text.en))));
    const take = pts.slice(0, Math.min(left, 4));
    if (!take.length) continue;
    out.push({ title: s.title[locale], points: take.map((p) => ({ text: p.text[locale], sources: p.cites.map(num) })) });
    left -= take.length;
  }
  if (!out.length) return null;
  const feeRow = (guide.fees ?? []).find((f) => mine.some((r) => r.test(f.office.en)) && f.cites.some((c) => !skipSource(c)));
  return {
    sections: out,
    ...(feeRow ? { fee: { office: feeRow.office[locale], items: feeRow.items[locale], payment: feeRow.payment[locale], sources: feeRow.cites.map(num) } } : {}),
    sources: ids.map((id, i) => ({ n: i + 1, id })),
  };
}
