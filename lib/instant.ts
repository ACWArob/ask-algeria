import "server-only";
import type { Locale } from "@/lib/i18n";
import { glossaryQueries, questionTopics } from "@/lib/detect";
import { detectMultiPostCountry, detectPost, LOCATION_FIRST, postFromGeo, readGeo, WILAYAS, type PostHint } from "@/lib/posts";
import { allMissionHosts, isMissionContactQuestion, locationDependent, matchMissions, MISSIONS, otherMissionHosts } from "@/lib/missions";
import { coversTopic, guideAnswer, pageOnTopic, quickAnswer, type QuickPage } from "@/lib/quick-answer";
import { searchChunks } from "@/lib/search";
import { expandQuery } from "@/lib/synonyms";
import { corpusById } from "@/lib/corpus";
import { GUIDES } from "@/lib/guides";
import sourcesJson from "@/data/sources.json";
import { resolveWhere, whereCountry, type Where } from "@/lib/where";
import { askCity, askCountry } from "@/lib/clarify";
import { localHours } from "@/lib/mission-i18n";

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
/** The actual facts, shown first: from our step-by-step guide when one matches, else from the top official pages. */
export interface InstantQuick {
  from: "guide" | "pages";
  slug?: string;
  sections: { title?: string; points: { text: string; sources: number[] }[] }[];
  fee?: { office: string; items: string; payment: string; sources: number[] };
  sources: { n: number; title: string; url: string; domain: string }[];
}

/** Cities that have an Algerian mission: a guide point naming one of them is that office's rule, not a general one. */
const MISSION_CITIES = [...new Set(MISSIONS.map((m) => m.city).filter(Boolean)), "Washington"];

export interface InstantResult {
  quick?: InstantQuick;
  guides: InstantGuide[];
  /** `place` is the wilaya or city in the reader's script when we have it (Arabic names for ar/dz). */
  office?: { place: string; name: string; site?: string; inAlgeria: boolean; fromConnection: boolean };
  mission?: InstantMission;
  pages: InstantPage[];
  /** The procedure depends on where they live and we don't know: one-tap places to narrow the results. */
  askPlace?: { question: string; chips: string[] };
}

/** Topics whose procedure, office, documents and fees depend on where the person lives (same list as /api/ask). */

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

/** A wilaya's Arabic name for Arabic and Darija readers ("Oran" → "وهران"); other places as they are. */
function localPlace(post: PostHint, locale: Locale): string {
  if ((locale === "ar" || locale === "dz") && post.inAlgeria) return WILAYAS.find((w) => w.name === post.place)?.ar ?? post.place;
  return post.place;
}

