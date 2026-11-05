import { beforeEach, describe, expect, it, vi } from "vitest";
import { Kv, setSharedKv } from "@/lib/kv";
import { count, dailyMetrics, flushMetrics, resetMetrics } from "@/lib/metrics";

vi.mock("server-only", () => ({}));

/** Minimal Upstash /pipeline fake (GET, INCRBY, EXPIRE, SET). */
function fake() {
  const data = new Map<string, string>();
  let requests = 0;
  const fetch = vi.fn(async (_u: unknown, init?: RequestInit) => {
    requests++;
    const body = JSON.parse(String(init?.body)) as string[][];
    const out = body.map(([op, k, a]) => {
      if (op === "GET") return { result: data.get(k) ?? null };
      if (op === "INCRBY") { data.set(k, String(Number(data.get(k) ?? 0) + Number(a))); return { result: Number(data.get(k)) }; }
      if (op === "SET") { data.set(k, a); return { result: "OK" }; }
      return { result: 1 };
    });
    return new Response(JSON.stringify(out), { status: 200 });
  });
  return { data, kv: new Kv({ url: "https://x.upstash.io", token: "t", fetch: fetch as unknown as typeof globalThis.fetch }), requests: () => requests };
}

beforeEach(() => {
  resetMetrics();
  setSharedKv(null);
});

describe("usage metrics", () => {
  it("counts per day in memory without a shared store", async () => {
    const now = Date.UTC(2026, 10, 4, 12);
    count("search", 1, now);
    count("search", 2, now);
    count("ask_cached", 1, now);
    const [today] = await dailyMetrics(1, now);
    expect(today).toEqual({ day: "2026-11-04", counts: { search: 3, ask_cached: 1 } });
  });

  it("batches counts into one store request and reads totals back for several days", async () => {
    const f = fake();
    setSharedKv(f.kv);
    const now = Date.UTC(2026, 10, 4, 12);
    for (let i = 0; i < 50; i++) count("search", 1, now); // all within a minute: no request yet
    expect(f.requests()).toBe(0);
    await flushMetrics(now);
    expect(f.requests()).toBe(1);
    expect(f.data.get("aa:m:2026-11-04:search")).toBe("50");
    f.data.set("aa:m:2026-11-03:ask_answered", "7");
    const rows = await dailyMetrics(2, now);
    expect(rows.map((r) => r.day)).toEqual(["2026-11-04", "2026-11-03"]);
    expect(rows[0].counts.search).toBe(50);
    expect(rows[1].counts.ask_answered).toBe(7);
    expect(JSON.stringify(rows)).not.toMatch(/spend/);
  });

  it("/api/health?days=2 returns the daily counts", async () => {
    const { GET } = await import("@/app/api/health/route");
    count("contact");
    const r = await GET(new Request("http://x/api/health?days=2"));
    const j = await r.json();
    expect(j.metrics).toHaveLength(2);
    expect(j.metrics[0].counts.contact).toBe(1);
  });
});
