/**
 * Search synonyms ("concepts"): the same thing said in English, French, Arabic, Darija and Arabizi.
 * GOV.UK's site search relies on a hand-kept synonym list like this (informal words, acronyms, misspellings, old names).
 * A question that mentions any term of a concept is searched with all of its terms, so "unemployment benefit"
 * finds French "allocation chômage" pages and "باسبور" finds "passeport".
 *
 * Add terms here when the search eval (qa/search-eval.json) or real searches show a miss. Keep each concept to one idea.
 */
import { normalizeTerm } from "@/lib/search-core.mjs";

export const CONCEPTS: Record<string, string[]> = {
  passport: ["passport", "passeport", "جواز السفر", "جواز", "باسبور", "الباسبور", "passpor", "pasport", "paspor"],
  id_card: ["identity card", "id card", "carte d'identité", "carte nationale d'identité", "cni", "cnibe", "بطاقة التعريف", "لاكارط", "ديدونتيتي"],
  birth_12s: ["12s", "12 s", "s12", "12 خ", "12خ", "acte de naissance spécial", "extrait de naissance", "birth certificate", "شهادة الميلاد", "شهادة ميلاد", "milad"],
  birth_registration: ["register birth", "birth registration", "déclaration de naissance", "transcription de naissance", "تسجيل المولود", "تسجيل الازدياد", "زيادة", "nouveau-né", "newborn", "baby", "enfant né", "bébé", "inscrire mon enfant", "inscrire un enfant", "déclarer la naissance"],
  marriage: ["marriage", "mariage", "زواج", "عقد الزواج", "transcription de mariage", "acte de mariage", "zwaj"],
  divorce: ["divorce", "طلاق", "jugement de divorce"],
  death: ["death", "décès", "deces", "وفاة", "repatriation", "rapatriement", "dépouille", "corps", "جثمان", "نقل الجثمان", "funeral", "obsèques"],
  family_book: ["family book", "livret de famille", "دفتر العائلة", "livret"],
  civil_status: ["civil status", "état civil", "etat civil", "الحالة المدنية", "transcription"],
  criminal_record: ["criminal record", "casier judiciaire", "casier", "bulletin n°3", "bulletin 3", "صحيفة السوابق", "السوابق العدلية", "كازي", "lcasier"],
  nationality: ["nationality", "nationalité", "nationalite", "الجنسية", "شهادة الجنسية", "jinsiya"],
  consular_registration: ["consular registration", "consular card", "immatriculation consulaire", "immatriculation", "carte consulaire", "التسجيل القنصلي", "البطاقة القنصلية", "register at the consulate", "carte consulaire", "lcarte consulaire"],
  change_residence: ["change of address", "change of residence", "changement de résidence", "changement d'adresse", "radiation", "de-registration", "file transfer", "transfert de dossier", "تغيير الإقامة", "نقل الملف"],
  residence_cert: ["residence certificate", "certificat de résidence", "شهادة الإقامة"],
  laissez_passer: ["laissez-passer", "laissez passer", "emergency travel document", "emergency passport", "passeport d'urgence", "جواز مرور", "رخصة مرور"],
  parental_auth: ["parental authorization", "autorisation parentale", "autorisation de sortie", "إذن أبوي", "ترخيص أبوي"],
  minors: ["child", "children", "minor", "minors", "enfant", "enfants", "mineur", "mineurs", "قاصر", "قصر", "أطفال", "صغار", "wlidi", "weldi"],
  power_attorney: ["power of attorney", "procuration", "توكيل", "وكالة", "wakala"],
  legalization: ["legalization", "legalisation", "légalisation", "apostille", "authentication", "certification conforme", "copie conforme", "تصديق", "مصادقة", "مطابقة للأصل"],
  national_service: ["national service", "military service", "service national", "service militaire", "الخدمة الوطنية", "الخدمة العسكرية", "سرفيس", "sarvis", "recensement", "régularisation militaire"],
  visa: ["visa", "تأشيرة", "فيزا", "entry visa", "visa d'entrée"],
  residence_permit: ["residence permit", "carte de séjour", "titre de séjour", "séjour", "بطاقة الإقامة", "permis de séjour"],
  driving: ["driving licence", "driving license", "driver's license", "permis de conduire", "رخصة السياقة", "permis", "lpermis"],
  vehicle: ["carte grise", "vehicle registration", "immatriculation du véhicule", "véhicule", "vehicle", "car", "voiture", "طوموبيل", "السيارة", "سيارة", "tomobil"],
  customs: ["customs", "douane", "douanes", "dédouanement", "import", "importation", "الجمارك", "جمارك", "ديوانة", "duties", "droits de douane"],
  housing: ["aadl", "عدل", "logement", "housing", "سكن", "lpp", "lpl", "social housing", "logement social", "location-vente"],
  unemployment: ["unemployment", "unemployment benefit", "unemployment allowance", "allocation chômage", "allocation chomage", "chômage", "chomage", "منحة البطالة", "بطالة", "minha", "chômeur"],
  employment: ["job", "jobs", "emploi", "employment", "travail", "anem", "demandeur d'emploi", "job seeker", "تشغيل", "khedma", "recrutement", "recruitment"],
  social_security: ["cnas", "casnos", "sécurité sociale", "social security", "assurance sociale", "الضمان الاجتماعي", "ضمان", "كناس", "affiliation", "attestation d'affiliation", "el hanaa", "الهناء"],
  chifa: ["chifa", "شفاء", "carte chifa", "health insurance", "assurance maladie", "remboursement"],
  pension: ["pension", "retraite", "retirement", "cnr", "تقاعد", "المنحة التقاعدية"],
  tax: ["tax", "taxes", "impôt", "impôts", "impot", "fiscal", "fiscale", "الضرائب", "ضريبة", "جباية", "jibayatic", "jibayat", "nif", "déclaration fiscale"],
  fiscal_stamp: ["fiscal stamp", "timbre fiscal", "timbres fiscaux", "droits de timbre", "tabioucom", "الطوابع الجبائية", "طابع جبائي", "stamp duty"],
  business: ["registre de commerce", "commercial register", "cnrc", "sidjilcom", "السجل التجاري", "création d'entreprise", "company registration", "entreprise", "business"],
  auto_entrepreneur: ["auto-entrepreneur", "auto entrepreneur", "anae", "مقاول ذاتي", "المقاول الذاتي"],
  startup: ["startup", "start-up", "label startup", "مؤسسة ناشئة", "incubateur"],
  bac: ["bac", "baccalauréat", "baccalaureat", "baccalaureate", "بكالوريا", "البكالوريا", "باك", "lbac"],
  bem: ["bem", "brevet", "شهادة التعليم المتوسط", "بيام"],
  university: ["university", "université", "universite", "الجامعة", "جامعة", "progres", "étudiant", "student", "inscription universitaire", "préinscription", "orientation", "طالب"],
  student_housing: ["onou", "webonou", "résidence universitaire", "cité universitaire", "student residence", "student housing", "hébergement universitaire", "الإقامة الجامعية", "الإيواء الجامعي", "bourse et hébergement"],
  scholarship: ["scholarship", "bourse", "منحة دراسية", "études à l'étranger", "study abroad"],
  equivalence: ["equivalence", "équivalence", "معادلة", "معادلة الشهادة", "diploma recognition", "reconnaissance de diplôme"],
  electricity_gas: ["sonelgaz", "électricité", "electricite", "electricity", "gaz", "gas", "كهرباء", "سونلغاز", "facture d'électricité"],
  water: ["water", "eau", "ade", "ماء", "facture d'eau", "seaal"],
  post: ["algérie poste", "algerie poste", "poste", "ccp", "edahabia", "dahabia", "الذهبية", "بريد الجزائر", "بوسطة"],
  internet: ["internet", "algérie télécom", "algerie telecom", "idoom", "adsl", "fibre", "اتصالات الجزائر", "انترنت"],
  health: ["health", "santé", "sante", "صحة", "hôpital", "hopital", "hospital", "مستشفى", "vaccin", "vaccination", "لقاح", "médecin", "doctor"],
  emergency: ["emergency", "urgence", "urgences", "طوارئ", "samu", "protection civile", "الحماية المدنية"],
  elections: ["election", "elections", "élection", "élections", "vote", "voter", "انتخاب", "الانتخابات", "anie", "liste électorale"],
  hajj: ["hajj", "حج", "الحج", "omra", "umrah", "عمرة", "pèlerinage"],
  travellers: ["dz travellers", "travellers", "voyageurs", "travel registration", "المسافرين"],
  fees: ["fee", "fees", "cost", "price", "frais", "tarif", "tarifs", "prix", "رسوم", "ثمن", "سعر", "شحال", "يكلف", "chhal", "bch7al"],
  documents: ["documents", "required documents", "pièces à fournir", "dossier", "الوثائق", "الوراق", "lwra9", "papiers"],
  renewal: ["renew", "renewal", "renewel", "renewed", "renewing", "renouvelé", "renouvelée", "renouveler", "renouvellement", "تجديد", "نجدد", "أجدد", "جدد", "يجدد", "njadded", "njeded"],
  abroad: ["abroad", "à l'étranger", "a l'etranger", "étranger", "living abroad", "diaspora", "communauté nationale à l'étranger", "الخارج", "بالخارج", "في الخارج", "الجالية", "الجالية الوطنية بالخارج", "برا"],
  foreigner: ["foreigner", "foreigners", "foreign national", "étranger", "étrangers", "ressortissant étranger", "أجنبي", "الأجانب", "أجانب"],
  lost: ["lost", "stolen", "perte", "perdu", "vol", "ضياع", "ضاع", "سرقة", "dha3"],
  appointment: ["appointment", "rendez-vous", "rdv", "موعد", "رونديفو"],
  contact: ["phone", "telephone", "téléphone", "address", "adresse", "hours", "horaires", "contact", "email", "هاتف", "عنوان", "أوقات العمل", "تيليفون"],
};

