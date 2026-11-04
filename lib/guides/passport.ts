import type { Locale } from "@/lib/i18n";

/**
 * Passport + CNI summary. EVERY point is a restatement of what the cited
 * data/corpus.json records say (ids in `cites`). Nothing here comes from outside
 * knowledge. tests/guide.test.ts checks every cited id exists in the corpus.
 * If the corpus changes, review this file.
 */

type L = Record<Locale, string>;
export interface GuidePoint { text: L; cites: string[] }
export interface GuideSection { id: string; title: L; points: GuidePoint[] }
export interface FeeRow { office: L; items: L; payment: L; cites: string[] }

const W = "passport-embwashington-biometric-passport";
const WD = "passport-embwashington-biometric-documents";
const MI = "passport-cgmilan-first-issue";
const LF = "passport-cglondon-first-issuance";
const LR = "passport-cglondon-renewal";
const CW = "cni-embwashington-identity-card";
const CM = "cni-cgmilan-national-identity-card";
const CL = "cni-cglondon-national-identity-card";
const CS = "cni-cgsanfrancisco-identity-cards";
// Ministry of the Interior: the 2025 passport page and the older biometric passport page (for people living in Algeria).
const PN = "interieur-gov-dz-2025-03-17-passeport-national";
const PB = "interieur-gov-dz-accueil-fr-passeport-biometrique";

