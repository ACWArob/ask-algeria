import "server-only";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { normalizeCorpus, type CorpusRecord } from "@/lib/search-core.mjs";

let cache: Map<string, CorpusRecord> | null = null;

/** Corpus records by id (data/corpus.json, falling back to seed-corpus.json). */
export function corpusById(): Map<string, CorpusRecord> {
  if (cache) return cache;
  const dir = path.join(process.cwd(), "data");
  const file = ["corpus.json", "seed-corpus.json"].map((f) => path.join(dir, f)).find((p) => existsSync(p));
  let records: CorpusRecord[] = [];
  try {
    records = file ? normalizeCorpus(JSON.parse(readFileSync(file, "utf8"))) : [];
  } catch (err) {
    console.error("[corpus] could not read corpus:", err);
  }
  cache = new Map(records.map((r) => [r.id, r]));
  return cache;
}
