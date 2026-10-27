#!/usr/bin/env node
/**
 * Re-checks every page in data/corpus.json against the live site.
 *
 *   npm run check                      # all corpus URLs
 *   npm run check -- --limit=20        # first 20 (testing)
 *   npm run check -- --domains=cnas.dz,mfa.gov.dz
 *   npm run check -- --dry-run         # fetch + report, write nothing
 *   npm run check -- --no-crawl        # skip Apify discovery even if APIFY_TOKEN is set
 *
 * Writes:
 *   data/page-state.json   { url: { hash, lastChecked, lastChanged, status, httpStatus, goneCount } }
 *   data/corpus.json       changed pages get fresh verbatim text; gone pages removed
 *   data/retired.json      pages removed after two consecutive 404/410s
 *   data/changes.json      what this run changed (used for the PR body)
 *
 * Status meanings: ok (same as before) · changed (content differs since last check) ·
 * unreachable (network error, timeout, blocked, robots-disallowed; nothing is dropped) · gone (404/410 twice).
 * The first successful check of a page only records a baseline hash: the curated summary text is kept,
 * because a summary and a raw page would always "differ".
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractText, getDocumentProxy } from "unpdf";
import {
  USER_AGENT,
  contentHash,
  decodeBody,
  htmlToText,
  isAllowed,
  looksBlockedOrEmpty,
  looksSoft404,
  nextState,
  parseRobots,
  today,
} from "./lib/refresh-core.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, "data");
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const DRY = Boolean(args["dry-run"]);
const CONCURRENCY = Number(process.env.CHECK_CONCURRENCY ?? 4);
const TIMEOUT_MS = 15_000;
const MAX_BYTES = 15 * 1024 * 1024;
const PER_HOST_GAP_MS = Number(process.env.CHECK_HOST_GAP_MS ?? 1000);
const DAY = today();

const readJson = async (f, fallback) => {
  const p = path.join(dataDir, f);
  if (!existsSync(p)) return fallback;
  return JSON.parse(await readFile(p, "utf8"));
};
// corpus.json keeps its existing 1-space format without a trailing newline so diffs show only real edits.
const writeJson = async (f, v) => {
  if (DRY) return;
  await writeFile(path.join(dataDir, f), JSON.stringify(v, null, 1) + (f === "corpus.json" ? "" : "\n"));
};

const corpus = await readJson("corpus.json", []);
const state = await readJson("page-state.json", {});
const retired = await readJson("retired.json", []);

let targets = corpus;
if (typeof args.domains === "string") {
  const set = new Set(args.domains.split(",").map((d) => d.trim().replace(/^www\./, "")));
  targets = targets.filter((r) => set.has(String(r.domain).replace(/^www\./, "")));
}
if (args.limit) targets = targets.slice(0, Number(args.limit));
console.log(`Checking ${targets.length} page(s), concurrency ${CONCURRENCY}${DRY ? " (dry run)" : ""}`);

/* ── fetch with timeout ── */
async function get(url, accept = "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8") {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "User-Agent": USER_AGENT, Accept: accept, "Accept-Language": "fr,ar;q=0.9,en;q=0.8" },
  });
  return res;
}

/* ── robots.txt per origin (cached). Unreachable/unparseable → allow. ── */
const robotsCache = new Map();
function robotsFor(origin) {
  if (!robotsCache.has(origin)) {
    robotsCache.set(
      origin,
      (async () => {
        try {
          const res = await get(`${origin}/robots.txt`, "text/plain,*/*;q=0.5");
          if (!res.ok) return null; // 4xx/5xx: treat as no robots.txt
          const type = res.headers.get("content-type") ?? "";
          const body = await res.text();
          if (/html/i.test(type) && /<html/i.test(body)) return null; // soft-404 HTML, not a robots file
          return parseRobots(body);
        } catch {
          return null;
        }
      })(),
    );
  }
  return robotsCache.get(origin);
}

/* ── polite per-host spacing ── */
const hostNext = new Map();
async function waitForHost(host) {
  const now = Date.now();
  const at = Math.max(now, hostNext.get(host) ?? 0);
  hostNext.set(host, at + PER_HOST_GAP_MS);
  if (at > now) await new Promise((r) => setTimeout(r, at - now));
}

async function extractPdf(buf) {
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: true });
  return String(text).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** @returns {Promise<{kind:"ok",hash,httpStatus,text,title}|{kind:"gone",httpStatus}|{kind:"unreachable",httpStatus?,note}>} */
