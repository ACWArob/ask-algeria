import { beforeEach, describe, expect, it, vi } from "vitest";
import { aiBlockedNow, aiStatus, classifyAiError, noteAiError, noteAiOk, resetHealth } from "@/lib/health";
import { setSharedKv } from "@/lib/kv";

vi.mock("server-only", () => ({}));

beforeEach(() => {
  resetHealth();
  setSharedKv(null);
});

describe("AI health for the uptime monitor", () => {
  it("names the errors that matter", () => {
    expect(classifyAiError({ status: 400, message: "Your credit balance is too low to access the Anthropic API." })).toBe("credit");
    expect(classifyAiError({ status: 401, message: "invalid x-api-key" })).toBe("auth");
    expect(classifyAiError({ status: 529, message: "Overloaded" })).toBe("overloaded");
    expect(classifyAiError({ status: 429, message: "rate limit" })).toBe("rate_limit");
    expect(classifyAiError(new Error("Request timed out."))).toBe("timeout");
  });

  it("is failing after a credit error, ok again after a success, and skips calls while out of credit", () => {
    const t = 1_000_000;
    expect(aiStatus({ lastErrorAt: null, lastErrorKind: null, lastOkAt: null }, t)).toBe("idle");
    noteAiError({ status: 400, message: "credit balance is too low" }, t);
    expect(aiBlockedNow(t + 60_000)).toBe(true);
    expect(aiBlockedNow(t + 11 * 60_000)).toBe(false); // try again after 10 minutes (credits may be reloaded)
    expect(aiStatus({ lastErrorAt: t, lastErrorKind: "credit", lastOkAt: null }, t + 30 * 60_000)).toBe("failing");
    noteAiOk(t + 2 * 60_000);
    expect(aiBlockedNow(t + 3 * 60_000)).toBe(false);
    expect(aiStatus({ lastErrorAt: t, lastErrorKind: "credit", lastOkAt: t + 1 }, t + 2)).toBe("ok");
    // our own timeouts aren't API outages
    resetHealth();
    noteAiError(new Error("Request timed out."), t);
    expect(aiBlockedNow(t + 1)).toBe(false);
  });
});

describe("/api/health", () => {
  it("answers 200 with search working and nothing private", async () => {
    const { GET } = await import("@/app/api/health/route");
    const r = await GET(new Request("http://x/api/health"));
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j).toMatchObject({ ok: true, search: "ok", store: "none", ai: { status: "idle", paused: null } });
    expect(j.pages).toBeGreaterThan(100);
    expect(JSON.stringify(j)).not.toMatch(/key|token|password/i);
  });
});

describe("query expansion reply", () => {
  it("a reply cut off by the token limit keeps the queries that arrived (not an AI failure)", async () => {
    const { parseExpansion } = await import("@/lib/llm");
    const cut = '{"lang":"ar","queries":{"fr":["renouvellement passeport","passeport biométrique"],"ar":["تجديد جواز السفر"],"en":["passport ren';
    expect(parseExpansion(cut)).toEqual({ lang: "ar", queries: { fr: ["renouvellement passeport", "passeport biométrique"], ar: ["تجديد جواز السفر"], en: [] } });
    expect(parseExpansion('{"lang":"en","queries":{"en":["a"]},"topic":"t"}')).toEqual({ lang: "en", queries: { en: ["a"] }, topic: "t" });
    expect(parseExpansion("no json here")).toBeNull();
  });
});
