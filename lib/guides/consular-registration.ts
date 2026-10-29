import type { Locale } from "@/lib/i18n";
import type { GuidePoint, GuideSection, FeeRow } from "./passport";

/**
 * Consular registration (immatriculation consulaire): card, renewal, transfer
 * on a change of address, and deregistration. EVERY point is a restatement of
 * what the cited data/corpus.json records say (ids in `cites`). Nothing here
 * comes from outside knowledge. Rules that come from one office name that
 * office; documents and photo counts differ between offices. If the corpus
 * changes, review this file.
 */

type L = Record<Locale, string>;
export type { GuidePoint, GuideSection, FeeRow };

const SF1 = "cgsf-first-time-registration";
const SFR = "cgsf-registration-renewal";
const SFT = "cgsf-transfer-of-file";
const SFC = "cgsf-cancellation-of-registration";
const NY = "cgny-registration";
const WC = "embwashington.mfa.gov.dz-consular-card";
const WR = "embwashington.mfa.gov.dz-consular-registration-1";
const BR = "cgbrussels.mfa.gov.dz-file-transfer";
const MI = "cgmilan.mfa.gov.dz-file-transfer";
const LT = "cglondon.mfa.gov.dz-file-transfer";
const AD = "embabudhabi.mfa.gov.dz-consular-registration";
const BE = "embberlin.mfa.gov.dz-consular-registration";
const PR = "cpontoise-mfa-gov-dz-fr-consular-services-consular-registration-1";
const PX = "cpontoise-mfa-gov-dz-fr-consular-services-cancellation-of-registration";
const PT = "cpontoise-mfa-gov-dz-fr-consular-services-file-transfer";
const PC = "cpontoise-mfa-gov-dz-fr-consular-services-certificat-de-changement-de-";
const MR = "residence-mfa-change-of-residence";

