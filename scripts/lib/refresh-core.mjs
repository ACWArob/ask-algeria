// Pure helpers for the refresh job (scripts/check-updates.mjs, scripts/crossref.mjs).
// No I/O here so everything is unit-testable (tests/refresh.test.ts).
import { createHash } from "node:crypto";
import { parse } from "node-html-parser";

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 " +
  "(compatible; AskAlgeriaBot/1.0; independent project; +https://algeriagov.online/about)";
/** Token we look for in robots.txt groups (in addition to "*"). */
export const ROBOTS_TOKEN = "askalgeriabot";

export function today(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/* ───────────── Text normalisation + hashing ───────────── */

const VOLATILE = [
  /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?\b/gi, // clock times
  /(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?\d{4}/gi, // copyright years
  /\b(?:visits?|visiteurs?|views?|vues?|زيارة|الزوار)\s*:?\s*[\d\s.,]+/gi, // hit counters
  /\b(?:last updated|mis à jour le|dernière mise à jour|آخر تحديث)\s*:?\s*[^\n]{0,40}/gi,
];

/**
 * Canonical form used for change detection: Unicode NFKC, Arabic diacritics and tatweel removed,
 * Arabic-Indic digits mapped to ASCII, volatile tokens (clock times, counters, © years) dropped,
 * lowercase, whitespace collapsed.
 */
export function normalizeForHash(text) {
  let t = String(text ?? "").normalize("NFKC");
  t = t.replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660));
  t = t.replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0));
  t = t.replace(/[ً-ٰٟـ]/g, "");
  t = t.toLowerCase();
  for (const re of VOLATILE) t = t.replace(re, " ");
  t = t.replace(/[​-‏‪-‮⁦-⁩﻿]/g, "");
  return t.replace(/\s+/g, " ").trim();
}

export function contentHash(text) {
  return createHash("sha256").update(normalizeForHash(text)).digest("hex").slice(0, 32);
}

/* ───────────── HTML → main text ───────────── */

const DROP = "script,style,noscript,template,svg,iframe,canvas,form,nav,header,footer,aside,button,select,[role=navigation],[role=banner],[role=contentinfo],[aria-hidden=true],.breadcrumb,.breadcrumbs,.menu,.navbar,.footer,.header,.sidebar,.social,.share,#cookie,.cookie,.cookies";
const MAIN = ["main", "article", "[role=main]", "#content", "#main", ".content", ".main-content", ".page-content", ".entry-content", ".node__content", ".field--name-body", "#block-system-main"];

/** Light, dependency-cheap main-content extraction. Returns { title, text }. */
export function htmlToText(html) {
  const root = parse(String(html ?? ""), { comment: false, blockTextElements: { script: false, style: false, noscript: false, pre: true } });
  const title = (root.querySelector("title")?.text ?? root.querySelector("h1")?.text ?? "").replace(/\s+/g, " ").trim();
  for (const el of root.querySelectorAll(DROP)) el.remove();
  let best = null;
  for (const sel of MAIN) {
    for (const el of root.querySelectorAll(sel)) {
      const len = el.text.replace(/\s+/g, " ").trim().length;
      if (len > 200 && (!best || len > best.len)) best = { el, len };
    }
    if (best) break;
  }
  const node = best?.el ?? root.querySelector("body") ?? root;
  const text = node.structuredText
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  return { title, text };
}

