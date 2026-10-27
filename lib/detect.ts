import type { Locale } from "@/lib/i18n";

/**
 * Cheap heuristic language detection. Used for mock mode and as a fallback when
 * the Haiku expansion call fails. Not meant to be perfect.
 */
const DARIJA_AR = /(^|\s)(واش|كيفاش|وشنو|راني|راك|راهو|راهي|بزاف|ماشي|علاش|وقتاش|شحال|تاع|نتاع|باش|نحب|حاب|نخرج|نديرو?|كاش|بلاك|درك|ضرك|مازال|برك|هادا|هادي|نتوما|حنا|خدام|الباسبور|الكناس|البوسطة)(?=\s|$|[؟?!.,،])/;
const ARABIZI = /\b(wach|wesh|kifach|kifeh|kifah|rani|rak|rahi|bzaf|bezaf|machi|3lach|wa9tach|chhal|ta3|nta3|bach|nheb|n7eb|7ab|nkhrej|nekhrej|dir|kayen|kach|derwek|drk|mazal|berk|hadi|hada|khdma|passpor|9raya|lbac)\b/i;
const FRENCH = /\b(comment|pourquoi|quand|quel(le)?s?|est-ce|je|mon|ma|mes|le|la|les|des|du|une?|pour|obtenir|demande|renouveler|carte|passeport|extrait|où)\b/gi;
const ENGLISH = /\b(how|what|where|when|which|do|does|can|i|my|the|to|get|renew|apply|need|is|are)\b/gi;

export function detectLanguage(text: string): Locale | null {
  const t = text.trim();
  if (t.length < 3) return null;
  const arabicChars = (t.match(/[؀-ۿ]/g) ?? []).length;
  const latinChars = (t.match(/[A-Za-zÀ-ÿ]/g) ?? []).length;
  if (arabicChars > latinChars) return DARIJA_AR.test(t) ? "dz" : "ar";
  if (latinChars === 0) return null;
  // Arabizi: Latin letters mixed with 3/7/9 used as letters, or common Darija words
  if (ARABIZI.test(t) || /[a-z][379][a-z]/i.test(t)) return "dz";
  const fr = (t.match(FRENCH) ?? []).length + (/[éèêàçùœ]/i.test(t) ? 2 : 0);
  const en = (t.match(ENGLISH) ?? []).length;
  if (fr === 0 && en === 0) return null;
  return fr >= en ? "fr" : "en";
}

/** Which language to answer in, given the UI language and what the question looks like. */
export function chooseAnswerLang(selected: Locale, detected: Locale | null, question: string): Locale {
  if (!detected || question.trim().length < 12) return selected;
  // Arabic and Darija share a script: respect the register the user picked in the UI.
  if ((selected === "ar" || selected === "dz") && (detected === "ar" || detected === "dz")) return selected;
  return detected;
}

/**
 * Offline query expansion used in MOCK_LLM mode and when the Haiku call fails.
 * Maps common Darija / Arabic / French / Arabizi words to the official terms used on
 * FR/EN/AR pages so lexical search still finds the right records.
 */
const GLOSSARY: [RegExp, string][] = [
  [/باسبور|جواز|passe?port|passpor/i, "passport passeport biometric جواز السفر"],
  [/12\s?s|12\s?خ|s12|ميلاد|naissance|birth/i, "12S birth certificate extrait de naissance شهادة الميلاد"],
  [/كازي|السوابق|casier|criminal|judiciaire/i, "criminal record casier judiciaire bulletin صحيفة السوابق العدلية"],
  [/جنسي|nationalit/i, "nationality certificate certificat de nationalité شهادة الجنسية"],
  [/لاكارط|بطاقة التعريف|ديدونتيتي|identit|\bcni\b/i, "national identity card CNIBE carte d'identité بطاقة التعريف"],
  [/صغار|قاصر|قُصّر|القصر|mineur|minor|enfant|child/i, "minors children parental authorization"],
  [/تجديد|نجدد|renouvel|renew/i, "renewal renouvellement"],
  [/كناس|cnas|ضمان|شفاء|chifa/i, "CNAS social security assurance sociale"],
  [/ضراي?ب|ضرائب|impôt|impot|tax|جبايت|jibayat/i, "tax impôts Jibayatic"],
  [/باك|بكالوريا|\bbac\b|bem|بيام|baccalaur/i, "baccalaureate bac preinscription orientation"],
  [/عدل|aadl|سكن|logement|housing/i, "AADL housing logement"],
  [/ذهبية|edahabia|ذهبيه|بوسطة|poste/i, "Edahabia Algérie Poste carte"],
  [/أوطو|auto.?entrepreneur|مقاول|anae/i, "auto-entrepreneur ANAE"],
  [/قنصل|consul|تسجيل قنصلي|immatricul/i, "consular registration immatriculation"],
  [/خدمة وطنية|service national|military/i, "national military service"],
  [/فيزا|visa|تأشيرة/i, "entry visa"],
];

export function glossaryQueries(text: string): string[] {
  const hits = GLOSSARY.filter(([re]) => re.test(text)).map(([, q]) => q);
  return hits.length ? [hits.join(" ")] : [];
}
