import type { Locale } from "@/lib/i18n";
import type { GuidePoint, GuideSection, FeeRow } from "./passport";

/**
 * Criminal record extract (casier judiciaire, bulletin n°3). EVERY point is a
 * restatement of what the cited data/corpus.json records say (ids in `cites`).
 * Nothing here comes from outside knowledge. Rules that come from one office
 * name that office. If the corpus changes, review this file.
 */

type L = Record<Locale, string>;
export type { GuidePoint, GuideSection, FeeRow };

const MJ_FR = "mjustice-dz-fr-nouveau-lancement-officiel-du-service-de-demande-et-de-";
const MJ_AR = "mjustice-dz-ar";
const FAQ_FR = "mjustice-dz-fr-extraire-des-documents";
const FAQ_AR = "mjustice-dz-ar-c73922";
const MISS_FR = "mjustice-dz-fr-au-niveau-des-representations-judiciaires-2-2";
const MISS_AR = "mjustice-dz-ar-2-2-2-94613b";
const W = "criminal-record-embwashington";
const LD = "criminal-record-cglondon";
const LDU = "algerian-consulate-org-uk-consulaire-social-legal-affairs-criminal-record-casier";
const NY = "cgny-criminal-record";
const IS = "cgistanbul.mfa.gov.dz-criminal-record";
const OTT = "www-embassyalgeria-ca-casier-judiciaire";
const NA = "consulat-nantes-algerie-fr-documents-juridiques-casier-judiciaire";
const PT = "criminal-record-cpontoise-form";