async function check(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return { kind: "unreachable", note: "bad-url" };
  }
  const robots = await robotsFor(u.origin);
  if (robots && !isAllowed(robots, url)) return { kind: "unreachable", note: "robots-disallow" };
  await waitForHost(u.host);
  let res;
  try {
    res = await get(url);
  } catch (err) {
    return { kind: "unreachable", note: err?.name === "TimeoutError" ? "timeout" : String(err?.cause?.code ?? err?.message ?? "fetch-error").slice(0, 60) };
  }
  if (res.status === 404 || res.status === 410) return { kind: "gone", httpStatus: res.status };
  if (!res.ok) return { kind: "unreachable", httpStatus: res.status, note: "http-error" };
  const len = Number(res.headers.get("content-length") ?? 0);
  if (len > MAX_BYTES) return { kind: "unreachable", httpStatus: res.status, note: "too-large" };
  const type = res.headers.get("content-type") ?? "";
  const buf = new Uint8Array(await res.arrayBuffer());
  let text = "";
  let title = "";
  try {
    if (/pdf/i.test(type) || /\.pdf($|\?)/i.test(url)) {
      text = await extractPdf(buf);
    } else {
      ({ text, title } = htmlToText(decodeBody(buf, type)));
    }
  } catch (err) {
    return { kind: "unreachable", httpStatus: res.status, note: `extract-failed: ${String(err?.message ?? err).slice(0, 40)}` };
  }
  if (looksSoft404(title, text)) return { kind: "gone", httpStatus: res.status };
  if (looksBlockedOrEmpty(text)) return { kind: "unreachable", httpStatus: res.status, note: "blocked-or-empty" };
  return { kind: "ok", httpStatus: res.status, hash: contentHash(text), text: text.slice(0, 200_000), title };
}

/* ── run ── */
const results = new Map();
const queue = [...targets];
let done = 0;
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const rec = queue.shift();
      const r = await check(rec.url);
      results.set(rec.url, r);
      done++;
      if (done % 20 === 0 || done === targets.length) console.log(`  ${done}/${targets.length}`);
    }
  }),
);

const changes = { date: DAY, changed: [], gone: [], unreachable: [], baseline: 0, unchanged: 0, discovered: 0 };
const nextCorpus = [];
const byUrl = new Map(targets.map((r) => [r.url, r]));
for (const rec of corpus) {
  const r = byUrl.has(rec.url) ? results.get(rec.url) : undefined;
  if (!r) {
    nextCorpus.push(rec);
    continue;
  }
  const { state: s, action } = nextState(state[rec.url], r, DAY, rec.fetched || null);
  state[rec.url] = s;
  if (action === "changed") {
    const before = rec.text.length;
    nextCorpus.push({ ...rec, text: r.text, fetched: DAY, extraction: "verbatim" });
    changes.changed.push({ id: rec.id, url: rec.url, title: rec.title, chars: { before, after: r.text.length } });
  } else if (action === "gone") {
    retired.push({ ...rec, retired: DAY, reason: `HTTP ${r.httpStatus ?? "404"} on two consecutive checks` });
    changes.gone.push({ id: rec.id, url: rec.url, title: rec.title });
  } else {
    nextCorpus.push(rec);
    if (action === "baseline") changes.baseline++;
    else if (action === "unchanged") changes.unchanged++;
    else changes.unreachable.push({ id: rec.id, url: rec.url, note: s.note ?? `HTTP ${s.httpStatus ?? "-"}` });
  }
}

console.log(
  `\nResult: ${changes.changed.length} changed · ${changes.gone.length} gone · ${changes.unreachable.length} unreachable · ` +
    `${changes.unchanged} unchanged · ${changes.baseline} baselined`,
);
for (const c of changes.changed) console.log(`  changed  ${c.url}`);
for (const g of changes.gone) console.log(`  gone     ${g.url}`);

if (!DRY) {
  await writeJson("page-state.json", Object.fromEntries(Object.entries(state).sort(([a], [b]) => a.localeCompare(b))));
  await writeJson("retired.json", retired);
  await writeJson("corpus.json", nextCorpus);
}

/* ── optional discovery of new pages via Apify (merges into corpus.json itself) ── */
if (!DRY && !args["no-crawl"] && process.env.APIFY_TOKEN) {
  console.log("\nAPIFY_TOKEN set: discovering new pages on priority 1–2 sources…");
  const before = nextCorpus.length;
  const r = spawnSync(process.execPath, [path.join(root, "scripts", "crawl.mjs")], {
    stdio: "inherit",
    env: { ...process.env, DATA_DIR: dataDir, CRAWL_PRIORITY_MAX: process.env.CRAWL_PRIORITY_MAX ?? "2" },
  });
  if (r.status === 0) {
    const after = await readJson("corpus.json", []);
    changes.discovered = Math.max(0, after.length - before);
    // Baseline the new pages so next week's check can detect edits.
    for (const rec of after) {
      // No hash yet: the next check-updates run records a baseline with the same extractor it compares with.
      if (!state[rec.url]) state[rec.url] = { lastChecked: DAY, lastChanged: DAY, status: "ok", httpStatus: 200, goneCount: 0 };
    }
    await writeJson("page-state.json", Object.fromEntries(Object.entries(state).sort(([a], [b]) => a.localeCompare(b))));
  } else {
    console.warn("Crawl failed; continuing without new pages.");
  }
}

await writeJson("changes.json", changes);
if (!DRY) console.log("Wrote data/page-state.json, data/corpus.json, data/retired.json, data/changes.json. Next: npm run crossref && npm run index");
