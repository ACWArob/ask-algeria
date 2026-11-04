import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { instantSearch, snippet } = await import("@/lib/instant");

describe("instant search (no AI)", () => {
  it("cuts a snippet around the query words", () => {
    const text = `${"intro ".repeat(80)}Pour renouveler le passeport biométrique il faut la carte consulaire. ${"fin ".repeat(80)}`;
    const s = snippet(text, "renouveler passeport");
    expect(s).toContain("passeport biométrique");
    expect(s.length).toBeLessThan(260);
  });

  it("someone living in Algeria gets the guide's in-Algeria passport points, not the rules for Algerians abroad", () => {
    const r = instantSearch("how do I renew my passport", "en", undefined, "", { in: "dz", wilaya: "Oran" });
    expect(r.quick?.from).toBe("guide");
    expect(r.quick?.sections[0].title).toMatch(/living in Algeria/);
    const text = r.quick!.sections.flatMap((x) => x.points.map((p) => p.text)).join(" ");
    expect(text).not.toMatch(/consulate|abroad|London|Washington/i);
  });

  it("returns the guide and official pages for a passport question, without wilaya pages for someone abroad", () => {
    const r = instantSearch("I live in Lyon, how do I renew my passport?", "en");
    expect(r.guides.map((g) => g.slug)).toContain("passport");
    expect(r.office?.inAlgeria).toBe(false);
    expect(r.pages.length).toBeGreaterThan(0);
    expect(r.pages.some((p) => p.domain.startsWith("wilaya"))).toBe(false);
  });

  it("answers contact questions with the mission's details", () => {
    const r = instantSearch("phone number of the consulate in London", "en");
    expect(r.mission?.name).toMatch(/London/);
  });

  it("offers place chips when the procedure depends on where they live, then narrows by place", () => {
    const first = instantSearch("how do I renew my passport?", "en");
    expect(first.askPlace?.chips).toContain("France");
    const france = instantSearch("how do I renew my passport?", "en", undefined, "France");
    expect(france.askPlace?.chips).toContain("Lyon");
    const lyon = instantSearch("how do I renew my passport?", "en", undefined, "France Lyon");
    expect(lyon.askPlace).toBeUndefined();
    expect(lyon.office?.name).toMatch(/Lyon/);
    expect(instantSearch("how do I renew my passport?", "en", undefined, "Canada").askPlace?.chips).toEqual(["Montreal", "Ottawa", "Toronto"]);
    expect(instantSearch("how do I renew my passport?", "en", undefined, "I live in Algeria").office?.inAlgeria).toBe(true);
  });

  it("works in Arabic and Darija", () => {
    expect(instantSearch("كيفاش نخرج شهادة الميلاد 12 خ", "dz").guides.map((g) => g.slug)).toContain("birth-12s");
    expect(instantSearch("كيف أستخرج صحيفة السوابق العدلية", "ar").pages.length).toBeGreaterThan(0);
  });
});
