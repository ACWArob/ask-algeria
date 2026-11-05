/**
 * What the uptime monitor needs to know about the AI side, without a paid call: the last model error (kind only,
 * never the message text or anything from the visitor) and the last success. Kept in memory and, when the shared
 * store is set up, in Upstash so /api/health on any instance sees it. Never throws; writes are fire-and-forget.
 */
import { sharedKv } from "@/lib/kv";
import { count } from "@/lib/metrics";

export type AiErrorKind = "credit" | "auth" | "overloaded" | "rate_limit" | "timeout" | "other";
export interface AiState { lastErrorAt: number | null; lastErrorKind: AiErrorKind | null; lastOkAt: number | null }

const KEY = "aa:health:ai";
const TTL_S = 6 * 60 * 60;
let state: AiState = { lastErrorAt: null, lastErrorKind: null, lastOkAt: null };
let lastOkWrite = 0;

/** The useful category of an Anthropic API error (credit balance, bad key, overloaded…). */
export function classifyAiError(err: unknown): AiErrorKind {
  const e = err as { status?: number; message?: string; name?: string } | null;
  const msg = `${e?.name ?? ""} ${e?.message ?? String(err ?? "")}`.toLowerCase();
  if (/credit balance|billing|insufficient|purchase credits|spend limit|usage limit/.test(msg)) return "credit";
  if (e?.status === 401 || e?.status === 403 || /invalid x-api-key|authentication|permission/.test(msg)) return "auth";
  if (e?.status === 529 || /overloaded/.test(msg)) return "overloaded";
  if (e?.status === 429 || /rate limit/.test(msg)) return "rate_limit";
  if (/timeout|timed out|abort/.test(msg)) return "timeout";
  return "other";
}

function save() {
  const kv = sharedKv();
  if (kv) void kv.setEx(KEY, JSON.stringify(state), TTL_S).catch(() => undefined);
}

export function noteAiError(err: unknown, now = Date.now()): AiErrorKind {
  const kind = classifyAiError(err);
  // Timeouts from our own deadline and wrong-language retries are normal; only real API problems are tracked.
  if (kind === "timeout") return kind;
  count(`ai_error_${kind}`);
  state = { ...state, lastErrorAt: now, lastErrorKind: kind };
  save();
  return kind;
}

export function noteAiOk(now = Date.now()) {
  state = { ...state, lastOkAt: now };
  if (now - lastOkWrite > 5 * 60_000) {
    lastOkWrite = now;
    save();
  }
}

/** This instance's view merged with the shared one (the most recent error and success win). */
export async function aiState(): Promise<AiState> {
  const kv = sharedKv();
  if (!kv) return state;
  const r = await kv.get(KEY);
  if (!r.ok || !r.value) return state;
  try {
    const s = JSON.parse(r.value) as AiState;
    const errFromShared = (s.lastErrorAt ?? 0) > (state.lastErrorAt ?? 0);
    return {
      lastErrorAt: errFromShared ? s.lastErrorAt : state.lastErrorAt,
      lastErrorKind: errFromShared ? s.lastErrorKind : state.lastErrorKind,
      lastOkAt: Math.max(s.lastOkAt ?? 0, state.lastOkAt ?? 0) || null,
    };
  } catch {
    return state;
  }
}

/**
 * "failing" when the latest event is an error of a kind that won't fix itself (no credit, bad key) in the last
 * hour, or several minutes of errors with no success since; else "ok" (or "idle" when nothing happened yet).
 */
export function aiStatus(s: AiState, now = Date.now()): "ok" | "failing" | "idle" {
  if (!s.lastErrorAt && !s.lastOkAt) return "idle";
  const errorIsLatest = (s.lastErrorAt ?? 0) > (s.lastOkAt ?? 0);
  if (!errorIsLatest) return "ok";
  const age = now - (s.lastErrorAt ?? 0);
  if ((s.lastErrorKind === "credit" || s.lastErrorKind === "auth") && age < 60 * 60_000) return "failing";
  if (age < 30 * 60_000 && s.lastErrorKind !== "rate_limit") return "failing";
  return "ok";
}

/**
 * Recent "no credit" or "bad key" error on this instance with no success since: skip the model call and show the
 * paused message right away (saves the visitor a slow failure). Memory only, no store call.
 */
export function aiBlockedNow(now = Date.now()): boolean {
  const recent = state.lastErrorAt !== null && now - state.lastErrorAt < 10 * 60_000;
  const noOkSince = (state.lastOkAt ?? 0) < (state.lastErrorAt ?? 0);
  return recent && noOkSince && (state.lastErrorKind === "credit" || state.lastErrorKind === "auth");
}

/** For tests. */
export function resetHealth() {
  state = { lastErrorAt: null, lastErrorKind: null, lastOkAt: null };
  lastOkWrite = 0;
}
