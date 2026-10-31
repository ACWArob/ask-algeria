import { describe, expect, it, vi } from "vitest";
import { parseWhere, resolveWhere, whereOptions } from "@/lib/where";
import { WILAYAS } from "@/lib/posts";

vi.mock("server-only", () => ({}));
const { instantSearch } = await import("@/lib/instant");

describe("where do you live", () => {
  it("lists all 69 wilayas and every country with an Algerian office", () => {
    expect(WILAYAS).toHaveLength(69);
    const ar = whereOptions("ar");
    expect(ar.wilayas.find((w) => w.value === "Oran")?.label).toBe("وهران");
    expect(ar.countries.find((c) => c.value === "France")?.cities).toContain("Lyon");
    expect(whereOptions("en").countries.find((c) => c.value === "Japan")?.cities).toEqual([]);
  });

  it("rejects values that aren't in our lists", () => {
    expect(parseWhere({ in: "dz", wilaya: "Narnia" })).toBeNull();
    expect(parseWhere({ in: "abroad", country: "France", city: "Atlantis" })).toEqual({ in: "abroad", country: "France" });
    expect(parseWhere("France")).toBeNull();
  });

  it("maps a choice to the right office, and never guesses one in a country with several", () => {
    expect(resolveWhere({ in: "dz", wilaya: "Mascara" })?.inAlgeria).toBe(true);
    expect(resolveWhere({ in: "abroad", country: "France", city: "Lyon" })?.post).toMatch(/Lyon/);
    expect(resolveWhere({ in: "abroad", country: "Japan" })?.post).toMatch(/Tokyo/);
    expect(resolveWhere({ in: "abroad", country: "France" })).toBeNull();
    expect(resolveWhere({ in: "abroad", country: "Germany", city: "Frankfurt" })?.post).toMatch(/Frankfurt/);
    expect(resolveWhere({ in: "abroad", country: "United Arab Emirates", city: "Dubai" })?.post).toMatch(/Dubai/);
    expect(resolveWhere({ in: "abroad", country: "Italy", city: "Rome" })?.post).toMatch(/Rome/);
  });

  it("narrows the free search, but a place named in the question still wins", () => {
    const oran = instantSearch("how do I renew my passport?", "en", undefined, "", { in: "dz", wilaya: "Oran" });
    expect(oran.office?.inAlgeria).toBe(true);
    expect(oran.askPlace).toBeUndefined();
    expect(oran.pages.some((p) => /mfa\.gov\.dz|consulat/.test(p.domain))).toBe(false);
    const named = instantSearch("I live in Lyon, how do I renew my passport?", "en", undefined, "", { in: "dz", wilaya: "Oran" });
    expect(named.office?.name).toMatch(/Lyon/);
    const france = instantSearch("passport renewal in France", "en", undefined, "", { in: "dz", wilaya: "Alger" });
    expect(france.office).toBeUndefined();
    expect(france.askPlace?.chips).toContain("Lyon");
  });
});
