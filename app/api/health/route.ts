import { NextResponse } from "next/server";
import { aiState, aiStatus } from "@/lib/health";
import { sharedKv } from "@/lib/kv";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { searchChunks } from "@/lib/search";
import { corpusById } from "@/lib/corpus";
import { overBudget } from "@/lib/spend";
import { dailyMetrics } from "@/lib/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * For the uptime monitor (.github/workflows/uptime.yml). Public on purpose (no password) but says nothing private:
 * is free search working (real query over the index), is the shared store reachable, is the AI answering, is it
 * paused, and (with ?days=7) daily usage counts. 200 when the site itself works; 503 when free search is broken.
 * No model call, no visitor data, no spend figures.
 */
export async function GET(req: Request) {
  // Generous: the monitors and a person checking by hand share one connection; 120/min still stops a flood.
  if (!rateLimit(`health:${clientIp(req.headers)}`, 120).ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const started = Date.now();
  let search = false;
  let pages = 0;
  try {
    pages = corpusById().size;
    search = pages > 100 && searchChunks(["passeport biométrique renouvellement"], 3).length > 0;
  } catch (err) {
    console.error("[health] search failed:", err instanceof Error ? err.message : err);
  }
  const kv = sharedKv();
  const store = kv ? ((await kv.get("aa:health:ping")).ok ? "ok" : "down") : "none";
  const ai = await aiState().catch(() => null);
  const aiNow = ai ? aiStatus(ai) : "ok";
  const paused = process.env.AI_DISABLED === "1" || process.env.AI_DISABLED === "true" ? "disabled" : overBudget() ? "daily_budget" : null;
  // ?days=N adds daily usage counts (no visitor data, no spend) for the metrics check.
  const days = Number(new URL(req.url).searchParams.get("days") ?? 0);
  const metrics = days > 0 ? await dailyMetrics(Math.min(days, 31)).catch(() => null) : undefined;
  const body = {
    ok: search,
    search: search ? "ok" : "failing",
    pages,
    store,
    ai: { status: aiNow, lastError: ai?.lastErrorKind ?? null, lastErrorAt: ai?.lastErrorAt ? new Date(ai.lastErrorAt).toISOString() : null, paused },
    version: (process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7),
    ms: Date.now() - started,
    ...(metrics !== undefined ? { metrics } : {}),
  };
  return NextResponse.json(body, { status: search ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
