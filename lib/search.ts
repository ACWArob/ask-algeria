import "server-only";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import { buildChunks, INDEX_VERSION, MINISEARCH_OPTIONS, normalizeCorpus, type Chunk } from "@/lib/search-core.mjs";
import { coversGroup, searchTokens } from "@/lib/synonyms";

export type { Chunk };

const DATA_DIR = path.join(process.cwd(), "data");

let cached: MiniSearch<Chunk> | null = null;

function readJson(file: string): unknown | null {
  const p = path.join(DATA_DIR, file);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (err) {
    console.error(`[search] could not parse ${file}:`, err);
    return null;
  }
}

/** Loads the prebuilt index (data/index.json) or builds one from data/corpus.json (or seed-corpus.json). Cached per instance. */
export function getIndex(): MiniSearch<Chunk> {
  if (cached) return cached;
  const pre = readJson("index.json") as { version?: number; index?: unknown } | null;
  if (pre && pre.version === INDEX_VERSION && pre.index) {
    try {
      cached = MiniSearch.loadJS<Chunk>(pre.index as never, MINISEARCH_OPTIONS);
      return cached;
    } catch (err) {
      console.error("[search] prebuilt index unusable, rebuilding:", err);
    }
  }
  const raw = readJson("corpus.json") ?? readJson("seed-corpus.json") ?? [];
  const ms = new MiniSearch<Chunk>(MINISEARCH_OPTIONS);
  ms.addAll(buildChunks(normalizeCorpus(raw)));
  cached = ms;
  return ms;
}

export interface Hit extends Chunk {
  score: number;
}

/** Runs each query, merges by best score, caps chunks per document so one page can't crowd out others. */
export interface SearchOptions {
  /** Domains of the office that serves the person: boosted, but capped so other relevant pages still fit. */
  boostDomains?: string[];
  /** Corpus topic slugs that match the question (e.g. "passport"): boosted. */
  topics?: string[];
  /** Domains never to use (e.g. consulates in other countries than the person's). */
  excludeDomains?: string[];
  /**
   * What a relevant page must mention (lib/synonyms expandQuery groups). Pages are scored by how much of it they
   * cover, rare words counting more (a page about "registration" alone isn't about "hajj registration").
   */
  groups?: string[][][];
  /** How many of `groups` are synonym concepts (the rest are leftover words, which weigh half and are ignored if unknown). */
  conceptCount?: number;
  /** With groups: drop pages covering less than this share (0..1). */
  minCoverage?: number;
}

const tokenCache = new Map<string, { list: string[]; set: Set<string> }>();
function chunkTokens(h: Hit) {
  let t = tokenCache.get(h.id);
  if (!t) {
    const list = searchTokens(`${h.title} ${h.text}`);
    t = { list, set: new Set(list) };
    if (tokenCache.size > 20000) tokenCache.clear();
    tokenCache.set(h.id, t);
  }
  return t;
}

/** Inverse document frequency of a group: rare topics ("hajj") weigh more than common words ("registration"). */
const dfCache = new Map<string, number>();
function groupDf(ms: MiniSearch<Chunk>, group: string[][]): number {
  const key = group.map((s) => s.join(" ")).join("|");
  const hit = dfCache.get(key);
  if (hit !== undefined) return hit;
  const n = countDf(ms, group);
  if (dfCache.size > 5000) dfCache.clear();
  dfCache.set(key, n);
  return n;
}
function countDf(ms: MiniSearch<Chunk>, group: string[][]): number {
  const ids = new Set<string>();
  for (const seq of group) {
    for (const r of ms.search(seq.join(" "), { combineWith: "AND", fuzzy: false, prefix: false, processTerm: (t: string) => t })) ids.add(r.id as string);
  }
  return ids.size;
}
const idf = (ms: MiniSearch<Chunk>, df: number) => Math.log(1 + ms.documentCount / (1 + df));

/** Pages that are never useful for procedures (speeches, history, biographies). */
const JUNK = /history of algeria|histoire de l'alg|biograph|speech|discours|allocution|condolence|congratulat|félicit|visite (de travail|officielle)|working visit/i;

export function searchChunks(queries: string[], limit: number, opts: SearchOptions | string[] = {}): Hit[] {
  const { boostDomains = [], topics = [], excludeDomains = [], groups = [], minCoverage = 0, conceptCount = groups.length } = Array.isArray(opts) ? { boostDomains: opts } : opts;
  const excluded = new Set(excludeDomains.map((d) => d.replace(/^www\./, "").toLowerCase()));
  const ms = getIndex();
  const best = new Map<string, Hit>();
  for (const q of queries) {
    if (!q.trim()) continue;
    for (const r of ms.search(q)) {
      if (excluded.size && excluded.has(String(r.domain).replace(/^www\./, "").toLowerCase())) continue;
      const prev = best.get(r.id as string);
      if (!prev || prev.score < r.score) {
        best.set(r.id as string, {
          id: r.id as string,
          docId: r.docId as string,
          title: r.title as string,
          url: r.url as string,
          domain: r.domain as string,
          lang: r.lang as string,
          topic: r.topic as string,
          text: r.text as string,
          score: r.score,
        });
      } else {
        prev.score += r.score * 0.25; // matched by several query variants: small bonus
      }
    }
  }
  const boost = new Set(boostDomains.map((d) => d.replace(/^www\./, "")));
  const topicSet = new Set(topics);
  for (const h of best.values()) {
    if (boost.has(h.domain.replace(/^www\./, ""))) h.score *= 3;
    if (topicSet.size && topicSet.has(h.topic)) h.score *= 1.6;
    if (JUNK.test(h.title)) h.score *= 0.2;
  }
  if (groups.length) {
    // Concepts weigh fully. Leftover words weigh half (they may be in another language than the page), and a word
    // that appears nowhere (typo, Darija spelling) is ignored rather than sinking every page.
    const weights = groups.map((g, i) => {
      const df = groupDf(ms, g);
      if (i < conceptCount) return idf(ms, df);
      return df === 0 ? 0 : 0.5 * idf(ms, df);
    });
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    for (const [id, h] of best) {
      const { list, set } = chunkTokens(h);
      const cov = groups.reduce((n, g, i) => n + (coversGroup(list, set, g) ? weights[i] : 0), 0) / total;
      if (weights.filter(Boolean).length >= 2 && cov < minCoverage) best.delete(id);
      else h.score *= 0.3 + 0.7 * cov;
    }
  }
  const ranked = [...best.values()].sort((a, b) => b.score - a.score);
  const top = ranked[0]?.score ?? 0;
  const perDoc = new Map<string, number>();
  const out: Hit[] = [];
  let boosted = 0;
  const maxBoosted = Math.max(1, Math.ceil(limit * 0.625)); // e.g. 5 of 8
  for (const h of ranked) {
    if (h.score < top * 0.3) break; // too weak compared with the best match: noise
    const n = perDoc.get(h.docId) ?? 0;
    if (n >= 2) continue;
    const isBoosted = boost.has(h.domain.replace(/^www\./, ""));
    if (isBoosted && boosted >= maxBoosted) continue;
    perDoc.set(h.docId, n + 1);
    if (isBoosted) boosted++;
    out.push(h);
    if (out.length >= limit) break;
  }
  return out;
}
