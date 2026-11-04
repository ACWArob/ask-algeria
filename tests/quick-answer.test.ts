import { describe, expect, it, vi } from "vitest";
import { guideAnswer, pageOnTopic, quickAnswer, units } from "@/lib/quick-answer";

vi.mock("server-only", () => ({}));
const { instantSearch } = await import("@/lib/instant");

describe("free quick answer", () => {
  it("keeps a header and its list together", () => {
    expect(units("Le dossier se constitue de :\n- le passeport expiré ;\n- deux photos ;\n- un acte 12S.")[0]).toBe("Le dossier se constitue de : le passeport expiré ; deux photos ; un acte 12S");
  });

  it("picks the lines that answer the question, with their source", () => {
    const qa = quickAnswer("how do I renew my passport", [
      { title: "Passports", url: "https://x/p", domain: "x", office: true, text: "Passports can be renewed up to six months before they expire.\nThe consulate is closed on public holidays and on Fridays and Saturdays in general." },
    ]);
    expect(qa?.facts[0].text).toMatch(/renewed/);
    expect(qa?.sources[0].url).toBe("https://x/p");
  });

  it("skips headings, the same sentence twice, and emergency-passport pages for a renewal question", () => {
    const q = "I live in London, how do I renew my passport?";
    expect(pageOnTopic(q, { title: "Emergency Passport - Consulate General of Algeria in London", url: "u", domain: "d", text: "" })).toBe(false);
    expect(pageOnTopic(q, { title: "Passport renewal - Consulate General of Algeria in London", url: "u", domain: "d", text: "" })).toBe(true);
    const note = "Note: the passport renewal file must include the expired passport and two photos.";
    const qa = quickAnswer(q, [
      { title: "A", url: "https://a/1", domain: "a", office: true, text: `Biometric Passport and/or CNIBE: Renewal\n${note}` },
      { title: "B", url: "https://b/1", domain: "b", office: true, text: `"${note}"\nRenewal is possible in the six months before the passport expires.` },
    ]);
    const texts = qa!.facts.map((f) => f.text);
    expect(texts).not.toContain("Biometric Passport and/or CNIBE: Renewal");
    expect(texts.filter((t) => /expired passport and two photos/.test(t))).toHaveLength(1);
  });

  it("drops another consulate's rules from guide points", () => {
    const L = (en: string) => ({ en, fr: en, ar: en, dz: en });
    const ga = guideAnswer(
      { sections: [{ id: "how", title: L("Renewal"), points: [{ text: L("London charges £55."), cites: ["a"] }, { text: L("Bring your old passport."), cites: ["b"] }, { text: L("Lyon accepts appointments online."), cites: ["c"] }] }] },
      "renew passport", "en", { inAlgeria: false, officeCities: ["Lyon"], otherCities: ["London", "Lyon"] },
    );
    const texts = ga!.sections[0].points.map((p) => p.text);
    expect(texts[0]).toMatch(/Lyon/);
    expect(texts).not.toContain("London charges £55.");
  });

  it("answers with real facts in the free search", () => {
    const r = instantSearch("how do i renew my passport", "en", undefined, "", { in: "abroad", country: "United States", city: "San Francisco" });
    expect(r.quick?.sections[0].points.some((p) => /renewed|Required documents/.test(p.text))).toBe(true);
    const ar = instantSearch("كيف أجدد جواز السفر", "ar", undefined, "", { in: "dz", wilaya: "Oran" });
    expect(ar.quick?.sections.flatMap((s) => s.points).some((p) => /[؀-ۿ]/.test(p.text))).toBe(true);
  });
});
