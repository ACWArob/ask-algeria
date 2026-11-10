#!/usr/bin/env node
// Builds data/index.json (serialized MiniSearch + chunk metadata) from data/corpus.json.
// Runs automatically before `next build` (npm "prebuild"), or manually with `npm run index`.
// If data/index.json is missing at runtime, the app builds the same index lazily from corpus.json.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MiniSearch from "minisearch";
import { buildChunks, INDEX_VERSION, MINISEARCH_OPTIONS, normalizeCorpus } from "../lib/search-core.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const corpusPath = path.join(root, "data", "corpus.json");
const outPath = path.join(root, "data", "index.json");

const raw = JSON.parse(await readFile(corpusPath, "utf8"));
const records = normalizeCorpus(raw);
const chunks = buildChunks(records);
const ms = new MiniSearch(MINISEARCH_OPTIONS);
ms.addAll(chunks);

await writeFile(
  outPath,
  JSON.stringify({ version: INDEX_VERSION, builtAt: new Date().toISOString(), docs: records.length, chunks: chunks.length, index: ms.toJSON() }),
);
// Tiny summary for the homepage ("Searching N official pages from M websites"), so it never loads the corpus.
const sites = new Set(records.map((r) => (r.domain || new URL(r.url).hostname).replace(/^www\./, ""))).size;
await writeFile(path.join(root, "data", "corpus-stats.json"), JSON.stringify({ pages: records.length, sites }) + "\n");
console.log(`Indexed ${records.length} documents into ${chunks.length} chunks -> ${path.relative(root, outPath)}`);
