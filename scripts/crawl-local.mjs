#!/usr/bin/env node
/**
 * Crawl official Algerian sites FROM YOUR OWN COMPUTER (e.g. an Algerian internet connection, where .dz
 * sites that block foreign traffic do open). No dependencies: needs Node 18+ only.
 *
 *   node scripts/crawl-local.mjs --dry-run                 # list the sites it would crawl
 *   node scripts/crawl-local.mjs                           # crawl every site we have no live pages for
 *   node scripts/crawl-local.mjs --domains=dgsn.dz,aadl.dz # only these sites
 *   node scripts/crawl-local.mjs --max-pages=40 --depth=2  # pages per site (default 30), link depth (default 2)
 *   node scripts/crawl-local.mjs --url=https://www.wilaya-x.dz/  # one site that isn't in our list yet
 *
 * Output: data/algeria-crawl-<date>.json (send this file back, or commit it).
 * Import (maintainers): node scripts/import-apify.mjs data/algeria-crawl-<date>.json && npm run index
 *
 * Polite by design: one site at a time, ~1 request/second, same-site links only, skips logins/forms/files,
 * stores only page text (no cookies, no personal data). Stop any time with Ctrl+C; finished sites are saved.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const MAX_PAGES = Number(args["max-pages"] ?? 30);
const MAX_DEPTH = Number(args.depth ?? 2);
const DELAY_MS = Number(args.delay ?? 1000);
const TIMEOUT_MS = Number(args.timeout ?? 20000);
const day = new Date().toISOString().slice(0, 10);
const OUT = path.join(root, "data", `algeria-crawl-${day}.json`);

const bare = (d) => String(d || "").toLowerCase().replace(/^www\./, "");
const sources = JSON.parse(readFileSync(path.join(root, "data", "sources.json"), "utf8"));
const corpus = existsSync(path.join(root, "data", "corpus.json")) ? JSON.parse(readFileSync(path.join(root, "data", "corpus.json"), "utf8")) : [];
const livePages = new Map();
for (const r of corpus) if (r.extraction !== "archived") livePages.set(bare(r.domain), (livePages.get(bare(r.domain)) ?? 0) + 1);

// Default targets: official sites we have no live pages for (mostly the ones blocked from abroad).
const only = typeof args.domains === "string" ? new Set(args.domains.split(",").map(bare)) : null;
const seen = new Set();
const targets = typeof args.url === "string"
  ? [{ url: args.url, domain: new URL(args.url).hostname }] // one specific site, e.g. a wilaya portal we don't list yet
  : sources
  .filter((s) => s?.url && s.fetch_status !== "dead")
  .filter((s) => (only ? only.has(bare(s.domain)) : !livePages.get(bare(s.domain))))
  .filter((s) => (seen.has(bare(s.domain)) ? false : seen.add(bare(s.domain))));

console.log(`Plan: ${targets.length} site(s), up to ${MAX_PAGES} pages each, depth ${MAX_DEPTH}. Output: ${path.relative(root, OUT)}`);
for (const s of targets) console.log(`  ${bare(s.domain).padEnd(36)} ${s.url}`);
if (args["dry-run"]) process.exit(0);

const SKIP = /\.(jpe?g|png|gif|webp|svg|ico|css|js|zip|rar|mp4|mp3|avi|docx?|xlsx?|pptx?)(\?|$)|\/(login|connexion|signin|logout|register|inscription-en-ligne|panier|cart|wp-admin|wp-login)/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", laquo: "«", raquo: "»", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", ecirc: "ê", ocirc: "ô", icirc: "î", ucirc: "û", rsquo: "’", lsquo: "‘", hellip: "…", ndash: "–", mdash: "—" };
function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

/** Readable text of an HTML page: main/article if present, without menus, scripts and footers. */
function htmlToText(html) {
  let h = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|noscript|svg|iframe|form|nav|header|footer)[\s\S]*?<\/\1>/gi, " ");
  const main = h.match(/<(main|article)[^>]*>([\s\S]*?)<\/\1>/i);
  if (main && main[2].replace(/<[^>]+>/g, "").trim().length > 300) h = main[2];
  return decode(
    h
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section)[^>]*>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n- ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchPage(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (AskAlgeria research crawler; contact via project maintainer)", "Accept-Language": "fr,ar;q=0.9,en;q=0.8" },
    });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.includes("html")) return { status: res.status, url: res.url };
    return { status: res.status, url: res.url, html: await res.text() };
  } catch (e) {
    return { status: 0, url, error: e.name === "AbortError" ? "timeout" : e.message };
  } finally {
    clearTimeout(timer);
  }
}

async function crawlSite(site) {
  const host = bare(new URL(site.url).hostname);
  const queue = [{ url: site.url, depth: 0 }];
  const visited = new Set();
  const items = [];
  let errors = 0;
  while (queue.length && items.length < MAX_PAGES) {
    const { url, depth } = queue.shift();
    const key = url.replace(/#.*$/, "").replace(/\/$/, "");
    if (visited.has(key)) continue;
    visited.add(key);
    const page = await fetchPage(url);
    await sleep(DELAY_MS);
    if (!page.html) {
      if (++errors >= 5 && items.length === 0) break; // site unreachable: move on
      continue;
    }
    const title = decode((page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim());
    const text = htmlToText(page.html);
    if (text.split(/\s+/).length >= 40) items.push({ url, loadedUrl: page.url, text, metadata: { title }, crawledFrom: "algeria-local", crawledAt: new Date().toISOString() });
    if (depth >= MAX_DEPTH) continue;
    for (const m of page.html.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)) {
      let next;
      try {
        next = new URL(decode(m[1]), page.url);
      } catch {
        continue;
      }
      if (!/^https?:$/.test(next.protocol) || bare(next.hostname) !== host || SKIP.test(next.pathname)) continue;
      next.hash = "";
      if (!visited.has(next.href.replace(/\/$/, ""))) queue.push({ url: next.href, depth: depth + 1 });
    }
  }
  return { items, reached: items.length > 0, errors };
}

const all = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
const report = [];
for (const [i, site] of targets.entries()) {
  process.stdout.write(`[${i + 1}/${targets.length}] ${bare(site.domain)} … `);
  const { items, reached, errors } = await crawlSite(site);
  all.push(...items);
  writeFileSync(OUT, JSON.stringify(all)); // saved after every site, so Ctrl+C loses nothing
  report.push({ domain: bare(site.domain), pages: items.length, reached, errors });
  console.log(reached ? `${items.length} page(s)` : `not reachable (${errors} error(s))`);
}
writeFileSync(OUT.replace(/\.json$/, "-report.json"), JSON.stringify(report, null, 1));
console.log(`\nDone: ${all.length} page(s) from ${report.filter((r) => r.reached).length}/${report.length} site(s).`);
console.log(`Send back: ${path.relative(root, OUT)} and ${path.relative(root, OUT.replace(/\.json$/, "-report.json"))}`);
