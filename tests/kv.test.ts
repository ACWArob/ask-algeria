import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Kv, kvConfig, setSharedKv, sharedKv } from "@/lib/kv";
import { allowAi, overBudget, recordSpend, resetSpend, spendSettled, spentToday } from "@/lib/spend";
import { KvAnswerStore, MemoryAnswerStore, answerStore, resetAnswerStore, type CachedAnswer } from "@/lib/answer-cache";
import type { AskMeta } from "@/lib/types";

vi.mock("server-only", () => ({}));

const NOON = Date.parse("2026-11-03T12:00:00Z");
const URL_ = "https://eu1-test.upstash.io";

/** A fake Upstash REST /pipeline endpoint over a Map (enough Redis for these tests). Records every request. */
function fakeUpstash() {
  const data = new Map<string, string>();
  const ttl = new Map<string, number>();
  const requests: { url: string; auth: string | null; body: string[][] }[] = [];
  const run = (c: string[]): unknown => {
    const [op, k, ...a] = c;
    switch (op) {
      case "GET":
        return data.get(k) ?? null;
      case "SET":
        data.set(k, a[0]);
        if (a[1] === "EX") ttl.set(k, Number(a[2]));
        return "OK";
      case "INCR":
        data.set(k, String(Number(data.get(k) ?? 0) + 1));
        return Number(data.get(k));
      case "INCRBYFLOAT":
        data.set(k, String(Number(data.get(k) ?? 0) + Number(a[0])));
        return data.get(k); // Upstash returns the float as a string
      case "EXPIRE":
        ttl.set(k, Number(a[0]));
        return 1;
      default:
        throw new Error(`unsupported ${op}`);
    }
  };
  const fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as string[][];
    requests.push({ url: String(input), auth: new Headers(init?.headers).get("authorization"), body });
    return new Response(JSON.stringify(body.map((c) => ({ result: run(c) }))), { status: 200 });
  });
  const kv = new Kv({ url: `${URL_}/`, token: "tok", fetch: fetch as unknown as typeof globalThis.fetch });
  const commands = () => requests.reduce((n, r) => n + r.body.length, 0);
  return { data, ttl, requests, fetch, kv, commands };
}

/** fetch that never answers but honours the abort signal, like a hung network call. */
const hangingFetch = vi.fn(
  (_: unknown, init?: RequestInit) =>
    new Promise<Response>((_res, rej) => init?.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")))),
) as unknown as typeof fetch;

const meta: AskMeta = { type: "meta", answerLang: "en", detectedLang: "en", sources: [], redactedServer: 0 };
const ans = (text: string): CachedAnswer => ({ meta, text });

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  setSharedKv(undefined);
  resetAnswerStore();
  resetSpend();
});

