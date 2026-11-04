import type { Locale } from "@/lib/i18n";

/**
 * "You may not have to provide this" card. Every quote below is copied verbatim from the cited
 * data/corpus.json record (tests/extras.test.ts checks it). The plain-words paraphrase is in lib/i18n-extra.ts.
 * Shown on /glossary and on the guides listed in EXEMPTION_SLUGS.
 */
export const EXEMPTION_SLUGS = ["civil-status", "birth-12s"];

const EC_FR = "interieur-gov-dz-2024-02-29-etat-civil";
const EC_AR = "interieur-gov-dz-2024-02-29-9aa05d";
const WINDOW = "interieur-gov-dz-2015-03-20-9c5840";

export interface ExemptionQuote { id: string; lang: "fr" | "ar"; quote: string }
export interface ExemptionPoint { key: "decree" | "window"; source: Record<Locale, ExemptionQuote> }

const DECREE_FR: ExemptionQuote = {
  id: EC_FR,
  lang: "fr",
  quote: "Décret exécutif n° 15-204 du 11 Chaoual 1436 correspondant au 27 juillet 2015 dispensant le citoyen de la présentation des documents d’Ètat civil contenus dans le registre national automatisé de l’Etat civil",
};
const DECREE_AR: ExemptionQuote = {
  id: EC_AR,
  lang: "ar",
  quote: "المرسوم التنفيذي رقم 15-204 المؤرخ في 11 شوال 1436 الموافق 27 جويلية 2015 المتضمن اعفاء المواطن من تقديم وثائق الحالة المدنية المتوفرة ضمن السجل الوطني الآلي للحالة المدنية.",
};
const WINDOW_AR: ExemptionQuote = {
  id: WINDOW,
  lang: "ar",
  quote: "إعفاء المواطن من تقديم ملخص شهادة الميلاد 12 خ ضمن الوثائق المكونة لملف طلب بطاقة التعريف الوطنية أو جواز السفر.\nإعفاء المواطن من تقديم الوثائق الموجودة بياناتها في قاعدة المعطيات ما لم يتم تغييرها.",
};

export const EXEMPTION_POINTS: ExemptionPoint[] = [
  { key: "decree", source: { en: DECREE_FR, fr: DECREE_FR, ar: DECREE_AR, dz: DECREE_AR } },
  { key: "window", source: { en: WINDOW_AR, fr: WINDOW_AR, ar: WINDOW_AR, dz: WINDOW_AR } },
];

export const EXEMPTION_SOURCE_IDS = [EC_FR, EC_AR, WINDOW];
