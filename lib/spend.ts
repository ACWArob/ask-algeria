/**
 * Spending guard for Claude calls. Three layers, all free to run:
 *   1. Kill switch: AI_DISABLED=1 → no model calls at all (free search, guides and cached answers keep working).
 *   2. Daily budget: AI_DAILY_BUDGET_USD (default $5) of estimated spend per UTC day (all instances with a shared store, else per instance), computed
 *      from the real token usage the API returns. Over it → AI pauses until midnight UTC.
 *   3. Per-visitor daily quotas: AI_DAILY_PER_IP (default 40 written answers) and TRANSLATE_DAILY_PER_IP (default 10).
 * Counters live in memory (per serverless instance). When a shared store is configured (lib/kv.ts, Upstash Redis),
 * the daily total and the per-visitor counts are also kept there, so the budget and quotas hold across instances;
 * if the store can't be reached, the in-memory counters decide (still limited, never unlimited). The hard ceiling is
 * the monthly spend limit set on the API workspace in the Claude Console (see docs/cost.md). Prices are per million
 * tokens (MTok).
 */
import { createHash } from "node:crypto";
import { sharedKv } from "@/lib/kv";

type Price = { in: number; out: number; inLong?: number; outLong?: number };
const PRICES: Record<string, Price> = {
  // Haiku 5.5 is priced by prompt length: above 100k input tokens a request costs 5x.
  "claude-haiku-5-5": { in: 0.1, out: 0.5, inLong: 0.5, outLong: 2.5 },
  "claude-sonnet-5-5": { in: 2, out: 10 },
};
/** Unknown model: assume the expensive tier rather than zero. */
const UNKNOWN: Price = { in: 5, out: 25 };

export interface Usage {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

/** Estimated US$ cost of one API call. */
export function costUsd(model: string, u: Usage | null | undefined): number {
  if (!u) return 0;
  const p = PRICES[model] ?? UNKNOWN;
  const input = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) * 1.25 + (u.cache_read_input_tokens ?? 0) * 0.1;
  const prompt = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
  const long = prompt > 100_000 && p.inLong !== undefined;
  return (input * (long ? p.inLong! : p.in) + (u.output_tokens ?? 0) * (long ? p.outLong! : p.out)) / 1_000_000;
}

const num = (v: string | undefined, d: number) => (v !== undefined && v !== "" && Number.isFinite(Number(v)) ? Number(v) : d);
const today = (now: number) => new Date(now).toISOString().slice(0, 10);

let day = "";
/** This instance's spend today (always counted, also when a shared store is used). */
let spent = 0;
/** Last known all-instances total for `day` from the shared store (0 without one). */
let shared = 0;
const perIp = new Map<string, number>();
/** Shared-store writes still in flight (recordSpend doesn't wait for them). */
const pending = new Set<Promise<void>>();

/** Shared keys live two days, so a day's key is still there just after midnight UTC and then disappears. */
const KEY_TTL_S = 2 * 24 * 60 * 60;
const spendKey = (d: string) => `aa:spend:${d}`;
/** Visitor IPs are hashed before they go to the shared store. */
const quotaKey = (kind: string, d: string, ip: string) => `aa:quota:${kind}:${d}:${createHash("sha256").update(ip).digest("base64url").slice(0, 22)}`;

function roll(now: number) {
  const d = today(now);
  if (d !== day) {
    day = d;
    spent = 0;
    shared = 0;
    perIp.clear();
  }
}

const total = () => Math.max(spent, shared);

/**
 * Add the cost of one finished call (any model) to today's total. Returns the call's cost. Synchronous: the
 * shared-store update (one INCRBYFLOAT + EXPIRE request) runs in the background; await spendSettled() before the
 * response ends so it isn't cut off.
 */
export function recordSpend(model: string, usage: Usage | null | undefined, now = Date.now()): number {
  roll(now);
  const c = costUsd(model, usage);
  spent += c;
  const kv = sharedKv();
  if (kv && c > 0) {
    const d = day;
    const p: Promise<void> = kv.incrByFloatEx(spendKey(d), c, KEY_TTL_S).then((r) => {
      if (r.ok && d === day) shared = Math.max(shared, r.value);
    });
    pending.add(p);
    void p.finally(() => pending.delete(p));
  }
  return c;
}

