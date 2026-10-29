import type { Locale } from "@/lib/i18n";

/**
 * One-tap follow-up questions shown under an answer ("How much does it cost?", "And for a child?").
 * Fixed per topic, so they are always sensible and in the reply language. Skips anything the person
 * already asked about.
 */
type Key = "fees" | "docs" | "time" | "child" | "online" | "office" | "appointment" | "lost" | "deferment";

const TEXT: Record<Key, Record<Locale, string>> = {
  fees: { en: "How much does it cost?", fr: "Ça coûte combien ?", ar: "كم التكلفة؟", dz: "قداش تسوى؟" },
  docs: { en: "Which documents do I need?", fr: "Quels documents faut-il ?", ar: "ما هي الوثائق المطلوبة؟", dz: "واش من وراق لازم نجيب؟" },
  time: { en: "How long does it take?", fr: "Combien de temps ça prend ?", ar: "كم تستغرق المدة؟", dz: "قداش ياخذ وقت؟" },
  child: { en: "And for a child?", fr: "Et pour un enfant ?", ar: "وماذا عن طفل قاصر؟", dz: "و للطفل الصغير؟" },
  online: { en: "Can I do it online?", fr: "Peut-on le faire en ligne ?", ar: "هل يمكن القيام بذلك عبر الإنترنت؟", dz: "نقدر نديرها من الانترنت؟" },
  office: { en: "Where is the office and when is it open?", fr: "Où est le bureau et quels sont les horaires ?", ar: "أين المكتب وما هي مواعيد العمل؟", dz: "وين المكتب ووقتاش يحل؟" },
  appointment: { en: "Do I need an appointment?", fr: "Faut-il un rendez-vous ?", ar: "هل أحتاج إلى موعد؟", dz: "لازم رونديفو؟" },
  lost: { en: "What if it was lost or stolen?", fr: "Et en cas de perte ou de vol ?", ar: "وماذا لو ضاع أو سُرق؟", dz: "و إذا ضاع ولا تسرق؟" },
  deferment: { en: "How do I get a deferment or exemption?", fr: "Comment obtenir un sursis ou une dispense ?", ar: "كيف أحصل على تأجيل أو إعفاء؟", dz: "كيفاش ندير السورسي ولا الإعفاء؟" },
};

/** Already asked about this → don't offer it again. */
// Whole words only (Unicode-aware), so "person" doesn't count as "son" or "within" as "win".
const w = (alts: string) => new RegExp(`(?<![\\p{L}])(?:${alts})(?![\\p{L}])`, "iu");
const ASKED: Record<Key, RegExp> = {
  fees: w("cost|fee|price|how much|combien|tarif|frais|prix|كم|سعر|رسوم|تكلفة|قداش|سوم|شحال"),
  docs: w("document|papers?|pi[eè]ces|dossier|papiers|وثائق|الوثائق|وراق|ملف|الملف|watha2i9|wra9"),
  time: w("how long|délai|delai|combien de temps|durée|مدة|المدة|وقت|يستغرق|طول"),
  child: w("child|kid|son|daughter|baby|minor|enfant|fils|fille|bébé|mineur|طفل|ابن|ابني|بنت|بنتي|قاصر|صغير|weldi|benti"),
  online: w("online|internet|en ligne|website|site|انترنت|الانترنت|الإنترنت|اونلاين|أون لاين|موقع"),
  office: w("where|address|hours|open|où|adresse|horaire|ouvert|أين|عنوان|العنوان|مواعيد|وين|وقتاش|win"),
  appointment: w("appointment|rendez|rdv|موعد|رونديفو|rendevou"),
  lost: w("lost|stolen|perdu|vol[ée]|perte|ضاع|ضائع|سرق|فقدان|tla9|dha3"),
  deferment: w("deferment|defer|exempt|sursis|dispense|report|تأجيل|إعفاء|اعفاء|سورسي"),
};

const BY_TOPIC: Record<string, Key[]> = {
  passport: ["docs", "fees", "child", "time", "appointment", "lost"],
  cni: ["docs", "fees", "child", "time", "lost"],
  birth_certificate: ["online", "docs", "office"],
  civil_status: ["docs", "time", "office", "child"],
  criminal_record: ["online", "time", "docs"],
  nationality: ["docs", "time", "office"],
  consular_registration: ["docs", "child", "office", "fees"],
  legalization: ["fees", "office", "docs"],
  national_service: ["deferment", "docs", "office"],
  consular_visa: ["docs", "fees", "time"],
  driving_vehicle: ["docs", "fees", "office"],
  housing: ["online", "docs", "office"],
  social_security: ["online", "docs", "office"],
  tax: ["online", "docs", "fees"],
  education: ["online", "docs", "time"],
  employment: ["online", "docs", "office"],
};
const DEFAULT: Key[] = ["docs", "fees", "office"];

export function followUps(topics: string[], question: string, lang: Locale, max = 3): string[] {
  const keys = topics.map((t) => BY_TOPIC[t]).find(Boolean) ?? DEFAULT;
  return keys.filter((k) => !ASKED[k].test(question)).slice(0, max).map((k) => TEXT[k][lang]);
}
