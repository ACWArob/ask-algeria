import { beforeEach, describe, expect, it } from "vitest";
import { allowAi, costUsd, pdfPageCount, recordSpend, resetSpend, spentToday } from "@/lib/spend";
import { setSharedKv } from "@/lib/kv";

const NOON = Date.parse("2026-11-03T12:00:00Z");

describe("spending guard", () => {
  beforeEach(() => {
    resetSpend();
    setSharedKv(null); // memory only, whatever the environment says
  });

  it("prices calls from real token usage", () => {
    // Typical written answer on Haiku 5.5: ~7k tokens in, ~600 out.
    expect(costUsd("claude-haiku-5-5", { input_tokens: 7000, output_tokens: 600 })).toBeCloseTo(0.001, 4);
    // Over 100k prompt tokens Haiku costs 5x.
    expect(costUsd("claude-haiku-5-5", { input_tokens: 200_000, output_tokens: 1000 })).toBeCloseTo(0.1025, 4);
    expect(costUsd("claude-sonnet-5-5", { input_tokens: 7000, output_tokens: 600 })).toBeCloseTo(0.02, 4);
    expect(costUsd("some-new-model", { input_tokens: 1_000_000 })).toBeGreaterThan(1); // unknown → assume expensive
  });

  it("kill switch blocks everything", async () => {
    expect(await allowAi("1.1.1.1", "ask", { AI_DISABLED: "1" }, NOON)).toEqual({ ok: false, reason: "disabled" });
  });

  it("pauses AI for the day once the budget is spent, and resets at midnight UTC", async () => {
    const env = { AI_DAILY_BUDGET_USD: "0.01" };
    expect((await allowAi("1.1.1.1", "ask", env, NOON)).ok).toBe(true);
    for (let i = 0; i < 10; i++) recordSpend("claude-haiku-5-5", { input_tokens: 7000, output_tokens: 600 }, NOON);
    expect(spentToday(NOON)).toBeCloseTo(0.01, 3);
    expect(await allowAi("2.2.2.2", "ask", env, NOON)).toEqual({ ok: false, reason: "budget" });
    expect((await allowAi("2.2.2.2", "ask", env, NOON + 24 * 3600_000)).ok).toBe(true);
  });

  it("limits each visitor per day, separately for answers and translations", async () => {
    const env = { AI_DAILY_PER_IP: "3", TRANSLATE_DAILY_PER_IP: "1" };
    for (let i = 0; i < 3; i++) expect((await allowAi("9.9.9.9", "ask", env, NOON)).ok).toBe(true);
    expect(await allowAi("9.9.9.9", "ask", env, NOON)).toEqual({ ok: false, reason: "quota" });
    expect((await allowAi("8.8.8.8", "ask", env, NOON)).ok).toBe(true);
    expect((await allowAi("9.9.9.9", "translate", env, NOON)).ok).toBe(true);
    expect((await allowAi("9.9.9.9", "translate", env, NOON)).ok).toBe(false);
  });

  it("counts PDF pages", () => {
    const pdf = new TextEncoder().encode("%PDF-1.4 1 0 obj <</Type /Pages /Count 2>> 2 0 obj <</Type /Page>> 3 0 obj <</Type/Page>>");
    expect(pdfPageCount(pdf)).toBe(2);
  });
});

describe("guard hardening", () => {
  it("only trusts the platform's own IP header", async () => {
    const { clientIp } = await import("@/lib/ratelimit");
    const h = new Headers({ "x-nf-client-connection-ip": "6.6.6.6", "x-vercel-forwarded-for": "1.2.3.4" });
    expect(clientIp(h, { VERCEL: "1" })).toBe("1.2.3.4");
    expect(clientIp(new Headers({ "x-forwarded-for": "6.6.6.6" }), { VERCEL: "1" })).toBe("unknown");
  });

  it("rejects big PDFs whose pages can't be counted", async () => {
    const { pdfAllowed } = await import("@/lib/spend");
    const small = new TextEncoder().encode("%PDF-1.5 /ObjStm");
    expect(pdfAllowed(small, 10)).toBe(true);
    const big = new Uint8Array(2_000_000);
    big.set(new TextEncoder().encode("%PDF-1.5 /ObjStm"));
    expect(pdfAllowed(big, 10)).toBe(false);
  });
});
