import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryAnswerStore, answerCacheKey, isCacheable, normalizeQuestion, type CachedAnswer } from "@/lib/answer-cache";
import { localExpansionDecision } from "@/lib/expand-local";
import type { AskMeta } from "@/lib/types";

vi.mock("server-only", () => ({}));

const meta: AskMeta = { type: "meta", answerLang: "en", detectedLang: "en", sources: [], redactedServer: 0 };
const ans = (text: string): CachedAnswer => ({ meta, text });
const LONG = "The Paris consulate's page lists the documents for a passport renewal [1]. Book an appointment online [2].";

describe("answer cache store", () => {
  it("evicts the least recently used entry when full", async () => {
    const s = new MemoryAnswerStore(2, 60_000);
    await s.set("a", ans("A"));
    await s.set("b", ans("B"));
    expect(await s.get("a")).not.toBeNull(); // a is now most recent
    await s.set("c", ans("C"));
    expect(await s.get("b")).toBeNull();
    expect((await s.get("a"))?.text).toBe("A");
    expect((await s.get("c"))?.text).toBe("C");
    expect(s.size).toBe(2);
  });

  it("expires entries after the TTL", async () => {
    let now = 1000;
    const s = new MemoryAnswerStore(10, 5000, () => now);
    await s.set("k", ans("x"));
    now += 4999;
    expect(await s.get("k")).not.toBeNull();
    now += 2;
    expect(await s.get("k")).toBeNull();
    expect(s.size).toBe(0);
  });
});

describe("cache key", () => {
  const k = (question: string, lang: "en" | "fr" | "ar" | "dz" = "en", office = "none", version = "v1") => answerCacheKey({ question, lang, office, version });

  it("ignores case, punctuation, accents, tashkeel and extra spaces", () => {
    expect(k("How do I renew my PASSPORT??")).toBe(k("  how do i renew my passport "));
    expect(k("Renouveler passeport biométrique", "fr")).toBe(k("renouveler passeport biometrique", "fr"));
    expect(k("كيف أجدّد جوازَ السفر؟", "ar")).toBe(k("كيف اجدد جواز السفر", "ar"));
    expect(normalizeQuestion("passport, child ٥ years")).toBe(normalizeQuestion("passport child 5 years"));
  });

  it("keeps words that change the answer (numbers, word order irrelevant words kept)", () => {
    expect(k("passport for child 5 years")).not.toBe(k("passport for child 9 years"));
    expect(k("renew passport")).not.toBe(k("lost passport"));
  });

  it("separates language, office and corpus version", () => {
    expect(k("renew passport", "en")).not.toBe(k("renew passport", "fr"));
    expect(k("renew passport", "en", "abroad:Consulate General of Algeria in Paris:Paris, France")).not.toBe(k("renew passport", "en", "none"));
    expect(k("renew passport", "en", "none", "v1")).not.toBe(k("renew passport", "en", "none", "v2"));
  });
});

describe("what gets cached", () => {
  const ok = { finishedNormally: true, text: LONG, meta, wrongLanguage: false };
  it("caches a complete answer", () => expect(isCacheable(ok)).toBe(true));
  it("never caches errors, cut-off or wrong-language answers", () => {
    expect(isCacheable({ ...ok, finishedNormally: false })).toBe(false);
    expect(isCacheable({ ...ok, text: `${LONG}\n\n\u0000ERROR` })).toBe(false);
    expect(isCacheable({ ...ok, wrongLanguage: true })).toBe(false);
    expect(isCacheable({ ...ok, text: "" })).toBe(false);
  });
  it("never caches clarifying answers or chips", () => {
    expect(isCacheable({ ...ok, text: `${LONG}\n\nTo be sure: do you live in France?` })).toBe(false);
    expect(isCacheable({ ...ok, text: `${LONG}\n\nباش نتأكد: وين راك ساكن؟` })).toBe(false);
    expect(isCacheable({ ...ok, meta: { ...meta, chips: ["France"] } })).toBe(false);
  });
});

describe("local query expansion rule", () => {
  it("expands short, known-concept first questions locally", () => {
    for (const q of ["how do I renew my passport", "renouveler passeport biométrique", "كيفاش نجدد الباسبور", "passport lyon", "casier judiciaire"]) {
      expect(localExpansionDecision(q).local, q).toBe(true);
    }
  });
  it("keeps the model for follow-ups, long or unknown questions", () => {
    expect(localExpansionDecision("and for minors?", "how do I renew my passport").reason).toBe("context");
    expect(localExpansionDecision("my brother lives in Montreal and wants to know whether he can renew his passport there").reason).toBe("long");
    expect(localExpansionDecision("what is the weather").reason).toBe("no_concept");
    expect(localExpansionDecision("passport grandmother inheritance dispute").local).toBe(false);
  });
  it("adds the synonym query so other languages' pages are found", () => {
    const d = localExpansionDecision("unemployment benefit");
    expect(d.local).toBe(true);
    expect(d.extra.join(" ")).toMatch(/chomage|chômage/);
  });
});

describe("/api/ask in mock mode", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("serves the second identical first question from the cache with zero model calls", async () => {
    vi.stubEnv("MOCK_LLM", "1");
    const { setSharedKv } = await import("@/lib/kv");
    setSharedKv(null); // memory store, whatever the environment says
    const { POST } = await import("@/app/api/ask/route");
    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((m: unknown) => void logs.push(String(m)));
    const req = (question: string, extra: Record<string, unknown> = {}) =>
      new Request("http://x/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 200)}` },
        body: JSON.stringify({ question, lang: "en", where: { in: "abroad", country: "France", city: "Lyon" }, ...extra }),
      });
    const first = await (await POST(req("How do I renew my passport?"))).text();
    const second = await (await POST(req("how do i renew my passport"))).text();
    const follow = await (await POST(req("and for minors?", { context: "How do I renew my passport?" }))).text();
    spy.mockRestore();
    expect(second).toBe(first);
    expect(JSON.parse(first.split("\n")[0]).type).toBe("meta");
    const lines = logs.filter((l) => l.startsWith("[ask] ")).map((l) => JSON.parse(l.slice(6)));
    expect(lines[0]).toMatchObject({ cache: "miss", expand: "local", stored: true });
    expect(lines[1]).toMatchObject({ cache: "hit", calls: 0 });
    expect(lines[2]).toMatchObject({ cache: "skip", expand: "llm" });
    expect(follow.length).toBeGreaterThan(0);
  });
});
