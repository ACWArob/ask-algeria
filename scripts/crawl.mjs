#!/usr/bin/env node
/**
 * Crawl official sites with Apify's Website Content Crawler and build data/corpus.json.
 *
 *   APIFY_TOKEN=... npm run crawl            # crawl priority 1–2 sites, 150 pages each
 *   CRAWL_MAX_PAGES=300 CRAWL_PRIORITY_MAX=3 npm run crawl
 *   npm run crawl -- --domains=cnas.dz,mjustice.dz
 *   npm run crawl -- --dry-run                # print the plan only
 *
 * Then: npm run index
 *
 * One actor run per site (keeps same-domain scoping exact and lets a broken site fail alone).
 * Raw datasets are cached to data/apify-raw-<domain>.json (git-ignored) so you can re-normalise offline.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApifyClient } from "apify-client";
import { extractText, getDocumentProxy } from "unpdf";
import { normalizeCorpus } from "../lib/search-core.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));

const MAX_PAGES = Number(process.env.CRAWL_MAX_PAGES ?? args["max-pages"] ?? 150);
const PRIORITY_MAX = Number(process.env.CRAWL_PRIORITY_MAX ?? args["priority-max"] ?? 2);
const MAX_DEPTH = Number(process.env.CRAWL_MAX_DEPTH ?? 3);
const CONCURRENT_SITES = Number(process.env.CRAWL_CONCURRENCY ?? 3);
const MAX_PDFS = Number(process.env.CRAWL_MAX_PDFS ?? 40); // per site
const MAX_PDF_BYTES = 15 * 1024 * 1024;
const ACTOR = "apify/website-content-crawler";

const sources = JSON.parse(await readFile(path.join(dataDir, "sources.json"), "utf8"));
const onlyDomains = typeof args.domains === "string" ? new Set(args.domains.split(",").map((d) => d.trim())) : null;

const targets = sources
  .filter((s) => s && s.url && s.reachable !== false)
  .filter((s) => (onlyDomains ? onlyDomains.has(s.domain) : Number(s.priority ?? 3) <= PRIORITY_MAX))
  .sort((a, b) => Number(a.priority ?? 3) - Number(b.priority ?? 3));

console.log(`Plan: ${targets.length} site(s), maxCrawlPages=${MAX_PAGES}, maxCrawlDepth=${MAX_DEPTH}`);
for (const s of targets) console.log(`  [p${s.priority}] ${s.domain}  ${s.url}`);
if (args["dry-run"]) process.exit(0);

if (!process.env.APIFY_TOKEN) {
  console.error("APIFY_TOKEN is not set. Add it to your environment (see .env.example).");
  process.exit(1);
}
const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inputFor(site) {
  const host = new URL(site.url).hostname.replace(/^www\./, "");
  return {
    startUrls: [{ url: site.url }],
    crawlerType: "playwright:adaptive",
    // Same-domain only (the host and its subdomains)
    includeUrlGlobs: [{ glob: `http?(s)://?(*.)${host}/**` }],
    excludeUrlGlobs: [{ glob: "**/*.{zip,rar,exe,mp4,mp3,avi,docx?,xlsx?,pptx?}" }],
    useSitemaps: true,
    maxCrawlPages: MAX_PAGES,
    maxCrawlDepth: MAX_DEPTH,
    maxConcurrency: 10,
    // PDFs: we don't rely on the actor's file storage. Instead we collect same-host
    // PDF links from the crawled markdown and extract their text locally (see fetchPdfs).
    saveFiles: false,
    saveMarkdown: true,
    saveHtml: false,
    htmlTransformer: "readableText",
    removeCookieWarnings: true,
    clickElementsCssSelector: "",
    readableTextCharThreshold: 100,
    proxyConfiguration: { useApifyProxy: true },
  };
}

