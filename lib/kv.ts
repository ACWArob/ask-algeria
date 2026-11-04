/**
 * Optional shared store: a tiny Upstash Redis REST client (fetch only, no SDK), so the daily budget, per-visitor
 * quotas and the answer cache are shared by every serverless instance instead of each keeping its own.
 *
 * Configured by UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or the Vercel KV / Marketplace names
 * KV_REST_API_URL + KV_REST_API_TOKEN. Not configured → sharedKv() is null and everything stays in memory.
 *
 * Fail-safe: every call has a short timeout (KV_TIMEOUT_MS, default 300 ms) and never throws. A failure (timeout,
 * network, HTTP or command error) returns { ok: false } / null and callers use their in-memory logic; after a
 * failure the store is skipped for 15 s so a dead store doesn't add the timeout to every request.
 */

export type Cmd = (string | number)[];
export type KvResult<T> = { ok: true; value: T } | { ok: false };

export interface KvOptions {
  url: string;
  token: string;
  timeoutMs?: number;
  /** Time limit until the first successful call (connection setup on a new instance). */
  firstTimeoutMs?: number;
  fetch?: typeof fetch;
  now?: () => number;
}

const SKIP_AFTER_FAILURE_MS = 15_000;

export class Kv {
  private url: string;
  private token: string;
  private timeoutMs: number;
  /** Longer limit until the first success: a new instance's first request also sets up the TLS connection. */
  private firstTimeoutMs: number;
  private warm = false;
  private fetchImpl: typeof fetch;
  private now: () => number;
  private downUntil = 0;

  constructor(o: KvOptions) {
    this.url = o.url.replace(/\/+$/, "");
    this.token = o.token;
    this.timeoutMs = o.timeoutMs ?? 300;
    this.firstTimeoutMs = Math.max(this.timeoutMs, o.firstTimeoutMs ?? 0);
    this.fetchImpl = o.fetch ?? ((...a) => fetch(...a));
    this.now = o.now ?? Date.now;
  }

  /**
   * Runs the commands in order in one HTTP request (Upstash /pipeline; not atomic, which is fine for counters).
   * Returns each command's result, or null if anything failed.
   */
  async pipeline(cmds: Cmd[]): Promise<unknown[] | null> {
    if (cmds.length === 0) return [];
    if (this.now() < this.downUntil) return null;
    const ac = new AbortController();
    const limit = this.warm ? this.timeoutMs : this.firstTimeoutMs;
    const timer = setTimeout(() => ac.abort(), limit);
    try {
      const res = await this.fetchImpl(`${this.url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(cmds.map((c) => c.map(String))),
        signal: ac.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { result?: unknown; error?: string }[];
      if (!Array.isArray(body) || body.length !== cmds.length) throw new Error("unexpected response");
      const bad = body.find((r) => !r || typeof r !== "object" || r.error);
      if (bad) throw new Error(`command failed: ${bad?.error ?? "?"}`);
      this.warm = true;
      return body.map((r) => r.result ?? null);
    } catch (err) {
      this.downUntil = this.now() + SKIP_AFTER_FAILURE_MS;
      const why = ac.signal.aborted ? `timeout after ${limit} ms` : err instanceof Error ? err.message : String(err);
      console.warn(`[kv] shared store unavailable (${why}); using in-memory counters for ${SKIP_AFTER_FAILURE_MS / 1000}s`);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async get(key: string): Promise<KvResult<string | null>> {
    const r = await this.pipeline([["GET", key]]);
    if (!r) return { ok: false };
    return { ok: true, value: typeof r[0] === "string" ? r[0] : null };
  }

  /** SET key value EX seconds. True when written. */
  async setEx(key: string, value: string, seconds: number): Promise<boolean> {
    return (await this.pipeline([["SET", key, value, "EX", Math.max(1, Math.ceil(seconds))]])) !== null;
  }

  /** INCR + EXPIRE in one round trip. Returns the new count. */
  async incrEx(key: string, seconds: number): Promise<KvResult<number>> {
    const r = await this.pipeline([["INCR", key], ["EXPIRE", key, seconds]]);
    const n = Number(r?.[0]);
    return r && Number.isFinite(n) ? { ok: true, value: n } : { ok: false };
  }

  /** INCRBYFLOAT + EXPIRE in one round trip. Returns the new total. */
  async incrByFloatEx(key: string, by: number, seconds: number): Promise<KvResult<number>> {
    const r = await this.pipeline([["INCRBYFLOAT", key, by.toFixed(8)], ["EXPIRE", key, seconds]]);
    const n = Number(r?.[0]);
    return r && Number.isFinite(n) ? { ok: true, value: n } : { ok: false };
  }
}

/** URL + token from the environment (Upstash names first, then Vercel KV names), or null when not configured. */
export function kvConfig(env: Record<string, string | undefined> = process.env): { url: string; token: string } | null {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

let shared: Kv | null | undefined;
/** The shared store for this process, or null when none is configured (→ today's in-memory behaviour). */
export function sharedKv(): Kv | null {
  if (shared !== undefined) return shared;
  const c = kvConfig();
  // A cold instance's first call timed out at 300 ms on Vercel (TLS setup), which skipped the shared cache write.
  shared = c ? new Kv({ ...c, timeoutMs: Number(process.env.KV_TIMEOUT_MS) || 300, firstTimeoutMs: 1500 }) : null;
  return shared;
}

/** For tests: use this client (null = no store); undefined = read the environment again. */
export function setSharedKv(kv: Kv | null | undefined) {
  shared = kv;
}
