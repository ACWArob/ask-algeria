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

  it("login form still works, and an oversized form is never parsed (counts as a wrong password)", async () => {
    vi.stubEnv("SITE_PASSWORD", "pw");
    vi.stubEnv("AUTH_SECRET", "s".repeat(32));
    const login = await import("@/app/api/login/route");
    const form = (body: string) => new Request("http://x/api/login", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": `10.4.${Math.floor(Math.random() * 250)}.1` }, body });
    const ok = await login.POST(form("password=pw&next=%2Fprepare"));
    expect(ok.status).toBe(303);
    expect(ok.headers.get("location")).toBe("http://x/prepare");
    expect(ok.headers.get("set-cookie") ?? "").toMatch(/=/);
    const huge = await login.POST(form("password=pw&pad=" + "x".repeat(100_000)));
    expect(huge.headers.get("location") ?? "").toContain("error=error");
    vi.unstubAllEnvs();
  });
});

describe("translate upload size", () => {
  it("refuses an upload whose declared size is over the limit without reading it", async () => {
    const { LIMITS } = await import("@/lib/config");
    const tr = await import("@/app/api/translate/route");
    const r = await tr.POST(new Request("http://x/api/translate", { method: "POST", headers: { "content-type": "multipart/form-data; boundary=b", "content-length": String(LIMITS.uploadMaxBytes + 200_000), "x-forwarded-for": "10.5.5.5" }, body: "--b--" }));
    expect(r.status).toBe(413);
  });
});
