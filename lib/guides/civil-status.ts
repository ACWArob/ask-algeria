import type { Locale } from "@/lib/i18n";
import type { GuidePoint, GuideSection, FeeRow } from "./passport";

/**
 * Transcription of births and marriages that happened abroad, and the family
 * book (livret de famille). EVERY point is a restatement of what the cited
 * data/corpus.json records say (ids in `cites`). Nothing here comes from outside
 * knowledge. Rules that come from one office name that office. If the corpus
 * changes, review this file.
 */

type L = Record<Locale, string>;
export type { GuidePoint, GuideSection, FeeRow };

const CW = "civil-status-embwashington";
const MFA = "civil-status-mfa-algiers";
const SFB = "cgsf-births";
const SFM = "cgsf-marriages";
const NY = "cgny-civilstatus";
const LDT = "cglondon.mfa.gov.dz-transcription-of-civil-records";
const PT = "cpontoise-mfa-gov-dz-fr-consular-services-civil-status-1-ranscription-";
const IST = "cgistanbul.mfa.gov.dz-extracts-of-civil-registration";
const OTT = "www-embassyalgeria-ca-etatcivil";
const LIV = "wilayaoran.dz-etat-civil-livret-de-famille-fiche-familiale";
const MM = "cgparis-mfa-gov-dz-fr-consular-services-civil-status-1-marginal-entrie";