describe("lib/kv client", () => {
  it("reads Upstash names first, then Vercel KV names; nothing configured → null", () => {
    expect(kvConfig({ UPSTASH_REDIS_REST_URL: "u1", UPSTASH_REDIS_REST_TOKEN: "t1", KV_REST_API_URL: "u2", KV_REST_API_TOKEN: "t2" })).toEqual({ url: "u1", token: "t1" });
    expect(kvConfig({ KV_REST_API_URL: "u2", KV_REST_API_TOKEN: "t2" })).toEqual({ url: "u2", token: "t2" });
    expect(kvConfig({ KV_REST_API_URL: "u2" })).toBeNull();
    expect(kvConfig({})).toBeNull();
  });

  it("sends one /pipeline request with bearer auth and string arguments", async () => {
    const f = fakeUpstash();
    const r = await f.kv.incrByFloatEx("aa:spend:2026-11-03", 0.0012, 172800);
    expect(r).toEqual({ ok: true, value: 0.0012 });
    expect(f.requests).toHaveLength(1);
    expect(f.requests[0].url).toBe(`${URL_}/pipeline`);
    expect(f.requests[0].auth).toBe("Bearer tok");
    expect(f.requests[0].body).toEqual([
      ["INCRBYFLOAT", "aa:spend:2026-11-03", "0.00120000"],
      ["EXPIRE", "aa:spend:2026-11-03", "172800"],
    ]);
    expect(await f.kv.incrEx("q", 60)).toEqual({ ok: true, value: 1 });
    expect(f.requests[1].body).toEqual([["INCR", "q"], ["EXPIRE", "q", "60"]]);
    expect(await f.kv.setEx("k", "v", 86400)).toBe(true);
    expect(f.requests[2].body).toEqual([["SET", "k", "v", "EX", "86400"]]);
    expect(await f.kv.get("k")).toEqual({ ok: true, value: "v" });
    expect(await f.kv.get("missing")).toEqual({ ok: true, value: null });
  });

  it("gives a new instance's first call longer (connection setup), then uses the short limit", async () => {
    let calls = 0;
    // First response after 60 ms: too slow for the 30 ms limit, fine for the 200 ms first-call limit.
    const slowOnce = (async () => {
      calls++;
      if (calls === 1) await new Promise((r) => setTimeout(r, 60));
      return new Response(JSON.stringify([{ result: "v" }]), { status: 200 });
    }) as unknown as typeof fetch;
    const kv = new Kv({ url: URL_, token: "t", timeoutMs: 30, firstTimeoutMs: 200, fetch: slowOnce });
    expect(await kv.get("k")).toEqual({ ok: true, value: "v" });
    const hang = new Kv({ url: URL_, token: "t", timeoutMs: 30, firstTimeoutMs: 200, fetch: hangingFetch });
    const t0 = Date.now();
    expect(await hang.get("k")).toEqual({ ok: false });
    expect(Date.now() - t0).toBeGreaterThanOrEqual(150);
  });

  it("times out quickly, reports failure instead of throwing, then skips the store for a while", async () => {
    let now = 0;
    const kv = new Kv({ url: URL_, token: "t", timeoutMs: 30, fetch: hangingFetch, now: () => now });
    const t0 = Date.now();
    expect(await kv.get("k")).toEqual({ ok: false });
    expect(Date.now() - t0).toBeLessThan(1000);
    expect(hangingFetch).toHaveBeenCalledTimes(1);
    now += 5_000;
    expect(await kv.incrEx("k", 60)).toEqual({ ok: false });
    expect(hangingFetch).toHaveBeenCalledTimes(1); // skipped, no second 30 ms wait
    now += 20_000;
    await kv.get("k");
    expect(hangingFetch).toHaveBeenCalledTimes(2); // tried again later
  });

  it("treats HTTP errors and command errors as failures", async () => {
    const http500 = new Kv({ url: URL_, token: "t", fetch: (async () => new Response("no", { status: 500 })) as unknown as typeof fetch });
    expect(await http500.get("k")).toEqual({ ok: false });
    const cmdErr = new Kv({ url: URL_, token: "t", fetch: (async () => new Response(JSON.stringify([{ error: "WRONGPASS" }]))) as unknown as typeof fetch });
    expect(await cmdErr.get("k")).toEqual({ ok: false });
  });

  it("no store configured → sharedKv() is null and nothing is fetched", () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("KV_REST_API_URL", "");
    const spy = vi.spyOn(globalThis, "fetch");
    setSharedKv(undefined);
    expect(sharedKv()).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("spending guard with a shared store", () => {
  it("uses the all-instances total: another instance's spend pauses AI here", async () => {
    const f = fakeUpstash();
    setSharedKv(f.kv);
    f.data.set("aa:spend:2026-11-03", "0.02"); // spent elsewhere
    expect(await allowAi("1.1.1.1", "ask", { AI_DAILY_BUDGET_USD: "0.01" }, NOON)).toEqual({ ok: false, reason: "budget" });
    expect(f.requests).toHaveLength(1);
    expect(f.requests[0].body.map((c) => c[0])).toEqual(["GET", "INCR", "EXPIRE"]);
    expect(overBudget({ AI_DAILY_BUDGET_USD: "0.01" }, NOON)).toBe(true); // last known total, no extra command
    expect(f.requests).toHaveLength(1);
  });

  it("adds each call's cost to the shared daily key (expires in 2 days)", async () => {
    const f = fakeUpstash();
    setSharedKv(f.kv);
    recordSpend("claude-haiku-5-5", { input_tokens: 7000, output_tokens: 600 }, NOON);
    recordSpend("claude-haiku-5-5", { input_tokens: 7000, output_tokens: 600 }, NOON);
    await spendSettled();
    expect(Number(f.data.get("aa:spend:2026-11-03"))).toBeCloseTo(0.002, 6);
    expect(f.ttl.get("aa:spend:2026-11-03")).toBe(172800);
    expect(spentToday(NOON)).toBeCloseTo(0.002, 6);
  });

  it("counts the per-visitor quota across instances, with hashed IPs", async () => {
    const f = fakeUpstash();
    setSharedKv(f.kv);
    const env = { AI_DAILY_PER_IP: "2" };
    expect((await allowAi("9.9.9.9", "ask", env, NOON)).ok).toBe(true);
    const key = [...f.data.keys()].find((k) => k.startsWith("aa:quota:ask:2026-11-03:"))!;
    expect(key).toBeDefined();
    expect(key).not.toContain("9.9.9.9");
    expect(f.ttl.get(key)).toBe(172800);
    f.data.set(key, "2"); // another instance served this visitor meanwhile
    expect(await allowAi("9.9.9.9", "ask", env, NOON)).toEqual({ ok: false, reason: "quota" });
    const before = f.requests.length;
    expect(await allowAi("9.9.9.9", "ask", env, NOON)).toEqual({ ok: false, reason: "quota" });
    expect(f.requests.length).toBe(before); // already blocked in memory → no store call
  });

  it("store unreachable → falls back to the in-memory counters (still limited)", async () => {
    setSharedKv(new Kv({ url: URL_, token: "t", timeoutMs: 20, fetch: hangingFetch }));
    const env = { AI_DAILY_PER_IP: "2", AI_DAILY_BUDGET_USD: "0.01" };
    expect((await allowAi("7.7.7.7", "ask", env, NOON)).ok).toBe(true);
    expect((await allowAi("7.7.7.7", "ask", env, NOON)).ok).toBe(true);
    expect(await allowAi("7.7.7.7", "ask", env, NOON)).toEqual({ ok: false, reason: "quota" });
    for (let i = 0; i < 10; i++) recordSpend("claude-haiku-5-5", { input_tokens: 7000, output_tokens: 600 }, NOON);
    await spendSettled();
    expect(await allowAi("6.6.6.6", "ask", env, NOON)).toEqual({ ok: false, reason: "budget" });
  });

  it("kill switch needs no store command", async () => {
    const f = fakeUpstash();
    setSharedKv(f.kv);
    expect(await allowAi("1.1.1.1", "ask", { AI_DISABLED: "1" }, NOON)).toEqual({ ok: false, reason: "disabled" });
    expect(f.fetch).not.toHaveBeenCalled();
  });
});

describe("answer cache with a shared store", () => {
  it("answerStore() picks the shared store when configured, memory otherwise", () => {
    vi.stubEnv("ANSWER_CACHE", "");
    setSharedKv(fakeUpstash().kv);
    resetAnswerStore();
    expect(answerStore()).toBeInstanceOf(KvAnswerStore);
    setSharedKv(null);
    resetAnswerStore();
    expect(answerStore()).toBeInstanceOf(MemoryAnswerStore);
    vi.stubEnv("ANSWER_CACHE", "memory");
    setSharedKv(fakeUpstash().kv);
    resetAnswerStore();
    expect(answerStore()).toBeInstanceOf(MemoryAnswerStore);
    vi.stubEnv("ANSWER_CACHE", "off");
    resetAnswerStore();
    expect(answerStore()).toBeNull();
  });

  it("an answer written on one instance is served on another (JSON, SET … EX ttl)", async () => {
    const f = fakeUpstash();
    const a = new KvAnswerStore(f.kv, 24 * 3600_000);
    const b = new KvAnswerStore(f.kv, 24 * 3600_000);
    await a.set("question-key", ans("Renew at the consulate [1]."));
    expect(f.requests.at(-1)!.body[0].slice(0, 1)).toEqual(["SET"]);
    expect(f.requests.at(-1)!.body[0].slice(3)).toEqual(["EX", "86400"]);
    expect(JSON.parse(f.requests.at(-1)!.body[0][2])).toEqual(ans("Renew at the consulate [1]."));
    expect((await b.get("question-key"))?.text).toBe("Renew at the consulate [1].");
    const n = f.requests.length;
    expect((await b.get("question-key"))?.text).toBe("Renew at the consulate [1]."); // now in b's memory
    expect(f.requests.length).toBe(n);
    expect(await b.get("other")).toBeNull();
  });

  it("store unreachable → behaves like the memory store", async () => {
    const s = new KvAnswerStore(new Kv({ url: URL_, token: "t", timeoutMs: 20, fetch: hangingFetch }));
    await s.set("k", ans("cached locally"));
    expect((await s.get("k"))?.text).toBe("cached locally");
    expect(await s.get("unknown")).toBeNull();
  });
});

describe("free search never depends on the shared store", () => {
  it("/api/search reads and writes nothing there; only the usage counter is sent, after the response", async () => {
    const f = fakeUpstash();
    setSharedKv(f.kv);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { POST } = await import("@/app/api/search/route");
    const res = await POST(
      new Request("http://x/api/search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: "renew passport", lang: "en" }) }),
    );
    expect(res.status).toBe(200);
    await new Promise((r) => setTimeout(r, 0));
    // Outside Next there is no "after the response", so the counter flush shows up here: it must be the only call,
    // and only usage counters (aa:m:…), never a cache or quota read.
    for (const r of f.requests) for (const [op, k] of r.body) expect([op, k.startsWith("aa:m:")]).toEqual([op === "INCRBY" ? "INCRBY" : "EXPIRE", true]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
