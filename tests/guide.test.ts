import { describe, expect, it } from "vitest";
import corpus from "@/data/corpus.json";
import services from "@/data/services.json";
import { PASSPORT_GUIDE } from "@/lib/guides/passport";
import { LOCALES } from "@/lib/i18n";

const ids = new Set((corpus as { id: string }[]).map((r) => r.id));

describe("passport guide", () => {
  it("cites only records that exist in data/corpus.json", () => {
    const all = [...PASSPORT_GUIDE.sections.flatMap((s) => s.points.flatMap((p) => p.cites)), ...PASSPORT_GUIDE.fees.flatMap((f) => f.cites)];
    expect(all.length).toBeGreaterThan(0);
    for (const id of all) expect(ids.has(id), id).toBe(true);
  });

  it("is translated into all four languages", () => {
    for (const s of PASSPORT_GUIDE.sections) {
      for (const l of LOCALES) {
        expect(s.title[l], `${s.id} title ${l}`).toBeTruthy();
        for (const p of s.points) expect(p.text[l], `${s.id} ${l}`).toBeTruthy();
      }
    }
  });
});

describe("services.json", () => {
  it("has names, lines and questions in all four languages and https/http portals", () => {
    for (const s of services as { id: string; name: Record<string, string>; line: Record<string, string>; question: Record<string, string>; portals: { url: string }[] }[]) {
      for (const l of LOCALES) {
        expect(s.name[l], `${s.id} name ${l}`).toBeTruthy();
        expect(s.line[l], `${s.id} line ${l}`).toBeTruthy();
        expect(s.question[l], `${s.id} question ${l}`).toBeTruthy();
      }
      for (const p of s.portals) expect(p.url).toMatch(/^https?:\/\//);
    }
  });
});
