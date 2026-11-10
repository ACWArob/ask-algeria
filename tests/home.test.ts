import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

vi.mock("server-only", () => ({}));

const LOCALES = ["en", "fr", "ar", "dz"] as const;
const dicts = Object.fromEntries(LOCALES.map((l) => [l, JSON.parse(readFileSync(`lib/i18n/${l}.json`, "utf8"))]));

describe("homepage", () => {
  it("the page/site count matches the corpus (rebuilt by npm run index / prebuild)", async () => {
    const { normalizeCorpus } = await import("@/lib/search-core.mjs");
    const records = normalizeCorpus(JSON.parse(readFileSync("data/corpus.json", "utf8")));
    const sites = new Set(records.map((r: { domain?: string; url: string }) => (r.domain || new URL(r.url).hostname).replace(/^www\./, ""))).size;
    expect(JSON.parse(readFileSync("data/corpus-stats.json", "utf8"))).toEqual({ pages: records.length, sites });
  });

  it("every language shows two examples in other languages or Arabizi, and the count line has both numbers", () => {
    for (const l of LOCALES) {
      const a = dicts[l].ask;
      expect(a.exampleMixed).toHaveLength(2);
      expect(a.coverage).toContain("{pages}");
      expect(a.coverage).toContain("{sites}");
      expect(a.anyLanguage.length).toBeGreaterThan(10);
      // Not the page's own examples again; Arabic pages get at least one in Latin letters (Arabizi or French).
      for (const x of a.exampleMixed) expect(a.exampleList).not.toContain(x);
      if (l === "ar" || l === "dz") expect(a.exampleMixed.some((x: string) => !/[\u0600-\u06FF]/.test(x))).toBe(true);
      expect(a.exampleMixed.some((x: string) => /kifach|nsajel|nakhrej/.test(x))).toBe(true);
    }
  });

  it("every homepage example gets a free answer, from Algeria and from abroad", async () => {
    const { instantSearch } = await import("@/lib/instant");
    const { parseWhere } = await import("@/lib/where");
    const places = [parseWhere({ in: "dz", wilaya: "Alger" }), parseWhere({ in: "abroad", country: "France", city: "Lyon" })];
    for (const l of LOCALES) {
      for (const ex of [...dicts[l].ask.exampleList.slice(0, 2), ...dicts[l].ask.exampleMixed]) {
        for (const w of places) {
          const r = instantSearch(ex, l, new Headers(), "", w);
          expect(r.quick, `${l} "${ex}" ${JSON.stringify(w)}`).toBeTruthy();
        }
      }
    }
  });
});
