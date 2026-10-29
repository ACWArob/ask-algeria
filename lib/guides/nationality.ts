import type { Locale } from "@/lib/i18n";
import type { GuidePoint, GuideSection, FeeRow } from "./passport";

/**
 * Certificate of Algerian nationality and the consular nationality attestation.
 * EVERY point is a restatement of what the cited data/corpus.json records say
 * (ids in `cites`). Nothing here comes from outside knowledge. Rules that come
 * from one office name that office. If the corpus changes, review this file.
 */

type L = Record<Locale, string>;
export type { GuidePoint, GuideSection, FeeRow };

const MISS_FR = "mjustice-dz-fr-au-niveau-des-representations-judiciaires-2-2";
const MISS_AR = "mjustice-dz-ar-2-2-2-94613b";
const FAQ_FR = "mjustice-dz-fr-extraire-des-documents";
const FAQ_AR = "mjustice-dz-ar-c73922";
const SF = "nationality-cgsanfrancisco";
const NY = "cgny-nationality-certificate";
const BR = "nationality-cgbrussels-online";
const WA = "nationality-embwashington-announcement";
const PAR = "cgparis-mfa-gov-dz-fr-consular-services-civil-status-1-attestation-de-";
const PT = "cpontoise-mfa-gov-dz-fr-consular-services-civil-status-1-attestation-d";
const CW = "civil-status-embwashington";