async function crawlSite(site) {
  const host = new URL(site.url).hostname.replace(/^www\./, "");
  const input = inputFor(site);
  console.log(`→ ${host}: starting run`);
  const run = await client.actor(ACTOR).call(input, { waitSecs: 0 });
  const finished = await client.run(run.id).waitForFinish();
  if (finished.status !== "SUCCEEDED") {
    console.warn(`✗ ${host}: run ${run.id} ended with ${finished.status}`);
  }
  const items = [];
  let offset = 0;
  for (;;) {
    const page = await client.dataset(finished.defaultDatasetId).listItems({ offset, limit: 1000, clean: true });
    items.push(...page.items);
    offset += page.items.length;
    if (page.items.length === 0 || offset >= page.total) break;
  }
  await writeFile(path.join(dataDir, `apify-raw-${host}.json`), JSON.stringify(items));
  const hostRe = new RegExp(`(^|\\.)${escapeRe(host)}$`);
  const records = items
    .filter((it) => {
      try {
        return hostRe.test(new URL(it.url ?? it.loadedUrl).hostname.replace(/^www\./, ""));
      } catch {
        return false;
      }
    })
    .map((it) => {
      const url = it.url ?? it.loadedUrl;
      const isPdf = /\.pdf($|\?)/i.test(url) || it.metadata?.contentType?.includes?.("pdf");
      return {
        title: it.metadata?.title || (isPdf ? decodeURIComponent(url.split("/").pop() || url) : url),
        url,
        domain: host,
        lang: it.metadata?.languageCode || guessLang(it.text || ""),
        topic: site.category ?? "",
        fetched: it.crawl?.loadedTime ?? new Date().toISOString(),
        text: (it.text || it.markdown || "").slice(0, 200_000),
      };
    });
  const pdfs = await fetchPdfs(site, host, hostRe, items);
  console.log(`✓ ${host}: ${items.length} pages, ${records.length} kept, ${pdfs.length} PDFs`);
  return [...records, ...pdfs];
}

/** Finds PDF links on the crawled pages (same host), downloads and extracts text with unpdf. */
async function fetchPdfs(site, host, hostRe, items) {
  const links = new Set();
  for (const it of items) {
    const base = it.url ?? it.loadedUrl;
    const md = it.markdown ?? "";
    for (const m of md.matchAll(/\]\((\S+?\.pdf(?:\?[^)\s]*)?)\)/gi)) {
      try {
        const u = new URL(m[1], base);
        if (hostRe.test(u.hostname.replace(/^www\./, ""))) links.add(u.href.replace(/#.*$/, ""));
      } catch {
        /* skip */
      }
    }
    if (/\.pdf($|\?)/i.test(base ?? "")) links.add(base);
  }
  const out = [];
  for (const url of [...links].slice(0, MAX_PDFS)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) continue;
      const buf = new Uint8Array(await res.arrayBuffer());
      if (buf.byteLength > MAX_PDF_BYTES) continue;
      const pdf = await getDocumentProxy(buf);
      const { text } = await extractText(pdf, { mergePages: true });
      const clean = String(text).replace(/\s+/g, " ").trim();
      if (clean.length < 200) continue; // likely a scanned PDF with no text layer
      out.push({
        title: decodeURIComponent(url.split("/").pop()?.split("?")[0] || url).replace(/[-_]+/g, " "),
        url,
        domain: host,
        lang: guessLang(clean),
        topic: site.category ?? "",
        fetched: new Date().toISOString(),
        text: clean.slice(0, 200_000),
      });
    } catch (err) {
      console.warn(`  pdf skipped ${url}: ${err?.message ?? err}`);
    }
  }
  return out;
}

function guessLang(text) {
  const ar = (text.match(/[؀-ۿ]/g) || []).length;
  const lat = (text.match(/[A-Za-z]/g) || []).length;
  if (ar > lat) return "ar";
  return /\b(le|la|les|des|pour|est)\b/i.test(text) ? "fr" : "en";
}

// Run a few sites at a time
const results = [];
const queue = [...targets];
await Promise.all(
  Array.from({ length: Math.min(CONCURRENT_SITES, queue.length) }, async () => {
    while (queue.length) {
      const site = queue.shift();
      try {
        results.push(...(await crawlSite(site)));
      } catch (err) {
        console.warn(`✗ ${site.domain}: ${err?.message ?? err}`);
      }
    }
  }),
);

// Merge: seed corpus first (hand-checked), then crawled pages; de-dupe by URL.
const seedPath = path.join(dataDir, "seed-corpus.json");
const seed = existsSync(seedPath) ? JSON.parse(await readFile(seedPath, "utf8")) : [];
const merged = normalizeCorpus([...normalizeCorpus(seed), ...results]);
await writeFile(path.join(dataDir, "corpus.json"), JSON.stringify(merged, null, 0));
console.log(`\nWrote data/corpus.json: ${merged.length} documents (${seed.length} seed + ${results.length} crawled, de-duplicated).`);
console.log("Next: npm run index");