/** Decode a fetched body using the charset from Content-Type or <meta charset>, defaulting to UTF-8. */
export function decodeBody(buf, contentType = "") {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let cs = /charset=["']?([\w-]+)/i.exec(contentType)?.[1];
  if (!cs) {
    const head = new TextDecoder("latin1").decode(bytes.slice(0, 2048));
    cs = /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1];
  }
  try {
    return new TextDecoder((cs || "utf-8").toLowerCase()).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

/** Detects block/challenge pages and empty JS shells that must not overwrite real content. */
export function looksBlockedOrEmpty(text) {
  const t = String(text ?? "").trim();
  if (t.length < 200) return true;
  if (t.length < 2500 && /(captcha|access denied|request blocked|cloudflare|attention required|forbidden|enable javascript|veuillez activer javascript|يرجى تفعيل)/i.test(t)) return true;
  return false;
}

export function looksSoft404(title, text) {
  const s = `${title ?? ""} ${String(text ?? "").slice(0, 600)}`;
  return String(text ?? "").length < 1500 && /(\b404\b|page (?:not found|introuvable|non trouvée)|n'existe pas|الصفحة غير موجودة|صفحة غير موجودة)/i.test(s);
}

/* ───────────── robots.txt ───────────── */

/** Parses robots.txt into groups: [{ agents: string[], rules: [{ allow: boolean, path: string }] }]. */
export function parseRobots(txt) {
  const groups = [];
  let cur = null;
  let lastWasAgent = false;
  for (const raw of String(txt ?? "").split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === "user-agent") {
      if (!cur || !lastWasAgent) {
        cur = { agents: [], rules: [] };
        groups.push(cur);
      }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!cur) continue;
    if (key === "allow" || key === "disallow") {
      // An empty Disallow means "allow everything" → no rule.
      if (val === "" && key === "disallow") continue;
      cur.rules.push({ allow: key === "allow", path: val });
    }
  }
  return groups;
}

function ruleToRegex(path) {
  const anchored = path.endsWith("$");
  const body = (anchored ? path.slice(0, -1) : path)
    .split("*")
    .map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp("^" + body + (anchored ? "$" : ""));
}

/**
 * Google-style evaluation: use the most specific matching group (our token, else "*"),
 * then the longest matching rule wins; ties go to Allow. No group → allowed.
 */
export function isAllowed(groups, urlOrPath, token = ROBOTS_TOKEN) {
  let path = urlOrPath;
  try {
    const u = new URL(urlOrPath);
    path = u.pathname + u.search;
  } catch {
    /* already a path */
  }
  try {
    path = decodeURI(path);
  } catch {
    /* keep as-is */
  }
  const mine = groups.filter((g) => g.agents.some((a) => a && a !== "*" && token.startsWith(a.replace(/\/.*$/, ""))));
  const group = mine.length ? mine : groups.filter((g) => g.agents.includes("*"));
  if (!group.length) return true;
  let best = null;
  for (const g of group) {
    for (const r of g.rules) {
      if (!ruleToRegex(r.path).test(path)) continue;
      const len = r.path.length;
      if (!best || len > best.len || (len === best.len && r.allow)) best = { len, allow: r.allow };
    }
  }
  return best ? best.allow : true;
}

/* ───────────── Page state transitions ───────────── */

/**
 * @param {Record<string, any> | undefined} prev previous state entry
 * @param {{kind: string, hash?: string, httpStatus?: number, note?: string}} result
 *   {kind: "ok", hash, httpStatus} | {kind: "gone", httpStatus} | {kind: "unreachable", httpStatus?, note?}
 * @param {string} day ISO date of this check
 * @param {string | null} [fallbackChanged] lastChanged to record on a first baseline
 * @returns {{ state: Record<string, any>, action: string }} action: baseline|changed|unchanged|gone-pending|gone|unreachable
 */
export function nextState(prev, result, day, fallbackChanged = null) {
  const base = { hash: null, lastChanged: null, ...(prev ?? {}), lastChecked: day, httpStatus: result.httpStatus ?? null };
  delete base.note;
  if (result.kind === "ok") {
    base.goneCount = 0;
    if (!prev?.hash) {
      return { state: { ...base, hash: result.hash, status: "ok", lastChanged: prev?.lastChanged ?? fallbackChanged }, action: "baseline" };
    }
    if (prev.hash !== result.hash) {
      return { state: { ...base, hash: result.hash, status: "changed", lastChanged: day }, action: "changed" };
    }
    return { state: { ...base, status: "ok" }, action: "unchanged" };
  }
  if (result.kind === "gone") {
    const goneCount = (prev?.goneCount ?? 0) + 1;
    const gone = goneCount >= 2;
    return { state: { ...base, goneCount, status: gone ? "gone" : "unreachable", ...(gone ? {} : { note: "not-found-once" }) }, action: gone ? "gone" : "gone-pending" };
  }
  // unreachable: keep hash and goneCount (neither confirms nor refutes)
  return { state: { ...base, status: "unreachable", ...(result.note ? { note: result.note } : {}) }, action: "unreachable" };
}

/* ───────────── Stale-date heuristic (used by crossref) ───────────── */

/** Returns { newest, years } of plausible calendar years mentioned in the text (1990..now+1). */
export function yearsMentioned(text, now = new Date()) {
  const max = now.getUTCFullYear() + 1;
  const years = new Set();
  for (const m of String(text ?? "").matchAll(/(?<!\d)(19[9]\d|20\d\d)(?!\d)/g)) {
    const y = Number(m[1]);
    if (y >= 1990 && y <= max) years.add(y);
  }
  const list = [...years].sort((a, b) => a - b);
  return { newest: list.at(-1) ?? null, years: list };
}
