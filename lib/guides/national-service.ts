import type { Locale } from "@/lib/i18n";
import type { GuidePoint, GuideSection, FeeRow } from "./passport";

/**
 * National service for Algerians abroad: census, deferment (sursis),
 * exemption (dispense), plus the Ministry of National Defence rules for people
 * in Algeria. EVERY point is a restatement of what the cited data/corpus.json
 * records say (ids in `cites`). Nothing here comes from outside knowledge.
 * Dates, ages and documents differ by consulate and by year, so each point
 * names its office. If the corpus changes, review this file.
 */

type L = Record<Locale, string>;
export type { GuidePoint, GuideSection, FeeRow };

const MDN = "mdn.dz-national-service-reserve-obligations";
const MDO = "mdn.dz-national-service-organisation-offices";
const PC = "cgparis-mfa-gov-dz-fr-consular-services-censusregularization";
const PD = "cgparis-mfa-gov-dz-fr-consular-services-request-or-renewal-of-defermen";
const PTE = "cpontoise-mfa-gov-dz-fr-consular-services-exemption-procedure";
const NN = "consulat-nantes-algerie-fr-demande-ou-renouvellement-de-sursis";
const LC = "cglondon.mfa.gov.dz-censusregularization";
const LE = "cglondon.mfa.gov.dz-exemption-procedure";
const LU = "algerian-consulate-org-uk-consulaire-national-service";
const SFC = "cgsf-military-census";
const SFD = "cgsf-military-deferment";
const NY = "cgny-national-service";
const OTT = "www-embassyalgeria-ca-servicenational";
const RY = "embriyadh.mfa.gov.dz-national-military-service";

