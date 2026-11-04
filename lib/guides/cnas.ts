import type { Locale } from "@/lib/i18n";
import type { GuidePoint, GuideSection, FeeRow } from "./passport";

/**
 * Social security: CNAS (employees) and CASNOS (self-employed), including the
 * voluntary affiliation scheme for Algerians abroad. EVERY point is a
 * restatement of what the cited data/corpus.json records say (ids in `cites`).
 * Nothing here comes from outside knowledge. Amounts and rates are the ones the
 * cited pages list; they may change, so review this file if the corpus changes.
 */

type L = Record<Locale, string>;
export type { GuidePoint, GuideSection, FeeRow };

const VA = "teledeclaration.cnas.dz-affiliation-volontaire-communaute-etranger";
const VD = "teledeclaration.cnas.dz-depliant-affiliation-volontaire";
const VX = "teledeclaration.cnas.dz-decret-22-351";
const VS = "teledeclaration.cnas.dz-suivi-demande-communaute-etranger";
const VP = "social-cgparis-national-pension-system";
const PRES = "cnas.dz-presentation-of-cnas";
const FAM = "cnas.dz-family-allowances";
const MAT = "cnas.dz-maternity-insurance";
const EH = "elhanaa.cnas.dz-home";
const EI = "elhanaa.cnas.dz-inscription";
const EN = "elhanaa.cnas.dz-attestation-non-affiliation";
const TD = "teledeclaration.cnas.dz-home";
const STU = "social-cnas-etudiant";
const CA = "casnos-com-dz-affiliation";
const CC = "casnos-com-dz-cotisations";
const CP = "casnos-com-dz-niveaux-de-prestations";

