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

/** Corpus topic slugs that the question is about (used to boost matching pages). */
const TOPIC_RULES: [RegExp, string[]][] = [
  [/باسبور|جواز|passe?port|passpor|laissez/i, ["passport"]],
  [/لاكارط|بطاقة التعريف|ديدونتيتي|identit|\bcni/i, ["cni"]],
  [/12\s?s|12\s?خ|s12|ميلاد|naissance|birth/i, ["birth_certificate", "civil_status"]],
  [/زواج|mariage|marriage|طلاق|divorce|وفاة|décès|deces|death|livret|دفتر العائلة|état civil|etat civil|حالة مدنية/i, ["civil_status"]],
  [/كازي|السوابق|casier|criminal|judiciaire/i, ["criminal_record", "justice"]],
  [/جنسي|nationalit/i, ["nationality"]],
  [/تسجيل قنصلي|التسجيل القنصلي|بطاقة قنصلية|البطاقة القنصلية|(?:أسجل|اسجل|نسجل|نتسجل|تسجيل)\s*(?:نفسي|روحي)?\s*(?:في|ف|فى)\s*(?:ال)?قنصلي|immatricul|consular (?:card|registration)|carte consulaire|regist\w* (?:\w+ ){0,3}(?:at|with) (?:the )?(?:\w+ )?(?:consulate|embassy)|inscri\w* (?:\w+ ){0,2}(?:au |à l'|a l')(?:consulat|ambassade)|ns[ae]jj?el (?:rouhi |rohi )?(?:f |fel )?(?:l)?consulat|karta? consulaire|l?carte consulaire/i, ["consular_registration"]],
  [/توكيل|وكالة|procuration|power of attorney|légalis|legalis|apostil|تصديق|مصادقة|أصادق|اصادق|نصادق|authenticat|certif\w* conforme/i, ["legalization"]],
  [/خدمة وطنية|service national|military|sarvis|سرفيس/i, ["national_service"]],
  [/فيزا|visa|تأشيرة/i, ["consular_visa"]],
  [/permis|رخصة|driving|carte grise|كارط غريز|immatriculation (de|du) v|véhicule|vehicle|car\b|طوموبيل/i, ["driving_vehicle"]],
  [/ضراي?ب|ضرائب|impôt|impot|tax|جبايت|jibayat|nif\b/i, ["tax"]],
  [/كناس|cnas|casnos|كازنوس|ضمان|شفاء|chifa|retraite|retire|pension|تقاعد|allocation|منحة عائلية/i, ["social_security"]],
  [/chômage|chomage|unemploy|بطالة|anem|minha|منحة البطالة|emploi|job|خدمة/i, ["employment"]],
  [/عدل|aadl|سكن|logement|housing|lpp|lpl/i, ["housing"]],
  [/باك|بكالوريا|\bbac\b|bem|بيام|baccalaur|universit|جامع|étudiant|student|progr[eè]s|bourse|scholar|منحة دراسية/i, ["education"]],
  [/startup|label|auto.?entrepreneur|مقاول|anae|registre de commerce|سجل تجاري|entreprise|business|nesda|angem/i, ["business"]],
  [/sonelgaz|سونلغاز|électricit|electricit|كهرباء|gaz|غاز|eau\b|water|ماء|facture|bill|فاتورة|poste|بوسطة|edahabia|ذهبية|ccp|baridi|internet|idoom|sim|arpce/i, ["utilities", "telecom", "post", "banking"]],
  [/santé|sante|health|صحة|vaccin|لقاح|médicament|medicine|دواء/i, ["health"]],
  [/hajj|حج|omra|عمرة/i, ["hajj", "general"]],
];
export function questionTopics(text: string): string[] {
  const out = new Set<string>();
  for (const [re, topics] of TOPIC_RULES) if (re.test(text)) topics.forEach((t) => out.add(t));
  return [...out];
}
