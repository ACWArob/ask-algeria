import "server-only";
import type { Locale } from "@/lib/i18n";
import { glossaryQueries, questionTopics } from "@/lib/detect";
import { detectMultiPostCountry, detectPost, postFromGeo, readGeo, type PostHint } from "@/lib/posts";
import { foreignMissionHosts, foreignMissionHostsForCountry, isMissionContactQuestion, matchMissions } from "@/lib/missions";
import { searchChunks } from "@/lib/search";
import { corpusById } from "@/lib/corpus";
import { GUIDES } from "@/lib/guides";
import sourcesJson from "@/data/sources.json";
import { resolveWhere, whereCountry, type Where } from "@/lib/where";
import { askCity, askCountry } from "@/lib/clarify";

/** The "Another country / city" chips: free search can't use them (the AI answer handles that case). */
const ANOTHER = /another|autre|آخر|أخرى/i;

/**
 * Free, instant results for a question: matching step-by-step guides, the person's office, and official pages
 * with a snippet. No model call: this is what most people need, and the AI answer is one tap away.
 */

export interface InstantPage { title: string; url: string; domain: string; snippet: string; archived?: string }
export interface InstantGuide { slug: string; title: string; lead: string }
export interface InstantMission {
  name: string; address?: string; phones: string[]; emails: string[]; hours?: string; website?: string; appointments?: string; checked?: string;
}
export interface InstantResult {
  guides: InstantGuide[];
  office?: { place: string; name: string; site?: string; inAlgeria: boolean; fromConnection: boolean };
  mission?: InstantMission;
  pages: InstantPage[];
  /** The procedure depends on where they live and we don't know: one-tap places to narrow the results. */
  askPlace?: { question: string; chips: string[] };
}

/** Topics whose procedure, office, documents and fees depend on where the person lives (same list as /api/ask). */
const LOCATION_FIRST = ["passport", "cni", "birth_certificate", "civil_status", "criminal_record", "nationality", "consular_registration", "legalization", "national_service", "driving_vehicle"];

/** Which guide answers which question topic (topics from lib/detect questionTopics). */
const GUIDE_TOPICS: Record<string, string[]> = {
  passport: ["passport", "cni"],
  "birth-12s": ["birth_certificate"],
  "civil-status": ["civil_status"],
  "criminal-record": ["criminal_record"],
  nationality: ["nationality"],
  "consular-registration": ["consular_registration"],
  "national-service": ["national_service"],
  cnas: ["social_security"],
  aadl: ["housing"],
};

const WILAYA_PORTALS = (sourcesJson as { domain: string; category?: string }[])
  .filter((x) => x.category === "wilayas")
  .map((x) => x.domain.replace(/^www\./, "").toLowerCase());

const STOP = new Set("the a an of to in for and or my is how do i what where can with on at de la le les des du un une et pour mon ma mes est comment je في من على عن ما كيف واش كيفاش".split(" "));

/** The sentence-ish window of `text` that contains the most query words, about `max` characters. */
export function snippet(text: string, query: string, max = 240): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const words = [...new Set(query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2 && !STOP.has(w)))];
  const lower = clean.toLowerCase();
  let bestAt = 0;
  let best = -1;
  for (let at = 0; at < clean.length - max / 2; at += 60) {
    const win = lower.slice(at, at + max);
    const score = words.reduce((n, w) => n + (win.includes(w) ? 1 : 0), 0);
    if (score > best) { best = score; bestAt = at; }
  }
  let start = bestAt;
  if (start > 0) {
    const space = clean.indexOf(" ", start);
    start = space === -1 ? start : space + 1;
  }
  let end = Math.min(clean.length, start + max);
  if (end < clean.length) {
    const space = clean.lastIndexOf(" ", end);
    if (space > start + max / 2) end = space;
  }
  return `${start > 0 ? "… " : ""}${clean.slice(start, end)}${end < clean.length ? " …" : ""}`;
}

export function instantSearch(question: string, locale: Locale, headers?: Headers, context = "", where: Where | null = null): InstantResult {
  const topics = questionTopics(`${context} ${question}`);
  // A place named in the question wins over the saved "where do you live?", which wins over the connection.
  const askedCountry = detectMultiPostCountry(question);
  const saved = askedCountry ? null : where;
  const stated = detectPost(question) ?? resolveWhere(saved) ?? detectPost(context);
  const namedCountry = askedCountry ?? detectMultiPostCountry(context) ?? whereCountry(saved);
  const geo = stated || namedCountry || !headers ? null : postFromGeo(readGeo(headers));
  const post: PostHint | null = stated ?? geo;
  const country = post ? null : namedCountry;
  const abroad = post ? !post.inAlgeria : Boolean(country);

  const excludeDomains = [
    ...(post ? foreignMissionHosts(post.domains, Boolean(post.inAlgeria)) : country ? foreignMissionHostsForCountry(country) : []),
    ...(abroad ? WILAYA_PORTALS : []),
  ];
  const queries = [...new Set([question, ...glossaryQueries(`${context} ${question}`)])];
  if (post && !post.inAlgeria) queries.push(`${question} ${post.place}`);
  const hits = searchChunks(queries, 12, { boostDomains: post?.domains ?? [], topics, excludeDomains });

  const corpus = corpusById();
  const pages: InstantPage[] = [];
  const seen = new Set<string>();
  for (const h of hits) {
    if (seen.has(h.docId)) continue;
    seen.add(h.docId);
    const rec = corpus.get(h.docId);
    pages.push({
      title: h.title,
      url: h.url,
      domain: h.domain.replace(/^www\./, ""),
      snippet: snippet(h.text, `${question} ${queries.slice(1).join(" ")}`),
      ...(rec?.extraction === "archived" ? { archived: rec.fetched || "" } : {}),
    });
    if (pages.length >= 6) break;
  }

  const guides: InstantGuide[] = Object.entries(GUIDE_TOPICS)
    .filter(([, ts]) => ts.some((t) => topics.includes(t)))
    .map(([slug]) => ({ slug, title: GUIDES[slug].title[locale], lead: GUIDES[slug].lead[locale] }))
    .slice(0, 2);

  let mission: InstantMission | undefined;
  if (isMissionContactQuestion(question) && !post?.inAlgeria) {
    const m = matchMissions(question, post?.domains ?? [], 1, context)[0];
    if (m && m.status !== "unverified") {
      mission = {
        name: locale === "fr" ? m.name_fr : m.name_en,
        address: m.address || undefined,
        phones: m.phones,
        emails: m.emails,
        hours: m.hours || undefined,
        website: m.website || undefined,
        appointments: m.appointment_url || undefined,
        checked: m.checked || undefined,
      };
    }
  }

  let askPlace: InstantResult["askPlace"];
  if (!post && topics.some((t) => LOCATION_FIRST.includes(t))) {
    const c = country ? askCity(country, locale) : askCountry(locale);
    if (c) {
      const q = c.text.match(/\*\*(.+?)\*\*/)?.[1] ?? c.text;
      askPlace = { question: q, chips: c.chips.filter((x) => !ANOTHER.test(x)) };
    }
  }

  return {
    guides,
    ...(askPlace ? { askPlace } : {}),
    ...(post ? { office: { place: post.place, name: post.post, site: post.site, inAlgeria: Boolean(post.inAlgeria), fromConnection: !stated } } : {}),
    ...(mission ? { mission } : {}),
    pages,
  };
}