export const GUIDE = {
  title: {
    en: "Social security: CNAS and CASNOS",
    fr: "Sécurité sociale : CNAS et CASNOS",
    ar: "الضمان الاجتماعي: كناص وكاسنوس",
    dz: "الضمان الاجتماعي: كناص وكاسنوس",
  } as L,
  lead: {
    en: "What official CNAS and CASNOS pages say about registration and services: the voluntary scheme for Algerians abroad, employees, students, and the self-employed. Amounts are those the pages list and can change.",
    fr: "Ce que disent les pages officielles de la CNAS et de la CASNOS sur l'affiliation et les services : le régime volontaire pour les Algériens de l'étranger, les salariés, les étudiants et les non-salariés. Les montants sont ceux des pages et peuvent changer.",
    ar: "ما تذكره الصفحات الرسمية للصندوق الوطني للتأمينات الاجتماعية (كناص) والصندوق الوطني للضمان الاجتماعي لغير الأجراء (كاسنوس) عن الانتساب والخدمات: النظام الإرادي للجزائريين بالخارج، والأجراء، والطلبة، وغير الأجراء. المبالغ هي ما تورده الصفحات وقد تتغير.",
    dz: "واش تقول الصفحات الرسمية تاع كناص وكاسنوس على الانخراط والخدمات: النظام الاختياري للجزائريين في الغربة، الأجراء، الطلبة وغير الأجراء. المبالغ هي لي في الصفحات وممكن تتبدل.",
  } as L,
  portals: [
    { url: "https://teledeclaration.cnas.dz/el_djalya.xhtml", label: { en: "CNAS voluntary affiliation for Algerians abroad", fr: "CNAS : affiliation volontaire des Algériens de l'étranger", ar: "كناص: الانتساب الإرادي للجزائريين بالخارج", dz: "كناص: الانتساب الاختياري للجزائريين في الغربة" } as L },
    { url: "https://elhanaa.cnas.dz/", label: { en: "CNAS El-Hanaa insured-person space", fr: "Espace assuré El-Hanaa (CNAS)", ar: "فضاء المؤمَّن له «الهناء» (كناص)", dz: "فضاء الهناء تاع المؤمَّنين (كناص)" } as L },
    { url: "https://www.cnas.dz/", label: { en: "CNAS (employees)", fr: "CNAS (salariés)", ar: "كناص (الأجراء)", dz: "كناص (الأجراء)" } as L },
    { url: "https://www.casnos.dz/", label: { en: "CASNOS (self-employed)", fr: "CASNOS (non-salariés)", ar: "كاسنوس (غير الأجراء)", dz: "كاسنوس (غير الأجراء)" } as L },
    { url: "https://damancom.casnos.dz/", label: { en: "Damancom (CASNOS online services)", fr: "Damancom (services en ligne CASNOS)", ar: "ضمانكم (خدمات كاسنوس عن بعد)", dz: "ضمانكم (خدمات كاسنوس من الأنترنت)" } as L },
  ],
  sections: [
    {
      id: "abroad",
      title: { en: "Algerians abroad: voluntary affiliation", fr: "Algériens de l'étranger : affiliation volontaire", ar: "الجزائريون بالخارج: الانتساب الإرادي", dz: "الجزائريين في الغربة: الانتساب الاختياري" },
      points: [
        { cites: [VA, VX, VP], text: {
          en: "CNAS has a page for voluntary affiliation of members of the national community abroad to the national social-security system (health-maternity and retirement), run online on its tele-declaration portal. The retirement side is governed by Executive Decree 22-351 of 18 October 2022. The Paris consulate announced the online retirement-scheme platform in 2023.",
          fr: "La CNAS dispose d'une page dédiée à l'affiliation volontaire des membres de la communauté nationale à l'étranger au système national de sécurité sociale (maladie-maternité et retraite), gérée en ligne sur son portail de télédéclaration. Le volet retraite relève du décret exécutif 22-351 du 18 octobre 2022. Le consulat de Paris a annoncé en 2023 la plateforme en ligne du système de retraite.",
          ar: "لدى كناص صفحة مخصصة للانتساب الإرادي لأفراد الجالية الوطنية بالخارج إلى النظام الوطني للضمان الاجتماعي (التأمين على المرض والأمومة والتقاعد)، تُدار عبر بوابة التصريح عن بعد. ويخضع جانب التقاعد للمرسوم التنفيذي 22-351 المؤرخ في 18 أكتوبر 2022. وقد أعلنت قنصلية باريس سنة 2023 عن المنصة الإلكترونية لنظام التقاعد.",
          dz: "كناص عندها صفحة خاصة بالانتساب الاختياري لولاد الجالية في الغربة للنظام الوطني للضمان الاجتماعي (المرض والأمومة والتقاعد)، تتسير من الأنترنت في بوابة التصريح عن بعد. وجانب التقاعد يخضع للمرسوم التنفيذي 22-351 تاع 18 أكتوبر 2022. قنصلية باريس أعلنت في 2023 على المنصة الإلكترونية تاع نظام التقاعد." } },
        { cites: [VD, VX], text: {
          en: "Eligibility, per the CNAS leaflet and the decree: Algerian nationality; registered with an Algerian diplomatic or consular mission; not older than 55 when applying; working abroad as an employee, equivalent or self-employed; and not subject to compulsory social-security affiliation.",
          fr: "Conditions, selon le dépliant de la CNAS et le décret : nationalité algérienne ; immatriculation auprès d'une représentation diplomatique ou consulaire algérienne ; ne pas dépasser 55 ans à la demande ; exercer à l'étranger une activité de salarié, assimilé ou non-salarié ; et ne pas être assujetti à l'affiliation obligatoire à la sécurité sociale.",
          ar: "الشروط حسب مطوية كناص والمرسوم: الجنسية الجزائرية؛ التسجيل لدى ممثلية دبلوماسية أو قنصلية جزائرية؛ ألا يتجاوز العمر 55 سنة عند طلب الانتساب؛ ممارسة نشاط في الخارج بصفة أجير أو مماثل له أو غير أجير؛ وألا يكون خاضعًا للانتساب الإجباري للضمان الاجتماعي.",
          dz: "الشروط حسب مطوية كناص والمرسوم: الجنسية الجزائرية؛ متسجل في سفارة ولا قنصلية جزائرية؛ ما يفوتش 55 سنة وقت الطلب؛ تخدم في الغربة أجير ولا مماثل ولا غير أجير؛ وما تكونش خاضع للانتساب الإجباري للضمان الاجتماعي." } },
        { cites: [VD, VX], text: {
          en: "Contributions: 31.25% of the declared base (13% health-maternity, 18.25% retirement), the base being at least three times the reference salary, paid in convertible currency each quarter within the month after the quarter. Late payment adds 15% per quarter and can mean losing rights for the unpaid period. The leaflet scan is partly unreadable, so check the decree in the Official Journal for exact terms.",
          fr: "Cotisations : 31,25 % de l'assiette déclarée (13 % maladie-maternité, 18,25 % retraite), l'assiette étant au moins égale à trois fois le salaire de référence, payées en devises convertibles chaque trimestre dans le mois suivant le trimestre. Un retard ajoute 15 % par trimestre et peut entraîner la perte des droits pour la période non payée. Le scan du dépliant est en partie illisible : vérifiez le décret au Journal officiel pour les termes exacts.",
          ar: "الاشتراكات: 31.25% من الوعاء المصرَّح به (13% للتأمين على المرض والأمومة و18.25% للتقاعد)، على ألا يقل الوعاء عن ثلاثة أضعاف الأجر المرجعي، وتُدفع بالعملة الصعبة كل ثلاثي خلال الشهر الموالي له. ويضيف التأخر 15% عن كل ثلاثي وقد يؤدي إلى فقدان الحقوق عن الفترة غير المدفوعة. والمسح الضوئي للمطوية غير مقروء جزئيًا، فتحقق من المرسوم في الجريدة الرسمية للأحكام الدقيقة.",
          dz: "الاشتراكات: 31.25% من الوعاء المصرح بيه (13% للمرض والأمومة و18.25% للتقاعد)، والوعاء ما ينقصش على ثلاث مرات الأجر المرجعي، وتخلصو بالدوفيز كل ثلاثي في الشهر لي يجي بعده. التأخر يزيد 15% على كل ثلاثي وممكن تضيع الحقوق على الفترة لي ما تخلصتش. السكانير تاع المطوية ما يتقراش مليح، شوف المرسوم في الجريدة الرسمية للتفاصيل الصحيحة." } },
        { cites: [VD, VX], text: {
          en: "Benefits: health and maternity benefits in kind, on condition that care is received in Algeria; the decree says benefits are paid in dinars and not outside the national territory. Retirement rights start at 65 with at least 15 years of contributions, calculated on the average of the last 10 years; up to 5 missing years can be bought with compensatory contributions. Survivors can get a pension, and if the member dies before retirement the heirs can ask for a refund of contributions within a five-year limit.",
          fr: "Prestations : prestations en nature maladie et maternité, à condition que les soins soient reçus en Algérie ; le décret précise que les prestations sont servies en dinars et pas hors du territoire national. Le droit à la retraite s'ouvre à 65 ans avec au moins 15 ans de cotisation, calculée sur la moyenne des 10 dernières années ; jusqu'à 5 années manquantes peuvent être validées par cotisation compensatoire. Les ayants droit peuvent obtenir une pension de réversion et, en cas de décès avant la retraite, demander le remboursement des cotisations dans la limite de cinq ans.",
          ar: "الأداءات: أداءات عينية للمرض والأمومة بشرط تلقي العلاج في الجزائر؛ ويذكر المرسوم أن الأداءات تُدفع بالدينار ولا تُدفع خارج التراب الوطني. ويُفتح الحق في التقاعد عند 65 سنة بشرط 15 سنة اشتراك على الأقل، ويُحسب على متوسط آخر 10 سنوات؛ ويمكن تسوية ما يصل إلى 5 سنوات ناقصة باشتراك تعويضي. ويمكن لذوي الحقوق الحصول على معاش المنحدرين، وفي حال الوفاة قبل التقاعد يمكنهم طلب استرجاع الاشتراكات في حدود خمس سنوات.",
          dz: "الخدمات: خدمات عينية للمرض والأمومة بشرط العلاج يكون في الدزاير؛ والمرسوم يقول الخدمات تتخلص بالدينار وما تتخلصش خارج التراب الوطني. حق التقاعد يبدا في 65 سنة مع 15 سنة اشتراك على الأقل، ويتحسب على معدل آخر 10 سنين؛ وحتى 5 سنين ناقصين تتسوى باشتراك تعويضي. ذوي الحقوق يقدرو ياخذو معاش المنحدرين، وإذا مات قبل التقاعد يقدرو يطلبو استرجاع الاشتراكات في حدود خمس سنين." } },
        { cites: [VA, VS], text: {
          en: "How to apply online (five steps): personal details; employment and residence; further information; upload PDF documents (max 2 MB each: birth certificate, passport, consular card, proof of professional activity); then create a tele-declaration account and choose the CNAS agency in charge of your file. You can track the request online with the request number and password you chose.",
          fr: "Demande en ligne (cinq étapes) : informations personnelles ; emploi et résidence ; informations complémentaires ; chargement de pièces PDF (2 Mo maximum chacune : acte de naissance, passeport, carte consulaire, justificatif d'activité) ; puis création d'un compte de télédéclaration et choix de l'agence CNAS chargée de votre dossier. La demande peut être suivie en ligne avec le numéro de demande et le mot de passe choisis.",
          ar: "طريقة التقديم عبر الإنترنت (خمس مراحل): المعلومات الشخصية؛ العمل والإقامة؛ معلومات إضافية؛ رفع الوثائق بصيغة PDF (2 ميغابايت كحد أقصى لكل ملف: شهادة الميلاد وجواز السفر والبطاقة القنصلية وإثبات النشاط المهني)؛ ثم إنشاء حساب للتصريح عن بعد واختيار وكالة كناص المكلفة بملفك. ويمكن متابعة الطلب عبر الإنترنت برقم الطلب وكلمة السر التي اخترتها.",
          dz: "كيفاش تقدم الطلب من الأنترنت (خمس مراحل): المعلومات الشخصية؛ الخدمة والإقامة؛ معلومات زيادة؛ تحمل الوراق PDF (2 ميغا أقصى لكل واحدة: شهادة الميلاد، الباسبور، الكارطة القنصلية، ورقة النشاط المهني)؛ ومن بعد تدير حساب التصريح عن بعد وتختار وكالة كناص لي تتكلف بملفك. تقدر تتبع الطلب من الأنترنت بنمرو الطلب وكلمة السر لي اخترتها." } },
      ],
    },
    {
      id: "employees",
      title: { en: "Employees (CNAS) and students", fr: "Salariés (CNAS) et étudiants", ar: "الأجراء (كناص) والطلبة", dz: "الأجراء (كناص) والطلبة" },
      points: [
        { cites: [PRES], text: {
          en: "CNAS is the national social insurance fund for salaried workers. It manages sickness, maternity, disability, death and work-accident/occupational-disease benefits, administers family allowances for the State and issues national registration numbers. Its beneficiaries include employees in all sectors, trainees, people with disabilities, pensioners, and their dependants (minor children, unmarried inactive daughters, dependent ascendants).",
          fr: "La CNAS est la caisse nationale des assurances sociales des travailleurs salariés. Elle gère les prestations maladie, maternité, invalidité, décès et accidents du travail/maladies professionnelles, administre les allocations familiales pour le compte de l'État et attribue les numéros d'immatriculation nationaux. Ses bénéficiaires comprennent les salariés de tous secteurs, les stagiaires de la formation, les personnes handicapées, les retraités et leurs ayants droit (enfants mineurs, filles célibataires sans activité, ascendants à charge).",
          ar: "كناص هو الصندوق الوطني للتأمينات الاجتماعية للعمال الأجراء. يسيّر أداءات المرض والأمومة والعجز والوفاة وحوادث العمل والأمراض المهنية، ويدير التعويضات العائلية لحساب الدولة ويمنح أرقام التسجيل الوطنية. ويستفيد منه الأجراء في كل القطاعات والمتربصون في التكوين المهني والأشخاص ذوو الإعاقة والمتقاعدون وذوو حقوقهم (الأبناء القُصّر والبنات العازبات غير العاملات والأصول المكفولون).",
          dz: "كناص هو الصندوق الوطني للتأمينات الاجتماعية للعمال الأجراء. يسير خدمات المرض، الأمومة، العجز، الوفاة وحوادث الخدمة والأمراض المهنية، ويدير التعويضات العائلية لحساب الدولة ويعطي أرقام التسجيل الوطنية. يستفيدو منه الأجراء في كل القطاعات، المتربصين في التكوين المهني، ذوي الإعاقة، المتقاعدين وذوي حقوقهم (الصغار، البنات العازبات لي ما يخدموش والأصول لي في كفالتهم)." } },
        { cites: [PRES], text: {
          en: "Rates listed by CNAS: healthcare and medicines covered at 80%, and at 100% in some cases, especially for chronic illness; sick-leave pay of 50% of salary for the first 15 days then 100% from day 16, up to three years; maternity benefits at 100% with 98 days of leave; disability pensions of at least 75% of the national guaranteed minimum wage.",
          fr: "Taux indiqués par la CNAS : soins et médicaments pris en charge à 80 %, et à 100 % dans certains cas, notamment les maladies chroniques ; indemnité de maladie de 50 % du salaire pendant les 15 premiers jours puis 100 % à partir du 16e jour, jusqu'à trois ans ; prestations de maternité à 100 % avec 98 jours de congé ; pensions d'invalidité d'au moins 75 % du SNMG.",
          ar: "النسب التي تذكرها كناص: تغطية العلاج والأدوية بنسبة 80%، و100% في بعض الحالات خاصة الأمراض المزمنة؛ تعويض المرض 50% من الأجر في أول 15 يومًا ثم 100% ابتداءً من اليوم 16 وإلى ثلاث سنوات؛ أداءات الأمومة بنسبة 100% مع 98 يومًا عطلة؛ معاشات العجز لا تقل عن 75% من الأجر الوطني الأدنى المضمون.",
          dz: "النسب لي تذكرها كناص: العلاج والدوا بنسبة 80%، و100% في بعض الحالات خاصة الأمراض المزمنة؛ تعويض المرض 50% من الراتب في أول 15 يوم ومن بعد 100% من اليوم 16 حتى ثلاث سنين؛ الأمومة 100% مع 98 يوم عطلة؛ معاش العجز ما ينقصش على 75% من الأجر الوطني الأدنى المضمون." } },
        { cites: [EH, EI, EN], text: {
          en: "El-Hanaa is the online space for CNAS insured people: reimbursement history, notifications, your information and your dependants', a mobile app, and verification of attestations. To create an account you enter your social-security number, name (French and Arabic), birth date, email and phone number. A separate online form issues a non-affiliation attestation (it asks for the national identification number, birth-certificate number, parents' names and contact details); the page does not say what the attestation is used for.",
          fr: "El-Hanaa est l'espace en ligne des assurés de la CNAS : historique des remboursements, notifications, informations personnelles et de vos ayants droit, application mobile et vérification d'attestations. Pour créer un compte, on saisit son numéro de sécurité sociale, nom et prénom (français et arabe), date de naissance, e-mail et téléphone. Un formulaire distinct permet d'obtenir une attestation de non-affiliation (il demande le NIN, le numéro d'acte de naissance, les noms des parents et les coordonnées) ; la page ne précise pas l'usage de l'attestation.",
          ar: "«الهناء» هو الفضاء الإلكتروني للمؤمَّن لهم لدى كناص: سجل التعويضات والإشعارات ومعلوماتك ومعلومات ذوي حقوقك وتطبيق للهاتف والتحقق من الشهادات. لإنشاء حساب تُدخل رقم الضمان الاجتماعي والاسم واللقب (بالفرنسية والعربية) وتاريخ الميلاد والبريد الإلكتروني والهاتف. وتتيح استمارة منفصلة الحصول على شهادة عدم الانتساب (تطلب رقم التعريف الوطني ورقم عقد الميلاد وأسماء الوالدين ومعلومات الاتصال)؛ ولا تذكر الصفحة فيمَ تُستعمل الشهادة.",
          dz: "الهناء هو الفضاء على الأنترنت تاع المؤمَّنين في كناص: سجل التعويضات، الإشعارات، معلوماتك ومعلومات ذوي حقوقك، تطبيق للتيليفون والتحقق من الشهادات. باش دير حساب تدخل نمرو الضمان الاجتماعي، الاسم واللقب (بالفرنسية والعربية)، تاريخ الميلاد، الإيميل والتيليفون. وفي استمارة أخرى تجبد شهادة عدم الانتساب (تطلب رقم التعريف الوطني، نمرو عقد الميلاد، أسماء الوالدين ومعلومات الاتصال)؛ والصفحة ما تقولش فاش تستعمل هاذ الشهادة." } },
        { cites: [TD], text: {
          en: "Employers use the CNAS tele-declaration portal to declare contribution bases, pay online, file the annual wage declaration and submit affiliation requests for new employees. The portal's two-factor login needs a phone number in Algeria, or an email address for people living abroad.",
          fr: "Les employeurs utilisent le portail de télédéclaration de la CNAS pour déclarer les assiettes de cotisations, payer en ligne, déposer la déclaration annuelle des salaires et soumettre les demandes d'affiliation de nouveaux salariés. La double authentification du portail demande un numéro de téléphone en Algérie ou une adresse e-mail pour les personnes résidant à l'étranger.",
          ar: "يستعمل أصحاب العمل بوابة التصريح عن بعد لدى كناص للتصريح بأوعية الاشتراكات والدفع عبر الإنترنت وإيداع التصريح السنوي بالأجور وتقديم طلبات انتساب الأجراء الجدد. وتتطلب المصادقة الثنائية للبوابة رقم هاتف في الجزائر أو بريدًا إلكترونيًا للمقيمين بالخارج.",
          dz: "أرباب العمل يستعملو بوابة التصريح عن بعد تاع كناص باش يصرحو بأوعية الاشتراكات، يخلصو من الأنترنت، يودعو التصريح السنوي بالأجور ويقدمو طلبات انتساب الأجراء الجداد. الدخول بخطوتين يطلب نمرو تيليفون في الدزاير ولا إيميل للي ساكنين في الغربة." } },
        { cites: [STU], text: {
          en: "Students: enrolling at university allows registration as an insured person with CNAS. The CNAS student sheet asks for form SECU01, an ID copy, a photo, a blood-group card copy, a birth extract (no. 12) and the university enrolment slip; the CHIFA card is collected at the pay centre where the university is. Students provide a school certificate each academic year.",
          fr: "Étudiants : l'inscription à l'université permet de devenir assuré social auprès de la CNAS. La fiche CNAS pour étudiants demande le formulaire SECU01, une photocopie de la carte d'identité, une photo, une copie de la carte de groupe sanguin, un extrait d'acte de naissance (n° 12) et le bulletin d'inscription universitaire ; la carte CHIFA se retire au centre payeur de la localité de l'établissement. L'étudiant fournit un certificat de scolarité à chaque année universitaire.",
          ar: "الطلبة: يتيح التسجيل في الجامعة الاكتساب صفة المؤمَّن له لدى كناص. وتطلب وثيقة كناص الخاصة بالطلبة استمارة SECU01 ونسخة من بطاقة الهوية وصورة ونسخة من بطاقة فصيلة الدم ومستخرج ميلاد (رقم 12) وشهادة التسجيل الجامعي؛ وتُسحب بطاقة الشفاء من مركز الدفع في منطقة المؤسسة الجامعية. ويقدّم الطالب شهادة مدرسية في بداية كل سنة جامعية.",
          dz: "الطلبة: التسجيل في الجامعة يخليك تولي مؤمَّن عند كناص. ورقة كناص تاع الطلبة تطلب استمارة SECU01، نسخة من كارط ديدونتيتي، تصويرة، نسخة من كارطة الزمرة الدموية، مستخرج ميلاد (نمرو 12) وشهادة التسجيل في الجامعة؛ وكارطة الشفاء تجبدها من مركز الدفع في البلاصة تاع الجامعة. والطالب يجيب شهادة مدرسية كل عام جامعي." } },
      ],
    },
    {
      id: "allowances",
      title: { en: "Family allowances and maternity (CNAS)", fr: "Allocations familiales et maternité (CNAS)", ar: "التعويضات العائلية والأمومة (كناص)", dz: "التعويضات العائلية والأمومة (كناص)" },
      points: [
        { cites: [FAM], text: {
          en: "Family allowances are claimed for children through an adult meeting the conditions, generally up to age 17, and up to 21 for apprentices on low pay, students, and children unable to work or study because of disability or chronic illness. CNAS lists 600 DA per child per month for the 1st to 5th child (300 DA from the 6th) where salary is 15,000 DA or less, and 300 DA per child above that; the school allowance is 800 DA (400 DA from the 6th child) once a year at that salary level. Documents: a form completed by the employer, a family civil-status sheet and a crossed cheque.",
          fr: "Les allocations familiales sont demandées pour les enfants par un adulte remplissant les conditions, en général jusqu'à 17 ans, et jusqu'à 21 ans pour les apprentis à faible rémunération, les élèves et étudiants, et les enfants empêchés de travailler ou d'étudier par un handicap ou une maladie chronique. La CNAS indique 600 DA par enfant et par mois du 1er au 5e enfant (300 DA à partir du 6e) quand le salaire est de 15 000 DA ou moins, et 300 DA par enfant au-delà ; l'allocation scolaire est de 800 DA (400 DA à partir du 6e enfant) une fois par an pour ce niveau de salaire. Pièces : formulaire rempli par l'employeur, fiche familiale d'état civil et chèque barré.",
          ar: "تُطلب التعويضات العائلية للأطفال عبر شخص بالغ يستوفي الشروط، وعمومًا حتى سن 17، وحتى 21 للمتمهنين ذوي الأجر المنخفض والتلاميذ والطلبة والأطفال العاجزين عن العمل أو الدراسة بسبب إعاقة أو مرض مزمن. وتذكر كناص 600 دج عن كل طفل شهريًا للطفل الأول إلى الخامس (300 دج ابتداءً من السادس) إذا كان الأجر 15,000 دج أو أقل، و300 دج عن كل طفل فوق ذلك؛ ومنحة التمدرس 800 دج (400 دج ابتداءً من الطفل السادس) مرة في السنة لهذا المستوى من الأجر. الوثائق: استمارة يملؤها المستخدم، وبطاقة عائلية للحالة المدنية وشيك مسطّر.",
          dz: "التعويضات العائلية تتطلب للصغار عن طريق كبير يستوفي الشروط، عموما حتى 17 سنة، وحتى 21 للمتمهنين بأجر قليل، التلاميذ والطلبة، والصغار لي ما يقدروش يخدمو ولا يقراو بسبب إعاقة ولا مرض مزمن. كناص تذكر 600 دج على كل صغير في الشهر من الأول للخامس (300 دج من السادس) إذا الراتب 15,000 دج ولا أقل، و300 دج على كل صغير فوق هذا؛ ومنحة المدرسة 800 دج (400 دج من السادس) مرة في العام لهاذ المستوى من الراتب. الوراق: استمارة يعمرها المستخدم، فيش عائلية للحالة المدنية وشيك مسطّر." } },
        { cites: [MAT], text: {
          en: "Maternity insurance for employees: in-kind benefits at 100% and replacement of lost salary during leave. The CNAS page is inconsistent on duration (14 weeks / 98 days in one place, 21 weeks / 150 days in the payment section). Cash benefits need at least 15 days of work in the 3 months, or 60 days in the 12 months, before the first medical confirmation of pregnancy. Full coverage needs the pregnancy declared at least 6 months before the expected delivery date and prenatal and postnatal certificates filed on time; missing deadlines reduces benefits by 20%, except in force majeure.",
          fr: "Assurance maternité des salariées : prestations en nature à 100 % et remplacement du salaire perdu pendant le congé. La page de la CNAS est incohérente sur la durée (14 semaines / 98 jours à un endroit, 21 semaines / 150 jours dans la section paiement). Les prestations en espèces exigent au moins 15 jours de travail dans les 3 mois, ou 60 jours dans les 12 mois, précédant la première constatation médicale de la grossesse. La couverture complète exige de déclarer la grossesse au moins 6 mois avant la date prévue d'accouchement et de déposer à temps les certificats prénataux et postnataux ; le non-respect des délais réduit les prestations de 20 %, sauf force majeure.",
          ar: "التأمين على الأمومة للأجيرات: أداءات عينية بنسبة 100% وتعويض الأجر المفقود خلال العطلة. وصفحة كناص غير متسقة بشأن المدة (14 أسبوعًا / 98 يومًا في موضع و21 أسبوعًا / 150 يومًا في قسم الدفع). وتتطلب الأداءات النقدية 15 يوم عمل على الأقل خلال الأشهر الثلاثة، أو 60 يومًا خلال الأشهر الاثني عشر، السابقة للمعاينة الطبية الأولى للحمل. وتتطلب التغطية الكاملة التصريح بالحمل قبل 6 أشهر على الأقل من تاريخ الولادة المتوقع وإيداع شهادات الفحص قبل الولادة وبعدها في آجالها؛ وعدم احترام الآجال يخفّض الأداءات بنسبة 20% إلا في حالة القوة القاهرة.",
          dz: "تأمين الأمومة للأجيرات: خدمات عينية 100% وتعويض الراتب المضيّع في العطلة. صفحة كناص ما هيش متفقة على المدة (14 أسبوع / 98 يوم في بلاصة و21 أسبوع / 150 يوم في قسم الخلاص). التعويض النقدي يطلب على الأقل 15 يوم خدمة في 3 شهور، ولا 60 يوم في 12 شهر، قبل أول معاينة طبية للحمل. التغطية الكاملة تطلب تصرح بالحمل 6 شهور على الأقل قبل تاريخ الولادة المنتظر وتودع شهادات الفحص قبل الولادة وبعدها في وقتها؛ وإذا فاتت الآجال تنقص الخدمات بـ20% غير في حالة القوة القاهرة." } },
      ],
    },
    {
      id: "casnos",
      title: { en: "Self-employed (CASNOS)", fr: "Non-salariés (CASNOS)", ar: "غير الأجراء (كاسنوس)", dz: "غير الأجراء (كاسنوس)" },
      points: [
        { cites: [CA], text: {
          en: "CASNOS asks self-employed people to file with the CASNOS agency or branch for their place of activity within 10 days of starting. Documents: traders, a certified copy of the commercial register; liberal professions, the practice approval; artisans, the card or attestation from the crafts chamber register; farmers, the wali's order or title deed and/or the agriculture chamber registration; all non-salaried activities also need the certificate of existence from the tax office. Late declaration brings a 5,000 DA penalty, increasing 20% for each extra month.",
          fr: "La CASNOS demande aux non-salariés de déposer leur dossier auprès de l'agence ou antenne CASNOS de leur lieu d'activité dans les 10 jours suivant le début de l'activité. Pièces : commerçants, photocopie légalisée du registre de commerce ; professions libérales, copie de l'agrément ; artisans, carte ou attestation d'immatriculation au registre de la chambre de l'artisanat ; agriculteurs, copie de l'arrêté du wali ou acte de propriété et/ou attestation d'immatriculation à la chambre d'agriculture ; toutes les activités non salariées fournissent aussi le certificat d'existence délivré par les impôts. Un retard de déclaration entraîne une pénalité de 5 000 DA, majorée de 20 % par mois de retard supplémentaire.",
          ar: "تطلب كاسنوس من غير الأجراء إيداع ملفهم لدى وكالة أو ملحقة كاسنوس التابعة لمكان نشاطهم خلال 10 أيام من بدء النشاط. الوثائق: التجار، نسخة مصادق عليها من السجل التجاري؛ المهن الحرة، نسخة من اعتماد المهنة؛ الحرفيون، بطاقة أو شهادة التسجيل في سجل غرفة الصناعة التقليدية والحرف؛ الفلاحون، نسخة من قرار الوالي أو عقد الملكية و/أو شهادة التسجيل في سجل غرفة الفلاحة؛ وتقدّم كل الأنشطة غير الأجيرة شهادة الوجود التي تسلمها مصالح الضرائب. ويترتب على التأخر في التصريح غرامة 5,000 دج تزداد بـ20% عن كل شهر تأخير إضافي.",
          dz: "كاسنوس تطلب من غير الأجراء يودعو الملف في وكالة ولا ملحقة كاسنوس تاع بلاصة النشاط في 10 أيام من بداية النشاط. الوراق: التجار، نسخة مصادق عليها من السجل التجاري؛ المهن الحرة، نسخة من اعتماد المهنة؛ الحرفيين، كارطة ولا شهادة التسجيل في سجل غرفة الصناعة التقليدية؛ الفلاحين، نسخة من قرار الوالي ولا عقد الملكية و/ولا شهادة التسجيل في غرفة الفلاحة؛ وكل الأنشطة غير الأجيرة تجيب شهادة الوجود من مصلحة الضرائب. التأخر في التصريح فيه غرامة 5,000 دج وتزيد بـ20% على كل شهر زيادة." } },
        { cites: [CC], text: {
          en: "CASNOS's page (archived copy from March 2023, so the amounts may have changed; check with CASNOS before paying) says: contribution is 15% of the annual contribution base, with a base between 216,000 DA and 4,320,000 DA, so a minimum of 32,400 DA and a maximum of 648,000 DA a year. It falls due on 1 January and must be paid between 1 January and 30 June; late payment adds a surcharge. For a first activity created that year, the minimum applies.",
          fr: "Selon la page de la CASNOS (copie archivée de mars 2023 : les montants ont pu changer, vérifiez auprès de la CASNOS avant de payer), la cotisation est de 15 % de l'assiette annuelle, avec une assiette comprise entre 216 000 DA et 4 320 000 DA, soit un minimum de 32 400 DA et un maximum de 648 000 DA par an. Elle est exigible le 1er janvier et doit être payée entre le 1er janvier et le 30 juin ; un retard entraîne une majoration. Pour une première activité créée dans l'année, le minimum s'applique.",
          ar: "حسب صفحة كاسنوس (نسخة مؤرشفة من مارس 2023، فقد تكون المبالغ تغيّرت؛ تحقّق لدى كاسنوس قبل الدفع): الاشتراك 15% من وعاء الاشتراك السنوي، على أن يتراوح الوعاء بين 216,000 دج و4,320,000 دج، أي حد أدنى 32,400 دج وحد أقصى 648,000 دج في السنة. ويستحق في 1 جانفي ويجب دفعه بين 1 جانفي و30 جوان؛ ويترتب على التأخر زيادة. وفي حالة أول نشاط أُنشئ في السنة يُطبَّق الحد الأدنى.",
          dz: "حسب الصفحة تاع كاسنوس (نسخة مأرشفة من مارس 2023، يمكن المبالغ تبدّلو؛ تأكد عند كاسنوس قبل ما تخلّص): الاشتراك 15% من الوعاء السنوي، والوعاء بين 216,000 دج و4,320,000 دج، يعني الأدنى 32,400 دج والأقصى 648,000 دج في العام. يستحق في 1 جانفي ولازم يتخلص بين 1 جانفي و30 جوان؛ والتأخر فيه زيادة. وإذا كان أول نشاط تدار في العام يطبقو الحد الأدنى." } },
        { cites: [CA], text: {
          en: "Scheduled payment of debts remains available: the first instalment cannot be below the minimum contribution for the current year, later instalments cannot be below 6,000 DA, and the schedule lasts at most 18 months; missing the schedule leads to forced recovery.",
          fr: "Le paiement échelonné des dettes reste possible : la première échéance ne peut être inférieure à la cotisation minimum de l'année en cours, les suivantes à 6 000 DA, et la durée maximale est de 18 mois ; le non-respect de l'échéancier entraîne le recouvrement forcé.",
          ar: "يظل التسديد بالتقسيط للديون متاحًا: لا يقل القسط الأول عن الاشتراك الأدنى للسنة الجارية، ولا تقل الأقساط اللاحقة عن 6,000 دج، وأقصى مدة للجدول 18 شهرًا؛ وعدم احترام الجدول يؤدي إلى التحصيل الجبري.",
          dz: "الخلاص بالتقسيط تاع الديون باقي: القسط الأول ما ينقصش على الاشتراك الأدنى تاع العام، والأقساط الجاية ما تنقصش على 6,000 دج، والمدة القصوى 18 شهر؛ وإذا ما احترمتش الجدول يديرو التحصيل الإجباري." } },
        { cites: [CP], text: {
          en: "CASNOS says the insured person (or dependants) pays for care first, then claims reimbursement from the fund. Health insurance reimbursement rates are 80% or 100%; 100% applies, for example, to listed long-term conditions, blood products, contraception and acts of coefficient K50 or more.",
          fr: "La CASNOS indique que l'assuré (ou ses ayants droit) règle d'abord les soins puis demande le remboursement à la caisse. Les taux de remboursement de l'assurance maladie sont de 80 % ou 100 % ; 100 % s'applique par exemple aux affections de longue durée listées, aux produits sanguins, à la contraception et aux actes de coefficient K50 ou plus.",
          ar: "تذكر كاسنوس أن المؤمَّن له (أو ذوي حقوقه) يدفع نفقات العلاج أولًا ثم يطلب التعويض من الصندوق. وتبلغ نسب تعويض التأمين على المرض 80% أو 100%؛ وتُطبَّق نسبة 100% مثلًا على الأمراض الطويلة المدى المدرجة ومشتقات الدم ومنع الحمل والأعمال ذات المعامل K50 فأكثر.",
          dz: "كاسنوس تقول المؤمَّن (ولا ذوي حقوقه) يخلص العلاج الأول ومن بعد يطلب التعويض من الصندوق. نسب التعويض 80% ولا 100%؛ و100% تتطبق مثلا على الأمراض الطويلة المدى لي في اللايست، منتجات الدم، منع الحمل والأعمال لي معاملها K50 وفوق." } },
      ],
    },
  ] as GuideSection[],
  fees: [] as FeeRow[],
};
