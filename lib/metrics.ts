/**
 * Usage counters for the daily metrics check (searches, written answers, cache hits, blocks, AI errors…). Counts
 * only: no question text, no IPs, nothing about a visitor. Buffered in memory and flushed to the shared store at
 * most every 10 s per server (one request), right after the response is sent (next/server `after`, so a serverless
 * function isn't frozen mid-write). The first count on a fresh server flushes at once: short-lived servers used to
 * lose everything. A server that stops loses at most its last 10 s. Without a shared store they stay per server.
 */
import { after } from "next/server";
import { sharedKv } from "@/lib/kv";

export const METRICS = [
  "search", "ask", "ask_cached", "ask_answered", "ask_failed", "ask_blocked_budget", "ask_blocked_quota",
  "ask_blocked_disabled", "ask_blocked_ai_unavailable", "translate", "feedback_up", "feedback_down", "contact",
  "ai_error_credit", "ai_error_auth", "ai_error_overloaded", "ai_error_rate_limit", "ai_error_other",
] as const;
export type Metric = (typeof METRICS)[number];

const TTL_S = 45 * 24 * 60 * 60;
const FLUSH_MS = 10_000;
const day = (now: number) => new Date(now).toISOString().slice(0, 10);
const key = (d: string, m: string) => `aa:m:${d}:${m}`;

let buf = new Map<string, number>(); // "<day>|<metric>" → count
let lastFlush = 0;

export function count(m: Metric, n = 1, now = Date.now()) {
  const k = `${day(now)}|${m}`;
  buf.set(k, (buf.get(k) ?? 0) + n);
  if (now - lastFlush >= FLUSH_MS) {
    lastFlush = now;
    try {
      after(() => flushMetrics(now)); // inside a request: runs once the response is sent, and is waited for
    } catch {
      void flushMetrics(now); // outside a request (tests, scripts)
    }
  }
}

/** Sends the buffered counts in one pipeline (INCRBY + EXPIRE each). Never throws. */
export async function flushMetrics(now = Date.now()): Promise<void> {
  lastFlush = now;
  const kv = sharedKv();
  if (!kv || buf.size === 0) return;
  const pending = buf;
  buf = new Map();
  const cmds = [...pending].flatMap(([k, n]) => {
    const [d, m] = k.split("|");
    return [["INCRBY", key(d, m), n], ["EXPIRE", key(d, m), TTL_S]] as (string | number)[][];
  });
  const r = await kv.pipeline(cmds);
  if (!r) for (const [k, n] of pending) buf.set(k, (buf.get(k) ?? 0) + n); // keep them for the next try
}

/** Daily totals for the last `days` days (shared store when set up, else this server's buffer only). Spend is not
 * included on purpose: /api/health is public; the credit balance is checked in the Claude Console. */
export async function dailyMetrics(days = 7, now = Date.now()): Promise<{ day: string; counts: Partial<Record<Metric, number>> }[]> {
  await flushMetrics(now);
  const list = Array.from({ length: Math.max(1, Math.min(days, 31)) }, (_, i) => day(now - i * 86_400_000));
  const kv = sharedKv();
  if (!kv) {
    return list.map((d) => ({
      day: d,
      counts: Object.fromEntries(METRICS.map((m) => [m, buf.get(`${d}|${m}`) ?? 0]).filter(([, v]) => v)) as Partial<Record<Metric, number>>,
    }));
  }
  const cmds = list.flatMap((d) => METRICS.map((m) => ["GET", key(d, m)]));
  const r = await kv.pipeline(cmds);
  return list.map((d, i) => {
    const row = r ? r.slice(i * METRICS.length, (i + 1) * METRICS.length) : [];
    const counts: Partial<Record<Metric, number>> = {};
    METRICS.forEach((m, j) => {
      const v = Number(row[j] ?? 0) + (buf.get(`${d}|${m}`) ?? 0);
      if (v) counts[m] = v;
    });
    return { day: d, counts };
  });
}

/** For tests. */
export function resetMetrics() {
  buf = new Map();
  lastFlush = 0;
}
