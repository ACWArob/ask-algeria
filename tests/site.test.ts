import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy as middleware } from "@/proxy";
import { isPublic, robotsTxt } from "@/lib/site";
import sitemap from "@/app/sitemap";
import { LEGAL_STRINGS } from "@/lib/i18n-legal";

const saved = { ...process.env };
afterEach(() => {
  process.env = { ...saved };
});

describe("public vs private site", () => {
  it("is private unless PUBLIC_SITE is set", () => {
    expect(isPublic({})).toBe(false);
    expect(isPublic({ PUBLIC_SITE: "0" })).toBe(false);
    expect(isPublic({ PUBLIC_SITE: "1" })).toBe(true);
    expect(robotsTxt(false)).toContain("Disallow: /\n");
    expect(robotsTxt(true)).toMatch(/Allow: \/\n[\s\S]*Sitemap: https:\/\/www\.algeriagov\.online\/sitemap\.xml/);
  });

  it("private: pages need the password and say noindex; no sitemap", async () => {
    delete process.env.PUBLIC_SITE;
    process.env.SITE_PASSWORD = "pw-test";
    const r = await middleware(new NextRequest("https://www.algeriagov.online/prepare"));
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toContain("/login");
    expect(r.headers.get("x-robots-tag")).toContain("noindex");
    expect(sitemap()).toEqual([]);
  });

  it("public: no password, no noindex, robots.txt from the API, /login goes home, sitemap lists pages", async () => {
    process.env.PUBLIC_SITE = "1";
    const page = await middleware(new NextRequest("https://www.algeriagov.online/prepare"));
    expect(page.status).toBe(200);
    expect(page.headers.get("x-robots-tag")).toBeNull();
    const robots = await middleware(new NextRequest("https://www.algeriagov.online/robots.txt"));
    expect(robots.headers.get("x-middleware-rewrite")).toContain("/api/robots");
    const login = await middleware(new NextRequest("https://www.algeriagov.online/login"));
    expect(login.headers.get("location")).toBe("https://www.algeriagov.online/");
    const urls = sitemap().map((x) => x.url);
    expect(urls).toContain("https://www.algeriagov.online/services/passport");
    expect(urls.some((u) => u.includes("/embassies/"))).toBe(true);
  });
});

describe("legal page strings", () => {
  const shape = (o: unknown): unknown =>
    Array.isArray(o) ? o.length : o && typeof o === "object" ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, shape(v)])) : typeof o;
  it("same keys and item counts in all four languages, independence stated, no em dashes", () => {
    const en = shape(LEGAL_STRINGS.en);
    for (const l of ["fr", "ar", "dz"] as const) expect(shape(LEGAL_STRINGS[l]), l).toEqual(en);
    for (const l of ["en", "fr", "ar", "dz"] as const) {
      expect(JSON.stringify(LEGAL_STRINGS[l])).not.toContain("\u2014");
      expect(JSON.stringify(LEGAL_STRINGS[l])).not.toContain("—");
      expect(LEGAL_STRINGS[l].notice.body[2]).toContain("Vercel");
    }
  });
});
