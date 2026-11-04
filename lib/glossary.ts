import type { Locale } from "@/lib/i18n";

/**
 * Glossary of common Algerian administrative documents and terms (/glossary).
 * Names are the established ones used on official pages and documents; `dz` is the everyday name people say.
 * Explanations are generic one-line definitions only: no fees, delays or requirements (those differ by office).
 * `guide` is a slug of lib/guides (only when one of our guides covers the term).
 */
export interface GlossaryEntry {
  id: string;
  fr: string;
  ar: string;
  en: string;
  dz: string;
  explain: Record<Locale, string>;
  guide?: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "12s", guide: "birth-12s",
    fr: "Extrait d'acte de naissance spécial (12S)", ar: "شهادة الميلاد الخاصة رقم 12 خ", en: "Special birth certificate (12S)", dz: "الـ12 خ · « douze S »",
    explain: {
      en: "A special extract of your birth record, asked for mainly in biometric passport and ID card applications.",
      fr: "Extrait spécial de l'acte de naissance, demandé surtout pour le passeport et la carte d'identité biométriques.",
      ar: "مستخرج خاص من عقد الميلاد، يُطلب خاصة في ملفات جواز السفر وبطاقة التعريف البيومتريين.",
      dz: "شهادة ميلاد خاصة، يطلبوها بزاف في ملف الباسبور والكارط البيومترية.",
    },
  },
  {
    id: "birth-extract", guide: "birth-12s",
    fr: "Extrait d'acte de naissance", ar: "مستخرج من عقد الميلاد (شهادة الميلاد)", en: "Birth certificate (extract)", dz: "شهادة الميلاد · « l'extrait »",
    explain: {
      en: "A short copy of your birth record, issued by a civil-status office.",
      fr: "Copie abrégée de votre acte de naissance, délivrée par un service d'état civil.",
      ar: "نسخة مختصرة من عقد ميلادك، تسلمها مصلحة الحالة المدنية.",
      dz: "نسخة قصيرة من عقد الزيادة تاعك، تجبدها من الحالة المدنية.",
    },
  },
  {
    id: "full-copy",
    fr: "Copie intégrale d'acte de naissance", ar: "نسخة كاملة من عقد الميلاد", en: "Full copy of the birth record", dz: "« la copie intégrale » · النسخة الكاملة",
    explain: {
      en: "A complete copy of the birth record, including the notes written in its margin.",
      fr: "Copie complète de l'acte de naissance, y compris les mentions portées en marge.",
      ar: "نسخة كاملة من عقد الميلاد، بما فيها البيانات المكتوبة في الهامش.",
      dz: "نسخة كاملة من عقد الزيادة، مع واش مكتوب في الهامش.",
    },
  },
  {
    id: "marriage", guide: "civil-status",
    fr: "Acte de mariage", ar: "عقد الزواج", en: "Marriage certificate", dz: "عقد الزواج · « l'acte de mariage »",
    explain: {
      en: "The civil-status record of a marriage, or an extract of it.",
      fr: "L'acte d'état civil qui constate un mariage, ou un extrait de cet acte.",
      ar: "عقد الحالة المدنية الذي يثبت الزواج، أو مستخرج منه.",
      dz: "عقد الحالة المدنية لي يثبت الزواج، ولا مستخرج منو.",
    },
  },
  {
    id: "death",
    fr: "Acte de décès", ar: "شهادة الوفاة", en: "Death certificate", dz: "شهادة الوفاة",
    explain: {
      en: "The civil-status record of a death, or an extract of it.",
      fr: "L'acte d'état civil qui constate un décès, ou un extrait de cet acte.",
      ar: "عقد الحالة المدنية الذي يثبت الوفاة، أو مستخرج منه.",
      dz: "عقد الحالة المدنية لي يثبت الوفاة، ولا مستخرج منو.",
    },
  },
  {
    id: "family-book", guide: "civil-status",
    fr: "Livret de famille", ar: "الدفتر العائلي", en: "Family book", dz: "دفتر العائلة · « le livret »",
    explain: {
      en: "A booklet given to a married couple that records the marriage and the children's births.",
      fr: "Livret remis aux époux, où sont inscrits le mariage et les naissances des enfants.",
      ar: "دفتر يُسلَّم للزوجين، يُقيَّد فيه الزواج وولادات الأبناء.",
      dz: "دفتر يعطوه للزوج والمرا، فيه الزواج وزيادة الذراري.",
    },
  },
  {
    id: "family-sheet",
    fr: "Fiche familiale d'état civil", ar: "البطاقة العائلية للحالة المدنية", en: "Family civil-status sheet", dz: "« la fiche familiale »",
    explain: {
      en: "A one-page civil-status sheet listing the members of a family.",
      fr: "Fiche d'état civil d'une page qui présente les membres d'une famille.",
      ar: "بطاقة حالة مدنية من صفحة واحدة تبيّن أفراد العائلة.",
      dz: "ورقة وحدة تاع الحالة المدنية فيها أفراد العائلة.",
    },
  },
  {
    id: "individual-sheet",
    fr: "Fiche individuelle d'état civil", ar: "البطاقة الفردية للحالة المدنية", en: "Individual civil-status sheet", dz: "« la fiche individuelle »",
    explain: {
      en: "A one-page summary of one person's civil status.",
      fr: "Fiche d'une page qui résume l'état civil d'une personne.",
      ar: "بطاقة من صفحة واحدة تلخص الحالة المدنية لشخص واحد.",
      dz: "ورقة وحدة فيها الحالة المدنية تاع شخص واحد.",
    },
  },
  {
    id: "civil-status", guide: "civil-status",
    fr: "État civil", ar: "الحالة المدنية", en: "Civil status", dz: "الحالة المدنية · « l'état civil »",
    explain: {
      en: "The official records of births, marriages and deaths, and the office that keeps them.",
      fr: "Les registres officiels des naissances, mariages et décès, et le service qui les tient.",
      ar: "السجلات الرسمية للمواليد والزواج والوفيات، والمصلحة التي تمسكها.",
      dz: "السجلات الرسمية تاع الزيادة والزواج والوفاة، والمصلحة لي تخدمهم.",
    },
  },
  {
    id: "transcription", guide: "civil-status",
    fr: "Transcription (d'un acte)", ar: "تسجيل (نقل) عقد في الحالة المدنية", en: "Transcription (registering a foreign record)", dz: "« la transcription »",
    explain: {
      en: "Entering a birth, marriage or death that took place abroad into the Algerian civil-status registers.",
      fr: "Inscription dans les registres d'état civil algériens d'une naissance, d'un mariage ou d'un décès survenu à l'étranger.",
      ar: "قيد ميلاد أو زواج أو وفاة وقع في الخارج في سجلات الحالة المدنية الجزائرية.",
      dz: "تدخيل زيادة ولا زواج ولا وفاة صراو في الغربة في سجلات الحالة المدنية الجزائرية.",
    },
  },
  {
    id: "marginal-note", guide: "civil-status",
    fr: "Mention marginale", ar: "البيانات الهامشية", en: "Marginal note", dz: "« la mention marginale »",
    explain: {
      en: "A note added in the margin of a civil-status record, for example a marriage, a divorce or a change of name.",
      fr: "Mention ajoutée en marge d'un acte d'état civil, par exemple un mariage, un divorce ou un changement de nom.",
      ar: "بيان يُضاف في هامش عقد الحالة المدنية، مثل الزواج أو الطلاق أو تغيير اللقب.",
      dz: "حاجة يزيدوها في هامش العقد، كيما الزواج ولا الطلاق ولا تبديل اللقب.",
    },
  },
  {
    id: "criminal-record", guide: "criminal-record",
    fr: "Extrait du casier judiciaire (bulletin n°3)", ar: "صحيفة السوابق القضائية / العدلية (القسيمة رقم 3)", en: "Criminal record certificate (bulletin no. 3)", dz: "« le casier » · الكازي",
    explain: {
      en: "A certificate showing whether a person has criminal convictions on record.",
      fr: "Document indiquant si une personne a des condamnations pénales inscrites.",
      ar: "وثيقة تبيّن ما إذا كانت على الشخص أحكام جزائية مسجلة.",
      dz: "ورقة تبين إذا كاين على الشخص أحكام مسجلين ولا لا.",
    },
  },
  {
    id: "nationality", guide: "nationality",
    fr: "Certificat de nationalité algérienne", ar: "شهادة الجنسية الجزائرية", en: "Certificate of Algerian nationality", dz: "شهادة الجنسية · « la nationalité »",
    explain: {
      en: "An official document that proves you hold Algerian nationality.",
      fr: "Document officiel qui prouve que vous avez la nationalité algérienne.",
      ar: "وثيقة رسمية تثبت أنك تحمل الجنسية الجزائرية.",
      dz: "ورقة رسمية تثبت بلي راك جزائري بالجنسية.",
    },
  },
  {
    id: "cnibe", guide: "passport",
    fr: "Carte nationale d'identité biométrique électronique (CNIBE)", ar: "بطاقة التعريف الوطنية البيومترية الإلكترونية", en: "Biometric national identity card", dz: "« la carte d'identité » · البطاقة البيومترية",
    explain: {
      en: "The Algerian national identity card, with an electronic chip.",
      fr: "La carte d'identité nationale algérienne, dotée d'une puce électronique.",
      ar: "بطاقة التعريف الوطنية الجزائرية المزودة بشريحة إلكترونية.",
      dz: "بطاقة التعريف الجزائرية لي فيها شريحة إلكترونية.",
    },
  },
  {
    id: "passport", guide: "passport",
    fr: "Passeport biométrique électronique", ar: "جواز السفر البيومتري الإلكتروني", en: "Biometric passport", dz: "الباسبور",
    explain: {
      en: "The Algerian passport, with an electronic chip that holds your data.",
      fr: "Le passeport algérien, avec une puce électronique qui contient vos données.",
      ar: "جواز السفر الجزائري المزود بشريحة إلكترونية تحمل بياناتك.",
      dz: "الباسبور الجزائري لي فيه شريحة إلكترونية فيها المعلومات تاعك.",
    },
  },
  {
    id: "consular-card", guide: "consular-registration",
    fr: "Carte d'immatriculation consulaire", ar: "بطاقة التسجيل القنصلي", en: "Consular registration card", dz: "« la carte consulaire » · الكارط القنصلية",
    explain: {
      en: "A card showing that you are registered with an Algerian consulate abroad.",
      fr: "Carte qui atteste que vous êtes inscrit auprès d'un consulat d'Algérie à l'étranger.",
      ar: "بطاقة تثبت أنك مسجل لدى قنصلية جزائرية في الخارج.",
      dz: "كارط تثبت بلي راك مسجل في قنصلية جزائرية في الغربة.",
    },
  },
  {
    id: "laissez-passer",
    fr: "Laissez-passer (titre de voyage consulaire)", ar: "جواز مرور قنصلي", en: "Laissez-passer (consular travel document)", dz: "« le laissez-passer »",
    explain: {
      en: "A temporary travel document that a consulate can issue, usually to return to Algeria without a valid passport.",
      fr: "Titre de voyage temporaire délivré par un consulat, en général pour rentrer en Algérie sans passeport valide.",
      ar: "وثيقة سفر مؤقتة تسلمها القنصلية، عادةً للعودة إلى الجزائر دون جواز سفر صالح.",
      dz: "ورقة سفر مؤقتة تعطيها القنصلية، غالباً باش تدخل للبلاد بلا باسبور صالح.",
    },
  },
  {
    id: "residence",
    fr: "Certificat de résidence", ar: "شهادة الإقامة", en: "Certificate of residence", dz: "شهادة الإقامة · « la résidence »",
    explain: {
      en: "A document from the commune where you live that states your address.",
      fr: "Document délivré par la commune de votre domicile, qui atteste votre adresse.",
      ar: "وثيقة تسلمها بلدية مكان إقامتك وتثبت عنوانك.",
      dz: "ورقة من البلدية لي ساكن فيها تثبت العنوان تاعك.",
    },
  },
  {
    id: "nin",
    fr: "Numéro d'identification national (NIN)", ar: "رقم التعريف الوطني", en: "National identification number (NIN)", dz: "« le NIN » · رقم التعريف",
    explain: {
      en: "A unique number that identifies each Algerian citizen in official records.",
      fr: "Numéro unique qui identifie chaque citoyen algérien dans les registres officiels.",
      ar: "رقم فريد يعرّف كل مواطن جزائري في السجلات الرسمية.",
      dz: "رقم واحد خاص بكل جزائري في السجلات الرسمية.",
    },
  },
  {
    id: "chifa", guide: "cnas",
    fr: "Carte Chifa", ar: "بطاقة الشفاء", en: "Chifa card (social-security card)", dz: "كارط الشفاء",
    explain: {
      en: "The electronic social-security card used for health-care reimbursement.",
      fr: "La carte électronique d'assuré social utilisée pour le remboursement des soins.",
      ar: "البطاقة الإلكترونية للمؤمَّن الاجتماعي، تُستعمل لتعويض مصاريف العلاج.",
      dz: "الكارط الإلكترونية تاع الضمان الاجتماعي، باش يخلصوك الدوا والعلاج.",
    },
  },
  {
    id: "affiliation", guide: "cnas",
    fr: "Attestation d'affiliation (CNAS)", ar: "شهادة الانتساب (الضمان الاجتماعي)", en: "Social-security affiliation certificate", dz: "« l'attestation d'affiliation »",
    explain: {
      en: "A certificate from the social-security fund stating that you are registered with it.",
      fr: "Attestation de la caisse de sécurité sociale indiquant que vous y êtes affilié.",
      ar: "شهادة من صندوق الضمان الاجتماعي تثبت أنك منتسب إليه.",
      dz: "ورقة من صندوق الضمان الاجتماعي تثبت بلي راك مسجل عندهم.",
    },
  },
  {
    id: "national-service", guide: "national-service",
    fr: "Service national", ar: "الخدمة الوطنية", en: "National service", dz: "الخدمة الوطنية · « le service »",
    explain: {
      en: "Compulsory national service for Algerian men; offices often ask for proof of your status towards it.",
      fr: "Service national obligatoire pour les hommes algériens ; on demande souvent un justificatif de votre situation.",
      ar: "الخدمة الوطنية الإجبارية للرجال الجزائريين، وكثيراً ما تُطلب وثيقة تثبت الوضعية إزاءها.",
      dz: "الخدمة الوطنية لي لازمة على الرجال الجزائريين، وبزاف المرات يطلبو ورقة تثبت وين راك معاها.",
    },
  },
  {
    id: "census", guide: "national-service",
    fr: "Recensement (service national)", ar: "الإحصاء (الخدمة الوطنية)", en: "Census registration (national service)", dz: "« le recensement » · الإحصاء",
    explain: {
      en: "Registering with the national-service authorities, the first step of national service for young men.",
      fr: "Inscription auprès des services du service national, première étape pour les jeunes hommes.",
      ar: "التسجيل لدى مصالح الخدمة الوطنية، وهو أول خطوة بالنسبة للشباب الذكور.",
      dz: "التسجيل عند مصالح الخدمة الوطنية، هي أول خطوة للشباب الذكور.",
    },
  },
  {
    id: "legalisation",
    fr: "Légalisation", ar: "التصديق (على الوثائق)", en: "Legalisation", dz: "« la légalisation » · التصديق",
    explain: {
      en: "Official confirmation that a signature or stamp on a document is genuine, so the document can be used in another country.",
      fr: "Confirmation officielle qu'une signature ou un cachet est authentique, pour utiliser le document dans un autre pays.",
      ar: "تأكيد رسمي لصحة التوقيع أو الختم على وثيقة، لاستعمالها في بلد آخر.",
      dz: "تأكيد رسمي بلي الإمضاء ولا الطابع لي على الورقة صحاح، باش تخدم بيها في بلاد أخرى.",
    },
  },
  {
    id: "apostille",
    fr: "Apostille", ar: "التصديق الدولي (الأبوستيل)", en: "Apostille", dz: "« l'apostille » · الأبوستيل",
    explain: {
      en: "A standard certificate under the Hague Convention that authenticates a public document for use in another member country.",
      fr: "Certificat type prévu par la Convention de La Haye, qui authentifie un acte public pour un autre pays membre.",
      ar: "شهادة موحدة وفق اتفاقية لاهاي تصادق على وثيقة رسمية لاستعمالها في بلد عضو آخر.",
      dz: "شهادة موحدة تاع اتفاقية لاهاي تصادق على ورقة رسمية باش تخدم بيها في بلاد أخرى عضو فيها.",
    },
  },
  {
    id: "proxy",
    fr: "Procuration", ar: "الوكالة", en: "Power of attorney (proxy)", dz: "« la procuration » · توكيل",
    explain: {
      en: "A signed document that authorises another person to act or collect a document for you.",
      fr: "Document signé qui autorise une autre personne à agir ou à retirer un document à votre place.",
      ar: "وثيقة موقعة تخوّل شخصاً آخر أن ينوب عنك أو يستلم وثيقة بدلاً منك.",
      dz: "ورقة ممضية تخلي واحد آخر يدير بلاصتك ولا يجبد الوثيقة بلاصتك.",
    },
  },
  {
    id: "certified-copy",
    fr: "Copie certifiée conforme", ar: "نسخة طبق الأصل", en: "Certified true copy", dz: "« la copie conforme » · نسخة طبق الأصل",
    explain: {
      en: "A copy officially stamped as identical to the original document.",
      fr: "Copie revêtue d'un cachet officiel attestant qu'elle est identique à l'original.",
      ar: "نسخة عليها ختم رسمي يثبت أنها مطابقة للوثيقة الأصلية.",
      dz: "نسخة عليها طابع رسمي يثبت بلي هي كيف الأصل.",
    },
  },
  {
    id: "tax-stamp",
    fr: "Timbre fiscal", ar: "الطابع الجبائي", en: "Tax stamp", dz: "« le timbre » · التامبر",
    explain: {
      en: "A stamp you buy to pay the fee for some documents; the amount depends on the document.",
      fr: "Timbre acheté pour payer le droit de certains documents ; le montant dépend du document.",
      ar: "طابع يُشترى لدفع رسم بعض الوثائق، وتختلف قيمته حسب الوثيقة.",
      dz: "طابع تشريه باش تخلص حق بعض الوراق، والسومة تتبدل على حساب الوثيقة.",
    },
  },
  {
    id: "apc",
    fr: "APC (Assemblée populaire communale) / mairie", ar: "البلدية (المجلس الشعبي البلدي)", en: "Commune (town hall, APC)", dz: "البلدية · « la mairie »",
    explain: {
      en: "Your local town hall, where civil-status documents are usually issued.",
      fr: "Votre mairie, où sont généralement délivrés les documents d'état civil.",
      ar: "البلدية التي تتبع لها، وفيها تُستخرج عادةً وثائق الحالة المدنية.",
      dz: "البلدية، وين تجبد عادةً وراق الحالة المدنية.",
    },
  },
];

/** Lower-case, strips Latin accents, Arabic diacritics/tatweel, and unifies alef/yeh/teh-marbuta forms for matching. */
export function foldForSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[«»"'’()·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Entries whose names (any language) or explanation (any language) contain every word of the query. */
export function filterGlossary(entries: GlossaryEntry[], query: string): GlossaryEntry[] {
  const words = foldForSearch(query).split(" ").filter(Boolean);
  if (!words.length) return entries;
  return entries.filter((e) => {
    const hay = foldForSearch([e.fr, e.ar, e.en, e.dz, ...Object.values(e.explain)].join(" "));
    return words.every((w) => hay.includes(w));
  });
}
