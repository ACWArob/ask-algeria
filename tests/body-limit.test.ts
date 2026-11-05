import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const big = (n: number) => JSON.stringify({ question: "renew passport", lang: "en", context: "x".repeat(n) });
const req = (url: string, body: string) => new Request(url, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": `10.3.${Math.floor(Math.random() * 250)}.1` }, body });

describe("request body size", () => {
  it("search and written answers refuse oversized bodies before parsing them", async () => {
    vi.stubEnv("MOCK_LLM", "1");
    const search = await import("@/app/api/search/route");
    const ask = await import("@/app/api/ask/route");
    expect((await search.POST(req("http://x/api/search", big(300_000)))).status).toBe(413);
    expect((await ask.POST(req("http://x/api/ask", big(300_000)))).status).toBe(413);
    expect((await search.POST(req("http://x/api/search", big(2_000)))).status).toBe(200);
    vi.unstubAllEnvs();
  });

  it("feedback refuses an oversized body", async () => {
    const fb = await import("@/app/api/feedback/route");
    vi.spyOn(console, "log").mockImplementation(() => {});
    const r = await fb.POST(req("http://x/api/feedback", JSON.stringify({ kind: "contact", message: "y".repeat(300_000) })));
    expect(r.status).toBeGreaterThanOrEqual(400);
  });
});