export function instantSearch(question: string, locale: Locale, headers?: Headers, context = "", where: Where | null = null): InstantResult {
  const topics = questionTopics(`${context} ${question}`);
  // A place named in the question wins over the saved "where do you live?", which wins over the connection.
  const askedCountry = detectMultiPostCountry(question);
  const saved = askedCountry ? null : where;
  const stated = detectPost(question) ?? resolveWhere(saved) ?? detectPost(context);
  const namedCountry = askedCountry ?? detectMultiPostCountry(context) ?? whereCountry(saved);
  const geo = stated || namedCountry || !headers || !locationDependent(topics, question) ? null : postFromGeo(readGeo(headers));
  const post: PostHint | null = stated ?? geo;
  const country = post ? null : namedCountry;
  const abroad = post ? !post.inAlgeria : Boolean(country);

  // Other countries' consulates are left out once the country is known, also when the person's own mission
  // has no website of its own (Ethiopia): their rules are not this person's.
  const otherMissions = otherMissionHosts(post?.domains ?? null, Boolean(post?.inAlgeria), country ?? namedCountry);
  const excludeDomains = [...otherMissions, ...(abroad ? WILAYA_PORTALS : [])];
  // Synonyms across en/fr/ar/Darija (lib/synonyms), so the page's language doesn't have to match the question's.
  const exp = expandQuery(question);
  const queries = [...new Set([question, exp.query, ...glossaryQueries(`${context} ${question}`)].filter(Boolean))];
  if (post && !post.inAlgeria) queries.push(`${question} ${post.place}`);
  const hits = searchChunks(queries, 12, { boostDomains: post?.domains ?? [], topics, excludeDomains, groups: exp.groups, conceptCount: exp.conceptCount, minCoverage: 0.4 });

  const corpus = corpusById();
  const pages: InstantPage[] = [];
  const quickPages: QuickPage[] = [];
  const seen = new Set<string>();
  // The person's own office. In Algeria the place's domains also list a few well-covered wilaya portals as search
  // examples (lib/posts ALGERIA); those help search but are not this person's office (Oran's pages for Algiers).
  const ownDomains = (post?.domains ?? []).map((d) => d.replace(/^www\./, ""));
  const officeHosts = new Set(post?.inAlgeria ? ownDomains.filter((d, i) => i === 0 || !WILAYA_PORTALS.includes(d)) : ownDomains);
  for (const h of hits) {
    if (seen.has(h.docId)) continue;
    seen.add(h.docId);
    const rec = corpus.get(h.docId);
    // Off-topic pages that only share a word like "renew" are left out (the question names a subject, they don't).
    if (!coversTopic(question, h.title, rec?.text ?? h.text)) continue;
    if (rec) quickPages.push({ title: h.title, url: h.url, domain: h.domain.replace(/^www\./, ""), text: rec.text, office: officeHosts.has(h.domain.replace(/^www\./, "")) });
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

  // The facts themselves (free): the matching guide's points for this person's office, else the best lines of the pages.
  let quick: InstantQuick | undefined;
  // 1. The person's own office has pages on this: its own rules beat a guide that summarises several consulates.
  // Living in Algeria with a guide that has in-Algeria sections: the guide wins (the Ministry's pages mix rules
  // for residents and for Algerians abroad on one page, in two languages).
  const gslug0 = guides[0]?.slug;
  const guideForAlgeria = Boolean(post?.inAlgeria && gslug0 && GUIDES[gslug0].sections.some((x) => /in-algeria/.test(x.id)));
  const officePages = guideForAlgeria ? [] : quickPages.filter((p) => p.office && pageOnTopic(question, p));
  // The office's own facts in another language than the reader's: kept in case the guide has nothing for them.
  let officeFallback: InstantQuick | undefined;
  if (officePages.length) {
    // The question's own words first; a question in another language than the pages (Arabic question, English
    // consulate pages) also tries the cross-language synonyms (lib/synonyms), so the office's facts are still found.
    const direct = quickAnswer(question, officePages, 6);
    const qa = direct && direct.facts.length >= 2 ? direct : quickAnswer(`${question} ${exp.query}`, officePages, 6) ?? direct;
    // Facts in another script than the reader's (French page, Arabic reader) lose to a guide in their language.
    const arabicShare = qa ? (qa.facts.map((f) => f.text).join(" ").match(/[\u0600-\u06FF]/g) ?? []).length / Math.max(1, qa.facts.map((f) => f.text).join(" ").length) : 0;
    // English readers: French page text (most official pages) also loses to a guide in English; the office's own
    // pages stay right below as links. French readers keep the office's own words.
    const factText = qa ? qa.facts.map((f) => f.text).join(" ") : "";
    const frenchShare = (factText.match(/(?<![\p{L}])(le|la|les|des|du|est|pour|aux|une|et|vous|votre)(?![\p{L}])/giu) ?? []).length / Math.max(1, factText.split(/\s+/).length);
    const wrongScript = (locale === "ar" || locale === "dz") ? arabicShare < 0.3 : arabicShare > 0.5 || (locale === "en" && frenchShare > 0.06);
    if (qa && qa.facts.length >= 2) {
      const own: InstantQuick = { from: "pages", sections: [{ points: qa.facts.map((f) => ({ text: f.text, sources: [f.source] })) }], sources: qa.sources };
      if (!(wrongScript && guides.length)) quick = own;
      else officeFallback = own;
    }
  }
  // 2. Else the matching guide (curated, in the reader's language), keeping points that fit their office.
  const gslug = guides[0]?.slug;
  if (!quick && gslug) {
    const officeCity = post?.post.match(/\bin ([^,()]+)/)?.[1]?.trim();
    const ga = guideAnswer(GUIDES[gslug] as never, question, locale, {
      inAlgeria: post ? Boolean(post.inAlgeria) : null,
      officeCities: [officeCity, post?.place].filter((x): x is string => Boolean(x)),
      otherCities: MISSION_CITIES,
      skipSource: (id) => otherMissions.includes((corpus.get(id)?.domain ?? "").replace(/^www\./, "")),
    });
    if (ga) {
      quick = {
        from: "guide",
        slug: gslug,
        sections: ga.sections,
        ...(ga.fee ? { fee: ga.fee } : {}),
        sources: ga.sources.map((s) => {
          const r = corpus.get(s.id);
          return { n: s.n, title: r?.title ?? s.id, url: r?.url ?? "", domain: (r?.domain ?? "").replace(/^www\./, "") };
        }).filter((s) => s.url),
      };
    }
  }
  // 2b. The guide had nothing for this person: their own office's facts, even in another language, beat nothing.
  if (!quick && officeFallback) quick = officeFallback;
  if (!quick) {
    // 3. Best lines of the top pages. Once the person's office abroad is known, another consulate's page is not
    // quoted here ("the Bordeaux consulate invites residents of its district...", shown to someone in Marseille):
    // each consulate writes for its own district. National pages stay; other consulates still appear as links.
    // Same inside Algeria: another wilaya's portal (Oran's page for someone in Algiers) is not quoted.
    const notMine = post ? (post.inAlgeria ? new Set(WILAYA_PORTALS) : allMissionHosts()) : null;
    const fallbackPages = notMine ? quickPages.filter((p) => p.office || !notMine.has(p.domain)) : quickPages;
    const qa = quickAnswer(question, fallbackPages);
    if (qa) quick = { from: "pages", sections: [{ points: qa.facts.map((f) => ({ text: f.text, sources: [f.source] })) }], sources: qa.sources };
  }

  let mission: InstantMission | undefined;
  if (isMissionContactQuestion(question) && !post?.inAlgeria) {
    const m = matchMissions(question, post?.domains ?? [], 1, context)[0];
    if (m && m.status !== "unverified") {
      mission = {
        name: locale === "fr" ? m.name_fr : m.name_en,
        address: m.address || undefined,
        phones: m.phones,
        emails: m.emails,
        hours: localHours(m.hours, locale) || undefined,
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
    ...(quick ? { quick } : {}),
    guides,
    ...(askPlace ? { askPlace } : {}),
    ...(post ? { office: { place: localPlace(post, locale), name: post.post, site: post.site, inAlgeria: Boolean(post.inAlgeria), fromConnection: !stated } } : {}),
    ...(mission ? { mission } : {}),
    pages,
  };
}