export const GUIDE = {
  title: {
    en: "Criminal record extract (bulletin no. 3)",
    fr: "Extrait de casier judiciaire (bulletin n° 3)",
    ar: "صحيفة السوابق القضائية (القسيمة رقم 3)",
    dz: "صحيفة السوابق العدلية (البولتان نمرو 3)",
  } as L,
  lead: {
    en: "What the Ministry of Justice and consular pages say about getting bulletin no. 3 online, at a court in Algeria, or through a consulate.",
    fr: "Ce que disent le ministère de la Justice et les pages consulaires sur l'obtention du bulletin n° 3 : en ligne, auprès d'une juridiction en Algérie ou via un consulat.",
    ar: "ما تذكره وزارة العدل والصفحات القنصلية عن استخراج القسيمة رقم 3: عبر الإنترنت، أو لدى جهة قضائية في الجزائر، أو عبر القنصلية.",
    dz: "واش يقولو وزارة العدل والصفحات تاع القنصليات على كيفاش تجبد البولتان نمرو 3: من الأنترنت، في محكمة في الدزاير، ولا عن طريق القنصلية.",
  } as L,
  portals: [
    { url: "https://portail.mjustice.dz/", label: { en: "Ministry of Justice e-services portal", fr: "Portail électronique du ministère de la Justice", ar: "البوابة الإلكترونية لوزارة العدل", dz: "البوابة الإلكترونية تاع وزارة العدل" } as L },
    { url: "https://www.mjustice.dz/", label: { en: "Ministry of Justice", fr: "Ministère de la Justice", ar: "وزارة العدل", dz: "وزارة العدل" } as L },
  ],
  sections: [
    {
      id: "online",
      title: { en: "Online (Ministry of Justice)", fr: "En ligne (ministère de la Justice)", ar: "عبر الإنترنت (وزارة العدل)", dz: "من الأنترنت (وزارة العدل)" },
      points: [
        { cites: [MJ_FR, MJ_AR], text: {
          en: "Since 15 February 2021 the Ministry of Justice offers the electronic bulletin no. 3 (with or without convictions) online, with no need to visit a court. You register through the \"Casier judiciaire\" window of the Ministry's portal, filling in a form with your identity details and mobile number.",
          fr: "Depuis le 15 février 2021, le ministère de la Justice propose en ligne la version électronique du bulletin n° 3 (sans ou avec condamnations), sans déplacement en juridiction. L'inscription se fait par la fenêtre « Casier judiciaire » du portail du ministère, avec un formulaire comprenant les données d'identité et le numéro de mobile.",
          ar: "منذ 15 فيفري 2021 تتيح وزارة العدل عبر الإنترنت النسخة الإلكترونية للقسيمة رقم 3 (للمدانين وغير المدانين) دون التنقل إلى الجهة القضائية. ويتم التسجيل عبر نافذة «صحيفة السوابق القضائية» في بوابة الوزارة بملء استمارة تتضمن بيانات الهوية ورقم الهاتف النقال.",
          dz: "من 15 فيفري 2021 وزارة العدل تعطي النسخة الإلكترونية تاع البولتان نمرو 3 (بصح ولا بلا أحكام) من الأنترنت، بلا ما تروح للمحكمة. تسجل من نافذة «صحيفة السوابق القضائية» في بوابة الوزارة، تعمر استمارة فيها معلومات الهوية ونمرو التليفون." } },
        { cites: [MJ_FR, MJ_AR], text: {
          en: "You get an SMS with a secret code to confirm registration, then an electronically signed PDF you can save and print, plus two accounts for later requests on portail.mjustice.dz. The announcement does not say whether people living abroad can use it.",
          fr: "Un SMS avec un code secret confirme l'inscription, puis vous recevez un PDF signé électroniquement, à enregistrer et imprimer, ainsi que deux comptes pour de futures demandes sur portail.mjustice.dz. L'annonce ne précise pas si les personnes résidant à l'étranger peuvent l'utiliser.",
          ar: "تصلك رسالة نصية برمز سري لتأكيد التسجيل، ثم نسخة PDF موقَّعة إلكترونيًا قابلة للحفظ والطباعة، وحسابان للاستفادة لاحقًا من الخدمة عبر portail.mjustice.dz. ولا يذكر الإعلان ما إذا كان بإمكان المقيمين بالخارج استعمالها.",
          dz: "يوصلك SMS فيه رمز سري باش تأكد التسجيل، ومن بعد PDF ممضي إلكترونيا تقدر تحفظو وتطبعو، وحسابين للطلبات الجاية في portail.mjustice.dz. الإعلان ما يقولش واش اللي ساكنين في الغربة يقدرو يستعملوها." } },
        { cites: [MJ_FR, MJ_AR], text: {
          en: "The electronic bulletin no. 3 is exempt from judicial tax under the 2020 finance law.",
          fr: "Le bulletin n° 3 délivré par voie électronique est exempté de la taxe judiciaire, conformément à la loi de finances 2020.",
          ar: "القسيمة رقم 3 المسلَّمة إلكترونيًا معفاة من الرسوم القضائية بموجب قانون المالية لسنة 2020.",
          dz: "البولتان نمرو 3 الإلكتروني معفي من الرسم القضائي حسب قانون المالية 2020." } },
      ],
    },
    {
      id: "in-algeria",
      title: { en: "At a court in Algeria", fr: "Auprès d'une juridiction en Algérie", ar: "لدى جهة قضائية في الجزائر", dz: "في المحكمة في الدزاير" },
      points: [
        { cites: [FAQ_FR, FAQ_AR], text: {
          en: "The Ministry of Justice FAQ says the extract is issued on presentation of the birth certificate of the person concerned (or of the legal representative if the person is a minor or an adult lacking legal capacity), plus a 30 DA fiscal stamp.",
          fr: "La FAQ du ministère de la Justice indique que l'extrait est délivré sur présentation de l'acte de naissance de l'intéressé (ou de son représentant légal s'il est mineur ou majeur frappé d'incapacité), avec un timbre fiscal de 30 DA.",
          ar: "تذكر الأسئلة المتداولة لوزارة العدل أن الصحيفة تُستخرج بتقديم شهادة ميلاد المعني أو ممثله الشرعي إذا كان قاصرًا أو بالغًا عديم الأهلية، مع طابع جبائي بقيمة 30 دج.",
          dz: "الأسئلة المتداولة تاع وزارة العدل تقول الصحيفة تتخرج بشهادة ميلاد المعني ولا ممثله الشرعي إذا كان صغير ولا كبير ما عندوش الأهلية، مع طابع جبائي 30 دج." } },
        { cites: [FAQ_FR, FAQ_AR], text: {
          en: "The request is filed at the office of the prosecutor of the Republic or the prosecutor general of any court.",
          fr: "La demande est déposée au bureau du procureur de la République ou du procureur général de n'importe quelle juridiction.",
          ar: "يُقدَّم الطلب إلى وكيل الجمهورية أو النائب العام على مستوى أي جهة قضائية.",
          dz: "الطلب يتقدم لوكيل الجمهورية ولا النائب العام في أي جهة قضائية." } },
      ],
    },
    {
      id: "abroad",
      title: { en: "Through a consulate (abroad)", fr: "Par un consulat (à l'étranger)", ar: "عبر القنصلية (في الخارج)", dz: "عن طريق القنصلية (في الغربة)" },
      points: [
        { cites: [MISS_FR, MISS_AR, OTT], text: {
          en: "The Ministry of Justice says Algerians abroad, and foreigners who once lived in Algeria, can get bulletin no. 3, electronically signed, from the nearest diplomatic or consular mission without travelling to Algeria. Ottawa cites a ministerial instruction signed on 24 June 2010 by the Foreign Affairs and Justice ministers, under which requests can be made directly with its services.",
          fr: "Le ministère de la Justice indique que les Algériens de l'étranger, et les étrangers ayant résidé en Algérie, peuvent retirer le bulletin n° 3, signé électroniquement, auprès de la représentation diplomatique ou consulaire la plus proche, sans se déplacer en Algérie. Ottawa cite une instruction ministérielle signée le 24 juin 2010 par les ministres des Affaires étrangères et de la Justice, en vertu de laquelle la demande peut être faite directement auprès de ses services.",
          ar: "تذكر وزارة العدل أن الجزائريين بالخارج والأجانب الذين سبق لهم الإقامة بالجزائر يمكنهم الحصول على القسيمة رقم 3 ممضاة إلكترونيًا لدى أقرب ممثلية دبلوماسية أو قنصلية دون التنقل إلى الجزائر. وتشير سفارة أوتاوا إلى تعليمة وزارية وقّعها وزيرا الخارجية والعدل في 24 جوان 2010 تتيح تقديم الطلب مباشرة لدى مصالحها.",
          dz: "وزارة العدل تقول الجزائريين لي في الغربة والأجانب لي سبق عاشو في الدزاير يقدرو ياخذو البولتان نمرو 3 ممضي إلكترونيا من أقرب سفارة ولا قنصلية بلا ما يروحو للدزاير. أوتاوا تذكر تعليمة وزارية وقّعوها وزيرا الخارجية والعدل في 24 جوان 2010 تخلي الطلب يتقدم مباشرة عند مصالحها." } },
        { cites: [W, LD, LDU, NA, IS], text: {
          en: "Who can apply depends on the office. Washington accepts Algerians living abroad and foreign nationals who lived in Algeria and now live outside it. London: community members in the UK registered with the consulate. Nantes: people registered there and born in Algeria, and foreigners who lived in Algeria, applying in person. Istanbul: people registered there and born in Algeria, and foreigners who lived in Algeria, applying in person.",
          fr: "Les personnes éligibles dépendent du poste. Washington accepte les Algériens vivant à l'étranger et les étrangers ayant vécu en Algérie et résidant hors du pays. Londres : les membres de la communauté au Royaume-Uni immatriculés au consulat. Nantes : les personnes immatriculées et nées en Algérie, et les étrangers ayant résidé en Algérie, la demande étant faite par l'intéressé lui-même. Istanbul : les personnes immatriculées et nées en Algérie, et les étrangers ayant résidé en Algérie, sur dépôt en personne.",
          ar: "تختلف الفئات المؤهلة حسب الممثلية. تقبل سفارة واشنطن الجزائريين المقيمين بالخارج والأجانب الذين أقاموا في الجزائر ويقيمون الآن خارجها. لندن: أفراد الجالية بالمملكة المتحدة المسجلون لدى القنصلية. نانت: المسجلون لديها والمولودون في الجزائر، والأجانب الذين أقاموا في الجزائر، ويقدّم الطلبَ المعنيُّ بنفسه. إسطنبول: المسجلون لديها والمولودون في الجزائر، والأجانب الذين أقاموا في الجزائر، ويُقدَّم الطلب شخصيًا.",
          dz: "شكون يقدر يطلب يختلف على حسب القنصلية. واشنطن تقبل الجزائريين لي في الغربة والأجانب لي عاشو في الدزاير وضرك ساكنين برا. لندن: ولاد الجالية في بريطانيا لي متسجلين في القنصلية. نانت: لي متسجلين عندها ومزدادين في الدزاير، والأجانب لي عاشو في الدزاير، والمعني يطلب بروحو. إسطنبول: لي متسجلين عندها ومزدادين في الدزاير، والأجانب لي عاشو في الدزاير، والطلب يتقدم شخصيا." } },
        { cites: [W, LD, NY], text: {
          en: "Documents by mail-in offices. Washington: the signed application form, a complete original birth certificate, a valid ID (registration card, passport or national ID card) and a prepaid self-addressed return envelope. London: the signed form, a copy of your valid consular registration card, the original full birth certificate (E.C. 12) and a prepaid return envelope. New York: the application form (PDF), birth certificate, a copy of the consular card and a prepaid return envelope. Foreign nationals add proof of residence in Algeria.",
          fr: "Pièces pour les postes qui traitent par courrier. Washington : formulaire signé, acte de naissance original intégral, pièce d'identité valide (carte d'immatriculation, passeport ou carte nationale d'identité) et enveloppe de retour prépayée avec adresse. Londres : formulaire signé, copie de la carte d'immatriculation consulaire valide, copie intégrale originale de l'acte de naissance (E.C. 12) et enveloppe de retour prépayée. New York : formulaire (PDF), acte de naissance, copie de la carte consulaire et enveloppe de retour prépayée. Les étrangers ajoutent une preuve de résidence en Algérie.",
          ar: "الوثائق لدى الممثليات التي تعالج الطلبات بالبريد. واشنطن: استمارة موقَّعة، وشهادة ميلاد كاملة أصلية، ووثيقة هوية سارية (بطاقة تسجيل أو جواز سفر أو بطاقة تعريف وطنية)، وظرف إرجاع مدفوع الأجر ومعنون. لندن: الاستمارة الموقَّعة، ونسخة من بطاقة التسجيل القنصلي السارية، والنسخة الكاملة الأصلية لشهادة الميلاد (E.C. 12)، وظرف إرجاع مدفوع الأجر. نيويورك: الاستمارة (PDF)، وشهادة الميلاد، ونسخة من البطاقة القنصلية، وظرف إرجاع مدفوع الأجر. ويضيف الأجانب إثبات الإقامة في الجزائر.",
          dz: "الوراق في القنصليات لي تخدم بالبوسطة. واشنطن: الاستمارة ممضية، شهادة ميلاد كاملة أصلية، ورقة هوية صالحة (كارطة التسجيل ولا الباسبور ولا كارط ديدونتيتي) وظرف رجوع مخلّص ومكتوب عليه عنوانك. لندن: الاستمارة ممضية، نسخة من كارطة التسجيل القنصلي الصالحة، النسخة الكاملة الأصلية من شهادة الميلاد (E.C. 12) وظرف رجوع مخلّص. نيويورك: الاستمارة (PDF)، شهادة الميلاد، نسخة من الكارطة القنصلية وظرف رجوع مخلّص. والأجانب يزيدو ورقة تثبت أنهم عاشو في الدزاير." } },
        { cites: [OTT, NA, IS, PT], text: {
          en: "Other offices. Ottawa: the dated and signed form, your birth extract, a valid ID, and for foreigners proof of residence in Algeria. Nantes: an Algerian ID and, if Algerian by birth, a birth certificate; foreigners bring proof of identity and of residence in Algeria. Istanbul: the request form, the birth certificate if born in Algeria, and an Algerian ID (foreigners: ID and proof of former residence). Pontoise publishes a form where name and first name are written in French and Arabic; it lists no supporting documents.",
          fr: "Autres postes. Ottawa : formulaire daté et signé, extrait de naissance, pièce d'identité valide, et pour les étrangers la preuve de résidence en Algérie. Nantes : une pièce d'identité algérienne et, pour les Algériens de naissance, un acte de naissance ; les étrangers fournissent un justificatif d'identité et de résidence en Algérie. Istanbul : formulaire de demande, acte de naissance si né en Algérie, et carte d'identité algérienne (étrangers : pièce d'identité et justificatif de résidence passée). Pontoise publie un formulaire où nom et prénom s'écrivent en français et en arabe ; il ne liste aucune pièce justificative.",
          ar: "ممثليات أخرى. أوتاوا: الاستمارة مؤرخة وموقعة، ومستخرج الميلاد، ووثيقة هوية سارية، وللأجانب إثبات الإقامة في الجزائر. نانت: وثيقة هوية جزائرية، وشهادة ميلاد إن كان جزائريًا بالميلاد؛ ويقدّم الأجانب ما يثبت هويتهم وإقامتهم بالجزائر. إسطنبول: استمارة الطلب، وشهادة الميلاد إن وُلد في الجزائر، وبطاقة هوية جزائرية (الأجانب: هوية وما يثبت الإقامة السابقة). وتنشر بونتواز استمارة يُكتب فيها الاسم واللقب بالفرنسية والعربية، ولا تذكر أي وثائق مرفقة.",
          dz: "قنصليات أخرى. أوتاوا: الاستمارة بالتاريخ وممضية، مستخرج الميلاد، ورقة هوية صالحة، وللأجانب ورقة الإقامة في الدزاير. نانت: ورقة هوية جزائرية، وشهادة ميلاد إذا كان جزائري بالزيادة؛ والأجانب يجيبو ما يثبت هويتهم وإقامتهم في الدزاير. إسطنبول: استمارة الطلب، شهادة الميلاد إذا مزداد في الدزاير، وكارط ديدونتيتي جزائرية (الأجانب: هوية وما يثبت الإقامة لي فاتت). بونتواز عندها استمارة تكتب فيها الاسم واللقب بالفرنسية والعربية، وما كتبتش حتى وراق إضافية." } },
      ],
    },
    {
      id: "language-fees",
      title: { en: "Language, fees and who applies", fr: "Langue, tarifs et demandeur", ar: "اللغة والرسوم وصاحب الطلب", dz: "اللغة، السوما ومن يطلب" },
      points: [
        { cites: [OTT, NA, LD, LDU], text: {
          en: "Ottawa and Nantes say the bulletin is written in Arabic but you can ask for a French version. London says records are issued only in Arabic or French, with no translation into English or other languages.",
          fr: "Ottawa et Nantes indiquent que le bulletin est rédigé en arabe mais qu'on peut demander une version en français. Londres précise que les bulletins ne sont délivrés qu'en arabe ou en français, sans traduction en anglais ni autre langue.",
          ar: "تذكر أوتاوا ونانت أن القسيمة محرَّرة بالعربية ويمكن طلبها بالفرنسية. وتذكر لندن أن الصحيفة لا تصدر إلا بالعربية أو الفرنسية دون ترجمة إلى الإنجليزية أو لغة أخرى.",
          dz: "أوتاوا ونانت يقولو البولتان مكتوب بالعربية بصح تقدر تطلبو بالفرنسية. لندن تقول الصحيفة تخرج غير بالعربية ولا بالفرنسية، وما يترجموش للإنجليزية ولا لغة أخرى." } },
        { cites: [LD, LDU, OTT, NY], text: {
          en: "London, Ottawa and New York state that the criminal record is free of charge. The Washington and Istanbul pages state no fee.",
          fr: "Londres, Ottawa et New York indiquent que le casier judiciaire est gratuit. Les pages de Washington et d'Istanbul n'indiquent aucun tarif.",
          ar: "تذكر لندن وأوتاوا ونيويورك أن صحيفة السوابق مجانية. ولا تذكر صفحتا واشنطن وإسطنبول أي رسوم.",
          dz: "لندن وأوتاوا ونيويورك يقولو صحيفة السوابق بلاش. صفحتي واشنطن وإسطنبول ما يذكروش حتى سومة." } },
        { cites: [NA, PT], text: {
          en: "Nantes says the request must be made by the person concerned. Pontoise's form states the request is strictly personal.",
          fr: "Nantes précise que la demande doit être formulée par l'intéressé lui-même. Le formulaire de Pontoise indique que la demande est strictement personnelle.",
          ar: "تذكر نانت أن الطلب يجب أن يقدّمه المعني نفسه. وتذكر استمارة بونتواز أن الطلب شخصي بحت.",
          dz: "نانت تقول الطلب لازم يديرو المعني بروحو. واستمارة بونتواز تقول الطلب شخصي بصح." } },
      ],
    },
  ] as GuideSection[],
  fees: [] as FeeRow[],
};
