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

export const PASSPORT_GUIDE = {
  title: {
    en: "Biometric passport and ID card",
    fr: "Passeport et carte d'identité biométriques",
    ar: "جواز السفر وبطاقة التعريف البيومتريان",
    dz: "الباسبور ولاكارط ديدونتيتي البيومتريين",
  } as L,
  lead: {
    en: "What official consular pages say about applying, the documents to bring, fees, minors and renewal.",
    fr: "Ce que disent les pages consulaires officielles sur la demande, les pièces à fournir, les tarifs, les mineurs et le renouvellement.",
    ar: "ما تذكره الصفحات القنصلية الرسمية عن تقديم الطلب والوثائق المطلوبة والرسوم والقُصّر والتجديد.",
    dz: "واش يقولو الصفحات الرسمية تاع القنصليات على الطلب، الوراق لي لازم تجيبهم، السوما، الصغار والتجديد.",
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
