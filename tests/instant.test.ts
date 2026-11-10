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

  it("drops pages that only share a qualifier or use the subject word once in passing", () => {
    // The Startup label page says "renouveler" and calls the label a "passeport" once.
    const r = instantSearch("How do I renew my passport? I live in Lyon", "en");
    expect(r.pages.some((p) => p.domain === "startup.dz")).toBe(false);
    expect(r.pages.length).toBeGreaterThan(2);
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

  it("someone in a country whose embassy has no website gets no other country's consulate rules", () => {
    // Ethiopia: the embassy has no site of its own, so London / Milan / New York pages used to fill the answer.
    const ethiopia = { in: "abroad" as const, country: "Ethiopia" };
    for (const q of ["how do I renew my passport", "consular registration"]) {
      const r = instantSearch(q, "en", undefined, "", ethiopia);
      const domains = [...(r.quick?.sources ?? []).map((s) => s.domain), ...r.pages.map((p) => p.domain)];
      expect(domains.length, q).toBeGreaterThan(0);
      expect(domains.filter((d) => /cglondon|cgmilan|embwashington|algeria-cgny|algerian-consulate/.test(d)), q).toEqual([]);
    }
  });

  it("consular registration doesn't bring up vehicle registration pages", () => {
    const r = instantSearch("consular registration", "en", undefined, "", { in: "abroad", country: "Ethiopia" });
    expect([...r.pages.map((p) => p.title), ...(r.quick?.sources ?? []).map((s) => s.title)].join(" ")).not.toMatch(/véhicule|vehicle/i);
  });

  it("uses the connection's location only for location-dependent questions", () => {
    const h = new Headers({ "x-vercel-ip-country": "US", "x-vercel-ip-country-region": "CO", "x-vercel-ip-city": "Boulder" });
    // A stolen SIM or a CNAS question is not answered "for Boulder, Colorado" with San Francisco pages.
    expect(instantSearch("On m'a volé mon téléphone avec ma puce, que dois-je faire ?", "fr", h).office).toBeUndefined();
    expect(instantSearch("how much are CNAS family allowances per child", "en", h).office).toBeUndefined();
    expect(instantSearch("How do I renew my Algerian passport?", "en", h).office?.name).toMatch(/San Francisco/);
  });

  it("works in Arabic and Darija", () => {
    expect(instantSearch("كيفاش نخرج شهادة الميلاد 12 خ", "dz").guides.map((g) => g.slug)).toContain("birth-12s");
    expect(instantSearch("كيف أستخرج صحيفة السوابق العدلية", "ar").pages.length).toBeGreaterThan(0);
  });
});

describe("quick answer never quotes another consulate's own notice", () => {
  it("someone in Marseille doesn't get the Bordeaux consulate's text as the answer", async () => {
    const { instantSearch } = await import("@/lib/instant");
    const r = instantSearch("renouvellement passeport, j'habite à Marseille", "fr", new Headers(), "", null);
    expect(r.office?.name ?? "").toMatch(/Marseille/);
    const quoted = JSON.stringify(r.quick ?? {});
    expect(quoted).not.toMatch(/consulat-bordeaux|Bordeaux/i);
    // Other consulates' pages may still be listed as links below the answer.
  });
});