/** Resolves once recordSpend's shared-store writes are done (each is bounded by the store timeout; never rejects). */
export async function spendSettled(): Promise<void> {
  await Promise.all([...pending]);
}

export function spentToday(now = Date.now()): number {
  roll(now);
  return total();
}

export type Block = "disabled" | "budget" | "quota";

/**
 * May this visitor trigger a model call now? Counts the call against their daily quota when allowed.
 * `kind` keeps written answers and document translations on separate quotas.
 * With a shared store: one request (GET today's total + INCR/EXPIRE the visitor's count); if the store fails, the
 * in-memory counters decide. Already blocked in memory → blocked without asking the store.
 */
export async function allowAi(
  ip: string,
  kind: "ask" | "translate",
  env: Record<string, string | undefined> = process.env,
  now = Date.now(),
): Promise<{ ok: true } | { ok: false; reason: Block }> {
  if (env.AI_DISABLED === "1" || env.AI_DISABLED === "true") return { ok: false, reason: "disabled" };
  roll(now);
  const budget = num(env.AI_DAILY_BUDGET_USD, 5);
  if (total() >= budget) {
    console.warn(`[spend] daily budget reached: $${total().toFixed(4)}${shared ? " (all instances)" : " (this instance)"}`);
    return { ok: false, reason: "budget" };
  }
  const limit = kind === "ask" ? num(env.AI_DAILY_PER_IP, 40) : num(env.TRANSLATE_DAILY_PER_IP, 10);
  const key = `${kind}:${ip}`;
  const n = perIp.get(key) ?? 0;
  if (n >= limit) return { ok: false, reason: "quota" };

  let count = n + 1;
  const kv = sharedKv();
  if (kv) {
    const asked = day;
    const qk = quotaKey(kind, asked, ip);
    const r = await kv.pipeline([["GET", spendKey(asked)], ["INCR", qk], ["EXPIRE", qk, KEY_TTL_S]]);
    if (r) {
      const all = Number(r[0] ?? 0);
      // Midnight UTC may have passed during the call: never carry yesterday's total into today.
      if (Number.isFinite(all) && asked === day) shared = Math.max(shared, all);
      const global = Number(r[1]);
      if (Number.isFinite(global)) count = Math.max(count, global);
      if (total() >= budget) {
        console.warn(`[spend] daily budget reached: $${total().toFixed(4)} (all instances)`);
        return { ok: false, reason: "budget" };
      }
      if (count > limit) {
        perIp.set(key, limit); // later requests from this visitor are refused without a store call
        return { ok: false, reason: "quota" };
      }
    }
    // r === null: store unreachable → the in-memory count below decides (limited, never unlimited).
  }
  if (perIp.size > 50_000) {
    // Bound memory under a flood of addresses: drop the oldest entries only, never everyone's count.
    let dropped = 0;
    for (const k of perIp.keys()) {
      perIp.delete(k);
      if (++dropped >= 10_000) break;
    }
  }
  perIp.set(key, count);
  return { ok: true };
}

/**
 * True once today's estimated spend has reached the budget (checked again before retry attempts). Uses the last
 * total seen from the shared store (from allowAi / recordSpend), so it costs no store command.
 */
export function overBudget(env: Record<string, string | undefined> = process.env, now = Date.now()): boolean {
  roll(now);
  return total() >= num(env.AI_DAILY_BUDGET_USD, 5);
}

/** For tests. */
export function resetSpend() {
  day = "";
  spent = 0;
  shared = 0;
  perIp.clear();
  pending.clear();
}

/** Rough page count of a PDF (counts page objects); 0 if it can't tell. */
export function pdfPageCount(bytes: Uint8Array): number {
  const s = Buffer.from(bytes).toString("latin1");
  return (s.match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? []).length;
}

/**
 * Is this PDF small enough to send? Pages hidden in compressed object streams can't be counted without a PDF
 * parser, so such files are only accepted when small (≈ a few pages).
 */
export function pdfAllowed(bytes: Uint8Array, maxPages: number, maxUncountedBytes = 1_500_000): boolean {
  const pages = pdfPageCount(bytes);
  const hidden = Buffer.from(bytes.subarray(0, Math.min(bytes.length, 4_000_000))).toString("latin1").includes("/ObjStm");
  if (pages > maxPages) return false;
  if (pages === 0 || hidden) return bytes.length <= maxUncountedBytes;
  return true;
}