export const GUIDE = {
  title: {
    en: "Births and marriages abroad, and the family book",
    fr: "Naissances et mariages à l'étranger, et livret de famille",
    ar: "الميلاد والزواج في الخارج ودفتر العائلة",
    dz: "الزيادة والزواج في الغربة ودفتر العائلة",
  } as L,
  lead: {
    en: "What official pages say about transcribing a birth or marriage from abroad into Algerian civil status, and about the family book. Documents differ by office, so check yours.",
    fr: "Ce que disent les pages officielles sur la transcription d'une naissance ou d'un mariage survenu à l'étranger et sur le livret de famille. Les pièces varient selon le poste : vérifiez le vôtre.",
    ar: "ما تذكره الصفحات الرسمية عن تسجيل ميلاد أو زواج وقع في الخارج في الحالة المدنية الجزائرية وعن دفتر العائلة. تختلف الوثائق من ممثلية إلى أخرى، فتحقّق من ممثليتك.",
    dz: "واش تقول الصفحات الرسمية على تسجيل زيادة ولا زواج صرا في الغربة في الحالة المدنية الجزائرية وعلى دفتر العائلة. الوراق تختلف من قنصلية لقنصلية، شوف تاعك.",
  } as L,
  portals: [
    { url: "https://www.mfa.gov.dz/services-for-algerians/civil-status-1", label: { en: "Civil Status Office, Ministry of Foreign Affairs", fr: "Service de l'état civil, ministère des Affaires étrangères", ar: "مصلحة الحالة المدنية بوزارة الشؤون الخارجية", dz: "مصلحة الحالة المدنية في وزارة الخارجية" } as L },
    { url: "https://etatcivil.interieur.gov.dz/ActeNaissance/", label: { en: "Civil status documents online (Ministry of the Interior)", fr: "Documents d'état civil en ligne (ministère de l'Intérieur)", ar: "وثائق الحالة المدنية عن بعد (وزارة الداخلية)", dz: "وثائق الحالة المدنية من الأنترنت (وزارة الداخلية)" } as L },
  ],
  sections: [
    {
      id: "why",
      title: { en: "What transcription means", fr: "Ce que signifie la transcription", ar: "معنى التسجيل (النقل) في الحالة المدنية", dz: "واش معناها الترنسكريبسيون" },
      points: [
        { cites: [PT, CW], text: {
          en: "Transcription means entering, in the consulate's civil-status registers, acts drawn up by local authorities abroad. Pontoise and Washington both call it a mandatory step before obtaining Algerian documents. It depends on where the event took place, not where you live, and only acts of people whose Algerian nationality is established can be transcribed.",
          fr: "La transcription consiste à enregistrer dans les registres d'état civil du consulat les actes dressés par les autorités locales à l'étranger. Pontoise et Washington la présentent comme une étape obligatoire avant l'obtention de documents algériens. Elle dépend du lieu de l'événement et non du lieu de résidence, et seuls les actes de personnes dont la nationalité algérienne est établie peuvent être transcrits.",
          ar: "التسجيل (النقل) هو قيد العقود التي حرّرتها السلطات المحلية في الخارج في سجلات الحالة المدنية للقنصلية. وتعدّه قنصلية بونتواز وسفارة واشنطن خطوة إلزامية قبل الحصول على الوثائق الجزائرية. وهو مرتبط بمكان وقوع الحدث لا بمكان الإقامة، ولا تُسجَّل إلا عقود الأشخاص الثابتة جنسيتهم الجزائرية.",
          dz: "الترنسكريبسيون معناها يدخلو في سجلات الحالة المدنية تاع القنصلية العقود لي كتبوها السلطات المحلية في الغربة. قنصلية بونتواز وسفارة واشنطن يقولو هي خطوة لازمة قبل ما تاخذ الوثائق الجزائرية. تتعلق بالبلاصة لي صرا فيها الحدث ماشي بالبلاصة لي ساكن فيها، وما يترنسكريو غير عقود الناس لي جنسيتهم الجزائرية ثابتة." } },
        { cites: [OTT], text: {
          en: "Ottawa says births, marriages and deaths occurring in its Canadian jurisdiction can be transcribed at the registrant's request, or a relative's request after a death. Once transcribed, civil-status documents can be issued by the embassy's consular section and by the Ministry of Foreign Affairs in Algiers.",
          fr: "Ottawa indique que les naissances, mariages et décès survenus dans sa circonscription canadienne peuvent être transcrits à la demande de l'immatriculé, ou d'un proche en cas de décès. Une fois transcrits, les actes peuvent être délivrés par la section consulaire de l'ambassade et par le ministère des Affaires étrangères à Alger.",
          ar: "تذكر سفارة أوتاوا أن عقود الميلاد والزواج والوفاة الواقعة في دائرة اختصاصها بكندا يمكن تسجيلها بطلب من المسجَّل، أو بطلب أحد أقاربه في حالة الوفاة. وبعد التسجيل يمكن استخراج وثائق الحالة المدنية من القسم القنصلي للسفارة ومن وزارة الشؤون الخارجية بالجزائر العاصمة.",
          dz: "سفارة أوتاوا تقول الزيادات والزواجات والوفيات لي تصرا في دائرتها في كندا تقدر تترنسكري بطلب من المسجل، ولا بطلب واحد من العائلة كي يموت. من بعد ما تترنسكري، تقدر تجبد الوثائق من القسم القنصلي تاع السفارة ومن وزارة الخارجية في الجزائر العاصمة." } },
      ],
    },
    {
      id: "birth",
      title: { en: "Registering a birth abroad", fr: "Enregistrer une naissance à l'étranger", ar: "تسجيل ميلاد وقع في الخارج", dz: "تسجيل زيادة صرات في الغربة" },
      points: [
        { cites: [LDT], text: {
          en: "London registers births only for children born in the UK or Ireland (elsewhere, register at the Algerian mission in the birth country), and asks you to apply as soon as you have the birth certificate. Documents: application form in Arabic, original and copy of the full birth certificate (short certificates not accepted), the family book if you have one, and a copy of your consular card. Processing may take more than a month; births registered in the year of birth get priority.",
          fr: "Londres n'enregistre que les naissances d'enfants nés au Royaume-Uni ou en Irlande (ailleurs, il faut s'adresser à la représentation algérienne du pays de naissance) et demande de déposer dès réception de l'acte de naissance. Pièces : formulaire en arabe, original et copie de l'acte de naissance intégral (les extraits courts ne sont pas acceptés), le livret de famille si vous en avez un, et une copie de la carte consulaire. Le traitement peut dépasser un mois ; les naissances enregistrées l'année de naissance sont prioritaires.",
          ar: "تسجّل قنصلية لندن ميلاد الأطفال المولودين في المملكة المتحدة أو إيرلندا فقط (وفي غير ذلك يُسجَّل لدى الممثلية الجزائرية في بلد الميلاد)، وتطلب تقديم الطلب فور الحصول على شهادة الميلاد. الوثائق: استمارة بالعربية، وأصل ونسخة من شهادة الميلاد الكاملة (لا تُقبل الشهادات المختصرة)، ودفتر العائلة إن وُجد، ونسخة من بطاقة التسجيل القنصلي. قد تتجاوز مدة المعالجة شهرًا، وتُعطى الأولوية للميلاد المسجَّل في سنة حدوثه.",
          dz: "لندن تسجل غير الزيادات تاع الصغار لي مزدادين في بريطانيا ولا إيرلندا (في بلاد أخرى تسجل في الممثلية الجزائرية تاع بلد الزيادة)، وتقولك تقدم الطلب كيما تاخذ شهادة الميلاد. الوراق: استمارة بالعربية، الأصل ونسخة من شهادة الميلاد الكاملة (المختصرة ما يقبلوهاش)، دفتر العائلة إذا عندك، ونسخة من كارطة التسجيل القنصلي. المعالجة تقدر تفوت شهر، والزيادات لي تتسجل في عام الزيادة ليهم الأولوية." } },
        { cites: [PT], text: {
          en: "Pontoise asks for two full copies of the birth certificate (originals under three months old), the family book, and an Algerian ID, a nationality certificate or, failing that, the full birth certificates of the father and grandfather born in Algeria. For a minor, the applicant need not attend and one parent's Algerian ID is needed.",
          fr: "Pontoise demande deux copies intégrales de l'acte de naissance (originaux de moins de trois mois), le livret de famille, et une pièce d'identité algérienne ou un certificat de nationalité ou, à défaut, la copie intégrale de l'acte de naissance du père et du grand-père nés en Algérie. Pour un mineur, sa présence n'est pas exigée et une pièce d'identité algérienne d'un parent est demandée.",
          ar: "تطلب قنصلية بونتواز نسختين كاملتين من شهادة الميلاد (أصليتين مضى عليهما أقل من ثلاثة أشهر)، ودفتر العائلة، ووثيقة هوية جزائرية أو شهادة جنسية، وإلا فنسخة كاملة من شهادة ميلاد الأب والجد المولودين في الجزائر. وبالنسبة للقاصر لا يُشترط حضوره ويُطلب وثيقة هوية جزائرية لأحد الوالدين.",
          dz: "بونتواز تطلب زوج نسخ كاملين من شهادة الميلاد (الأصليين أقل من ثلاثة شهور)، دفتر العائلة، وورقة هوية جزائرية ولا شهادة الجنسية، وإذا ما كانتش نسخة كاملة من شهادة ميلاد البابا والجد لي مزدادين في الدزاير. للصغير ما يلزمش يحضر ويطلبو ورقة هوية جزائرية تاع واحد من الوالدين." } },
        { cites: [PT], text: {
          en: "Pontoise: if one or both parents changed their civil status through naturalisation, the children's births can only be transcribed on an order of the Sidi M'Hamed court in Algiers.",
          fr: "Pontoise : si l'un des parents ou les deux ont changé d'état civil à la suite d'une naturalisation, la transcription des naissances des enfants ne peut se faire que sur ordonnance du tribunal de Sidi M'Hamed à Alger.",
          ar: "بونتواز: إذا غيّر أحد الوالدين أو كلاهما حالته المدنية بسبب التجنّس، فلا يمكن تسجيل ميلاد الأبناء إلا بموجب أمر من محكمة سيدي امحمد بالجزائر العاصمة.",
          dz: "بونتواز: إذا واحد من الوالدين ولا زوج بدلو الحالة المدنية تاعهم بسبب التجنس، زيادة الصغار تترنسكري غير بأمر من محكمة سيدي امحمد في الجزائر العاصمة." } },
        { cites: [SFB, NY], text: {
          en: "San Francisco and New York: the parents' names on the child's birth certificate must match the Algerian civil-status register. They ask for the full birth certificate including the time of birth (original or certified copy, returned after checking), proof of the applicant's or a parent's nationality and identity, and the family book if available. Mailed applications need a USPS Priority Mail return envelope.",
          fr: "San Francisco et New York : les noms des parents sur l'acte de naissance de l'enfant doivent correspondre au registre d'état civil algérien. Elles demandent l'acte de naissance intégral avec l'heure de naissance (original ou copie certifiée, restitué après vérification), une preuve de nationalité et d'identité du demandeur ou d'un parent, et le livret de famille s'il existe. Les demandes par courrier doivent comporter une enveloppe de retour USPS Priority Mail.",
          ar: "سان فرانسيسكو ونيويورك: يجب أن تطابق أسماء الوالدين في شهادة ميلاد الطفل سجل الحالة المدنية الجزائري. وتطلبان شهادة الميلاد الكاملة بما فيها ساعة الميلاد (أصلًا أو نسخة مصدّقة تُعاد بعد التحقق)، وإثبات جنسية وهوية صاحب الطلب أو أحد الوالدين، ودفتر العائلة إن وُجد. وتتطلب الطلبات البريدية ظرف إرجاع من USPS Priority Mail.",
          dz: "سان فرانسيسكو ونيويورك: الأسماء تاع الوالدين في شهادة ميلاد الصغير لازم تطابق سجل الحالة المدنية الجزائري. يطلبو شهادة الميلاد الكاملة بالساعة تاع الزيادة (الأصل ولا نسخة مصدقة ويرجعوها بعد التحقق)، ورقة تثبت الجنسية والهوية تاع صاحب الطلب ولا تاع واحد من الوالدين، ودفتر العائلة إذا موجود. الطلبات بالبوسطة لازم فيها ظرف رجوع USPS Priority Mail." } },
        { cites: [CW], text: {
          en: "Washington asks for two recent original birth certificates, the family book, and either a nationality certificate or an ID plus the birth certificates of ancestors; for minors, a parent's ID is needed.",
          fr: "Washington demande deux actes de naissance originaux récents, le livret de famille, et soit un certificat de nationalité, soit une pièce d'identité avec les actes de naissance des ascendants ; pour les mineurs, une pièce d'identité d'un parent est nécessaire.",
          ar: "تطلب سفارة واشنطن شهادتي ميلاد أصليتين حديثتين، ودفتر العائلة، وإما شهادة جنسية أو وثيقة هوية مع شهادات ميلاد الأصول؛ وبالنسبة للقُصّر تلزم هوية أحد الوالدين.",
          dz: "سفارة واشنطن تطلب زوج شهادات ميلاد أصلية جداد، دفتر العائلة، وإما شهادة الجنسية ولا ورقة هوية مع شهادات ميلاد الأجداد؛ وللصغار لازم هوية تاع واحد من الوالدين." } },
      ],
    },
    {
      id: "marriage",
      title: { en: "Registering a marriage abroad", fr: "Enregistrer un mariage à l'étranger", ar: "تسجيل زواج وقع في الخارج", dz: "تسجيل زواج صرا في الغربة" },
      points: [
        { cites: [SFM, NY], text: {
          en: "San Francisco and New York: a marriage in the US involving an Algerian national can be registered at the consulate, and a family book is then issued free of charge. For an Algerian couple: the signed descriptive form, the original US marriage certificate (returned after checking), a copy of proof of Algerian nationality, and the original birth certificates of both spouses (the Algerian national's issued within the last three months). Names must match the Algerian civil-status register.",
          fr: "San Francisco et New York : un mariage célébré aux États-Unis impliquant un ressortissant algérien peut être enregistré au consulat, et un livret de famille est ensuite délivré gratuitement. Pour un couple algérien : la fiche descriptive signée, l'acte de mariage américain original (restitué après vérification), une copie de la preuve de nationalité algérienne, et les actes de naissance originaux des deux époux (celui du ressortissant algérien datant de moins de trois mois). Les noms doivent correspondre au registre d'état civil algérien.",
          ar: "سان فرانسيسكو ونيويورك: يمكن تسجيل زواج عُقد في الولايات المتحدة يكون أحد طرفيه جزائريًا لدى القنصلية، ثم يُسلَّم دفتر العائلة مجانًا. بالنسبة لزوجين جزائريين: الاستمارة الوصفية الموقَّعة، وعقد الزواج الأمريكي الأصلي (يُعاد بعد التحقق)، ونسخة من إثبات الجنسية الجزائرية، وشهادتا الميلاد الأصليتان للزوجين (وشهادة الجزائري صادرة خلال الأشهر الثلاثة الأخيرة). ويجب أن تطابق الأسماء سجل الحالة المدنية الجزائري.",
          dz: "سان فرانسيسكو ونيويورك: الزواج لي يتعقد في أمريكا ويكون فيه جزائري يتسجل في القنصلية، ومن بعد يعطيوك دفتر العائلة بلاش. لزوج جزائريين: الاستمارة الوصفية ممضية، عقد الزواج الأمريكي الأصلي (يرجعوه بعد التحقق)، نسخة من الورقة لي تثبت الجنسية الجزائرية، وشهادتي الميلاد الأصليتين تاع الزوجين (تاع الجزائري تكون خارجة في آخر ثلاثة شهور). والأسماء لازم تطابق سجل الحالة المدنية الجزائري." } },
        { cites: [SFM, PT, CW], text: {
          en: "Marriage with a non-Muslim spouse: San Francisco asks, for a husband born non-Muslim, a certificate of conversion to Islam issued by a mosque or an agreed association. Pontoise says a marriage between an Algerian woman and a non-Muslim cannot be transcribed unless he converted, and wants the attestation from the religious authority. Washington also lists a conversion certificate for marriages to non-Muslims.",
          fr: "Mariage avec un conjoint non musulman : San Francisco demande, pour un époux né non musulman, un certificat de conversion à l'islam délivré par une mosquée ou une association agréée. Pontoise indique que le mariage d'une Algérienne avec un non-musulman ne peut être transcrit sauf conversion de l'époux, et exige l'attestation de l'autorité religieuse. Washington mentionne aussi un certificat de conversion pour les mariages avec des non-musulmans.",
          ar: "الزواج من غير مسلم: تطلب قنصلية سان فرانسيسكو، في حالة الزوج المولود غير مسلم، شهادة اعتناق الإسلام صادرة عن مسجد أو جمعية معتمدة. وتذكر قنصلية بونتواز أن زواج جزائرية من غير مسلم لا يُسجَّل إلا إذا أسلم الزوج، وتشترط شهادة من السلطة الدينية المختصة. وتذكر سفارة واشنطن أيضًا شهادة اعتناق الإسلام في الزواج من غير المسلمين.",
          dz: "الزواج مع واحد ماشي مسلم: سان فرانسيسكو تطلب، للراجل لي ولد ماشي مسلم، شهادة دخول للإسلام من جامع ولا من جمعية معتمدة. بونتواز تقول زواج جزائرية مع ماشي مسلم ما يترنسكريش إلا إذا الراجل أسلم، وتطلب الشهادة من الجهة الدينية المختصة. وسفارة واشنطن حتى هي تذكر شهادة الإسلام في الزواج مع غير المسلمين." } },
        { cites: [PT, CW], text: {
          en: "Pontoise asks for two full original copies of the marriage certificate, the family book and an Algerian ID. Marriages celebrated by foreign embassies and religious marriages can only be transcribed on an order of the Sidi M'Hamed court in Algiers; Washington likewise says foreign-chancellery and religious marriages need a court order.",
          fr: "Pontoise demande deux copies intégrales originales de l'acte de mariage, le livret de famille et une pièce d'identité algérienne. Les mariages célébrés par des chancelleries étrangères et les mariages religieux ne peuvent être transcrits que sur ordonnance du tribunal de Sidi M'Hamed à Alger ; Washington indique de même qu'ils nécessitent une ordonnance judiciaire.",
          ar: "تطلب قنصلية بونتواز نسختين أصليتين كاملتين من عقد الزواج، ودفتر العائلة، ووثيقة هوية جزائرية. أما الزواج الذي عقدته سفارات أجنبية والزواج الديني فلا يُسجَّل إلا بأمر من محكمة سيدي امحمد بالجزائر العاصمة؛ وتذكر سفارة واشنطن كذلك أنه يلزم أمر قضائي.",
          dz: "بونتواز تطلب زوج نسخ أصلية كاملة من عقد الزواج، دفتر العائلة وورقة هوية جزائرية. الزواجات لي دارتهم سفارات أجنبية والزواج الديني ما يترنسكريوش غير بأمر من محكمة سيدي امحمد في الجزائر العاصمة؛ وواشنطن تقول كذلك لازم أمر قضائي." } },
        { cites: [OTT, IST], text: {
          en: "Ottawa asks for the original marriage certificate from the Canadian city hall, the spouse's birth extract if not yet registered or foreign, and a form; C$2 stamp duty applies for the family book. Istanbul asks for the original marriage certificate, both spouses' birth certificates, an Algerian nationality certificate for either spouse, a completed form and ID photos of both.",
          fr: "Ottawa demande l'acte de mariage original délivré par la mairie canadienne, un extrait de naissance du conjoint s'il n'est pas encore immatriculé ou est étranger, et un formulaire ; des droits de timbre de 2 $ CAD s'appliquent pour le livret de famille. Istanbul demande l'acte de mariage original, les actes de naissance des deux époux, un certificat de nationalité algérienne pour l'un des époux, un formulaire rempli et des photos d'identité des deux époux.",
          ar: "تطلب سفارة أوتاوا عقد الزواج الأصلي الصادر عن البلدية الكندية، ومستخرج ميلاد الزوج إن لم يكن مسجَّلًا بعد أو كان أجنبيًا، واستمارة؛ وتُدفع رسوم طابع بقيمة 2 دولار كندي لإنشاء دفتر العائلة. وتطلب قنصلية إسطنبول عقد الزواج الأصلي، وشهادتي ميلاد الزوجين، وشهادة الجنسية الجزائرية لأحدهما، واستمارة مملوءة، وصور هوية للزوجين.",
          dz: "أوتاوا تطلب عقد الزواج الأصلي من البلدية الكندية، مستخرج ميلاد الزوج إذا مازال ما تسجلش ولا إذا كان أجنبي، واستمارة؛ وفي دفتر العائلة تخلص 2 دولار كندي طابع. إسطنبول تطلب عقد الزواج الأصلي، شهادتي ميلاد الزوجين، شهادة الجنسية الجزائرية لواحد منهم، استمارة معمرة وتصاور هوية للزوجين." } },
        { cites: [MFA], text: {
          en: "At the Ministry of Foreign Affairs, requests go to the Civil Status Service, which forwards the file to the competent post. For an Algerian husband: the marriage certificate from the foreign town hall, his recent birth certificate and those of his father and grandfather, the wife's recent birth certificate and a copy of his ID. For an Algerian wife with a foreign husband: the marriage certificate, her recent birth certificate and those of her father and grandfather, the husband's recent birth certificate, and a certificate of conversion to Islam if he is from a non-Muslim country.",
          fr: "Au ministère des Affaires étrangères, les demandes sont déposées au service de l'état civil, qui transmet le dossier au poste compétent. Pour un époux algérien : l'acte de mariage de la mairie étrangère, son acte de naissance récent et ceux de son père et de son grand-père, l'acte de naissance récent de l'épouse et une copie de sa carte d'identité. Pour une épouse algérienne avec un mari étranger : l'acte de mariage, son acte de naissance récent et ceux de son père et de son grand-père, l'acte de naissance récent du mari, et un certificat de conversion à l'islam s'il est ressortissant d'un pays non musulman.",
          ar: "لدى وزارة الشؤون الخارجية تُقدَّم الطلبات إلى مصلحة الحالة المدنية التي تحيل الملف إلى الممثلية المختصة. بالنسبة للزوج الجزائري: عقد الزواج الصادر عن البلدية الأجنبية، وشهادة ميلاده الحديثة وشهادتا ميلاد أبيه وجده، وشهادة ميلاد الزوجة الحديثة، ونسخة من بطاقة هويته. وبالنسبة للزوجة الجزائرية وزوجها أجنبي: عقد الزواج، وشهادة ميلادها الحديثة وشهادتا ميلاد أبيها وجدها، وشهادة ميلاد الزوج الحديثة، وشهادة اعتناق الإسلام إن كان من بلد غير مسلم.",
          dz: "في وزارة الخارجية الطلبات تروح لمصلحة الحالة المدنية، وهي تبعث الملف للممثلية المختصة. للراجل الجزائري: عقد الزواج من البلدية الأجنبية، شهادة ميلاده الجديدة وشهادتي ميلاد باباه وجده، شهادة ميلاد المرا الجديدة ونسخة من كارطة هويته. وللمرا الجزائرية مع راجل أجنبي: عقد الزواج، شهادة ميلادها الجديدة وشهادتي ميلاد باباها وجدها، شهادة ميلاد الراجل الجديدة، وشهادة الإسلام إذا هو من بلاد ماشي مسلمة." } },
      ],
    },
    {
      id: "family-book",
      title: { en: "Family book (livret de famille)", fr: "Livret de famille", ar: "دفتر العائلة", dz: "دفتر العائلة (ليفري دو فاميل)" },
      points: [
        { cites: [SFM, NY], text: {
          en: "San Francisco and New York issue a family book free of charge after a marriage is registered. New York's fee page lists a duplicate family book at $25.00 and a translation of the family book at $25.00.",
          fr: "San Francisco et New York délivrent un livret de famille gratuitement après l'enregistrement du mariage. La page des tarifs de New York indique 25,00 $ pour un duplicata du livret de famille et 25,00 $ pour sa traduction.",
          ar: "تسلّم قنصليتا سان فرانسيسكو ونيويورك دفتر العائلة مجانًا بعد تسجيل الزواج. وتذكر صفحة الرسوم لقنصلية نيويورك 25.00 دولارًا لنسخة ثانية من دفتر العائلة و25.00 دولارًا لترجمته.",
          dz: "سان فرانسيسكو ونيويورك يعطيو دفتر العائلة بلاش بعد ما يتسجل الزواج. صفحة السوما تاع نيويورك تقول نسخة ثانية من دفتر العائلة 25.00 دولار وترجمته 25.00 دولار." } },
        { cites: [CW], text: {
          en: "Washington says the documents depend on the couple type (two Algerian spouses, Algerian husband with foreign wife, or foreign husband with Algerian wife). A duplicate needs a loss, theft or damage declaration, an ID, a recent marriage certificate, the relevant birth certificates and stamp duty. A translation into Arabic needs the book, a recent marriage certificate and stamp duty.",
          fr: "Washington indique que les pièces dépendent du type de couple (deux conjoints algériens, mari algérien et épouse étrangère, ou mari étranger et épouse algérienne). Un duplicata exige une déclaration de perte, vol ou détérioration, une pièce d'identité, un acte de mariage récent, les actes de naissance concernés et des droits de timbre. Une traduction en arabe exige le livret, un acte de mariage récent et des droits de timbre.",
          ar: "تذكر سفارة واشنطن أن الوثائق تختلف حسب نوع الزوجين (زوجان جزائريان، أو زوج جزائري وزوجة أجنبية، أو زوج أجنبي وزوجة جزائرية). وتتطلب النسخة الثانية تصريحًا بالضياع أو السرقة أو التلف، ووثيقة هوية، وعقد زواج حديثًا، وشهادات الميلاد المعنية، ورسوم الطابع. وتتطلب الترجمة إلى العربية الدفتر وعقد زواج حديثًا ورسوم الطابع.",
          dz: "سفارة واشنطن تقول الوراق تختلف على حسب نوع الزوجين (زوج جزائريين، راجل جزائري مع مرا أجنبية، ولا راجل أجنبي مع مرا جزائرية). النسخة الثانية تطلب تصريح بالضياع ولا السرقة ولا التقطيع، ورقة هوية، عقد زواج جديد، شهادات الميلاد المعنية وطابع. والترجمة للعربية تطلب الدفتر، عقد زواج جديد وطابع." } },
        { cites: [LIV], text: {
          en: "Oran's civil-status page says the family book is handed to the spouses by the civil-status officer after the marriage is celebrated or transcribed. Children born outside the commune where the marriage was transcribed are added by the head of family at the commune of birth.",
          fr: "La page d'état civil d'Oran indique que le livret de famille est remis aux époux par l'officier de l'état civil après la célébration ou la transcription du mariage. Les enfants nés hors de la commune de transcription du mariage sont inscrits par le chef de famille à la commune de naissance.",
          ar: "تذكر صفحة الحالة المدنية لولاية وهران أن ضابط الحالة المدنية يسلّم دفتر العائلة للزوجين بعد إبرام الزواج أو تسجيله. أما الأبناء المولودون خارج البلدية التي سُجّل فيها الزواج فيقيّدهم ربّ الأسرة في بلدية الميلاد.",
          dz: "صفحة الحالة المدنية تاع وهران تقول ضابط الحالة المدنية يعطي دفتر العائلة للزوجين بعد الزواج ولا بعد ما يترنسكري الزواج. الصغار لي مزدادين برا البلدية لي ترنسكري فيها الزواج، رب العائلة يروح لبلدية الزيادة يزيدهم." } },
        { cites: [LIV], text: {
          en: "Oran also says a second booklet after a divorce can be issued to the spouse who does not hold the first, marked as such on its first page. If it is lost, stolen or damaged, the head of family reports it to the competent police station, which issues a declaration allowing a new booklet to be drawn up. A French-language copy for use abroad can be requested with the wet stamp and the mention \"valable à l'étranger\".",
          fr: "Oran précise aussi qu'un second livret après divorce peut être délivré à l'époux qui ne détient pas le premier, avec une mention en première page. En cas de perte, vol ou détérioration, le chef de famille le déclare au commissariat compétent, qui délivre une déclaration permettant d'établir un nouveau livret. Une copie en langue française destinée à l'étranger peut être demandée, avec le cachet humide et la mention « valable à l'étranger ».",
          ar: "وتذكر ولاية وهران أيضًا أنه يمكن تسليم دفتر ثانٍ بعد الطلاق للزوج الذي لا يحوز الدفتر الأول، مع بيان ذلك في صفحته الأولى. وفي حالة الضياع أو السرقة أو التلف يصرّح ربّ الأسرة لدى مركز الشرطة المختص الذي يسلّم تصريحًا يتيح إعداد دفتر جديد. ويمكن طلب نسخة بالفرنسية مخصصة للاستعمال في الخارج بالختم الرطب وعبارة «صالح في الخارج».",
          dz: "وهران تقول زيادة، دفتر ثاني بعد الطلاق يقدر يتعطى للزوج لي ما عندوش الأول، ويكتبو عليه في الصفحة الأولى. إذا ضاع ولا تسرق ولا تقطع، رب العائلة يصرّح في الكوميسارية المختصة وهي تعطيه تصريح باش يديرو دفتر جديد. ويقدر يطلب نسخة بالفرنسية للخارج بالطابع الرطب وعبارة «valable à l'étranger»." } },
      ],
    },
    {
      id: "changes",
      title: { en: "Updating records and divorces abroad", fr: "Mise à jour des actes et divorces à l'étranger", ar: "تحيين العقود والطلاق في الخارج", dz: "تحيين العقود والطلاق في الغربة" },
      points: [
        { cites: [MM], text: {
          en: "Paris: any change in civil status must be reported so it is entered in the documents. For people born in Algeria and married in France, the French town hall normally sends the marriage notice to the Algerian commune of birth; if your birth record is not updated, ask the town hall of the marriage to send it. People born and married abroad whose birth was transcribed before the marriage must request transcription of the marriage at the competent consulate.",
          fr: "Paris : tout changement d'état civil doit être signalé pour être porté sur les actes. Pour les personnes nées en Algérie et mariées en France, la mairie française envoie normalement l'avis de mention de mariage à la commune algérienne de naissance ; si votre acte de naissance n'est pas à jour, demandez à la mairie du mariage de l'envoyer. Les personnes nées et mariées à l'étranger dont la naissance a été transcrite avant le mariage doivent demander la transcription du mariage au consulat compétent.",
          ar: "باريس: يجب التصريح بكل تغيير في الحالة المدنية ليُدرج في العقود. بالنسبة للمولودين في الجزائر والمتزوجين في فرنسا، ترسل البلدية الفرنسية عادة إشعار البيان الهامشي للزواج إلى البلدية الجزائرية مكان الميلاد؛ وإذا لم يُحيَّن عقد ميلادك فاطلب من بلدية الزواج إرساله. أما المولودون والمتزوجون في الخارج الذين سُجّل ميلادهم قبل الزواج فعليهم طلب تسجيل الزواج لدى القنصلية المختصة.",
          dz: "باريس: كل تغيير في الحالة المدنية لازم تصرح بيه باش يتحط في العقود. للي مزدادين في الدزاير ومتزوجين في فرنسا، البلدية الفرنسية تبعث عادة إشعار الزواج لبلدية الزيادة في الدزاير؛ إذا عقد ميلادك ما تحيّنش، اطلب من بلدية الزواج تبعثو. ولي مزدادين ومتزوجين برا وزيادتهم ترنسكريت قبل الزواج، لازم يطلبو ترنسكريبسيون الزواج في القنصلية المختصة." } },
        { cites: [MM, NY, IST], text: {
          en: "A foreign divorce has no effect in Algeria until an Algerian court gives it exequatur (New York, Paris, Istanbul). Paris says to apply to the personal-status judge of the court of your birthplace if you were born in Algeria, or to the Sidi M'Hamed court in Algiers if you were born abroad; Istanbul names the Sidi M'Hamed court.",
          fr: "Un divorce prononcé à l'étranger n'a pas d'effet en Algérie tant qu'un tribunal algérien ne lui a pas donné l'exequatur (New York, Paris, Istanbul). Paris indique de s'adresser au juge du statut personnel du tribunal du lieu de naissance si vous êtes né en Algérie, ou au tribunal de Sidi M'Hamed à Alger si vous êtes né à l'étranger ; Istanbul cite le tribunal de Sidi M'Hamed.",
          ar: "الطلاق الصادر في الخارج لا أثر له في الجزائر ما لم تمنحه محكمة جزائرية الصيغة التنفيذية (نيويورك وباريس وإسطنبول). وتذكر قنصلية باريس تقديم الطلب إلى قاضي شؤون الأسرة بمحكمة مكان الميلاد إن كنت مولودًا في الجزائر، أو إلى محكمة سيدي امحمد بالجزائر العاصمة إن كنت مولودًا في الخارج؛ وتذكر قنصلية إسطنبول محكمة سيدي امحمد.",
          dz: "الطلاق لي يوقع في الغربة ما عندو حتى أثر في الدزاير حتى محكمة جزائرية تعطيه الإكزيكاتور (نيويورك، باريس، إسطنبول). باريس تقول قدم الطلب لقاضي الأحوال الشخصية في محكمة بلاصة الزيادة إذا ولدت في الدزاير، ولا لمحكمة سيدي امحمد في الجزائر العاصمة إذا ولدت برا؛ وإسطنبول تذكر محكمة سيدي امحمد." } },
      ],
    },
  ] as GuideSection[],
  fees: [] as FeeRow[],
};