export const GUIDE = {
  title: {
    en: "Certificate of Algerian nationality",
    fr: "Certificat de nationalité algérienne",
    ar: "شهادة الجنسية الجزائرية",
    dz: "شهادة الجنسية الجزائرية",
  } as L,
  lead: {
    en: "What the Ministry of Justice and consular pages say about getting the nationality certificate from abroad or in Algeria, and how it differs from the consular attestation.",
    fr: "Ce que disent le ministère de la Justice et les pages consulaires sur l'obtention du certificat de nationalité depuis l'étranger ou en Algérie, et sa différence avec l'attestation consulaire.",
    ar: "ما تذكره وزارة العدل والصفحات القنصلية عن استخراج شهادة الجنسية من الخارج أو في الجزائر، وما يميّزها عن الشهادة القنصلية.",
    dz: "واش يقولو وزارة العدل والصفحات القنصلية على كيفاش تجبد شهادة الجنسية من الغربة ولا في الدزاير، وواش الفرق بينها وبين الأتستاسيون القنصلية.",
  } as L,
  portals: [
    { url: "https://portail.mjustice.dz/", label: { en: "Ministry of Justice e-services portal", fr: "Portail électronique du ministère de la Justice", ar: "البوابة الإلكترونية لوزارة العدل", dz: "البوابة الإلكترونية تاع وزارة العدل" } as L },
    { url: "https://www.mjustice.dz/", label: { en: "Ministry of Justice", fr: "Ministère de la Justice", ar: "وزارة العدل", dz: "وزارة العدل" } as L },
  ],
  sections: [
    {
      id: "abroad",
      title: { en: "From abroad (consulate)", fr: "Depuis l'étranger (consulat)", ar: "من الخارج (القنصلية)", dz: "من الغربة (القنصلية)" },
      points: [
        { cites: [MISS_FR, MISS_AR, WA, BR], text: {
          en: "The Ministry of Justice says Algerians abroad can collect an electronically signed nationality certificate at the nearest diplomatic or consular mission without travelling to Algeria. The Washington and Brussels notices repeat this but give no website, steps or documents.",
          fr: "Le ministère de la Justice indique que les Algériens de l'étranger peuvent retirer un certificat de nationalité signé électroniquement auprès de la représentation diplomatique ou consulaire la plus proche, sans se déplacer en Algérie. Les avis de Washington et de Bruxelles le répètent mais ne donnent ni site, ni démarches, ni pièces.",
          ar: "تذكر وزارة العدل أن الجزائريين بالخارج يمكنهم استلام شهادة الجنسية ممضاة إلكترونيًا لدى أقرب ممثلية دبلوماسية أو قنصلية دون التنقل إلى الجزائر. وتكرر ذلك إعلانات واشنطن وبروكسل دون ذكر موقع أو خطوات أو وثائق.",
          dz: "وزارة العدل تقول الجزائريين لي في الغربة يقدرو يجبدو شهادة الجنسية ممضية إلكترونيا من أقرب سفارة ولا قنصلية بلا ما يروحو للدزاير. إعلانات واشنطن وبروكسل يعاودو نفس الشي بصح ما يعطيوش الموقع ولا الخطوات ولا الوراق." } },
        { cites: [SF, NY], text: {
          en: "San Francisco and New York issue it to Algerian nationals established in their jurisdiction. The consulate submits the application on the Ministry of Justice platform; after the judicial authorities process it, the certificate is delivered electronically, signed. New York says no appointment is needed, applications can be made in person or by mail (notarised copies and a USPS Priority Mail return envelope), and the fee page shows it as free; San Francisco lists no fee.",
          fr: "San Francisco et New York le délivrent aux ressortissants algériens établis dans leur circonscription. Le consulat dépose la demande sur la plateforme du ministère de la Justice ; après traitement par les autorités judiciaires, le certificat est délivré électroniquement, signé. New York indique qu'aucun rendez-vous n'est nécessaire, que la demande se fait en personne ou par courrier (copies notariées et enveloppe de retour USPS Priority Mail), et que la page des tarifs l'indique gratuit ; San Francisco n'indique aucun tarif.",
          ar: "تصدرها قنصليتا سان فرانسيسكو ونيويورك للمواطنين الجزائريين المقيمين في دائرة اختصاصهما. تودع القنصلية الطلب في منصة وزارة العدل، وبعد معالجته من السلطات القضائية تُسلَّم الشهادة إلكترونيًا موقَّعة. وتذكر نيويورك أنه لا حاجة إلى موعد، وأن الطلب يُقدَّم شخصيًا أو بالبريد (نسخ موثّقة وظرف إرجاع من USPS Priority Mail)، وتُظهر صفحة الرسوم أنها مجانية؛ ولا تذكر سان فرانسيسكو أي رسوم.",
          dz: "سان فرانسيسكو ونيويورك يخرجوها للجزائريين لي مقيمين في دائرتهم. القنصلية تحط الطلب في منصة وزارة العدل، وكي تعالجو السلطات القضائية تتسلم الشهادة إلكترونيا ممضية. نيويورك تقول ما كاين لا موعد، والطلب يتقدم شخصيا ولا بالبوسطة (نسخ عند الموثق وظرف رجوع USPS Priority Mail)، وصفحة السوما تقول بلاش؛ وسان فرانسيسكو ما كتبت حتى سومة." } },
        { cites: [SF, NY], text: {
          en: "Both ask for the signed application form and require that all details in your documents match; the judicial authority may ask you to correct your civil-status documents before issuing the certificate. San Francisco asks for Algerian civil-status documents in Arabic and a notarised copy of an official ID (Algerian or US). New York asks for one ID from a list (for example a state ID, driver's licence, US passport, permanent resident card or foreign passport), with civil-status documents in the national language.",
          fr: "Les deux demandent le formulaire signé et exigent que toutes les informations de vos pièces concordent ; l'autorité judiciaire peut demander de corriger vos actes d'état civil avant de délivrer le certificat. San Francisco demande les actes d'état civil algériens en arabe et une copie notariée d'une pièce d'identité officielle (algérienne ou américaine). New York demande une pièce d'identité parmi une liste (par exemple carte d'État, permis de conduire, passeport américain, carte de résident permanent ou passeport étranger), avec des actes d'état civil en langue nationale.",
          ar: "تطلب كلتاهما الاستمارة موقَّعة وتشترطان تطابق جميع البيانات في وثائقك؛ وقد تطلب السلطة القضائية تصحيح وثائق الحالة المدنية قبل إصدار الشهادة. تطلب سان فرانسيسكو وثائق الحالة المدنية الجزائرية بالعربية ونسخة موثّقة من وثيقة هوية رسمية (جزائرية أو أمريكية). وتطلب نيويورك وثيقة هوية واحدة من قائمة (مثل هوية الولاية أو رخصة السياقة أو الجواز الأمريكي أو بطاقة الإقامة الدائمة أو جواز أجنبي)، مع وثائق حالة مدنية باللغة الوطنية.",
          dz: "الزوج يطلبو الاستمارة ممضية ولازم كل المعلومات في وراقك تتطابق؛ والسلطة القضائية تقدر تطلب منك تصحح وثائق الحالة المدنية قبل ما تخرج الشهادة. سان فرانسيسكو تطلب وثائق الحالة المدنية الجزائرية بالعربية ونسخة عند الموثق من ورقة هوية رسمية (جزائرية ولا أمريكية). ونيويورك تطلب ورقة هوية وحدة من لايست (مثلا هوية الولاية، رخصة السياقة، الباسبور الأمريكي، كارطة الإقامة الدائمة ولا باسبور أجنبي)، مع وثائق الحالة المدنية باللغة الوطنية." } },
      ],
    },
    {
      id: "cases",
      title: { en: "Documents by family situation", fr: "Pièces selon la situation familiale", ar: "الوثائق حسب الحالة العائلية", dz: "الوراق على حسب الحالة العائلية" },
      points: [
        { cites: [NY, FAQ_FR, FAQ_AR], text: {
          en: "Through an Algerian father: if his nationality is original, the applicant's, father's and grandfather's birth certificates (New York; the Ministry of Justice FAQ lists the same). If he acquired it, the applicant's birth certificate and a copy of the acquisition decree. If it was proven by court, the applicant's and father's birth certificates and an executive copy of the final judicial decision.",
          fr: "Par un père algérien : si sa nationalité est d'origine, les actes de naissance du demandeur, du père et du grand-père (New York ; la FAQ du ministère de la Justice donne la même liste). S'il l'a acquise, l'acte de naissance du demandeur et une copie du décret d'acquisition. Si elle a été établie par décision de justice, les actes de naissance du demandeur et du père et une copie exécutoire de la décision définitive.",
          ar: "عن طريق الأب الجزائري: إذا كانت جنسيته أصلية فشهادات ميلاد المعني وأبيه وجده (نيويورك؛ وتورد الأسئلة المتداولة لوزارة العدل القائمة نفسها). وإذا اكتسبها فشهادة ميلاد المعني ونسخة من مرسوم الاكتساب. وإذا ثبتت بحكم قضائي فشهادتا ميلاد المعني وأبيه ونسخة تنفيذية من الحكم النهائي.",
          dz: "من جهة البابا الجزائري: إذا جنسيته أصلية، شهادات ميلاد المعني وباباه وجده (نيويورك؛ والأسئلة المتداولة تاع وزارة العدل تعطي نفس القائمة). إذا اكتسبها، شهادة ميلاد المعني ونسخة من مرسوم الاكتساب. إذا ثبتت بحكم قضائي، شهادتي ميلاد المعني وباباه ونسخة تنفيذية من الحكم النهائي." } },
        { cites: [NY, FAQ_FR, FAQ_AR], text: {
          en: "Through an Algerian mother: if original, the applicant's birth certificate plus either her nationality certificate or the birth certificates of the mother, her father and her grandfather. If she acquired it, the applicant's birth certificate and her acquisition decree; if proven by court, both birth certificates and the judicial decision.",
          fr: "Par une mère algérienne : si sa nationalité est d'origine, l'acte de naissance du demandeur plus soit son certificat de nationalité, soit les actes de naissance de la mère, de son père et de son grand-père. Si elle l'a acquise, l'acte de naissance du demandeur et son décret d'acquisition ; si elle a été établie par décision de justice, les deux actes de naissance et la décision.",
          ar: "عن طريق الأم الجزائرية: إذا كانت جنسيتها أصلية فشهادة ميلاد المعني مع شهادة جنسية الأم أو شهادات ميلاد الأم وأبيها وجدها. وإذا اكتسبتها فشهادة ميلاد المعني ومرسوم اكتساب الأم؛ وإذا ثبتت بحكم قضائي فشهادتا الميلاد والحكم القضائي.",
          dz: "من جهة الماما الجزائرية: إذا جنسيتها أصلية، شهادة ميلاد المعني مع شهادة جنسية الماما ولا شهادات ميلاد الماما وباباها وجدها. إذا اكتسبتها، شهادة ميلاد المعني ومرسوم اكتساب الماما؛ وإذا ثبتت بحكم قضائي، شهادتي الميلاد والحكم." } },
        { cites: [NY, FAQ_FR, FAQ_AR], text: {
          en: "Other cases: born in Algeria to unknown parents, the full Algerian birth certificate only (New York; the FAQ says the same). Mother named but father unknown: the same plus a certificate from the childhood-assistance directorate saying the mother's name is unknown. Nationality acquired or proven by court decision: the applicant's birth certificate and a copy of the decision.",
          fr: "Autres cas : né en Algérie de parents inconnus, la copie intégrale de l'acte de naissance algérien seulement (New York ; la FAQ dit de même). Mère nommée seulement : la même pièce plus un certificat de la direction chargée de l'enfance assistée. Nationalité acquise ou établie par décision de justice : l'acte de naissance du demandeur et une copie de la décision.",
          ar: "حالات أخرى: المولود في الجزائر من أبوين مجهولين، تكفي النسخة الكاملة من شهادة الميلاد الجزائرية (نيويورك؛ وتذكر الأسئلة المتداولة الأمر نفسه). والمولود من أم مسماة فقط: الوثيقة نفسها مع شهادة من مديرية الطفولة المسعفة. وللجنسية المكتسبة أو الثابتة بحكم قضائي: شهادة ميلاد المعني ونسخة من الحكم.",
          dz: "حالات أخرى: مزداد في الدزاير من والدين مجهولين، يكفي النسخة الكاملة من شهادة الميلاد الجزائرية (نيويورك؛ والأسئلة المتداولة تقول نفس الشي). الماما مسماة غير: نفس الورقة مع شهادة من مديرية الطفولة المسعفة. الجنسية المكتسبة ولا الثابتة بحكم قضائي: شهادة ميلاد المعني ونسخة من الحكم." } },
      ],
    },
    {
      id: "in-algeria",
      title: { en: "In Algeria", fr: "En Algérie", ar: "في الجزائر", dz: "في الدزاير" },
      points: [
        { cites: [MISS_FR, MISS_AR], text: {
          en: "The Ministry of Justice says the nationality certificate can be obtained at any court in the national territory, or at a national diplomatic mission abroad.",
          fr: "Le ministère de la Justice indique que le certificat de nationalité peut être obtenu auprès de n'importe quel tribunal sur le territoire national ou auprès d'une représentation diplomatique nationale à l'étranger.",
          ar: "تذكر وزارة العدل أن شهادة الجنسية تُستخرج من أي محكمة عبر التراب الوطني أو من ممثلية دبلوماسية وطنية بالخارج.",
          dz: "وزارة العدل تقول شهادة الجنسية تتخرج من أي محكمة في الدزاير ولا من ممثلية دبلوماسية جزائرية في الخارج." } },
        { cites: [FAQ_FR, FAQ_AR], text: {
          en: "On where to file, the Ministry's two language versions differ: the French FAQ says the documents go to the office of the prosecutor of the Republic of any court, while the Arabic FAQ says the request goes to the president of the court whose jurisdiction covers the person's home. Ask the court which applies.",
          fr: "Sur le lieu de dépôt, les deux versions linguistiques du ministère diffèrent : la FAQ française indique le bureau du procureur de la République de n'importe quelle juridiction, tandis que la FAQ arabe indique le président du tribunal dans le ressort duquel se trouve le domicile de l'intéressé. Renseignez-vous auprès du tribunal.",
          ar: "بخصوص جهة إيداع الطلب، تختلف نسختا الوزارة: تذكر الأسئلة المتداولة بالفرنسية مكتب وكيل الجمهورية لدى أي جهة قضائية، بينما تذكر النسخة العربية رئيس المحكمة التي يقع سكن المعني في دائرة اختصاصها. استفسر لدى المحكمة عن الجهة المعتمدة.",
          dz: "على بلاصة إيداع الطلب، النسختين تاع الوزارة ماشي كيف كيف: الفرنسية تقول مكتب وكيل الجمهورية في أي محكمة، والعربية تقول رئيس المحكمة لي سكن المعني في دائرتها. سقسي المحكمة أي وحدة معتمدة." } },
      ],
    },
    {
      id: "attestation",
      title: { en: "Consular attestation is not the certificate", fr: "L'attestation consulaire n'est pas le certificat", ar: "الشهادة القنصلية ليست شهادة الجنسية", dz: "الأتستاسيون القنصلية ماشي شهادة الجنسية" },
      points: [
        { cites: [PAR, PT, CW], text: {
          en: "Paris and Pontoise issue an \"attestation of Algerian nationality\" only to people registered at the consulate, and state it is not the nationality certificate, which they say is issued only by a court in Algeria. Washington likewise says its attestation is for registered nationals and does not replace the court-issued certificate.",
          fr: "Paris et Pontoise délivrent une « attestation de nationalité algérienne » uniquement aux personnes immatriculées au consulat, et précisent qu'elle ne vaut pas certificat de nationalité, délivré selon elles uniquement par un tribunal en Algérie. Washington indique de même que son attestation est réservée aux ressortissants immatriculés et ne remplace pas le certificat délivré par le tribunal.",
          ar: "تسلّم قنصليتا باريس وبونتواز «شهادة الجنسية الجزائرية» للمسجّلين لدى القنصلية فقط، وتنصّان على أنها لا تغني عن شهادة الجنسية التي تقولان إنها لا تصدر إلا عن محكمة في الجزائر. وتذكر سفارة واشنطن كذلك أن شهادتها للمواطنين المسجّلين ولا تحلّ محل الشهادة الصادرة عن المحكمة.",
          dz: "باريس وبونتواز يخرجو «أتستاسيون الجنسية الجزائرية» غير للناس لي متسجلين في القنصلية، ويقولو ماشي هي شهادة الجنسية، لي يقولو تخرج غير من محكمة في الدزاير. وواشنطن تقول كذلك الأتستاسيون تاعها للمسجلين وما تعوضش الشهادة لي تخرجها المحكمة." } },
        { cites: [PAR], text: {
          en: "Paris asks for: an Algerian ID of the person (passport, consular card or national identity card), the full copy of their birth certificate, the full copy of the father's birth certificate, and the mother's if the father is foreign.",
          fr: "Paris demande : une pièce d'identité algérienne de l'intéressé (passeport, carte consulaire ou carte nationale d'identité), la copie intégrale de son acte de naissance, celle de l'acte de naissance du père, et celle de la mère si le père est étranger.",
          ar: "تطلب قنصلية باريس: وثيقة هوية جزائرية للمعني (جواز سفر أو بطاقة قنصلية أو بطاقة تعريف وطنية)، والنسخة الكاملة لشهادة ميلاده، والنسخة الكاملة لشهادة ميلاد الأب، وشهادة ميلاد الأم إذا كان الأب أجنبيًا.",
          dz: "باريس تطلب: ورقة هوية جزائرية تاع المعني (باسبور، كارطة قنصلية ولا كارط ديدونتيتي)، النسخة الكاملة من شهادة ميلاده، النسخة الكاملة من شهادة ميلاد البابا، وتاع الماما إذا البابا أجنبي." } },
      ],
    },
  ] as GuideSection[],
  fees: [] as FeeRow[],
};