export const GUIDE = {
  title: {
    en: "Consular registration and consular card",
    fr: "Immatriculation consulaire et carte consulaire",
    ar: "التسجيل القنصلي والبطاقة القنصلية",
    dz: "التسجيل القنصلي والكارطة القنصلية",
  } as L,
  lead: {
    en: "What consular pages say about first registration, renewal, moving to another consular district and deregistration. Documents and photo counts differ by office, so check yours.",
    fr: "Ce que disent les pages consulaires sur la première immatriculation, le renouvellement, le changement de circonscription et la radiation. Les pièces et le nombre de photos varient selon le poste : vérifiez le vôtre.",
    ar: "ما تذكره الصفحات القنصلية عن التسجيل الأول والتجديد والانتقال إلى دائرة قنصلية أخرى والشطب. تختلف الوثائق وعدد الصور من ممثلية إلى أخرى، فتحقّق من ممثليتك.",
    dz: "واش تقول الصفحات القنصلية على التسجيل لأول مرة، التجديد، تبديل الدائرة القنصلية والشطب. الوراق وعدد التصاور يختلفو من قنصلية لقنصلية، شوف تاعك.",
  } as L,
  portals: [
    { url: "https://mfa.gov.dz/services-for-algerians/certificate-of-change-of-residence-and-de-registration", label: { en: "Certificate of change of residence and de-registration (Ministry of Foreign Affairs)", fr: "Certificat de changement de résidence et radiation (ministère des Affaires étrangères)", ar: "شهادة تغيير الإقامة والشطب (وزارة الشؤون الخارجية)", dz: "شهادة تغيير الإقامة والشطب (وزارة الخارجية)" } as L },
    { url: "https://www.mfa.gov.dz/services-for-algerians/civil-status-1", label: { en: "Civil Status Office, Ministry of Foreign Affairs", fr: "Service de l'état civil, ministère des Affaires étrangères", ar: "مصلحة الحالة المدنية بوزارة الشؤون الخارجية", dz: "مصلحة الحالة المدنية في وزارة الخارجية" } as L },
  ],
  sections: [
    {
      id: "who",
      title: { en: "Who registers and what you get", fr: "Qui s'immatricule et ce que l'on obtient", ar: "من يسجّل وماذا يُمنح", dz: "شكون يتسجل وواش ياخذ" },
      points: [
        { cites: [PR, WC, NY, BE], text: {
          en: "Registration is for Algerians who reside regularly abroad. The consular card is issued free of charge and is valid five years; renewal must be requested. Washington and New York say registration is needed for a passport and to register to vote; Berlin links it to consular protection and services.",
          fr: "L'immatriculation concerne les Algériens résidant régulièrement à l'étranger. La carte consulaire est délivrée gratuitement et valable cinq ans ; son renouvellement doit être demandé. Washington et New York indiquent qu'elle est nécessaire pour obtenir un passeport et s'inscrire sur les listes électorales ; Berlin la relie à la protection et aux services consulaires.",
          ar: "التسجيل للجزائريين المقيمين إقامة قانونية بالخارج. تُسلَّم البطاقة القنصلية مجانًا وصلاحيتها خمس سنوات، ويجب طلب تجديدها. وتذكر سفارة واشنطن وقنصلية نيويورك أنه مطلوب للحصول على جواز السفر وللتسجيل في القوائم الانتخابية، وتربطه سفارة برلين بالحماية والخدمات القنصلية.",
          dz: "التسجيل للجزائريين لي مقيمين بصفة قانونية في الغربة. الكارطة القنصلية تتعطى بلاش وصالحة خمس سنين، والتجديد لازم تطلبو. واشنطن ونيويورك يقولو لازم للباسبور وللتسجيل في القوائم الانتخابية، وبرلين تربطها بالحماية والخدمات القنصلية." } },
        { cites: [SF1, WC, NY, BE], text: {
          en: "Age and family: San Francisco and Washington register citizens aged 19 and over. San Francisco registers children under 19 with their parents; New York says only the parent's or guardian's registration is needed until 19, with no card before then; Berlin registers minors at the request of the person holding parental authority. A married woman can be registered under her husband's file (San Francisco, Washington).",
          fr: "Âge et famille : San Francisco et Washington immatriculent les citoyens de 19 ans et plus. San Francisco inscrit les enfants de moins de 19 ans avec leurs parents ; New York indique que seule l'immatriculation du parent ou du tuteur est nécessaire jusqu'à 19 ans, sans carte avant cet âge ; Berlin immatricule les mineurs à la demande de la personne exerçant l'autorité parentale. Une femme mariée peut être inscrite sur le dossier de son mari (San Francisco, Washington).",
          ar: "السن والأسرة: تسجّل سان فرانسيسكو وواشنطن المواطنين من 19 سنة فما فوق. وتسجّل سان فرانسيسكو الأطفال دون 19 مع والديهم؛ وتذكر نيويورك أنه يكفي تسجيل الوالد أو الولي حتى سن 19 دون بطاقة قبل ذلك؛ وتسجّل برلين القُصّر بطلب من صاحب الولاية الأبوية. ويمكن تسجيل المتزوجة ضمن ملف زوجها (سان فرانسيسكو وواشنطن).",
          dz: "السن والعائلة: سان فرانسيسكو وواشنطن يسجلو من 19 سنة وفوق. سان فرانسيسكو تسجل الصغار تحت 19 مع والديهم؛ نيويورك تقول يكفي تسجيل الوالد ولا الولي حتى 19 سنة وما كاين كارطة قبل؛ برلين تسجل الصغار بطلب من لي عندو السلطة الأبوية. والمرا المتزوجة تقدر تتسجل في ملف راجلها (سان فرانسيسكو، واشنطن)." } },
        { cites: [NY, WR], text: {
          en: "New York says you cannot apply if you entered the US temporarily for business or tourism (B1/B2), hold a work permit not valid for re-entry, or are undocumented. Washington asks for proof of legal presence in the US and says the applicant must appear in person with the original.",
          fr: "New York indique qu'on ne peut pas faire la demande si l'on est entré aux États-Unis temporairement pour affaires ou tourisme (B1/B2), si l'on a un permis de travail non valable pour une réentrée, ou si l'on est en situation irrégulière. Washington demande une preuve de présence légale aux États-Unis et précise que le demandeur doit se présenter en personne avec l'original.",
          ar: "تذكر نيويورك أنه لا يمكن التقدّم بالطلب لمن دخل الولايات المتحدة مؤقتًا لأغراض العمل أو السياحة (B1/B2)، أو يحمل رخصة عمل غير صالحة لإعادة الدخول، أو في وضعية غير قانونية. وتطلب واشنطن إثبات الإقامة القانونية في الولايات المتحدة وتشترط حضور صاحب الطلب شخصيًا بالأصل.",
          dz: "نيويورك تقول ما تقدرش تطلب إذا دخلت لأمريكا مؤقتا للخدمة ولا السياحة (B1/B2)، ولا عندك رخصة خدمة ما تصلحش للدخول من جديد، ولا راك بلا أوراق. وواشنطن تطلب ورقة تثبت الإقامة القانونية في أمريكا وتقول لازم تحضر بروحك بالأصل." } },
      ],
    },
    {
      id: "first",
      title: { en: "First registration: documents by office", fr: "Première immatriculation : pièces selon le poste", ar: "التسجيل الأول: الوثائق حسب الممثلية", dz: "التسجيل لأول مرة: الوراق على حسب القنصلية" },
      points: [
        { cites: [SF1, NY], text: {
          en: "San Francisco (and New York, with variants by immigration status): signed application form; two recent 2x2 inch photos; original full birth certificate (E.C. 12) if born in Algeria, or any birth certificate if born abroad; a parent's birth certificate or nationality certificate (not needed if the parent holds a consular card); for people born overseas, a nationality certificate or the birth certificates of two male ascendants born in Algeria; proof of legal US stay; proof of employment or school enrolment; proof of address; and a self-addressed stamped envelope. Submit in person or by mail.",
          fr: "San Francisco (et New York, avec des variantes selon le statut d'immigration) : formulaire signé ; deux photos récentes 2x2 pouces ; acte de naissance intégral original (E.C. 12) si né en Algérie, ou tout acte de naissance si né à l'étranger ; acte de naissance ou certificat de nationalité d'un parent (inutile si le parent a une carte consulaire) ; pour les personnes nées à l'étranger, un certificat de nationalité ou les actes de naissance de deux ascendants masculins nés en Algérie ; preuve de séjour légal aux États-Unis ; justificatif d'activité ou de scolarité ; justificatif de domicile ; enveloppe retour affranchie. Dépôt en personne ou par courrier.",
          ar: "سان فرانسيسكو (ونيويورك مع فروق حسب الوضعية القانونية للهجرة): استمارة موقَّعة؛ صورتان حديثتان بمقاس 2x2 بوصة؛ شهادة ميلاد كاملة أصلية (E.C. 12) إن وُلد في الجزائر أو أي شهادة ميلاد إن وُلد في الخارج؛ شهادة ميلاد أحد الوالدين أو شهادة جنسيته (غير لازمة إن كان يحمل بطاقة قنصلية)؛ وللمولودين في الخارج شهادة جنسية أو شهادتا ميلاد لأصلين ذكرين مولودين في الجزائر؛ إثبات الإقامة القانونية في الولايات المتحدة؛ إثبات عمل أو دراسة؛ إثبات العنوان؛ وظرف إرجاع مطبوع عليه العنوان والطابع. يُقدَّم الطلب شخصيًا أو بالبريد.",
          dz: "سان فرانسيسكو (ونيويورك مع شوية اختلافات على حسب وضعيتك في الهجرة): استمارة ممضية؛ تصويرتين جداد 2x2 بوصة؛ شهادة ميلاد كاملة أصلية (E.C. 12) إذا مزداد في الدزاير ولا أي شهادة ميلاد إذا مزداد برا؛ شهادة ميلاد واحد من الوالدين ولا شهادة الجنسية تاعو (ما يلزمش إذا عندو كارطة قنصلية)؛ للمزدادين برا شهادة الجنسية ولا شهادتي ميلاد لجدين ذكور مزدادين في الدزاير؛ ورقة الإقامة القانونية في أمريكا؛ ورقة الخدمة ولا القراية؛ ورقة العنوان؛ وظرف رجوع بالطابع. تقدم الطلب بنفسك ولا بالبوسطة." } },
        { cites: [WR], text: {
          en: "Washington: signed form; original full birth certificate; original birth or death certificate of the father; for people born abroad, birth certificates of two paternal ancestors born in Algeria or a nationality certificate; marriage certificate if married and divorce judgment if divorced; copy of proof of legal US presence; proof of address within the embassy's district; employment or university statement; and three recent passport photos with first and last names in pencil on the back.",
          fr: "Washington : formulaire signé ; acte de naissance intégral original ; acte de naissance ou de décès original du père ; pour les personnes nées à l'étranger, actes de naissance de deux ascendants paternels nés en Algérie ou certificat de nationalité ; acte de mariage si marié et jugement de divorce si divorcé ; copie de la preuve de présence légale aux États-Unis ; justificatif de domicile dans la circonscription de l'ambassade ; attestation d'emploi ou d'inscription universitaire ; trois photos d'identité récentes avec nom et prénom écrits au crayon au dos.",
          ar: "واشنطن: استمارة موقَّعة؛ شهادة ميلاد كاملة أصلية؛ شهادة ميلاد الأب أو وفاته الأصلية؛ وللمولودين في الخارج شهادتا ميلاد لأصلين من جهة الأب مولودين في الجزائر أو شهادة جنسية؛ عقد الزواج للمتزوج وحكم الطلاق للمطلّق؛ نسخة من إثبات الإقامة القانونية في الولايات المتحدة؛ إثبات العنوان داخل دائرة السفارة؛ شهادة عمل أو تسجيل جامعي؛ وثلاث صور شمسية حديثة يُكتب الاسم واللقب بالقلم الرصاص على ظهرها.",
          dz: "واشنطن: استمارة ممضية؛ شهادة ميلاد كاملة أصلية؛ شهادة ميلاد ولا وفاة البابا الأصلية؛ للمزدادين برا شهادتي ميلاد لجدين من جهة البابا مزدادين في الدزاير ولا شهادة الجنسية؛ عقد الزواج إذا متزوج وحكم الطلاق إذا مطلق؛ نسخة من ورقة الإقامة القانونية في أمريكا؛ ورقة العنوان في دائرة السفارة؛ شهادة العمل ولا القراية في الجامعة؛ وثلاث تصاور جداد مكتوب على ظهرهم الاسم واللقب بالقلم الرصاص." } },
        { cites: [PR], text: {
          en: "Pontoise (France; originals plus A4 photocopies): signed form; Algerian passport (first three pages and the visa or Schengen entry pages); original 12S birth certificate and a copy; the father's full birth certificate (and the grandfather's for those born abroad); the naturalisation decree if applicable; family-status documents; residence permit, renewal receipt or French ID; proof of address under three months old; proof of activity; and five recent 3.5 x 4.5 cm photos. First-time applicants in its district go to the consulate itself; spouses and minor children are registered as dependants.",
          fr: "Pontoise (France ; originaux plus photocopies A4) : formulaire signé ; passeport algérien (trois premières pages et pages de visa ou d'entrée Schengen) ; acte de naissance 12S original et copie ; acte de naissance intégral du père (et du grand-père pour les personnes nées à l'étranger) ; décret de naturalisation le cas échéant ; justificatifs de situation de famille ; titre de séjour, récépissé de renouvellement ou carte d'identité française ; justificatif de domicile de moins de trois mois ; justificatif d'activité ; cinq photos récentes 3,5 x 4,5 cm. Les primo-demandeurs de sa circonscription se présentent au siège du consulat ; le conjoint et les enfants mineurs sont immatriculés à titre subsidiaire.",
          ar: "بونتواز (فرنسا؛ أصول مع نسخ بحجم A4): استمارة موقَّعة؛ جواز السفر الجزائري (الصفحات الثلاث الأولى وصفحات التأشيرة أو دخول فضاء شنغن)؛ شهادة الميلاد 12S الأصلية ونسخة منها؛ شهادة ميلاد الأب الكاملة (والجد للمولودين في الخارج)؛ مرسوم التجنّس عند الاقتضاء؛ وثائق الوضعية العائلية؛ بطاقة الإقامة أو وصل تجديدها أو بطاقة الهوية الفرنسية؛ إثبات العنوان لا يتجاوز ثلاثة أشهر؛ إثبات النشاط؛ وخمس صور حديثة مقاس 3.5 × 4.5 سم. ويتوجّه طالبو التسجيل لأول مرة في دائرتها إلى مقر القنصلية، ويُسجَّل الزوج والأبناء القُصّر بصفة تبعية.",
          dz: "بونتواز (فرنسا؛ الأصول مع نسخ A4): استمارة ممضية؛ الباسبور الجزائري (أول ثلاث صفحات وصفحات الفيزا ولا دخول شنغن)؛ شهادة الميلاد 12S الأصلية ونسخة؛ شهادة ميلاد البابا الكاملة (والجد للمزدادين برا)؛ مرسوم التجنس إذا كان؛ وراق الوضعية العائلية؛ كارطة الإقامة ولا وصل تجديدها ولا كارط ديدونتيتي الفرنسية؛ ورقة العنوان أقل من ثلاثة شهور؛ ورقة النشاط؛ وخمس تصاور جداد 3.5 × 4.5 سم. لي يسجلو لأول مرة في دائرتها يروحو لمقر القنصلية، والزوج والصغار يتسجلو بصفة تابعة." } },
        { cites: [BE, AD], text: {
          en: "Berlin and Abu Dhabi ask for similar items (birth certificate, passport copy, residence permit, proof of address or work, family-status documents) but with different photo counts: four 3.5 x 4.5 cm photos in Berlin, five identical photos in Abu Dhabi. Abu Dhabi says the applicant must appear in person; Berlin says to appear at the consulate covering your place of residence.",
          fr: "Berlin et Abu Dhabi demandent des pièces similaires (acte de naissance, copie du passeport, titre de séjour, justificatif de domicile ou d'activité, situation de famille) mais avec des nombres de photos différents : quatre photos 3,5 x 4,5 cm à Berlin, cinq photos identiques à Abu Dhabi. Abu Dhabi précise que le demandeur doit se présenter en personne ; Berlin demande de se présenter au consulat couvrant le lieu de résidence.",
          ar: "تطلب برلين وأبوظبي وثائق متشابهة (شهادة الميلاد ونسخة من جواز السفر وبطاقة الإقامة وإثبات العنوان أو العمل ووثائق الوضعية العائلية) مع اختلاف عدد الصور: أربع صور مقاس 3.5 × 4.5 سم في برلين، وخمس صور متطابقة في أبوظبي. وتشترط أبوظبي حضور صاحب الطلب شخصيًا، وتطلب برلين الحضور إلى القنصلية التي تغطي مكان الإقامة.",
          dz: "برلين وأبوظبي يطلبو وراق تشبه بعضها (شهادة الميلاد، نسخة الباسبور، كارطة الإقامة، ورقة العنوان ولا الخدمة، وراق الوضعية العائلية) بصح عدد التصاور يختلف: أربع تصاور 3.5 × 4.5 سم في برلين، وخمس تصاور كيف كيف في أبوظبي. أبوظبي تقول لازم تحضر بروحك، وبرلين تقول تروح للقنصلية لي تغطي بلاصة سكناك." } },
      ],
    },
    {
      id: "renewal-transfer",
      title: { en: "Renewal, change of address and transfer", fr: "Renouvellement, changement d'adresse et transfert", ar: "التجديد وتغيير العنوان والتحويل", dz: "التجديد، تبديل العنوان والتحويل" },
      points: [
        { cites: [SFR, WR, BE], text: {
          en: "Renewal documents differ: San Francisco asks for the signed form, two photos, the expired card if you have it, proof of lawful US stay, proof of address, employment or enrolment if changed, and a stamped return envelope. Washington asks for the expired card (if lost, stolen or damaged: a notarised declaration and a $2.50 penalty by US Postal Service money order), two photos, proof of legal presence and address. Berlin asks for the expired card, two colour photos, the residence permit, and a new registration certificate if the address changed.",
          fr: "Les pièces de renouvellement varient : San Francisco demande le formulaire signé, deux photos, l'ancienne carte si vous l'avez, la preuve de séjour légal aux États-Unis, un justificatif de domicile, l'activité ou la scolarité si elle a changé, et une enveloppe retour affranchie. Washington demande l'ancienne carte (si perdue, volée ou abîmée : déclaration notariée et pénalité de 2,50 $ par mandat postal américain), deux photos, preuve de présence légale et de domicile. Berlin demande l'ancienne carte, deux photos couleur, le titre de séjour, et un nouveau certificat d'immatriculation si l'adresse a changé.",
          ar: "تختلف وثائق التجديد: سان فرانسيسكو تطلب الاستمارة موقَّعة وصورتين والبطاقة المنتهية إن وُجدت وإثبات الإقامة القانونية في الولايات المتحدة وإثبات العنوان وإثبات العمل أو الدراسة إذا تغيّر، وظرف إرجاع مطبوع عليه الطابع. وواشنطن تطلب البطاقة المنتهية (وإذا ضاعت أو سُرقت أو تلفت: تصريح موثّق وغرامة 2.50 دولارًا بحوالة بريدية أمريكية) وصورتين وإثبات الإقامة القانونية والعنوان. وبرلين تطلب البطاقة المنتهية وصورتين ملونتين وبطاقة الإقامة وشهادة تسجيل جديدة إذا تغيّر العنوان.",
          dz: "وراق التجديد تختلف: سان فرانسيسكو تطلب الاستمارة ممضية، تصويرتين، الكارطة القديمة إذا عندك، ورقة الإقامة القانونية في أمريكا، ورقة العنوان، الخدمة ولا القراية إذا تبدلت، وظرف رجوع بالطابع. واشنطن تطلب الكارطة القديمة (إذا ضاعت، تسرقت ولا تقطعت: تصريح عند الموثق وغرامة 2.50 دولار بمونداة بوسطة أمريكية)، تصويرتين، ورقة الإقامة القانونية والعنوان. وبرلين تطلب الكارطة القديمة، تصويرتين بالألوان، كارطة الإقامة، وشهادة تسجيل جديدة إذا تبدل العنوان." } },
        { cites: [WR], text: {
          en: "Washington says the card must be renewed after five years, and failure to renew within ten years results in removal from the register.",
          fr: "Washington indique que la carte doit être renouvelée après cinq ans, et que l'absence de renouvellement dans les dix ans entraîne la radiation du registre.",
          ar: "تذكر سفارة واشنطن أن البطاقة تُجدَّد بعد خمس سنوات، وأن عدم التجديد خلال عشر سنوات يؤدي إلى الشطب من السجل.",
          dz: "سفارة واشنطن تقول الكارطة لازم تتجدد بعد خمس سنين، وإذا ما جددتهاش في عشر سنين يشطبوك من السجل." } },
        { cites: [PT, BR, MI, LT, SFT], text: {
          en: "Moving outside your consular district requires a file transfer: Pontoise, Brussels and Milan say the request goes to the consulate covering the new residence. London and San Francisco say registration there is granted once the file arrives from the previous post; London adds that in some cases Algeria's competent authorities must agree.",
          fr: "Un changement de résidence hors de la circonscription consulaire exige un transfert de dossier : Pontoise, Bruxelles et Milan indiquent que la demande se fait auprès du consulat couvrant la nouvelle résidence. Londres et San Francisco précisent que l'immatriculation y est accordée dès réception du dossier du poste précédent ; Londres ajoute que l'accord des autorités compétentes en Algérie peut être nécessaire.",
          ar: "الانتقال خارج الدائرة القنصلية يستوجب تحويل الملف: تذكر بونتواز وبروكسل وميلانو أن الطلب يُقدَّم إلى القنصلية التي تغطي مكان الإقامة الجديد. وتذكر لندن وسان فرانسيسكو أن التسجيل لديهما يُمنح بمجرد وصول الملف من الممثلية السابقة؛ وتضيف لندن أن موافقة السلطات المختصة في الجزائر قد تلزم أحيانًا.",
          dz: "إذا بدلت الدائرة القنصلية لازم تحول الملف: بونتواز وبروكسل وميلانو يقولو الطلب يتقدم للقنصلية لي تغطي بلاصة السكنى الجديدة. لندن وسان فرانسيسكو يقولو التسجيل عندهم يتعطى كي يوصل الملف من القنصلية الأولى؛ ولندن تزيد بلي أحيانا لازم موافقة السلطات المختصة في الدزاير." } },
        { cites: [BR, MI, PT, LT, SFT], text: {
          en: "Transfer documents: Brussels, Milan and Pontoise ask for the signed form, the consular card from the consulate holding your file (or a passport copy), your residence permit (or the host country's ID for dual citizens) and a recent proof of address. London asks for the file-transfer form, the first-registration form, the original card, proof of legal permanent UK residence and four photos. San Francisco asks for the form, two photos, a birth certificate, proof of legal US stay, proof of employment or enrolment and proof of address. Changes in profession, marriage, divorce or civil status must also be notified (Brussels, Milan, Pontoise).",
          fr: "Pièces de transfert : Bruxelles, Milan et Pontoise demandent le formulaire signé, la carte consulaire délivrée par le consulat détenteur du dossier (ou une copie du passeport), le titre de séjour (ou la carte d'identité du pays d'accueil pour les binationaux) et un justificatif de domicile récent. Londres demande le formulaire de transfert, le formulaire de première immatriculation, la carte originale, la preuve de résidence légale permanente au Royaume-Uni et quatre photos. San Francisco demande le formulaire, deux photos, un acte de naissance, la preuve de séjour légal aux États-Unis, un justificatif d'activité ou de scolarité et un justificatif de domicile. Les changements de profession, de mariage, de divorce ou d'état civil doivent aussi être signalés (Bruxelles, Milan, Pontoise).",
          ar: "وثائق التحويل: تطلب بروكسل وميلانو وبونتواز الاستمارة موقَّعة والبطاقة القنصلية الصادرة عن القنصلية الحائزة للملف (أو نسخة من جواز السفر) وبطاقة الإقامة (أو بطاقة هوية بلد الإقامة لمزدوجي الجنسية) وإثبات عنوان حديث. وتطلب لندن استمارة تحويل الملف واستمارة التسجيل الأول والبطاقة الأصلية وإثبات الإقامة الدائمة القانونية في المملكة المتحدة وأربع صور. وتطلب سان فرانسيسكو الاستمارة وصورتين وشهادة ميلاد وإثبات الإقامة القانونية في الولايات المتحدة وإثبات العمل أو الدراسة وإثبات العنوان. كما يجب التبليغ عن تغيّر المهنة أو الزواج أو الطلاق أو الحالة المدنية (بروكسل وميلانو وبونتواز).",
          dz: "وراق التحويل: بروكسل وميلانو وبونتواز يطلبو الاستمارة ممضية، الكارطة القنصلية تاع القنصلية لي عندها الملف (ولا نسخة الباسبور)، كارطة الإقامة (ولا هوية البلاد لمزدوجي الجنسية) وورقة عنوان جديدة. لندن تطلب استمارة تحويل الملف، استمارة التسجيل الأول، الكارطة الأصلية، ورقة الإقامة الدائمة القانونية في بريطانيا وأربع تصاور. سان فرانسيسكو تطلب الاستمارة، تصويرتين، شهادة ميلاد، ورقة الإقامة القانونية في أمريكا، ورقة الخدمة ولا القراية وورقة العنوان. وأي تبديل في المهنة، الزواج، الطلاق ولا الحالة المدنية لازم تبلغ بيه (بروكسل، ميلانو، بونتواز)." } },
      ],
    },
    {
      id: "ending",
      title: { en: "Deregistration and final return to Algeria", fr: "Radiation et retour définitif en Algérie", ar: "الشطب والعودة النهائية إلى الجزائر", dz: "الشطب والرجوع النهائي للدزاير" },
      points: [
        { cites: [PX, BE, WR], text: {
          en: "Pontoise, Berlin and Washington list the cases for deregistration: death, final return to Algeria, change of consular district, a written request, or absence of more than ten years. Deregistration also removes you from the electoral list.",
          fr: "Pontoise, Berlin et Washington citent les cas de radiation : décès, retour définitif en Algérie, changement de circonscription consulaire, demande de l'intéressé, ou absence de plus de dix ans. La radiation entraîne aussi la radiation de la liste électorale.",
          ar: "تذكر بونتواز وبرلين وواشنطن حالات الشطب: الوفاة، أو العودة النهائية إلى الجزائر، أو تغيير الدائرة القنصلية، أو طلب مكتوب من المعني، أو الغياب أكثر من عشر سنوات. ويترتب على الشطب أيضًا الشطب من القائمة الانتخابية.",
          dz: "بونتواز وبرلين وواشنطن يذكرو حالات الشطب: الموت، الرجوع النهائي للدزاير، تبديل الدائرة القنصلية، طلب مكتوب من المعني، ولا الغياب أكثر من عشر سنين. والشطب يشطبك حتى من القائمة الانتخابية." } },
        { cites: [SFC, BE, WR], text: {
          en: "San Francisco asks for a signed application form, the original consular card, a $2.50 USPS money order and a stamped return envelope; if you are in Algeria you can submit the request in person at the Ministry of Foreign Affairs' Civil Status Department in Kouba, Algiers. Berlin says the removal certificate carries a stamp fee, and Washington says a fee applies (amount not stated).",
          fr: "San Francisco demande un formulaire signé, la carte consulaire originale, un mandat USPS de 2,50 $ et une enveloppe retour affranchie ; si vous êtes en Algérie, vous pouvez déposer la demande en personne au service de l'état civil du ministère des Affaires étrangères à Kouba, Alger. Berlin indique que le certificat de radiation est soumis à un droit de timbre, et Washington qu'un droit est perçu (montant non précisé).",
          ar: "تطلب سان فرانسيسكو استمارة موقَّعة والبطاقة القنصلية الأصلية وحوالة USPS بقيمة 2.50 دولارًا وظرف إرجاع مطبوع عليه الطابع؛ وإذا كنت في الجزائر فيمكنك إيداع الطلب شخصيًا لدى مصلحة الحالة المدنية بوزارة الشؤون الخارجية في القبة بالجزائر العاصمة. وتذكر برلين أن شهادة الشطب تخضع لرسم طابع، وتذكر واشنطن أن رسمًا يُدفع (دون ذكر المبلغ).",
          dz: "سان فرانسيسكو تطلب استمارة ممضية، الكارطة القنصلية الأصلية، مونداة USPS 2.50 دولار وظرف رجوع بالطابع؛ وإذا راك في الدزاير تقدر تودع الطلب بنفسك في مصلحة الحالة المدنية في وزارة الخارجية بالقبة، الجزائر العاصمة. برلين تقول شهادة الشطب فيها رسم طابع، وواشنطن تقول يتخلص رسم (المبلغ ما ذكروهش)." } },
        { cites: [MR], text: {
          en: "For people registered abroad who have moved back to Algeria permanently and want to renew their ID and travel documents through their municipality, the Ministry of Foreign Affairs' civil status office issues a certificate of deregistration or of change of residence. Documents: the original consular card (or a declaration of loss), a copy of a valid ID and a residence certificate from the municipality.",
          fr: "Pour les personnes immatriculées à l'étranger qui sont rentrées définitivement en Algérie et veulent renouveler leurs documents d'identité et de voyage auprès de leur commune, le service de l'état civil du ministère des Affaires étrangères délivre un certificat de radiation ou de changement de résidence. Pièces : la carte consulaire originale (ou une déclaration de perte), une copie d'une pièce d'identité valide et un certificat de résidence de la commune.",
          ar: "بالنسبة للمسجَّلين في الخارج الذين عادوا نهائيًا إلى الجزائر ويريدون تجديد وثائق الهوية والسفر عبر بلديتهم، تسلّم مصلحة الحالة المدنية بوزارة الشؤون الخارجية شهادة شطب أو شهادة تغيير الإقامة. الوثائق: البطاقة القنصلية الأصلية (أو تصريح بالضياع) ونسخة من بطاقة هوية سارية وشهادة إقامة من البلدية.",
          dz: "للمسجلين في الغربة لي رجعو نهائيا للدزاير ويحبو يجددو وراق الهوية والسفر في البلدية تاعهم، مصلحة الحالة المدنية في وزارة الخارجية تخرج شهادة الشطب ولا شهادة تغيير الإقامة. الوراق: الكارطة القنصلية الأصلية (ولا تصريح بالضياع)، نسخة من ورقة هوية صالحة وشهادة الإقامة من البلدية." } },
        { cites: [PC, AD], text: {
          en: "A certificate of change of residence (CCR) is tied to a definitive return. Pontoise says it allows duty-free import of household effects and a new vehicle for people registered at the consulate with an uninterrupted stay of more than three years, who are over 19 and have never had a CCR; it lists a €40 chancery fee (plus €4 per €100 declared; 50% reduction for students and trainees) and a 15-day processing time. Abu Dhabi describes it as a one-time certificate for moving belongings and a tourist car.",
          fr: "Un certificat de changement de résidence (CCR) est lié à un retour définitif. Pontoise indique qu'il permet l'importation en franchise du mobilier et d'un véhicule neuf pour les personnes immatriculées au consulat justifiant d'un séjour ininterrompu de plus de trois ans, âgées de plus de 19 ans et n'ayant jamais bénéficié d'un CCR ; elle cite des droits de chancellerie de 40 € (majorés de 4 € par 100 € déclarés ; réduction de 50 % pour étudiants et stagiaires) et un délai de traitement de 15 jours. Abu Dhabi le décrit comme un certificat unique pour le déménagement des effets et d'une voiture de tourisme.",
          ar: "شهادة تغيير الإقامة مرتبطة بالعودة النهائية. تذكر بونتواز أنها تتيح استيراد الأثاث وسيارة جديدة معفاة من الرسوم للمسجَّلين لدى القنصلية ممن أقاموا إقامة متواصلة أكثر من ثلاث سنوات وتجاوزوا 19 سنة ولم يستفيدوا سابقًا من الشهادة؛ وتذكر رسوم مستشارية بقيمة 40 أورو (تزاد 4 أورو عن كل 100 أورو مصرَّح بها، وتخفيض 50% للطلبة والمتربصين) ومدة معالجة 15 يومًا. وتصفها أبوظبي بأنها شهادة تُمنح مرة واحدة لنقل الأمتعة وسيارة سياحية.",
          dz: "شهادة تغيير الإقامة (CCR) مرتبطة بالرجوع النهائي. بونتواز تقول تخليك تدخل الأثاث وسيارة جديدة بلا حقوق جمركية إذا راك متسجل في القنصلية وقعدت أكثر من ثلاث سنين بلا انقطاع، عمرك فوق 19 وما استفدتش من CCR قبل؛ وتذكر حقوق الشانسلري 40 أورو (يزيدو 4 أورو على كل 100 أورو مصرّح بيهم، وتخفيض 50% للطلبة والمتربصين) والمعالجة في 15 يوم. وأبوظبي تقول هي شهادة مرة وحدة لنقل الأغراض وسيارة سياحية." } },
      ],
    },
  ] as GuideSection[],
  fees: [] as FeeRow[],
};