export const GUIDE = {
  title: {
    en: "National service for Algerians abroad",
    fr: "Service national pour les Algériens de l'étranger",
    ar: "الخدمة الوطنية للجزائريين بالخارج",
    dz: "الخدمة الوطنية للجزائريين في الغربة",
  } as L,
  lead: {
    en: "What official pages say about the census, deferment (sursis) and exemption (dispense). Ages, dates and documents differ by consulate and by year, so check your own office's current notice.",
    fr: "Ce que disent les pages officielles sur le recensement, le sursis et la dispense. Les âges, dates et pièces varient selon le consulat et l'année : consultez l'avis actuel de votre poste.",
    ar: "ما تذكره الصفحات الرسمية عن الإحصاء والتأجيل (الإرجاء) والإعفاء. تختلف الأعمار والتواريخ والوثائق من قنصلية إلى أخرى ومن سنة إلى أخرى، فراجع إعلان ممثليتك الحالي.",
    dz: "واش تقول الصفحات الرسمية على الإحصاء (ريسانسمون)، التأجيل (السورسي) والإعفاء (الدّيسبونس). الأعمار والتواريخ والوراق تختلف من قنصلية لقنصلية ومن عام لعام، شوف الإعلان الحالي تاع قنصليتك.",
  } as L,
  portals: [
    { url: "https://www.mdn.dz/", label: { en: "Ministry of National Defence", fr: "Ministère de la Défense nationale", ar: "وزارة الدفاع الوطني", dz: "وزارة الدفاع الوطني" } as L },
    { url: "https://www.mdn.dz/site_principal/sommaire/service/reserve_an.php", label: { en: "National service: military obligations (MDN)", fr: "Service national : obligations militaires (MDN)", ar: "الخدمة الوطنية: الواجبات العسكرية (وزارة الدفاع)", dz: "الخدمة الوطنية: الواجبات العسكرية (وزارة الدفاع)" } as L },
  ],
  sections: [
    {
      id: "rule",
      title: { en: "The obligation and who handles it", fr: "L'obligation et qui s'en occupe", ar: "الواجب والجهة المكلّفة به", dz: "الواجب وشكون يتكلف بيه" },
      points: [
        { cites: [MDN], text: {
          en: "The Ministry of National Defence says that under Ordinance 76-110 national service lasts 12 months for citizens over 19, followed by availability (5 years), first reserve (10 years) and second reserve (10 years).",
          fr: "Le ministère de la Défense nationale indique qu'en vertu de l'ordonnance 76-110, le service national dure 12 mois pour les citoyens de plus de 19 ans, suivi de la disponibilité (5 ans), de la première réserve (10 ans) et de la deuxième réserve (10 ans).",
          ar: "تذكر وزارة الدفاع الوطني أنه بموجب الأمر 76-110 تدوم الخدمة الوطنية 12 شهرًا للمواطنين فوق 19 سنة، ثم فترة الاستعداد (5 سنوات) والاحتياط الأول (10 سنوات) والاحتياط الثاني (10 سنوات).",
          dz: "وزارة الدفاع الوطني تقول حسب الأمر 76-110 الخدمة الوطنية 12 شهر للمواطنين فوق 19 سنة، ومن بعد الاستعداد (5 سنين)، الاحتياط الأول (10 سنين) والاحتياط الثاني (10 سنين)." } },
        { cites: [PC, LU], text: {
          en: "Paris and London also describe national service as compulsory from 19 and require citizens abroad to be entered on the census at their mission.",
          fr: "Paris et Londres décrivent aussi le service national comme obligatoire à partir de 19 ans et exigent que les citoyens à l'étranger soient inscrits au recensement de leur poste.",
          ar: "تصف قنصليتا باريس ولندن الخدمة الوطنية بأنها إجبارية ابتداءً من 19 سنة وتشترطان تسجيل المواطنين بالخارج في قوائم الإحصاء لدى ممثليتهم.",
          dz: "باريس ولندن يقولو حتى هما الخدمة الوطنية إجبارية من 19 سنة ولازم المواطنين في الغربة يتسجلو في الإحصاء تاع ممثليتهم." } },
        { cites: [MDO], text: {
          en: "The Ministry of National Defence says that abroad, the national service is handled by the diplomatic or consular representations.",
          fr: "Le ministère de la Défense nationale indique qu'à l'étranger, le service national est géré par les représentations diplomatiques ou consulaires.",
          ar: "تذكر وزارة الدفاع الوطني أنه في الخارج تتولى التمثيليات الدبلوماسية أو القنصلية تسيير الخدمة الوطنية.",
          dz: "وزارة الدفاع الوطني تقول في الغربة السفارات والقنصليات هي لي تسير الخدمة الوطنية." } },
        { cites: [RY], text: {
          en: "Riyadh says census, deferment and exemption requests go to the consular authority, which forwards them to the competent authorities in Algeria, and applicants are told when answers arrive.",
          fr: "Riyad précise que les demandes de recensement, de sursis et de dispense sont remises à l'autorité consulaire, qui les transmet aux autorités compétentes en Algérie, et que les intéressés sont avisés à l'arrivée des réponses.",
          ar: "تذكر سفارة الرياض أن طلبات الإحصاء والتأجيل والإعفاء تُقدَّم إلى السلطة القنصلية التي تحيلها إلى السلطات المختصة في الجزائر، ويُبلَّغ المعنيون عند وصول الردود.",
          dz: "الرياض تقول طلبات الإحصاء، التأجيل والإعفاء تتقدم للسلطة القنصلية وهي تبعثها للسلطات المختصة في الدزاير، والمعنيين يتعلمو كي توصل الردود." } },
        { cites: [PC, LE], text: {
          en: "Paris and London both cite the Algerian-French agreement of 11 October 1983: Paris says it lets dual nationals choose to serve in Algeria or in France, and London says dual nationals can seek exemption with a \"Déclaration d'Option\" and a \"Certificat des Services\" issued by the French military authorities.",
          fr: "Paris et Londres citent toutes deux l'accord algéro-français du 11 octobre 1983 : Paris indique qu'il laisse aux binationaux le choix d'effectuer le service en Algérie ou en France, et Londres que les binationaux peuvent demander la dispense avec la « Déclaration d'Option » et le « Certificat des Services » délivrés par les autorités militaires françaises.",
          ar: "تشير قنصليتا باريس ولندن إلى الاتفاق الجزائري الفرنسي المؤرخ في 11 أكتوبر 1983: تذكر باريس أنه يترك لمزدوجي الجنسية اختيار أداء الخدمة في الجزائر أو في فرنسا، وتذكر لندن أنه يمكن لمزدوجي الجنسية طلب الإعفاء بتقديم «تصريح الاختيار» و«شهادة الخدمات» الصادرين عن السلطات العسكرية الفرنسية.",
          dz: "باريس ولندن يذكرو الاتفاق الجزائري الفرنسي تاع 11 أكتوبر 1983: باريس تقول يخلي مزدوجي الجنسية يختارو يديرو الخدمة في الدزاير ولا في فرنسا، ولندن تقول مزدوجي الجنسية يقدرو يطلبو الإعفاء بـ«Déclaration d'Option» و«Certificat des Services» لي تخرجهم السلطات العسكرية الفرنسية." } },
      ],
    },
    {
      id: "census",
      title: { en: "Census (recensement)", fr: "Recensement", ar: "الإحصاء (الإحصاء العسكري)", dz: "الإحصاء (ريسانسمون)" },
      points: [
        { cites: [PC, LC, NY, SFC, OTT], text: {
          en: "Age and dates differ by office. Paris: citizens who have completed 17 in its district, census open 2 January to 30 September every year. London: Algerians who turn 17 and are registered with the consulate; New York: young people aged 17 or older registered with it. San Francisco: its page for the class of 2029 (born in 2009) set a deadline of 1 October 2026. Ottawa: citizens who have completed 18, during the periods it announces on its site.",
          fr: "L'âge et les dates varient selon le poste. Paris : citoyens ayant 17 ans révolus dans sa circonscription, recensement du 2 janvier au 30 septembre de chaque année. Londres : Algériens atteignant 17 ans et immatriculés au consulat ; New York : jeunes de 17 ans ou plus immatriculés au consulat. San Francisco : sa page pour la classe 2029 (nés en 2009) fixait une échéance au 1er octobre 2026. Ottawa : citoyens ayant 18 ans révolus, pendant les périodes annoncées sur son site.",
          ar: "يختلف السن والتواريخ حسب الممثلية. باريس: المواطنون الذين أتمّوا 17 سنة في دائرتها، والإحصاء مفتوح من 2 جانفي إلى 30 سبتمبر من كل سنة. لندن: الجزائريون الذين يبلغون 17 سنة والمسجَّلون لدى القنصلية؛ نيويورك: الشباب من 17 سنة فما فوق المسجَّلون لديها. سان فرانسيسكو: حددت صفحتها لدفعة 2029 (المولودين سنة 2009) أجلًا هو 1 أكتوبر 2026. أوتاوا: المواطنون الذين أتمّوا 18 سنة، خلال الفترات التي تعلنها على موقعها.",
          dz: "السن والتواريخ تختلف على حسب القنصلية. باريس: لي كملو 17 سنة في دائرتها، والإحصاء مفتوح من 2 جانفي حتى 30 سبتمبر كل عام. لندن: لي يوصلو 17 سنة ومتسجلين في القنصلية؛ نيويورك: الشباب من 17 سنة وفوق لي متسجلين فيها. سان فرانسيسكو: صفحتها لدفعة 2029 (مزدادين في 2009) حددت آخر أجل 1 أكتوبر 2026. أوتاوا: لي كملو 18 سنة، في الفترات لي تعلنها في الموقع تاعها." } },
        { cites: [LC, NY, OTT], text: {
          en: "London and New York warn that failing to enrol can mean losing the right to exemption, deferment and deferral of incorporation; New York adds that people who missed the census period are listed automatically as the law provides. Ottawa says census and regularisation files must be sent during the open periods and recommends checking its website for the dates.",
          fr: "Londres et New York préviennent que l'absence de recensement peut entraîner la perte du droit à la dispense, au sursis et au report d'incorporation ; New York ajoute que ceux qui ont manqué la période sont recensés d'office selon la loi. Ottawa précise que les dossiers de recensement et de régularisation doivent être transmis pendant les périodes d'ouverture et recommande de consulter son site pour les dates.",
          ar: "تحذّر لندن ونيويورك من أن عدم التسجيل في الإحصاء قد يُفقد الحق في الإعفاء والتأجيل وإرجاء الإدماج؛ وتضيف نيويورك أن من فاتته فترة الإحصاء يُسجَّل تلقائيًا وفق القانون. وتذكر أوتاوا أن ملفات الإحصاء والتسوية يجب إرسالها خلال فترات الفتح وتنصح بمراجعة موقعها لمعرفة التواريخ.",
          dz: "لندن ونيويورك يحذرو لي ما يتسجلش في الإحصاء ممكن يضيع حقه في الإعفاء، التأجيل وتأجيل الإدماج؛ ونيويورك تزيد لي فاتتو فترة الإحصاء يتسجل أوتوماتيك حسب القانون. أوتاوا تقول ملفات الإحصاء والتسوية لازم تتبعث في الفترات المفتوحة وتنصح تشوف الموقع للتواريخ." } },
        { cites: [SFC, NY, LU], text: {
          en: "Census documents. San Francisco: enrolment form completed on screen and hand-signed by the legal guardian, one original Algerian birth certificate, two recent photos, a copy of the guardian's consular card and a stamped return envelope for the census certificate. New York: the same form, birth certificate and envelope. London: birth certificate, a copy of the guardian's consular card and two photos; a census certificate is issued, and if the young person is absent the legal guardian registers them.",
          fr: "Pièces du recensement. San Francisco : formulaire d'enrôlement rempli à l'écran et signé à la main par le tuteur légal, un acte de naissance algérien original, deux photos récentes, copie de la carte consulaire du tuteur et enveloppe retour affranchie pour le certificat de recensement. New York : le même formulaire, l'acte de naissance et l'enveloppe. Londres : acte de naissance, copie de la carte consulaire du tuteur et deux photos ; un certificat de recensement est délivré, et en cas d'absence du jeune c'est le tuteur légal qui l'inscrit.",
          ar: "وثائق الإحصاء. سان فرانسيسكو: استمارة التسجيل تُملأ إلكترونيًا ويوقّعها الولي الشرعي بخط يده، وشهادة ميلاد جزائرية أصلية، وصورتان حديثتان، ونسخة من البطاقة القنصلية للولي، وظرف إرجاع بطابع لشهادة الإحصاء. نيويورك: الاستمارة نفسها وشهادة الميلاد والظرف. لندن: شهادة الميلاد ونسخة من البطاقة القنصلية للولي وصورتان؛ وتُسلَّم شهادة إحصاء، وفي حال غياب الشاب يسجّله وليّه الشرعي.",
          dz: "وراق الإحصاء. سان فرانسيسكو: استمارة التسجيل تتعمر على الكمبيوتر ويمضيها الولي الشرعي بيده، شهادة ميلاد جزائرية أصلية، تصويرتين جداد، نسخة من الكارطة القنصلية تاع الولي وظرف رجوع بالطابع لشهادة الإحصاء. نيويورك: نفس الاستمارة وشهادة الميلاد والظرف. لندن: شهادة الميلاد، نسخة من الكارطة القنصلية تاع الولي وتصويرتين؛ تتعطى شهادة إحصاء، وإذا الشاب غايب وليه الشرعي هو لي يسجلو." } },
        { cites: [OTT, PC], text: {
          en: "Ottawa: a birth certificate, two recent identical photos, a school certificate and a copy of the consular card of the person or legal guardian. Paris, for people born in Algeria without French nationality: signed form, full birth certificate, copy of the Algerian ID, a copy of the consular card (mandatory at 19) or the guardian's, a copy of the residence permit, an original school certificate or proof of activity, and four photos. Paris has a different list for people with French nationality.",
          fr: "Ottawa : un acte de naissance, deux photos récentes identiques, un certificat de scolarité et une copie de la carte consulaire de l'intéressé ou du tuteur légal. Paris, pour les personnes nées en Algérie sans nationalité française : formulaire signé, copie intégrale de l'acte de naissance, copie de la carte d'identité algérienne, copie de la carte consulaire (obligatoire à 19 ans) ou celle du tuteur, copie du titre de séjour, certificat de scolarité original ou justificatif d'activité, et quatre photos. Paris a une liste différente pour les personnes ayant la nationalité française.",
          ar: "أوتاوا: شهادة ميلاد، وصورتان حديثتان متطابقتان، وشهادة مدرسية، ونسخة من البطاقة القنصلية للمعني أو لوليّه الشرعي. باريس، بالنسبة للمولودين في الجزائر غير الحاملين للجنسية الفرنسية: استمارة موقَّعة، ونسخة كاملة من شهادة الميلاد، ونسخة من بطاقة الهوية الجزائرية، ونسخة من البطاقة القنصلية (إلزامية عند 19 سنة) أو بطاقة الولي، ونسخة من بطاقة الإقامة، وشهادة مدرسية أصلية أو ما يثبت النشاط، وأربع صور. ولباريس قائمة مختلفة لحاملي الجنسية الفرنسية.",
          dz: "أوتاوا: شهادة ميلاد، تصويرتين جداد كيف كيف، شهادة مدرسية ونسخة من الكارطة القنصلية تاع المعني ولا الولي. باريس، للمزدادين في الدزاير لي ما عندهمش الجنسية الفرنسية: استمارة ممضية، نسخة كاملة من شهادة الميلاد، نسخة من كارط ديدونتيتي الجزائرية، نسخة من الكارطة القنصلية (إجبارية في 19 سنة) ولا تاع الولي، نسخة من كارطة الإقامة، شهادة مدرسية أصلية ولا ورقة النشاط، وأربع تصاور. وباريس عندها لايست أخرى للي عندهم الجنسية الفرنسية." } },
      ],
    },
    {
      id: "deferment",
      title: { en: "Deferment (sursis)", fr: "Sursis", ar: "التأجيل (الإرجاء)", dz: "التأجيل (السورسي)" },
      points: [
        { cites: [LC], text: {
          en: "London: deferment is open to citizens aged 19 or older, covers the whole period of study and is renewed each year until studies end or stop. First application: signed form, original birth certificate (not an S12 extract), current-year school enrolment certificate, copy of the consular card, four photos and proof of UK residence. Extension: signed form, copy of the consular card, the previous deferment certificate and the current-year enrolment certificate. Apply at the start of each academic year.",
          fr: "Londres : le sursis est ouvert aux citoyens de 19 ans et plus, couvre toute la durée des études et se renouvelle chaque année jusqu'à la fin ou l'arrêt des études. Première demande : formulaire signé, acte de naissance original (pas un extrait S12), certificat de scolarité de l'année en cours, copie de la carte consulaire, quatre photos et preuve de résidence au Royaume-Uni. Prolongation : formulaire signé, copie de la carte consulaire, certificat de sursis précédent et certificat de scolarité de l'année en cours. À déposer au début de chaque année universitaire.",
          ar: "لندن: التأجيل مفتوح للمواطنين من 19 سنة فما فوق، ويغطي مدة الدراسة كاملة ويُجدَّد سنويًا حتى انتهاء الدراسة أو توقفها. الطلب الأول: استمارة موقَّعة، وشهادة ميلاد أصلية (وليس مستخرج S12)، وشهادة مدرسية للسنة الجارية، ونسخة من البطاقة القنصلية، وأربع صور، وإثبات الإقامة في المملكة المتحدة. التمديد: استمارة موقَّعة، ونسخة من البطاقة القنصلية، وشهادة التأجيل السابقة، وشهادة مدرسية للسنة الجارية. وتُقدَّم الطلبات في بداية كل سنة دراسية.",
          dz: "لندن: التأجيل لمن عمره 19 سنة وفوق، يغطي مدة القراية كاملة ويتجدد كل عام حتى تخلص القراية ولا توقف. الطلب الأول: استمارة ممضية، شهادة ميلاد أصلية (ماشي مستخرج S12)، شهادة مدرسية تاع العام الجاري، نسخة من الكارطة القنصلية، أربع تصاور وورقة الإقامة في بريطانيا. التمديد: استمارة ممضية، نسخة من الكارطة القنصلية، شهادة التأجيل لي فاتت وشهادة مدرسية تاع العام الجاري. قدم الطلب في بداية كل سنة دراسية." } },
        { cites: [SFD, NY], text: {
          en: "San Francisco and New York: the application form completed on screen, two 2x2 inch photos, one original Algerian birth certificate (\"12S not accepted\"), a copy of the school transcript, enrolment or last diploma (school IDs are not accepted), and for renewal the previous deferment document. San Francisco also asks for a copy of the consular card. Neither lists a fee.",
          fr: "San Francisco et New York : le formulaire rempli à l'écran, deux photos 2x2 pouces, un acte de naissance algérien original (« 12S non accepté »), une copie du relevé de notes, du certificat de scolarité ou du dernier diplôme (les cartes d'étudiant ne sont pas acceptées), et pour un renouvellement le précédent document de sursis. San Francisco demande aussi une copie de la carte consulaire. Aucune ne mentionne de tarif.",
          ar: "سان فرانسيسكو ونيويورك: استمارة الطلب تُملأ إلكترونيًا، وصورتان بمقاس 2x2 بوصة، وشهادة ميلاد جزائرية أصلية («لا يُقبل مستخرج 12S»)، ونسخة من كشف النقاط أو شهادة التسجيل أو آخر شهادة، (ولا تُقبل بطاقات الطالب)، وفي التجديد وثيقة التأجيل السابقة. وتطلب سان فرانسيسكو أيضًا نسخة من البطاقة القنصلية. ولا تذكر أيٌّ منهما رسومًا.",
          dz: "سان فرانسيسكو ونيويورك: استمارة الطلب تتعمر على الكمبيوتر، تصويرتين 2x2 بوصة، شهادة ميلاد جزائرية أصلية («12S ما تتقبلش»)، نسخة من كشف النقاط ولا شهادة التسجيل ولا آخر دبلوم (كارطة الطالب ما تتقبلش)، وللتجديد وثيقة التأجيل لي فاتت. سان فرانسيسكو تطلب حتى نسخة من الكارطة القنصلية. ولا وحدة فيهم ما ذكرت سومة." } },
        { cites: [PD, NN], text: {
          en: "Paris, renewal: the old card or deferment attestation, a current-year school certificate or internship attestation, two identical recent photos, a copy of the valid residence permit, and a copy of the consular card (mandatory at 19) or the guardian's with the family book photocopy. Nantes, first request: full birth certificate (transcribed for people born abroad), copy of the Algerian ID, consular card, residence permit, an original school certificate or proof of activity, and four photos.",
          fr: "Paris, renouvellement : l'ancienne carte ou l'attestation de report, un certificat de scolarité ou attestation de stage de l'année en cours, deux photos récentes identiques, copie du titre de séjour valide, et copie de la carte consulaire (obligatoire à 19 ans) ou celle du tuteur avec photocopie du livret de famille. Nantes, première demande : copie intégrale de l'acte de naissance (acte transcrit pour les personnes nées à l'étranger), copie de la carte d'identité algérienne, de la carte consulaire et du titre de séjour, certificat de scolarité original ou justificatif d'activité, et quatre photos.",
          ar: "باريس، التجديد: البطاقة القديمة أو شهادة الإرجاء، وشهادة مدرسية أو شهادة تربص للسنة الجارية، وصورتان حديثتان متطابقتان، ونسخة من بطاقة الإقامة السارية، ونسخة من البطاقة القنصلية (إلزامية عند 19 سنة) أو بطاقة الولي مع نسخة من دفتر العائلة. نانت، الطلب الأول: نسخة كاملة من شهادة الميلاد (المسجَّلة بالنسبة للمولودين في الخارج)، ونسخة من بطاقة الهوية الجزائرية والبطاقة القنصلية وبطاقة الإقامة، وشهادة مدرسية أصلية أو ما يثبت النشاط، وأربع صور.",
          dz: "باريس، التجديد: الكارطة القديمة ولا شهادة الإرجاء، شهادة مدرسية ولا شهادة تربص تاع العام الجاري، تصويرتين جداد كيف كيف، نسخة من كارطة الإقامة الصالحة، ونسخة من الكارطة القنصلية (إجبارية في 19 سنة) ولا تاع الولي مع نسخة من دفتر العائلة. نانت، الطلب الأول: نسخة كاملة من شهادة الميلاد (المترنسكريتة للمزدادين برا)، نسخة من كارط ديدونتيتي الجزائرية والكارطة القنصلية وكارطة الإقامة، شهادة مدرسية أصلية ولا ورقة النشاط، وأربع تصاور." } },
        { cites: [OTT, LC], text: {
          en: "Ottawa: a handwritten request addressed to the Ministry of National Defence through the ambassador or the consul general in Montreal, with a school certificate or enrolment attestation for studies, or an attestation that a brother is serving national service. London also offers deferral of incorporation, granted if a brother is serving or has been recalled, or for a duly justified temporary impediment, with the same documents plus evidence of the reason.",
          fr: "Ottawa : une demande manuscrite adressée au ministère de la Défense nationale sous couvert de l'ambassadeur ou du consul général à Montréal, accompagnée d'un certificat de scolarité ou d'une attestation d'inscription pour les études, ou d'une attestation d'incorporation d'un frère. Londres prévoit aussi le report d'incorporation, accordé si un frère effectue ou a été rappelé pour le service, ou en cas d'empêchement temporaire dûment justifié, avec les mêmes pièces plus la preuve du motif.",
          ar: "أوتاوا: طلب مكتوب بخط اليد موجَّه إلى وزارة الدفاع الوطني عن طريق السفير أو القنصل العام بمونتريال، مرفق بشهادة مدرسية أو شهادة تسجيل بالنسبة للدراسة، أو شهادة تفيد التحاق أخ بالخدمة الوطنية. وتتيح لندن أيضًا إرجاء الإدماج، ويُمنح إذا كان أخ يؤدي الخدمة أو أُعيد استدعاؤه، أو لمانع مؤقت مبرَّر، بالوثائق نفسها مع ما يثبت السبب.",
          dz: "أوتاوا: طلب مكتوب بالإيد موجه لوزارة الدفاع الوطني عن طريق السفير ولا القنصل العام في مونتريال، مع شهادة مدرسية ولا شهادة تسجيل للقراية، ولا شهادة تثبت بلي خوه راه في الخدمة الوطنية. لندن عندها حتى تأجيل الإدماج، يتعطى إذا خوه راه في الخدمة ولا رجعوه، ولا لمانع مؤقت مبرر، بنفس الوراق زائد ورقة تثبت السبب." } },
      ],
    },
    {
      id: "exemption",
      title: { en: "Exemption (dispense)", fr: "Dispense", ar: "الإعفاء", dz: "الإعفاء (الدّيسبونس)" },
      points: [
        { cites: [LE], text: {
          en: "London lists several grounds: ordinary (studies completed or abandoned), medical, social (supporting the family), Algerian-French dual nationals under the 1983 agreement, and presidential measures. The ordinary file: signed form, original birth certificate (not S12), copy of the consular card, proof of UK residence, two photos, a diploma or last enrolment certificate, and a work contract or the last three payslips. Medical adds evidence of the illness or disability; documents in English must be translated into Arabic or French.",
          fr: "Londres cite plusieurs motifs : ordinaire (études terminées ou abandonnées), médical, social (soutien de famille), binationaux algéro-français selon l'accord de 1983, et mesures présidentielles. Dossier ordinaire : formulaire signé, acte de naissance original (pas S12), copie de la carte consulaire, preuve de résidence au Royaume-Uni, deux photos, un diplôme ou le dernier certificat de scolarité, et un contrat de travail ou les trois dernières fiches de paie. Le motif médical ajoute la preuve de la maladie ou du handicap ; les documents en anglais doivent être traduits en arabe ou en français.",
          ar: "تذكر لندن أسبابًا عدة: عادي (دراسة منتهية أو متوقفة)، وطبي، واجتماعي (إعالة الأسرة)، ومزدوجو الجنسية الجزائرية الفرنسية بموجب اتفاق 1983، وتدابير رئاسية. الملف العادي: استمارة موقَّعة، وشهادة ميلاد أصلية (وليس S12)، ونسخة من البطاقة القنصلية، وإثبات الإقامة في المملكة المتحدة، وصورتان، وشهادة أو آخر شهادة مدرسية، وعقد عمل أو آخر ثلاث قسائم أجر. ويضيف السبب الطبي ما يثبت المرض أو الإعاقة؛ ويجب ترجمة الوثائق بالإنجليزية إلى العربية أو الفرنسية.",
          dz: "لندن تذكر بزاف أسباب: عادي (القراية كملت ولا وقفت)، طبي، اجتماعي (سند العائلة)، مزدوجي الجنسية الجزائرية الفرنسية حسب اتفاق 1983، وإجراءات رئاسية. الملف العادي: استمارة ممضية، شهادة ميلاد أصلية (ماشي S12)، نسخة من الكارطة القنصلية، ورقة الإقامة في بريطانيا، تصويرتين، دبلوم ولا آخر شهادة مدرسية، وعقد خدمة ولا آخر ثلاث فيش تاع الخلاص. الطبي يزيد ورقة تثبت المرض ولا الإعاقة؛ والوثائق بالإنجليزية لازم تترجم للعربية ولا الفرنسية." } },
        { cites: [LE, NY, OTT, PTE], text: {
          en: "For social grounds, offices ask for more. London: a request to the Ministry of National Defence through the consulate, the parents' family book, a death, divorce or unemployment/retirement/disability certificate for the parent where relevant, a work contract and documents on the brothers' national service status. New York adds the previous deferment document. Ottawa lists being the sole support of an infirm or young relative, or being over 27 and in salaried work. Pontoise asks for a handwritten explanation, a work contract and last three payslips, and family civil-status sheets.",
          fr: "Pour le motif social, les postes demandent davantage. Londres : une demande au ministère de la Défense nationale par l'intermédiaire du consulat, le livret de famille des parents, un acte de décès, de divorce ou une attestation de chômage/retraite/invalidité du parent selon le cas, un contrat de travail et les documents sur la situation des frères au regard du service national. New York ajoute le document de sursis précédent. Ottawa cite le fait d'être seul soutien d'un ascendant ou collatéral infirme ou en bas âge, ou d'être âgé de plus de 27 ans et salarié. Pontoise demande une demande manuscrite explicative, un contrat de travail et les trois dernières fiches de paie, et des fiches familiales d'état civil.",
          ar: "بالنسبة للأسباب الاجتماعية تطلب الممثليات وثائق أكثر. لندن: طلب إلى وزارة الدفاع الوطني عبر القنصلية، ودفتر عائلة الوالدين، وشهادة وفاة أو طلاق أو بطالة/تقاعد/عجز للوالد حسب الحالة، وعقد عمل، ووثائق عن وضعية الإخوة إزاء الخدمة الوطنية. وتضيف نيويورك وثيقة التأجيل السابقة. وتذكر أوتاوا حالة الكفيل الوحيد لأصل أو قريب عاجز أو صغير السن، أو من تجاوز 27 سنة ويعمل أجيرًا. وتطلب بونتواز طلبًا مكتوبًا بخط اليد يشرح الوضعية، وعقد عمل وآخر ثلاث قسائم أجر، وبطاقات عائلية للحالة المدنية.",
          dz: "للإعفاء الاجتماعي القنصليات تطلب زيادة وراق. لندن: طلب لوزارة الدفاع الوطني عن طريق القنصلية، دفتر العائلة تاع الوالدين، شهادة وفاة ولا طلاق ولا بطالة/تقاعد/عجز تاع الوالد على حسب الحالة، عقد خدمة ووراق على وضعية الإخوة في الخدمة الوطنية. نيويورك تزيد وثيقة التأجيل لي فاتت. أوتاوا تذكر الوحيد لي يعيّش واحد من الأصول ولا قريب عاجز ولا صغير، ولا لي فات 27 سنة وخدام أجير. بونتواز تطلب طلب مكتوب بالإيد يشرح الوضعية، عقد خدمة وآخر ثلاث فيش تاع الخلاص، وفيش عائلية للحالة المدنية." } },
        { cites: [OTT, PTE], text: {
          en: "Medical exemption: Ottawa says you must build a complete medical file and be examined by a medical commission for fitness for national service. Pontoise says that for any exemption the person must appear before the ministerial national service commission; for medical grounds it lists a medical file, four photos, a consular card copy and an Algerian ID copy.",
          fr: "Dispense médicale : Ottawa indique qu'il faut constituer un dossier médical complet et passer des examens devant une commission médicale d'aptitude au service national. Pontoise précise que, pour toute dispense, l'intéressé doit se présenter devant la commission ministérielle du service national ; pour le motif médical elle liste un dossier médical, quatre photos, une copie de la carte consulaire et une copie de la carte d'identité algérienne.",
          ar: "الإعفاء الطبي: تذكر أوتاوا أنه يجب تكوين ملف طبي كامل وإجراء فحوص أمام لجنة طبية لتقدير اللياقة للخدمة الوطنية. وتذكر بونتواز أن على المعني، في كل إعفاء، الحضور أمام اللجنة الوزارية للخدمة الوطنية؛ وللسبب الطبي تطلب ملفًا طبيًا وأربع صور ونسخة من البطاقة القنصلية ونسخة من بطاقة الهوية الجزائرية.",
          dz: "الإعفاء الطبي: أوتاوا تقول لازم تكون ملف طبي كامل وتدير فحوصات قدام لجنة طبية تقرر واش راك لائق للخدمة الوطنية. بونتواز تقول في أي إعفاء لازم المعني يحضر قدام اللجنة الوزارية تاع الخدمة الوطنية؛ وللطبي تطلب ملف طبي، أربع تصاور، نسخة من الكارطة القنصلية ونسخة من كارط ديدونتيتي الجزائرية." } },
        { cites: [NY], text: {
          en: "New York also handles replacement of a lost exemption card (form, two photos, a copy of the exemption if available, and a loss report form, notarised if mailed) and correction of errors (a hand-signed letter, two photos, the original birth certificate and the original deferment or exemption card if available).",
          fr: "New York traite aussi le remplacement d'une carte de dispense perdue (formulaire, deux photos, copie de la dispense si disponible, et déclaration de perte, notariée si envoyée par courrier) et la correction d'erreurs (lettre signée à la main, deux photos, acte de naissance original et carte de sursis ou de dispense originale si disponible).",
          ar: "تعالج نيويورك أيضًا استبدال بطاقة الإعفاء المفقودة (استمارة وصورتان ونسخة من الإعفاء إن وُجدت واستمارة التصريح بالضياع، موثّقة إذا أُرسلت بالبريد) وتصحيح الأخطاء (رسالة بخط اليد وموقَّعة وصورتان وشهادة الميلاد الأصلية وبطاقة التأجيل أو الإعفاء الأصلية إن وُجدت).",
          dz: "نيويورك تخدم حتى تبديل كارطة الإعفاء الضايعة (استمارة، تصويرتين، نسخة من الإعفاء إذا كاين، واستمارة التصريح بالضياع، عند الموثق إذا بعثتها بالبوسطة) وتصحيح الأخطاء (رسالة ممضية بالإيد، تصويرتين، شهادة الميلاد الأصلية وكارطة التأجيل ولا الإعفاء الأصلية إذا كاينة)." } },
      ],
    },
    {
      id: "in-algeria",
      title: { en: "Rules and offices in Algeria", fr: "Règles et bureaux en Algérie", ar: "القواعد والمكاتب في الجزائر", dz: "القواعد والمكاتب في الدزاير" },
      points: [
        { cites: [MDN], text: {
          en: "After service, people are discharged and receive a National Service card. The Ministry of National Defence says holders must renew it: the first renewal 3 years after issue, the second 5 years after the first, the third (final) 5 years after the second. Renewal documents: the family book (if married) or a civil-status document (if unmarried), a valid residence certificate, two photos and the previous card.",
          fr: "Après le service, les personnes sont libérées et reçoivent une carte de service national. Le ministère de la Défense nationale indique qu'elle doit être renouvelée : un premier renouvellement 3 ans après la délivrance, un deuxième 5 ans après le premier, un troisième (final) 5 ans après le deuxième. Pièces de renouvellement : le livret de famille (si marié) ou une pièce d'état civil (si célibataire), un certificat de résidence valide, deux photos et la carte précédente.",
          ar: "بعد أداء الخدمة يُسرَّح المعني ويتسلّم بطاقة الخدمة الوطنية. وتذكر وزارة الدفاع الوطني أنه يجب تجديدها: التجديد الأول بعد 3 سنوات من إصدارها، والثاني بعد 5 سنوات من الأول، والثالث (الأخير) بعد 5 سنوات من الثاني. وثائق التجديد: دفتر العائلة (للمتزوج) أو وثيقة حالة مدنية (للأعزب)، وشهادة إقامة سارية، وصورتان، والبطاقة السابقة.",
          dz: "بعد الخدمة يخرجوك ويعطوك كارطة الخدمة الوطنية. وزارة الدفاع الوطني تقول لازم تجددها: التجديد الأول بعد 3 سنين من الإصدار، الثاني بعد 5 سنين من الأول، والثالث (الأخير) بعد 5 سنين من الثاني. وراق التجديد: دفتر العائلة (إذا متزوج) ولا وثيقة حالة مدنية (إذا عازب)، شهادة إقامة صالحة، تصويرتين والكارطة لي فاتت." } },
        { cites: [MDN], text: {
          en: "Reservists must notify the National Gendarmerie brigade of their residence and any change of it, and inform the National Service Center of changes in family situation. For a lost card, bring a loss declaration from the Gendarmerie (or the consulate for residents abroad), two photos and a copy of the former card if available.",
          fr: "Les réservistes doivent informer la brigade de gendarmerie nationale de leur résidence et de tout changement, et informer le centre du service national des changements de situation familiale. En cas de perte de la carte, fournir une déclaration de perte de la gendarmerie (ou du consulat pour les résidents à l'étranger), deux photos et une copie de l'ancienne carte si disponible.",
          ar: "على الاحتياطيين إبلاغ فرقة الدرك الوطني بمقر إقامتهم وبأي تغيير فيه، وإعلام مركز الخدمة الوطنية بتغيّر وضعيتهم العائلية. وفي حالة ضياع البطاقة يُقدَّم تصريح بالضياع من الدرك (أو من القنصلية للمقيمين بالخارج)، وصورتان، ونسخة من البطاقة السابقة إن وُجدت.",
          dz: "الاحتياطيين لازم يعلمو فرقة الدرك الوطني بمكان سكناهم وبأي تبديل فيه، ويعلمو مركز الخدمة الوطنية بتبديل الوضعية العائلية. إذا ضاعت الكارطة جيب تصريح بالضياع من الدرك (ولا من القنصلية للي في الغربة)، تصويرتين ونسخة من الكارطة القديمة إذا كاينة." } },
        { cites: [MDO], text: {
          en: "The Ministry of National Defence says national service is run through a central Directorate and, regionally, National Service Centres (CNS) and Offices (ONS) in all 48 wilayas. Its page lists the office type for each wilaya and gives the Ministry's contact as B.P. 184, Alger Gare, Algiers, tel. 021.71.15.15.",
          fr: "Le ministère de la Défense nationale indique que le service national est géré par une direction centrale et, au niveau régional, par des centres (CNS) et bureaux (ONS) du service national dans les 48 wilayas. Sa page liste le type de bureau de chaque wilaya et donne le contact du ministère : B.P. 184, Alger Gare, Alger, tél. 021.71.15.15.",
          ar: "تذكر وزارة الدفاع الوطني أن الخدمة الوطنية تُسيَّر عبر مديرية مركزية، وجهويًا عبر مراكز (CNS) ومكاتب (ONS) للخدمة الوطنية في الولايات الـ48. وتسرد صفحتها نوع المكتب في كل ولاية وتعطي عنوان الوزارة: ص.ب 184، الجزائر المحطة، الهاتف 021.71.15.15.",
          dz: "وزارة الدفاع الوطني تقول الخدمة الوطنية تتسير بمديرية مركزية، وفي الولايات بمراكز (CNS) ومكاتب (ONS) في 48 ولاية. صفحتها تعطي نوع المكتب تاع كل ولاية وعنوان الوزارة: ص.ب 184، الجزائر المحطة، تيليفون 021.71.15.15." } },
      ],
    },
  ] as GuideSection[],
  fees: [] as FeeRow[],
};
