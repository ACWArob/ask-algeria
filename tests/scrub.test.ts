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
    ["Les sources fournies ne mentionnent aucun visa spécial.", /fournies/],
    ["The Montreal office's pages I can see here cover visas.", /I can see/],
    ["الصفحات الرسمية المتاحة لا تذكر شرط الترجمة", /المتاحة/],
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
  it("drops non-numeric bracket tags but keeps citations and links", () => {
    expect(scrubHedges("Michigan falls under New York [system guidance], see [1] and [the site](https://x.dz).")).toBe(
      "Michigan falls under New York, see [1] and [the site](https://x.dz).",
    );
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

describe("first place mentioned wins", () => {
  it("in Toronto ... go to Montreal → Ottawa", () => {
    expect(detectPost("do algerians in toronto need to go to montreal for a new ID card")?.post).toMatch(/Ottawa/);
    expect(detectPost("I moved from Paris to Lille")?.place).toBe("Lille");
    expect(detectPost("je vais à Paris mais j'habite à Lyon")?.place).toBe("Lyon");
  });
});

import { questionTopics } from "@/lib/detect";
describe("topics that must trigger 'where do you live?'", () => {
  it("consular registration in 4 languages, apostille", () => {
    for (const q of ["how do I register at the algerian consulate", "كيف أسجل نفسي في القنصلية", "kifach nsajel rouhi f consulat", "comment m'inscrire au consulat"])
      expect(questionTopics(q), q).toContain("consular_registration");
    expect(questionTopics("how do I get an American document apostilled for use in algeria")).toContain("legalization");
    expect(questionTopics("كيف أصادق على وثيقة تركية")).toContain("legalization");
  });
});

import { postFromGeo, readGeo } from "@/lib/posts";
describe("Vercel geo headers", () => {
  it("Colorado connection → San Francisco; Algiers → APC", () => {
    const h = new Headers({ "x-vercel-ip-country": "US", "x-vercel-ip-country-region": "CO", "x-vercel-ip-city": "Boulder" });
    expect(postFromGeo(readGeo(h))?.post).toMatch(/San Francisco/);
    const dz = new Headers({ "x-vercel-ip-country": "DZ", "x-vercel-ip-city": "Alger" });
    expect(postFromGeo(readGeo(dz))?.inAlgeria).toBe(true);
  });
});

describe("wilayas and 'in Algeria'", () => {
  it("every wilaya maps to its portal; plain 'in Algeria' is not a residence", () => {
    expect(detectPost("I live in Tlemcen")?.domains).toContain("wilaya-tlemcen.dz");
    expect(detectPost("ساكن في سطيف")?.inAlgeria).toBe(true);
    expect(detectPost("j'habite à Bou Saâda")?.inAlgeria).toBe(true);
    expect(detectPost("عقد زواجي في بلجيكا كيف أسجله في الجزائر")?.inAlgeria).not.toBe(true);
    expect(detectPost("how do I get a document apostilled for use in algeria")).toBeNull();
    expect(detectPost("الجزائر")).toBeNull();
    expect(detectPost("أسكن في الجزائر")?.inAlgeria).toBe(true);
    expect(detectPost("rani f dzayer")?.inAlgeria).toBe(true);
  });
  it("wilaya names that are everyday words need 'in/à/في'", () => {
    expect(detectPost("my mascara ran out")).toBeNull();
    expect(detectPost("j'habite à Mascara")?.place).toBe("Mascara");
    expect(detectPost("أنا سعيدة جدا")).toBeNull();
    expect(detectPost("ساكن في البيض")?.place).toBe("El Bayadh");
  });
});
