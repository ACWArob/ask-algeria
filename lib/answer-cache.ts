/**
 * Cache of complete /api/ask answers for first questions (no conversation context), so a popular question
 * ("renew passport", same office, same language) costs zero model calls after the first time.
 *
 * Key = normalized question + answer language + office (or "none") + corpus/index/deploy version.
 * Store: in-memory LRU per serverless instance (ANSWER_CACHE=memory, the default; ANSWER_CACHE=off disables).
 * A shared store (Vercel KV / Upstash) can implement AnswerStore later and be picked in answerStore() by env var.
 */
import { closeSync, existsSync, openSync, readSync, statSync } from "node:fs";
import path from "node:path";
import { INDEX_VERSION, normalizeTerm } from "@/lib/search-core.mjs";
import type { Locale } from "@/lib/i18n";
import type { AskMeta } from "@/lib/types";

export interface CachedAnswer {
  meta: AskMeta;
  text: string;
}

/** Async so a network store (KV) fits the same interface. */
export interface AnswerStore {
  get(key: string): Promise<CachedAnswer | null>;
  set(key: string, value: CachedAnswer): Promise<void>;
}

/** Bounded LRU with a TTL. Map keeps insertion order: re-inserting on read moves an entry to the end. */
export class MemoryAnswerStore implements AnswerStore {
  private map = new Map<string, { value: CachedAnswer; expires: number }>();
  constructor(
    private max = 500,
    private ttlMs = 24 * 60 * 60 * 1000,
    private now: () => number = Date.now,
  ) {}
  get size(): number {
    return this.map.size;
  }
  async get(key: string): Promise<CachedAnswer | null> {
    const e = this.map.get(key);
    if (!e) return null;
    this.map.delete(key);
    if (e.expires <= this.now()) return null;
    this.map.set(key, e);
    return e.value;
  }
  async set(key: string, value: CachedAnswer): Promise<void> {
    this.map.delete(key);
    this.map.set(key, { value, expires: this.now() + this.ttlMs });
    while (this.map.size > this.max) this.map.delete(this.map.keys().next().value as string);
  }
}

let store: AnswerStore | null | undefined;
/** The configured store, or null when caching is off. */
export function answerStore(): AnswerStore | null {
  if (store !== undefined) return store;
  const kind = (process.env.ANSWER_CACHE || "memory").toLowerCase();
  // Future: if (kind === "kv") store = new KvAnswerStore(process.env.KV_REST_API_URL, …)
  store =
    kind === "off" || kind === "0" || kind === "false"
      ? null
      : new MemoryAnswerStore(Number(process.env.ANSWER_CACHE_MAX) || 500, Number(process.env.ANSWER_CACHE_TTL_MS) || 24 * 60 * 60 * 1000);
  return store;
}

const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
/**
 * Lowercase, strip punctuation and diacritics (Latin accents, Arabic tashkeel/tatweel), unify Arabic letter forms,
 * Arabic-Indic digits → ASCII, collapse spaces. Word order and every word (including numbers like an age) are kept.
 */
export function normalizeQuestion(q: string): string {
  const t = q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(ARABIC_MARKS, "")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  return t
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((w) => normalizeTerm(w) ?? w)
    .join(" ");
}

export interface KeyParts {
  question: string;
  lang: Locale;
  /** Resolved office/post (or country, or "none"), including whether it came from the connection. */
  office: string;
  version: string;
}
export function answerCacheKey(p: KeyParts): string {
  return JSON.stringify([p.version, p.lang, p.office, normalizeQuestion(p.question)]);
}

let version: string | undefined;
/** Changes whenever the index is rebuilt (weekly refresh) or a new deploy ships (prompts/models may change). */
export function corpusVersion(): string {
  if (version) return version;
  let built = "";
  const dir = path.join(process.cwd(), "data");
  try {
    // Only the head of index.json: {"version":2,"builtAt":"…",…}
    const fd = openSync(path.join(dir, "index.json"), "r");
    const buf = Buffer.alloc(256);
    readSync(fd, buf, 0, 256, 0);
    closeSync(fd);
    built = /"builtAt":"([^"]+)"/.exec(buf.toString("utf8"))?.[1] ?? "";
  } catch {
    /* no prebuilt index */
  }
  if (!built) {
    const c = path.join(dir, "corpus.json");
    built = existsSync(c) ? `corpus@${statSync(c).mtimeMs}` : "seed";
  }
  const deploy = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || process.env.COMMIT_REF || "dev";
  version = `${INDEX_VERSION}:${built}:${deploy}`;
  return version;
}

/** Lines the model uses to ask a clarifying question (lib/prompts.ts CLARIFY). */
const CLARIFY_MARKERS = ["To be sure:", "Pour être sûr :", "للتأكد:", "باش نتأكد:"];

export interface Outcome {
  /** The stream ended on the normal path (no error, no deadline cut, not shortened at max_tokens). */
  finishedNormally: boolean;
  text: string;
  meta: AskMeta;
  /** Final answer is in the wrong script for meta.answerLang (language retry failed). */
  wrongLanguage: boolean;
}
/** Only clean, complete, non-clarifying answers are cached. */
export function isCacheable(o: Outcome): boolean {
  if (!o.finishedNormally || o.wrongLanguage) return false;
  const text = o.text.trim();
  if (text.length < 40 || text.includes("\u0000")) return false;
  if (o.meta.chips?.length) return false;
  if (CLARIFY_MARKERS.some((m) => text.includes(m))) return false;
  return true;
}
