import { describe, expect, it } from "vitest";
import corpus from "@/data/corpus.json";
import { EXEMPTION_POINTS, EXEMPTION_SLUGS, EXEMPTION_SOURCE_IDS } from "@/lib/exemption";
import { filterGlossary, GLOSSARY } from "@/lib/glossary";
import { checkedRange, rangeLabel } from "@/lib/guide-freshness";
import { GUIDES } from "@/lib/guides";
import { LOCALES } from "@/lib/i18n";
import { EXTRA } from "@/lib/i18n-extra";

type Rec = { id: string; text: string; fetched?: string; extraction?: string; archived_url?: string; url: string };
const byId = new Map((corpus as Rec[]).map((r) => [r.id, r]));
const MOROCCAN = /(?<![\p{L}])(ديال|دابا|بغيت|بزّاف ديال|كنقول)(?![\p{L}])/u;

/** Every leaf path of an object ("a.b.0"), to compare key sets across languages. */
function shape(v: unknown, prefix = ""): string[] {
  if (Array.isArray(v)) return [`${prefix}[]`];
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => shape(x, prefix ? `${prefix}.${k}` : k));
  return [prefix];
}
function strings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}

describe("lib/i18n-extra", () => {
  it("has the same keys in all four languages, none empty", () => {
    const ref = shape(EXTRA.en).sort();
    for (const l of LOCALES) {
      expect(shape(EXTRA[l]).sort(), l).toEqual(ref);
      for (const s of strings(EXTRA[l])) expect(s.trim(), l).toBeTruthy();
    }
    for (const l of LOCALES) expect(EXTRA[l].prepareExtras.items.length, l).toBe(EXTRA.en.prepareExtras.items.length);
  });
  it("keeps the same {placeholders} in every language", () => {
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    const flat = (l: (typeof LOCALES)[number]) => shape(EXTRA[l]).map((p) => [p, p.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k.replace("[]", "")], EXTRA[l])] as const);
    const ref = new Map(flat("en").map(([p, v]) => [p, typeof v === "string" ? ph(v) : ""]));
    for (const l of LOCALES) for (const [p, v] of flat(l)) if (typeof v === "string") expect(ph(v), `${l} ${p}`).toBe(ref.get(p));
  });
  it("Darija is Algerian, not Moroccan", () => {
    for (const s of strings(EXTRA.dz)) expect(s).not.toMatch(MOROCCAN);
  });
});

describe("glossary", () => {
  it("has about 25 terms with unique ids, names in fr/ar/en/dz and a one-line explanation in all four languages", () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(24);
    expect(new Set(GLOSSARY.map((e) => e.id)).size).toBe(GLOSSARY.length);
    for (const e of GLOSSARY) {
      for (const k of ["fr", "ar", "en", "dz"] as const) expect(e[k].trim(), `${e.id} ${k}`).toBeTruthy();
      expect(e.ar, e.id).toMatch(/[؀-ۿ]/);
      for (const l of LOCALES) {
        const x = e.explain[l];
        expect(x.trim(), `${e.id} ${l}`).toBeTruthy();
        expect(x, `${e.id} ${l} one line`).not.toMatch(/\n/);
        expect(x.length, `${e.id} ${l} short`).toBeLessThan(200);
      }
      expect(e.explain.dz, e.id).not.toMatch(MOROCCAN);
      expect(e.dz, e.id).not.toMatch(MOROCCAN);
    }
  });
  it("states no fees or delays (generic definitions only)", () => {
    for (const e of GLOSSARY)
      for (const x of Object.values(e.explain)) expect(x, e.id).not.toMatch(/\d+\s*(?:DA|DZD|دج|€|\$|days?|jours?|أيام|يوم)|(?<![\p{L}])(?:DA|دج)(?![\p{L}])/iu);
  });
  it("links only to guides that exist", () => {
    for (const e of GLOSSARY) if (e.guide) expect(GUIDES[e.guide], `${e.id} → ${e.guide}`).toBeTruthy();
    expect(GLOSSARY.find((e) => e.id === "12s")?.guide).toBe("birth-12s");
    expect(GLOSSARY.find((e) => e.id === "criminal-record")?.guide).toBe("criminal-record");
  });
  it("filters in any language, ignoring accents, Arabic letter forms and case", () => {
    const ids = (q: string) => filterGlossary(GLOSSARY, q).map((e) => e.id);
    expect(ids("")).toHaveLength(GLOSSARY.length);
    expect(ids("12S")).toContain("12s");
    expect(ids("12 خ")).toContain("12s");
    expect(ids("casier")).toEqual(["criminal-record"]);
    expect(ids("الدفتر العائلي")).toContain("family-book");
    expect(ids("الدفتر العائلى")).toContain("family-book"); // alef maqsura typed for yeh
    expect(ids("legalisation")).toContain("legalisation"); // no accent typed
    expect(ids("CHIFA")).toContain("chifa");
    expect(ids("الباسبور")).toContain("passport");
    expect(ids("zzzz-nothing")).toEqual([]);
  });
});

describe("civil-status register card", () => {
  it("quotes each official page verbatim", () => {
    for (const p of EXEMPTION_POINTS)
      for (const l of LOCALES) {
        const q = p.source[l];
        const rec = byId.get(q.id);
        expect(rec, q.id).toBeTruthy();
        expect(rec!.text.includes(q.quote), `${p.key} ${l}: quote not found verbatim in ${q.id}`).toBe(true);
        expect(rec!.url).toMatch(/^https:\/\/interieur\.gov\.dz\//);
      }
  });
  it("cites dated records with their archive links", () => {
    for (const id of EXEMPTION_SOURCE_IDS) {
      const r = byId.get(id)!;
      expect(r.fetched, id).toMatch(/^\d{4}-\d{2}-\d{2}/);
      if (r.extraction === "archived") expect(r.archived_url, id).toMatch(/^https:\/\/web\.archive\.org\//);
    }
  });
  it("is shown only on real guides", () => {
    for (const s of EXEMPTION_SLUGS) expect(GUIDES[s], s).toBeTruthy();
  });
});

describe("guide freshness", () => {
  it("gives the range of fetched dates and counts archived copies", () => {
    const r = checkedRange([
      { fetched: "2026-02-15T10:00:00Z", extraction: "archived" },
      { fetched: "2025-11-02" },
      { fetched: "" },
      { fetched: "2026-01-15", extraction: "verbatim" },
    ]);
    expect(r).toEqual({ from: "2025-11-02", to: "2026-02-15", archived: 1, total: 4 });
    expect(checkedRange([])).toBeNull();
    expect(rangeLabel({ from: "2026-01-01", to: "2026-01-01" }, (d) => `<${d}>`)).toBe("<2026-01-01>");
    expect(rangeLabel({ from: "2026-01-01", to: "2026-02-01" }, (d) => d)).toBe("2026-01-01 – 2026-02-01");
  });
  it("works for every guide from the records it cites", () => {
    for (const [slug, g] of Object.entries(GUIDES)) {
      const ids = [...new Set([...g.sections.flatMap((s) => s.points.flatMap((p) => p.cites)), ...g.fees.flatMap((f) => f.cites)])];
      const r = checkedRange(ids.map((id) => byId.get(id)).filter((x): x is Rec => !!x));
      expect(r, slug).not.toBeNull();
      expect(r!.from <= r!.to, slug).toBe(true);
      expect(r!.archived, slug).toBeLessThanOrEqual(r!.total);
    }
  });
});