export const PASSPORT_GUIDE = {
  title: {
    en: "Biometric passport and ID card",
    fr: "Passeport et carte d'identité biométriques",
    ar: "جواز السفر وبطاقة التعريف البيومتريان",
    dz: "الباسبور ولاكارط ديدونتيتي البيومتريين",
  } as L,
  lead: {
    en: "What official pages (the Ministry of the Interior and the consulates) say about applying in Algeria or abroad, the documents to bring, fees, minors and renewal.",
    fr: "Ce que disent les pages officielles (ministère de l'Intérieur et consulats) sur la demande en Algérie ou à l'étranger, les pièces à fournir, les tarifs, les mineurs et le renouvellement.",
    ar: "ما تذكره الصفحات الرسمية (وزارة الداخلية والقنصليات) عن تقديم الطلب داخل الجزائر أو خارجها، والوثائق المطلوبة والرسوم والقُصّر والتجديد.",
    dz: "واش يقولو الصفحات الرسمية (وزارة الداخلية والقنصليات) على الطلب في الدزاير ولا برّا، الوراق لي لازم تجيبهم، السوما، الصغار والتجديد.",
  } as L,
  portals: [
    { url: "https://passeport.interieur.gov.dz", label: { en: "Passport and biometric ID portal (Ministry of the Interior)", fr: "Portail passeport et CNIBE (ministère de l'Intérieur)", ar: "بوابة جواز السفر وبطاقة التعريف (وزارة الداخلية)", dz: "بوابة الباسبور ولاكارط (وزارة الداخلية)" } as L },
    { url: "http://demande12s.interieur.gov.dz", label: { en: "12S birth certificate request", fr: "Demande d'extrait de naissance 12S", ar: "طلب شهادة الميلاد 12خ", dz: "طلب شهادة الميلاد 12S" } as L },
  ],
  sections: [
    {
      id: "how",
      title: { en: "How the consular procedure works", fr: "Comment se déroule la démarche au consulat", ar: "كيف يجري الإجراء لدى القنصلية", dz: "كيفاش يمشي الإجراء في القنصلية" },
      points: [
        { cites: [LF, MI], text: {
          en: "You must be registered with the consulate and hold a valid consular registration card.",
          fr: "Il faut être immatriculé au consulat et disposer d'une carte d'immatriculation consulaire valide.",
          ar: "يجب أن تكون مسجّلًا لدى القنصلية وتحمل بطاقة تسجيل قنصلي سارية.",
          dz: "لازم تكون متسجّل في القنصلية وعندك كارطة التسجيل القنصلي صالحة." } },
        { cites: [W, LF], text: {
          en: "Applicants attend in person to give photo and fingerprints, submit the file, and collect the passport.",
          fr: "Le demandeur se présente en personne pour la photo et les empreintes, le dépôt du dossier et le retrait du passeport.",
          ar: "يحضر صاحب الطلب شخصيًا لأخذ الصورة والبصمات، ولإيداع الملف، ولاستلام الجواز.",
          dz: "تروح بروحك باش ياخذو التصويرة والبصمات، تديپوزي الدوسي، وتجبد الباسبور." } },
        { cites: [W, WD], text: {
          en: "Biometric passports are issued in Algeria; Washington says to allow at least six weeks between enrolment and receipt.",
          fr: "Les passeports biométriques sont fabriqués en Algérie ; Washington indique au moins six semaines entre l'enrôlement et la réception.",
          ar: "تُصدَر الجوازات البيومترية في الجزائر، وتذكر سفارة واشنطن مدة لا تقل عن ستة أسابيع بين التسجيل والاستلام.",
          dz: "الباسبورات البيومترية يتصنعو في الدزاير؛ سفارة واشنطن تقول حسب على الأقل ستة سمانات بين البصمات والاستلام." } },
        { cites: [LF, W], text: {
          en: "London no longer accepts postal applications or mails passports; Washington can mail it back if you provide a prepaid USPS envelope.",
          fr: "Londres n'accepte plus les demandes par courrier et n'envoie pas les passeports ; Washington peut le renvoyer si vous fournissez une enveloppe USPS prépayée.",
          ar: "لم تعد قنصلية لندن تقبل الطلبات بالبريد ولا ترسل الجوازات، بينما يمكن لسفارة واشنطن إرساله إذا قدّمت ظرفًا مدفوع الأجر من USPS.",
          dz: "لندن ما بقاتش تقبل الطلبات بالبوسطة وما تبعثش الباسبور؛ واشنطن تقدر تبعثهولك إذا عطيتهم ظرف USPS مخلّص." } },
        { cites: [W, MI], text: {
          en: "A passport not collected is destroyed six months after the availability notice. Milan says reapplying then costs twice the standard fee, unless there is justified force majeure.",
          fr: "Un passeport non retiré est détruit six mois après l'avis de mise à disposition. Milan précise qu'une nouvelle demande coûte alors le double du tarif, sauf force majeure justifiée.",
          ar: "يُتلَف الجواز غير المستلَم بعد ستة أشهر من إشعار جاهزيته. وتذكر قنصلية ميلانو أن إعادة الطلب حينها تكلّف ضعف الرسم العادي، إلا في حالة قوة قاهرة مبرّرة.",
          dz: "الباسبور لي ما تجبدوش يتقطّع بعد ستة شهور من الإشعار. ميلانو تقول إذا عاودت الطلب تخلّص الضعف، غير إذا كانت قوة قاهرة مبرّرة." } },
      ],
    },
    {
      id: "documents",
      title: { en: "Documents usually requested", fr: "Pièces généralement demandées", ar: "الوثائق المطلوبة عادة", dz: "الوراق لي يطلبوهم عادة" },
      points: [
        { cites: [W, MI, LF], text: { en: "Completed and signed passport application form.", fr: "Formulaire de demande de passeport rempli et signé.", ar: "استمارة طلب جواز السفر مملوءة وموقّعة.", dz: "استمارة الباسبور معمّرة وممضية." } },
        { cites: [W, MI, LF, LR], text: { en: "Valid consular registration card.", fr: "Carte d'immatriculation consulaire valide.", ar: "بطاقة تسجيل قنصلي سارية.", dz: "كارطة التسجيل القنصلي صالحة." } },
        { cites: [MI, LF, LR], text: {
          en: "12S birth certificate. For a London renewal it is needed only if the expired passport was not issued in London.",
          fr: "Extrait de naissance 12S. Pour un renouvellement à Londres, il n'est exigé que si l'ancien passeport n'a pas été délivré à Londres.",
          ar: "شهادة الميلاد 12خ. وفي التجديد بلندن لا تُطلب إلا إذا لم يصدر الجواز المنتهي من قنصلية لندن.",
          dz: "شهادة الميلاد 12S. في التجديد في لندن يطلبوها غير إذا الباسبور القديم ما خرجش من لندن." } },
        { cites: [W, LR], text: { en: "Your expired passport (Washington also accepts one expiring within six months).", fr: "L'ancien passeport expiré (Washington accepte aussi un passeport expirant dans les six mois).", ar: "الجواز المنتهي الصلاحية (وتقبل واشنطن أيضًا جوازًا ينتهي خلال ستة أشهر).", dz: "الباسبور القديم الفايت (واشنطن تقبل حتى لي باقيلو أقل من ستة شهور)." } },
        { cites: [W, MI, LF], text: { en: "Proof of legal residence in the host country, and proof of address.", fr: "Justificatif de séjour régulier dans le pays de résidence, et justificatif d'adresse.", ar: "إثبات الإقامة القانونية في بلد الإقامة، وإثبات العنوان.", dz: "ورقة تثبت بلي راك مقيم قانونيًا في البلاد لي راك فيها، وورقة العنوان." } },
        { cites: [W, MI, LF], text: { en: "Work certificate, or school or enrolment certificate for students.", fr: "Attestation de travail, ou certificat de scolarité pour les élèves et étudiants.", ar: "شهادة عمل، أو شهادة مدرسية أو جامعية للتلاميذ والطلبة.", dz: "شهادة العمل، ولا شهادة القراية للتلامذة والطلبة." } },
        { cites: [W, MI, LF], text: { en: "Proof of blood type.", fr: "Justificatif du groupe sanguin.", ar: "إثبات فصيلة الدم.", dz: "ورقة الزمرة الدموية (لوغروب سانڨان)." } },
        { cites: [W, MI, LF, WD], text: {
          en: "Passport photos to the consulate's standard: two in Washington and Milan, four in London. Photos that don't meet the standard are rejected.",
          fr: "Photos d'identité aux normes du consulat : deux à Washington et Milan, quatre à Londres. Les photos non conformes sont refusées.",
          ar: "صور شمسية وفق معايير القنصلية: صورتان في واشنطن وميلانو، وأربع في لندن. وتُرفض الصور غير المطابقة.",
          dz: "تصاور حسب الشروط تاع القنصلية: زوج في واشنطن وميلانو، أربعة في لندن. التصاور لي ماشي مطابقة يرفضوهم." } },
      ],
    },
    {
      id: "minors",
      title: { en: "Minors", fr: "Mineurs", ar: "القُصّر", dz: "الصغار" },
      points: [
        { cites: [W, LF], text: { en: "Every minor needs an individual passport; children can no longer be added to a parent's passport.", fr: "Chaque mineur doit avoir son propre passeport ; on ne peut plus inscrire un enfant sur le passeport d'un parent.", ar: "لكل قاصر جواز سفر خاص به، ولم يعد ممكنًا إضافة الطفل إلى جواز أحد الوالدين.", dz: "كل صغير لازمو باسبور وحدو؛ ما بقاش يزيدوه في الباسبور تاع باباه ولا ماماه." } },
        { cites: [W, LF], text: { en: "Under 19: written parental authorisation from the father or legal guardian, who signs the form.", fr: "Moins de 19 ans : autorisation parentale écrite du père ou du tuteur légal, qui signe le formulaire.", ar: "دون 19 سنة: إذن أبوي مكتوب من الأب أو الولي الشرعي الذي يوقّع الاستمارة.", dz: "تحت 19 سنة: لازم إذن مكتوب من البابا ولا الولي الشرعي، وهو لي يمضي الاستمارة." } },
        { cites: [W, MI, WD], text: { en: "Validity: 10 years for adults, 5 years for minors.", fr: "Validité : 10 ans pour les adultes, 5 ans pour les mineurs.", ar: "مدة الصلاحية: 10 سنوات للبالغين و5 سنوات للقُصّر.", dz: "الصلاحية: 10 سنين للكبار و5 سنين للصغار." } },
        { cites: [MI, LF], text: { en: "In Milan and London, children under 12 don't need to attend; a legal guardian handles submission and collection.", fr: "À Milan et Londres, les enfants de moins de 12 ans n'ont pas à se présenter ; le tuteur légal dépose et retire.", ar: "في ميلانو ولندن، لا يُشترط حضور الأطفال دون 12 سنة، ويتولى الولي الشرعي الإيداع والاستلام.", dz: "في ميلانو ولندن، الصغار تحت 12 سنة ما يلزمش يجيو؛ الولي الشرعي هو لي يديپوزي ويجبد." } },
        { cites: [LF], text: { en: "London: the child's birth must first be registered with the consulate's civil status section.", fr: "Londres : la naissance de l'enfant doit d'abord être transcrite à l'état civil du consulat.", ar: "لندن: يجب أولًا تسجيل ميلاد الطفل لدى مصلحة الحالة المدنية بالقنصلية.", dz: "لندن: لازم الأول تسجّل الزيادة تاع الصغير في الحالة المدنية تاع القنصلية." } },
      ],
    },
    {
      id: "renewal",
      title: { en: "Renewal, loss or damage", fr: "Renouvellement, perte ou détérioration", ar: "التجديد أو الضياع أو التلف", dz: "التجديد، الضياع ولا التقطيع" },
      points: [
        { cites: [W], text: { en: "Washington handles renewal through the same application; you need a passport that has expired or expires within six months.", fr: "Washington traite le renouvellement avec la même demande ; il faut un passeport expiré ou expirant dans les six mois.", ar: "تعالج سفارة واشنطن التجديد بالطلب نفسه، ويُشترط جواز منتهٍ أو ينتهي خلال ستة أشهر.", dz: "في واشنطن التجديد بنفس الطلب؛ لازم يكون الباسبور فايت ولا باقيلو أقل من ستة شهور." } },
        { cites: [LR], text: { en: "London lets you check availability online by entering the registration number from your deposit receipt.", fr: "Londres permet de vérifier la disponibilité en ligne avec le numéro d'enregistrement du récépissé de dépôt.", ar: "تتيح قنصلية لندن التحقق من جاهزية الجواز عبر الإنترنت برقم التسجيل المدوّن في وصل الإيداع.", dz: "في لندن تقدر تشوف إذا وجد الباسبور من الأنترنت بالنمرو لي في الوصل." } },
        { cites: [W, WD], text: { en: "Lost, stolen or damaged (Washington): add a notarised declaration explaining what happened and pay a $125 penalty by money order.", fr: "Perte, vol ou détérioration (Washington) : ajouter une déclaration notariée expliquant les circonstances et payer une pénalité de 125 $ par mandat.", ar: "الضياع أو السرقة أو التلف (واشنطن): إضافة تصريح موثّق يشرح الظروف ودفع غرامة 125 دولارًا بحوالة بريدية.", dz: "إذا ضاع، تسرق ولا تقطّع (واشنطن): زيد تصريح عند الموثق تشرح واش صرا وخلّص غرامة 125 دولار بمونداة." } },
      ],
    },
    {
      id: "in-algeria",
      title: { en: "First passport, living in Algeria", fr: "Premier passeport, résident en Algérie", ar: "أول جواز سفر للمقيمين في الجزائر", dz: "أول باسبور، ساكن في الدزاير" },
      points: [
        { cites: [PB, PN], text: {
          en: "You submit the file at any commune (APC), daïra or administrative district of your wilaya. You get a receipt once the file is accepted and your photo and fingerprints are taken.",
          fr: "Le dossier se dépose auprès de n'importe quelle commune, daïra ou circonscription administrative de votre wilaya. Un récépissé est remis une fois le dossier accepté et les données biométriques enregistrées.",
          ar: "يُودَع الملف لدى أي بلدية أو دائرة أو مقاطعة إدارية في ولايتك. ويُسلَّم وصل بعد قبول الملف وأخذ الصورة والبصمات.",
          dz: "تديپوزي الدوسي في أي بلدية، دايرة ولا مقاطعة إدارية في الولاية تاعك. يعطوك وصل كي يقبلو الدوسي وياخذو التصويرة والبصمات." } },
        { cites: [PN, PB], text: {
          en: "The passport application form, filled in and signed by you, or by the legal guardian for a minor.",
          fr: "Le formulaire de demande de passeport rempli et signé par l'intéressé, ou par le tuteur légal pour un mineur.",
          ar: "استمارة طلب جواز السفر مملوءة وموقّعة من صاحب الطلب، أو من الولي الشرعي بالنسبة للقاصر.",
          dz: "استمارة الباسبور معمّرة وممضية من عندك، ولا من الولي الشرعي إذا كان صغير." } },
        { cites: [PN], text: {
          en: "Algerian nationality certificate, unless your biometric ID card was already issued on the basis of one.",
          fr: "Certificat de nationalité algérienne, sauf si votre carte d'identité biométrique a déjà été délivrée sur la base d'un certificat de nationalité.",
          ar: "شهادة الجنسية الجزائرية، إلا إذا سبق أن صدرت بطاقة تعريفك البيومترية على أساس شهادة جنسية.",
          dz: "شهادة الجنسية، غير إذا لاكارط ديدونتيتي البيومترية تاعك خرجت من قبل بشهادة الجنسية." } },
        { cites: [PN, PB], text: {
          en: "Residence certificate, if you hold no biometric document or have moved. Under-19s don't need one. The Ministry's older page asks for one less than six months old.",
          fr: "Certificat de résidence, si vous n'avez aucun document biométrique ou avez changé de résidence. Les moins de 19 ans en sont dispensés. L'ancienne page du ministère le demande daté de moins de six mois.",
          ar: "شهادة الإقامة، إذا لم تكن تملك وثيقة بيومترية أو غيّرت مقر إقامتك. ويُعفى منها من هم دون 19 سنة. وتطلبها الصفحة القديمة للوزارة بتاريخ لا يتجاوز ستة أشهر.",
          dz: "شهادة الإقامة، إذا ما عندكش ورقة بيومترية ولا بدّلت السكنى. لي عمرهم تحت 19 سنة ما يحتاجوهاش. الصفحة القديمة تاع الوزارة تطلبها ما تفوتش ستة شهور." } },
        { cites: [PN], text: {
          en: "Work certificate, certificate of non-activity, or school certificate for students and pupils.",
          fr: "Attestation de travail, attestation de non-activité, ou certificat de scolarité pour les étudiants et les élèves.",
          ar: "شهادة عمل أو شهادة عدم النشاط، أو شهادة مدرسية للطلبة والتلاميذ.",
          dz: "شهادة العمل، شهادة عدم النشاط، ولا شهادة مدرسية للطلبة والتلاميذ." } },
        { cites: [PN, PB], text: {
          en: "Recent, identical colour ID photos on a plain white background with no border. The Ministry's 2025 page asks for two; its biometric passport page asks for four.",
          fr: "Photos d'identité en couleur, récentes et identiques, sur fond blanc uni et sans contour. La page 2025 du ministère en demande deux ; sa page sur le passeport biométrique en demande quatre.",
          ar: "صور شمسية ملوّنة حديثة ومتطابقة بخلفية بيضاء موحّدة ودون إطار. تطلب صفحة الوزارة لسنة 2025 صورتين، وتطلب صفحتها عن الجواز البيومتري أربع صور.",
          dz: "تصاور ملوّنين جداد وكيف كيف، الخلفية بيضاء بلا إطار. الصفحة تاع الوزارة 2025 تطلب زوج؛ الصفحة تاع الباسبور البيومتري تطلب أربعة." } },
        { cites: [PN, PB], text: {
          en: "A tax receipt (quittance fiscale or fiscal stamp) for the amount that matches the document and the procedure.",
          fr: "Une quittance fiscale (ou timbre fiscal) dont le montant correspond au document demandé et au type de procédure.",
          ar: "وصل جبائي (أو طابع جبائي) بالمبلغ الموافق لنوع الوثيقة والإجراء.",
          dz: "وصل الضريبة (ولا تامبر) بالسوما لي تناسب الوثيقة ونوع الإجراء." } },
        { cites: [PN, PB], text: {
          en: "A copy of your blood group card.",
          fr: "La copie de la carte du groupe sanguin.",
          ar: "نسخة من بطاقة فصيلة الدم.",
          dz: "نسخة من كارطة لوغروب سانڨان." } },
        { cites: [PB, PN], text: {
          en: "12S birth certificate: listed on the Ministry's biometric passport page; its 2025 page lists it only for Algerians living abroad.",
          fr: "Extrait de naissance 12S : demandé sur la page du ministère consacrée au passeport biométrique ; sa page 2025 ne le cite que pour les Algériens résidant à l'étranger.",
          ar: "شهادة الميلاد 12خ: تذكرها صفحة الوزارة عن الجواز البيومتري، بينما لا تذكرها صفحتها لسنة 2025 إلا للجزائريين المقيمين بالخارج.",
          dz: "شهادة الميلاد 12S: مكتوبة في صفحة الوزارة تاع الباسبور البيومتري؛ الصفحة تاع 2025 تذكرها غير للي ساكنين برّا." } },
        { cites: [PN, PB], text: {
          en: "You collect the passport yourself after an SMS says it is ready, and check the details printed on it. Anyone aged 12 or over must attend both submission and collection; under-12s attend submission only. Validity: 10 years for adults, 5 for minors.",
          fr: "Le passeport est retiré par le demandeur lui-même après un SMS, en vérifiant les informations imprimées. La présence est obligatoire au dépôt et au retrait à partir de 12 ans ; avant 12 ans, seulement au dépôt. Validité : 10 ans pour les majeurs, 5 ans pour les mineurs.",
          ar: "يستلم صاحب الطلب الجواز بنفسه بعد رسالة نصية تدعوه لذلك، ويتحقق من المعلومات المطبوعة فيه. الحضور إلزامي عند الإيداع والاستلام لمن بلغ 12 سنة فأكثر، وعند الإيداع فقط لمن هم دون 12 سنة. مدة الصلاحية 10 سنوات للبالغين و5 سنوات للقُصّر.",
          dz: "تجبد الباسبور بروحك كي يجيك SMS، وتشوف المعلومات لي مكتوبين فيه. من 12 سنة وفوق لازم تحضر في الإيداع والاستلام؛ تحت 12 سنة غير في الإيداع. الصلاحية 10 سنين للكبار و5 للصغار." } },
      ],
    },
    {
      id: "in-algeria-renewal",
      title: { en: "Renewal, loss or theft, living in Algeria", fr: "Renouvellement, perte ou vol, résident en Algérie", ar: "التجديد أو الضياع أو السرقة للمقيمين في الجزائر", dz: "التجديد، الضياع ولا السرقة، ساكن في الدزاير" },
      points: [
        { cites: [PN], text: {
          en: "You can renew in the six months before the passport expires, or when its visa pages are full.",
          fr: "Le passeport peut être renouvelé dans les six mois qui précèdent son expiration, ou lorsque ses feuillets de visas sont remplis.",
          ar: "يمكن تجديد الجواز خلال الأشهر الستة التي تسبق انتهاء صلاحيته، أو عندما تمتلئ صفحات التأشيرات.",
          dz: "تقدر تجدد الباسبور في الستة شهور لي قبل ما يكمل، ولا كي تعمر الصفحات تاع الفيزا." } },
        { cites: [PN, PB], text: {
          en: "Bring the old passport. If it was lost, stolen or damaged, bring the loss or theft declaration, or the damage report, instead.",
          fr: "Apportez l'ancien passeport. En cas de perte, de vol ou de détérioration, apportez à la place la déclaration de perte ou de vol, ou le procès-verbal de détérioration.",
          ar: "أحضر الجواز القديم. وفي حالة الضياع أو السرقة أو التلف، أحضر بدله التصريح بالضياع أو السرقة، أو محضر التلف.",
          dz: "جيب الباسبور القديم. إذا ضاع، تسرق ولا تقطّع، جيب في بلاصتو التصريح بالضياع ولا السرقة، ولا محضر التقطيع." } },
        { cites: [PN], text: {
          en: "Residence certificate only if you have moved.",
          fr: "Certificat de résidence uniquement en cas de changement de résidence.",
          ar: "شهادة الإقامة فقط في حالة تغيير مقر الإقامة.",
          dz: "شهادة الإقامة غير إذا بدّلت السكنى." } },
        { cites: [PN], text: {
          en: "Work certificate, certificate of non-activity, or school certificate for students and pupils.",
          fr: "Attestation de travail, attestation de non-activité, ou certificat de scolarité pour les étudiants et les élèves.",
          ar: "شهادة عمل أو شهادة عدم النشاط، أو شهادة مدرسية للطلبة والتلاميذ.",
          dz: "شهادة العمل، شهادة عدم النشاط، ولا شهادة مدرسية للطلبة والتلاميذ." } },
        { cites: [PN], text: {
          en: "Two recent, identical colour photos on a plain white background, and the tax receipt for the procedure.",
          fr: "Deux photos d'identité en couleur, récentes et identiques, sur fond blanc uni, et la quittance fiscale correspondant à la procédure.",
          ar: "صورتان شمسيتان ملوّنتان حديثتان ومتطابقتان بخلفية بيضاء، والوصل الجبائي الموافق للإجراء.",
          dz: "زوج تصاور ملوّنين جداد وكيف كيف بخلفية بيضاء، ووصل الضريبة تاع الإجراء." } },
        { cites: [PB], text: {
          en: "The Ministry's biometric passport page also asks, for a renewal, for your father's or mother's birth certificate, or a parent's death certificate if neither is available.",
          fr: "La page du ministère sur le passeport biométrique demande aussi, pour un renouvellement, l'acte de naissance du père ou de la mère, ou à défaut l'acte de décès de l'un des parents.",
          ar: "وتطلب صفحة الوزارة عن الجواز البيومتري أيضًا، عند التجديد، عقد ميلاد الأب أو الأم، أو عند تعذّر ذلك عقد وفاة أحد الوالدين.",
          dz: "الصفحة تاع الوزارة على الباسبور البيومتري تطلب زادة في التجديد شهادة ميلاد الباباك ولا اليماك، ولا شهادة وفاة واحد فيهم إذا ما كانش." } },
        { cites: [PN], text: {
          en: "A passport with a wrong or duplicate national identification number (NIN) can be replaced; no stamp duty is due when it is still valid and not declared lost, damaged or stolen.",
          fr: "Un passeport comportant un NIN erroné ou attribué à une autre personne peut être remplacé ; aucun droit de timbre n'est dû s'il est en cours de validité et n'est pas déclaré perdu, détérioré ou volé.",
          ar: "يمكن استبدال جواز يحمل رقم تعريف وطني خاطئ أو مكرّر، ولا تُدفع حقوق الطابع إذا كان ساري الصلاحية ولم يُصرَّح بضياعه أو تلفه أو سرقته.",
          dz: "الباسبور لي فيه NIN غالط ولا مكرّر يتبدّل؛ ما تخلّصش التامبر إذا مازال صالح وما صرّحتش بلي ضاع، تقطّع ولا تسرق." } },
        { cites: [PN], text: {
          en: "If your request is refused, you can appeal to the daïra or administrative district responsible for your area.",
          fr: "En cas de rejet de la demande, un recours peut être introduit auprès de la daïra ou de la circonscription administrative territorialement compétente.",
          ar: "في حالة رفض الطلب، يمكن تقديم طعن لدى الدائرة أو المقاطعة الإدارية المختصة إقليميًا.",
          dz: "إذا رفضو الطلب، تقدر تدير طعن في الدايرة ولا المقاطعة الإدارية تاع البلاصة تاعك." } },
      ],
    },
    {
      id: "cni",
      title: { en: "Biometric national ID card (CNIBE)", fr: "Carte nationale d'identité biométrique (CNIBE)", ar: "بطاقة التعريف الوطنية البيومترية", dz: "لاكارط ديدونتيتي البيومترية" },
      points: [
        { cites: [CW, CM, CL, CS], text: { en: "Once you hold a biometric passport, apply online on the Ministry of the Interior portal (passeport.interieur.gov.dz).", fr: "Une fois le passeport biométrique obtenu, la demande se fait en ligne sur le portail du ministère de l'Intérieur (passeport.interieur.gov.dz).", ar: "بعد الحصول على جواز السفر البيومتري، يُقدَّم الطلب عبر الإنترنت في بوابة وزارة الداخلية (passeport.interieur.gov.dz).", dz: "كي يكون عندك الباسبور البيومتري، تطلبها من الأنترنت في بوابة وزارة الداخلية (passeport.interieur.gov.dz)." } },
        { cites: [CW, CM, CS], text: { en: "For Algerians abroad, you must be registered with the consulate.", fr: "Pour les Algériens à l'étranger, il faut être immatriculé au consulat.", ar: "بالنسبة للجزائريين بالخارج، يُشترط التسجيل لدى القنصلية.", dz: "للدزيريين في الغربة، لازم تكون متسجّل في القنصلية." } },
        { cites: [CM, CS], text: { en: "Applicants aged 12 and over go to the consulate for fingerprints. Sources differ on younger children: Milan exempts under-12s from fingerprinting, while San Francisco says under-12s cannot apply.", fr: "À partir de 12 ans, on se rend au consulat pour les empreintes. Les sources divergent pour les plus jeunes : Milan dispense les moins de 12 ans d'empreintes, San Francisco indique qu'ils ne peuvent pas faire la demande.", ar: "من بلغ 12 سنة فما فوق يحضر إلى القنصلية لأخذ البصمات. وتختلف المصادر بشأن الأصغر سنًا: ميلانو تعفي من هم دون 12 من البصمات، بينما تذكر سان فرانسيسكو أنهم لا يمكنهم التقديم.", dz: "من 12 سنة وفوق تروح للقنصلية للبصمات. على الصغار المصادر ماشي كيف كيف: ميلانو تعفي لي تحت 12 من البصمات، وسان فرانسيسكو تقول ما يقدروش يطلبو." } },
        { cites: [CL, CM], text: { en: "At collection, bring an identity document and return your old card; if it was lost, bring a loss declaration (London).", fr: "Au retrait, présentez une pièce d'identité et rendez l'ancienne carte ; en cas de perte, une déclaration de perte (Londres).", ar: "عند الاستلام، أحضر وثيقة هوية وأعد البطاقة القديمة، وفي حال ضياعها أحضر تصريحًا بالضياع (لندن).", dz: "كي تروح تجبدها، جيب ورقة هوية ورجّع لاكارط القديمة؛ إذا ضاعت جيب تصريح بالضياع (لندن)." } },
        { cites: [CW, CS, CM, CL], text: { en: "Fees: Washington lists no fee; San Francisco is free unless the old card is lost, stolen or damaged ($15 money order); Milan and London list no fees.", fr: "Tarifs : Washington n'exige aucun frais ; San Francisco est gratuit sauf ancienne carte perdue, volée ou abîmée (mandat de 15 $) ; Milan et Londres n'indiquent aucun tarif.", ar: "الرسوم: لا رسوم في واشنطن؛ ومجانية في سان فرانسيسكو إلا إذا ضاعت البطاقة القديمة أو سُرقت أو تلفت (حوالة بـ15 دولارًا)؛ ولا تذكر ميلانو ولندن أي رسوم.", dz: "السوما: واشنطن بلاش؛ سان فرانسيسكو بلاش غير إذا لاكارط القديمة ضاعت، تسرقت ولا تقطعت (15 دولار مونداة)؛ ميلانو ولندن ما كتبو حتى سومة." } },
        { cites: [CS], text: { en: "Cards are made in Algeria, so delivery usually takes several weeks (San Francisco).", fr: "Les cartes sont fabriquées en Algérie ; la livraison prend généralement plusieurs semaines (San Francisco).", ar: "تُصنع البطاقات في الجزائر، لذا يستغرق التسليم عادة عدة أسابيع (سان فرانسيسكو).", dz: "لاكارطات يتصنعو في الدزاير، داك الشي تطوّل عادة بزاف السمانات (سان فرانسيسكو)." } },
      ],
    },
  ] as GuideSection[],
  fees: [
    { cites: [W, WD], office: { en: "Embassy in Washington", fr: "Ambassade à Washington", ar: "السفارة في واشنطن", dz: "السفارة في واشنطن" },
      items: { en: "28 pages: $75 adults (19+), $37.50 minors and students · 48 pages: $112.50 adults, $56.25 minors and students", fr: "28 pages : 75 $ adultes (19 ans et +), 37,50 $ mineurs et étudiants · 48 pages : 112,50 $ adultes, 56,25 $ mineurs et étudiants", ar: "28 صفحة: 75 دولارًا للبالغين (19 سنة فما فوق)، 37.50 للقُصّر والطلبة · 48 صفحة: 112.50 للبالغين، 56.25 للقُصّر والطلبة", dz: "28 صفحة: 75 دولار للكبار (19 وفوق)، 37.50 للصغار والطلبة · 48 صفحة: 112.50 للكبار، 56.25 للصغار والطلبة" },
      payment: { en: "U.S. Post Office money order only", fr: "Mandat postal américain uniquement", ar: "حوالة بريدية أمريكية فقط", dz: "غير مونداة البوسطة الأمريكية" } },
    { cites: [LF, LR], office: { en: "Consulate in London", fr: "Consulat à Londres", ar: "القنصلية في لندن", dz: "القنصلية في لندن" },
      items: { en: "28 pages: £55 adults, £27.50 minors · 48 pages: £110 adults, £55 minors · students and under-19s: £27.50 · replacement for loss or damage: £100 adults, £50 minors", fr: "28 pages : 55 £ adultes, 27,50 £ mineurs · 48 pages : 110 £ adultes, 55 £ mineurs · étudiants et moins de 19 ans : 27,50 £ · remplacement (perte ou détérioration) : 100 £ adultes, 50 £ mineurs", ar: "28 صفحة: 55 جنيهًا للبالغين، 27.50 للقُصّر · 48 صفحة: 110 للبالغين، 55 للقُصّر · الطلبة ومن هم دون 19: 27.50 · الاستبدال بسبب الضياع أو التلف: 100 للبالغين، 50 للقُصّر", dz: "28 صفحة: 55 جنيه للكبار، 27.50 للصغار · 48 صفحة: 110 للكبار، 55 للصغار · الطلبة ولي تحت 19: 27.50 · التبديل كي يضيع ولا يتقطع: 100 للكبار، 50 للصغار" },
      payment: { en: "Cash or postal order at submission (renewal page: cash only)", fr: "Espèces ou mandat au dépôt (page renouvellement : espèces uniquement)", ar: "نقدًا أو بحوالة بريدية عند الإيداع (صفحة التجديد: نقدًا فقط)", dz: "كاش ولا مونداة كي تديپوزي (صفحة التجديد: غير كاش)" } },
    { cites: [MI], office: { en: "Consulate in Milan", fr: "Consulat à Milan", ar: "القنصلية في ميلانو", dz: "القنصلية في ميلانو" },
      items: { en: "€60 standard · €30 students and minors", fr: "60 € tarif normal · 30 € étudiants et mineurs", ar: "60 يورو الرسم العادي · 30 يورو للطلبة والقُصّر", dz: "60 أورو العادي · 30 أورو للطلبة والصغار" },
      payment: { en: "Not stated", fr: "Non précisé", ar: "غير مذكور", dz: "ما كتبوش" } },
  ] as FeeRow[],
};
