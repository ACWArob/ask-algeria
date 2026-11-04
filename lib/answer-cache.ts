/**
 * Cache of complete /api/ask answers for first questions (no conversation context), so a popular question
 * ("renew passport", same office, same language) costs zero model calls after the first time.
 *
 * Key = normalized question + answer language + office (or "none") + corpus/index/deploy version.
 * Store: in-memory LRU per serverless instance; when a shared store is configured (lib/kv.ts, Upstash Redis) the
 * memory LRU sits in front of it, so an answer written on one instance is served by all of them.
 * ANSWER_CACHE=memory forces memory only; ANSWER_CACHE=off disables caching.
 */
import { createHash } from "node:crypto";
import { closeSync, existsSync, openSync, readSync, statSync } from "node:fs";
import path from "node:path";
import { INDEX_VERSION, normalizeTerm } from "@/lib/search-core.mjs";
import type { Locale } from "@/lib/i18n";
import type { AskMeta } from "@/lib/types";
import { sharedKv, type Kv } from "@/lib/kv";

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

/**
 * Shared store (Upstash Redis) behind a per-instance memory LRU. get: memory first (0 commands), else one GET;
 * set: memory + one SET … EX ttl. If the store can't be reached it behaves exactly like the memory store.
 */
export class KvAnswerStore implements AnswerStore {
  constructor(
    private kv: Kv,
    private ttlMs = 24 * 60 * 60 * 1000,
    private local = new MemoryAnswerStore(500, ttlMs),
  ) {}
  /** Cache keys contain the whole question; hash them to keep Redis keys short. */
  static redisKey(key: string): string {
    return `aa:ans:${createHash("sha256").update(key).digest("base64url")}`;
  }
  async get(key: string): Promise<CachedAnswer | null> {
    const near = await this.local.get(key);
    if (near) return near;
    const r = await this.kv.get(KvAnswerStore.redisKey(key));
    if (!r.ok || !r.value) return null;
    try {
      const v = JSON.parse(r.value) as CachedAnswer;
      if (typeof v?.text !== "string" || v.meta?.type !== "meta") return null;
      await this.local.set(key, v);
      return v;
    } catch {
      return null;
    }
  }
  async set(key: string, value: CachedAnswer): Promise<void> {
    await this.local.set(key, value);
    await this.kv.setEx(KvAnswerStore.redisKey(key), JSON.stringify(value), this.ttlMs / 1000);
  }
}

let store: AnswerStore | null | undefined;
/** The configured store, or null when caching is off. */
export function answerStore(): AnswerStore | null {
  if (store !== undefined) return store;
  const kind = (process.env.ANSWER_CACHE || "auto").toLowerCase();
  if (kind === "off" || kind === "0" || kind === "false") return (store = null);
  const ttl = Number(process.env.ANSWER_CACHE_TTL_MS) || 24 * 60 * 60 * 1000;
  const memory = new MemoryAnswerStore(Number(process.env.ANSWER_CACHE_MAX) || 500, ttl);
  const kv = kind === "memory" ? null : sharedKv();
  store = kv ? new KvAnswerStore(kv, ttl, memory) : memory;
  return store;
}

/** For tests: pick the store from the environment again. */
export function resetAnswerStore() {
  store = undefined;
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