/** Question words that say nothing about the topic: never required on a page. */
const FILLER = new Set(
  "apply applying get getting need needed want obtain request please help does there about which where when who what online obtenir faire avoir demande demander quoi quel quelle quels aide info information algeria algerian algérie algerie algérien الجزائر dz نحب حاب بغيت لازم باش ندير نخرج نجيب واش كيفاش wach kifach kifech bach lazem ndir nheb nkhrej"
    .split(" ")
    .map((w) => normalizeTerm(w))
    .filter((w): w is string => Boolean(w)),
);

interface Group { id: string; terms: string[][] } // each term = normalized token sequence

function tokens(s: string): string[] {
  return s
    .replace(/[’']/g, "'")
    .split(/[^\p{L}\p{N}']+/u)
    .map((t) => normalizeTerm(t))
    .filter((t): t is string => Boolean(t));
}

const GROUPS: Group[] = Object.entries(CONCEPTS).map(([id, terms]) => ({
  id,
  terms: [...new Set(terms.map((t) => tokens(t).join(" ")).filter(Boolean))].map((t) => t.split(" ")),
}));

function containsSeq(hay: string[], seq: string[]): boolean {
  outer: for (let i = 0; i + seq.length <= hay.length; i++) {
    for (let j = 0; j < seq.length; j++) if (hay[i + j] !== seq[j]) continue outer;
    return true;
  }
  return false;
}

export interface Expansion {
  /** Concepts found in the text. */
  concepts: string[];
  /** One extra query with every term of the matched concepts. */
  query: string;
  /**
   * What a page must cover to be relevant: one entry per concept, plus one per leftover content word
   * (each entry = alternatives, as normalized token sequences).
   */
  groups: string[][][];
  /** How many of `groups` (at the start) are concepts; the rest are leftover words. */
  conceptCount: number;
}

/** Concepts mentioned in `text`, and the words they cover. */
export function expandQuery(text: string): Expansion {
  const toks = tokens(text);
  const covered = new Set<number>();
  const found: Group[] = [];
  for (const g of GROUPS) {
    let hit = false;
    for (const seq of g.terms) {
      for (let i = 0; i + seq.length <= toks.length; i++) {
        if (seq.every((s, j) => toks[i + j] === s)) {
          hit = true;
          for (let j = 0; j < seq.length; j++) covered.add(i + j);
        }
      }
    }
    if (hit) found.push(g);
  }
  // A word that only matched a broad concept ("service") shouldn't count twice when a narrower one also matched.
  const leftovers = toks.filter((t, i) => !covered.has(i) && t.length >= 3 && !/^\d+$/.test(t) && !FILLER.has(t));
  return {
    concepts: found.map((g) => g.id),
    query: found.flatMap((g) => g.terms.map((t) => t.join(" "))).join(" "),
    groups: [...found.map((g) => g.terms), ...[...new Set(leftovers)].map((t) => [[t]])],
    conceptCount: found.length,
  };
}

/** Does a page (its normalized tokens) mention any alternative of a group? */
export function coversGroup(pageTokens: string[], pageSet: Set<string>, group: string[][]): boolean {
  return group.some((seq) => (seq.length === 1 ? pageSet.has(seq[0]) : containsSeq(pageTokens, seq)));
}

export { tokens as searchTokens };
