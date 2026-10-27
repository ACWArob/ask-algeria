import "server-only";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import { buildChunks, INDEX_VERSION, MINISEARCH_OPTIONS, normalizeCorpus, type Chunk } from "@/lib/search-core.mjs";

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
export function searchChunks(queries: string[], limit: number, boostDomains: string[] = []): Hit[] {
  const ms = getIndex();
  const best = new Map<string, Hit>();
  for (const q of queries) {
    if (!q.trim()) continue;
    for (const r of ms.search(q)) {
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
  if (boostDomains.length) {
    const boost = new Set(boostDomains.map((d) => d.replace(/^www\./, "")));
    for (const h of best.values()) if (boost.has(h.domain.replace(/^www\./, ""))) h.score *= 3;
  }
  const perDoc = new Map<string, number>();
  const out: Hit[] = [];
  for (const h of [...best.values()].sort((a, b) => b.score - a.score)) {
    const n = perDoc.get(h.docId) ?? 0;
    if (n >= 3) continue;
    perDoc.set(h.docId, n + 1);
    out.push(h);
    if (out.length >= limit) break;
  }
  return out;
}
