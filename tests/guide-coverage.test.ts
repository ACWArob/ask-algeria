import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// Every guide topic, from Algeria and from consulates with and without pages of their own, in English, Arabic
// and Darija: the free answer exists and is in the reader's language (2026-11-10 sweep: Lyon/Montreal got raw French
// page text, "ID card" and "الخدمة الوطنية" weren't detected, Algiers was quoted Oran's pages).
const QUESTIONS: Record<"en" | "ar" | "dz", Record<string, string>> = {
  en: { passport: "How do I renew my passport?", cni: "How do I get the biometric ID card?", "birth-12s": "How do I get a 12S birth certificate?", "civil-status": "How do I get a marriage certificate?", "criminal-record": "How do I get a criminal record extract?", nationality: "How do I get a nationality certificate?", "consular-registration": "How do I register at the consulate?", "national-service": "How do I get a national service deferment?", cnas: "How do I register with CNAS?", aadl: "How do I follow my AADL application?" },
  ar: { passport: "كيف أجدد جواز السفر؟", cni: "كيف أحصل على بطاقة التعريف البيومترية؟", "birth-12s": "كيف أستخرج شهادة الميلاد 12خ؟", "civil-status": "كيف أستخرج عقد الزواج؟", "criminal-record": "كيف أستخرج صحيفة السوابق العدلية؟", nationality: "كيف أستخرج شهادة الجنسية؟", "consular-registration": "كيف أسجل في القنصلية؟", "national-service": "كيف أحصل على تأجيل الخدمة الوطنية؟", cnas: "كيف أنتسب إلى الضمان الاجتماعي؟", aadl: "كيف أتابع ملف عدل؟" },
  dz: { passport: "كيفاش نجدد الباسبور؟", cni: "كيفاش نخرج لاكارط ديدونتيتي؟", "birth-12s": "كيفاش نخرج 12S؟", "civil-status": "كيفاش نخرج عقد الزواج؟", "criminal-record": "كيفاش نخرج الكازيي؟", nationality: "كيفاش نخرج شهادة الجنسية؟", "consular-registration": "كيفاش نتسجل في القنصلية؟", "national-service": "كيفاش ناخذ سورسي تاع الخدمة الوطنية؟", cnas: "كيفاش نتسجل في الكناس؟", aadl: "كيفاش نتبع الدوسي تاع عدل؟" },
};
const PLACES = [
  { in: "dz", wilaya: "Alger" }, { in: "dz", wilaya: "Oran" },
  { in: "abroad", country: "France", city: "Paris" }, { in: "abroad", country: "France", city: "Lyon" },
  { in: "abroad", country: "Canada", city: "Montreal" }, { in: "abroad", country: "United Kingdom", city: "London" },
  { in: "abroad", country: "United States", city: "New York" }, { in: "abroad", country: "United Arab Emirates" },
  { in: "abroad", country: "Spain", city: "Madrid" }, { in: "abroad", country: "Germany" },
  { in: "abroad", country: "Belgium" }, { in: "abroad", country: "Tunisia" },
];

describe("free answers for every guide topic, place and language", () => {
  it("exist and are in the reader's language", async () => {
    const { instantSearch } = await import("@/lib/instant");
    const { parseWhere } = await import("@/lib/where");
    const bad: string[] = [];
    for (const lang of ["en", "ar", "dz"] as const) {
      for (const [topic, q] of Object.entries(QUESTIONS[lang])) {
        for (const p of PLACES) {
          const w = parseWhere(p);
          expect(w, JSON.stringify(p)).not.toBeNull();
          const r = instantSearch(q, lang, new Headers(), "", w);
          const text = (r.quick?.sections ?? []).flatMap((s) => s.points.map((x) => x.text)).join(" ");
          const where = "city" in p ? p.city : "wilaya" in p ? p.wilaya : p.country;
          if (!r.quick) { bad.push(`${lang} ${topic} ${where}: no answer`); continue; }
          const arabic = (text.match(/[؀-ۿ]/g) ?? []).length / Math.max(1, text.replace(/\s/g, "").length);
          const french = (text.match(/(?<![\p{L}])(le|la|les|des|du|est|pour|aux|une)(?![\p{L}])/giu) ?? []).length / Math.max(1, text.split(/\s+/).length);
          if (lang === "en" && french > 0.08) bad.push(`${lang} ${topic} ${where}: French text`);
          if (lang !== "en" && arabic < 0.3) bad.push(`${lang} ${topic} ${where}: not in Arabic script`);
        }
      }
    }
    expect(bad).toEqual([]);
  }, 180_000);
});
