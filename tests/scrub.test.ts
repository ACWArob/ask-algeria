import { describe, expect, it } from "vitest";
import { makeScrubber, scrubHedges } from "@/lib/scrub";
import { detectPost } from "@/lib/posts";

// Sentences taken from the 100-conversation live test (2026-10-28).
describe("scrubHedges", () => {
  const cases: [string, RegExp][] = [
    ["The pages available to me do not include the Montreal consulate's address.", /available to me/],
    ["However, none of the official pages provided include the requirements.", /provided/],
    ["The sources provided here don't include visa application steps.", /provided/],
    ["Its criminal record request is not among the pages I have on this office.", /pages I have/],
    ["Le montant n'est pas indiqué dans les pages officielles dont je dispose : elles précisent", /dont je dispose/],
    ["Les pages consultées ne traitent pas précisément le cas.", /consultées/],
    ["mais les extraits dont je dispose ne contiennent pas ses horaires", /extraits|dont je dispose/],
    ["الصفحات الرسمية اللي عندي ما فيهاش معلومات على منحة البطالة", /اللي عندي/],
    ["المعلومات المتوفرة لدي لا تذكر الرسوم", /المتوفرة لدي/],
  ];
  for (const [input, banned] of cases) {
    it(`removes ${banned} from "${input.slice(0, 40)}…"`, () => {
      const out = scrubHedges(input);
      expect(out).not.toMatch(banned);
      expect(out.length).toBeGreaterThan(input.length * 0.6);
    });
  }
  it("leaves normal text alone", () => {
    const t = "Bring your old passport, provided it is not damaged [1]. Le consulat est ouvert du mardi au samedi [2].";
    expect(scrubHedges(t)).toBe(t);
    expect(scrubHedges("Pièces à fournir : passeport ; photo.")).toBe("Pièces à fournir : passeport ; photo.");
  });
  it("Darija: Moroccan ديال/دابا become Algerian تاع/ضرك, only in dz", () => {
    expect(scrubHedges("الباسبور ديالك لازم يكون صالح، دابا روح للقنصلية", "dz")).toBe("الباسبور تاعك لازم يكون صالح، ضرك روح للقنصلية");
    expect(scrubHedges("الملف ديال الكارط", "dz")).toBe("الملف تاع الكارط");
    expect(scrubHedges("ديالك", "ar")).toBe("ديالك");
  });
  it("streams across chunk boundaries", () => {
    const s = makeScrubber();
    const parts = ["Les pages consul", "tées ne disent rien. Ens", "uite, appelez-les."];
    const out = parts.map((p) => s.push(p)).join("") + s.flush();
    expect(out).toBe("Les pages officielles ne disent rien. Ensuite, appelez-les.");
  });
});

describe("location detection gaps found in the live test", () => {
  it("Arabic and French US state names", () => {
    expect(detectPost("جورجيا")?.post).toMatch(/New York/);
    expect(detectPost("نسكن في فلوريدا")?.post).toMatch(/New York/);
    expect(detectPost("أعيش في تكساس")?.post).toMatch(/San Francisco/);
    expect(detectPost("j'habite en Floride")?.post).toMatch(/New York/);
  });
  it("'depuis Nice' is a place, 'a nice summary' is not", () => {
    expect(detectPost("acte de naissance algérien depuis Nice")?.place).toBe("Nice");
    expect(detectPost("give me a nice summary")).toBeNull();
    expect(detectPost("je vis a Nice")?.place).toBe("Nice");
  });
});

describe("Canada jurisdictions (embassyalgeria.ca/consulat)", () => {
  it("Toronto, Vancouver and Gatineau go to Ottawa; Quebec and Halifax to Montreal", () => {
    expect(detectPost("I live in Toronto")?.post).toMatch(/Ottawa/);
    expect(detectPost("je suis à Vancouver")?.post).toMatch(/Ottawa/);
    expect(detectPost("Gatineau")?.post).toMatch(/Ottawa/);
    expect(detectPost("j'habite à Québec")?.post).toMatch(/Montreal/);
    expect(detectPost("Halifax")?.post).toMatch(/Montreal/);
    expect(detectPost("Paris")?.domains).toContain("consulat-paris-algerie.fr");
  });
});

describe("state code after a city", () => {
  it("rockville MD / austin tx", () => {
    expect(detectPost("I'm in rockville MD")?.post).toMatch(/Washington/);
    expect(detectPost("living in austin tx")?.post).toMatch(/San Francisco/);
    expect(detectPost("I am in good shape ok")).toBeNull();
  });
});
