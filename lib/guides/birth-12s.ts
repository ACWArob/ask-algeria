import type { Locale } from "@/lib/i18n";
import type { GuidePoint, GuideSection, FeeRow } from "./passport";

/**
 * 12S birth certificate and civil-status extracts. EVERY point is a restatement
 * of what the cited data/corpus.json records say (ids in `cites`). Nothing here
 * comes from outside knowledge. Where a rule comes from one office, the text
 * names that office. If the corpus changes, review this file.
 */

type L = Record<Locale, string>;
export type { GuidePoint, GuideSection, FeeRow };

const I12 = "interieur-gov-dz-2020-10-24-demande-de-certificat-de-naissance-12s-au-";
const I12A = "interieur-gov-dz-2020-10-24-12-196bb3";
const P12 = "demande12s-interieur-gov-dz";
const W = "birth-12s-embwashington";
const LD = "birth-12s-cglondon";
const IS = "birth-12s-cgistanbul";
const WA = "birth-12s-embwarsaw";
const NY = "cgny-civilstatus";
const MFA = "civil-status-mfa-algiers";
const PAR = "cgparis-mfa-gov-dz-fr-consular-services-civil-status-1-extracts-of-civ";
const BN = "interieur-gov-dz-2023-12-13-acte-de-naissance";
const OR = "wilayaoran.dz-acte-de-naissance";

export const GUIDE = {
  title: {
    en: "12S birth certificate and civil-status extracts",
    fr: "Extrait de naissance 12S et extraits d'état civil",
    ar: "شهادة الميلاد 12خ ومستخرجات الحالة المدنية",
    dz: "شهادة الميلاد 12S وإستخراجات الحالة المدنية",
  } as L,
  lead: {
    en: "What official pages say about the 12S: how to request it online, what differs between consulates, and how it works for people born abroad.",
    fr: "Ce que disent les pages officielles sur le 12S : la demande en ligne, les différences entre consulats et le cas des personnes nées à l'étranger.",
    ar: "ما تذكره الصفحات الرسمية عن شهادة الميلاد 12خ: الطلب عبر الإنترنت، واختلاف الإجراءات بين القنصليات، وحالة المولودين في الخارج.",
    dz: "واش تقول الصفحات الرسمية على شهادة الميلاد 12S: كيفاش تطلبها من الأنترنت، واش يختلف بين القنصليات، وكيفاش يديرو للي مزدادين في الغربة.",
  } as L,
  portals: [
    { url: "http://demande12s.interieur.gov.dz/", label: { en: "12S birth certificate request (Ministry of the Interior)", fr: "Demande d'extrait de naissance 12S (ministère de l'Intérieur)", ar: "طلب شهادة الميلاد 12خ (وزارة الداخلية)", dz: "طلب شهادة الميلاد 12S (وزارة الداخلية)" } as L },
    { url: "https://etatcivil.interieur.gov.dz/ActeNaissance/", label: { en: "Birth certificate online (Ministry of the Interior)", fr: "Acte de naissance en ligne (ministère de l'Intérieur)", ar: "شهادة الميلاد عن بعد (وزارة الداخلية)", dz: "شهادة الميلاد من الأنترنت (وزارة الداخلية)" } as L },
    { url: "https://www.mfa.gov.dz/services-for-algerians/civil-status-1", label: { en: "Civil Status Office, Ministry of Foreign Affairs", fr: "Service de l'état civil, ministère des Affaires étrangères", ar: "مصلحة الحالة المدنية بوزارة الشؤون الخارجية", dz: "مصلحة الحالة المدنية في وزارة الخارجية" } as L },
  ],
  sections: [
    {
      id: "what",
      title: { en: "What the 12S is", fr: "Ce qu'est le 12S", ar: "ما هي شهادة الميلاد 12خ", dz: "واش هي شهادة الميلاد 12S" },
      points: [
        { cites: [I12, P12], text: {
          en: "The 12S is an official civil-status extract issued by the birth commune from the civil register. It carries the information used to generate each Algerian's unique national identification number, and is printed on secure paper with a unique serial number.",
          fr: "Le 12S est un extrait d'acte de naissance officiel délivré par la commune de naissance à partir du registre d'état civil. Il contient les informations qui permettent de générer le numéro d'identifiant national unique de chaque Algérien, et il est imprimé sur papier sécurisé avec un numéro de série unique.",
          ar: "شهادة الميلاد 12خ وثيقة رسمية تصدرها بلدية الميلاد استنادًا إلى سجل الحالة المدنية. تتضمن المعلومات التي يُشكَّل منها رقم التعريف الوطني الفريد لكل جزائري، وتُطبع على ورق مؤمَّن يحمل رقمًا تسلسليًا فريدًا.",
          dz: "شهادة الميلاد 12S وثيقة رسمية تخرجها بلدية الميلاد من سجل الحالة المدنية. فيها المعلومات لي يتشكّل بيها رقم التعريف الوطني الوحيد تاع كل جزائري، وتتطبع على ورقة مؤمّنة فيها نمرو تسلسلي وحيد." } },
        { cites: [W, LD, NY], text: {
          en: "Washington and London say the 12S can be obtained only once in a lifetime and is needed before a biometric passport can be issued. New York says it is required for the biometric passport or ID card.",
          fr: "Washington et Londres indiquent que le 12S n'est délivré qu'une seule fois dans la vie et qu'il est nécessaire avant l'émission d'un passeport biométrique. New York précise qu'il est exigé pour le passeport ou la carte d'identité biométrique.",
          ar: "تذكر سفارة واشنطن وقنصلية لندن أن شهادة 12خ لا تُمنح إلا مرة واحدة في العمر وأنها لازمة قبل إصدار الجواز البيومتري. وتذكر قنصلية نيويورك أنها مطلوبة للجواز أو بطاقة التعريف البيومترية.",
          dz: "سفارة واشنطن وقنصلية لندن يقولو الـ12S تخرجها غير مرة وحدة في العمر وهي لازمة قبل ما يخرج الباسبور البيومتري. قنصلية نيويورك تقول لازمة للباسبور ولا لاكارط ديدونتيتي البيومترية." } },
      ],
    },
    {
      id: "abroad",
      title: { en: "Requesting it from abroad (born in Algeria)", fr: "La demander depuis l'étranger (né en Algérie)", ar: "طلبها من الخارج (المولود في الجزائر)", dz: "كيفاش تطلبها من الغربة (مزداد في الدزاير)" },
      points: [
        { cites: [I12, I12A], text: {
          en: "The Ministry of the Interior says Algerians abroad send the 12S request directly through its website and collect it at the diplomatic or consular mission where they are registered.",
          fr: "Le ministère de l'Intérieur indique que les Algériens à l'étranger introduisent leur demande de 12S directement sur son site web et la retirent à la représentation diplomatique ou consulaire où ils sont immatriculés.",
          ar: "تذكر وزارة الداخلية أن الجزائريين المقيمين بالخارج يقدّمون طلب شهادة 12خ مباشرة عبر موقعها على الإنترنت ويتسلّمونها من الممثلية الدبلوماسية أو القنصلية المسجّلين لديها.",
          dz: "وزارة الداخلية تقول الجزائريين لي في الغربة يطلبو الـ12S مباشرة من الموقع تاعها ويجبدوها من السفارة ولا القنصلية لي متسجلين فيها." } },
        { cites: [LD, IS, W], text: {
          en: "London lists three ways if you were born in Algeria: the town hall of birth, the Interior Ministry portal, or a proxy in Algeria arranged at the consulate. Istanbul lists the online request, an appointment at its consular centre where the document is stamped, or a power of attorney (stamped by the consulate) for someone in Algeria. Washington lists the birth city hall or the online portal.",
          fr: "Londres cite trois voies si vous êtes né en Algérie : la mairie du lieu de naissance, le portail du ministère de l'Intérieur, ou une procuration à une personne en Algérie établie au consulat. Istanbul cite la demande en ligne, un rendez-vous au centre consulaire où le document est tamponné, ou une procuration (visée par le consulat) à une personne en Algérie. Washington cite la mairie de naissance ou le portail en ligne.",
          ar: "تذكر قنصلية لندن ثلاث طرق لمن وُلد في الجزائر: بلدية الميلاد، أو بوابة وزارة الداخلية، أو وكالة لشخص في الجزائر تُحرَّر لدى القنصلية. وتذكر قنصلية إسطنبول: الطلب عبر الإنترنت، أو موعدًا في مركزها القنصلي حيث تُختم الوثيقة، أو وكالة (مختومة من القنصلية) لشخص في الجزائر. وتذكر سفارة واشنطن بلدية الميلاد أو البوابة الإلكترونية.",
          dz: "لندن تعطي ثلاث طرق إذا ولدت في الدزاير: بلدية الميلاد، بوابة وزارة الداخلية، ولا وكالة لواحد في الدزاير تديرها في القنصلية. إسطنبول تقول: الطلب من الأنترنت، ولا موعد في المركز القنصلي لي يختمو فيه الوثيقة، ولا وكالة (مختومة من القنصلية) لواحد في الدزاير. واشنطن تقول بلدية الميلاد ولا البوابة من الأنترنت." } },
        { cites: [LD], text: {
          en: "London says you must present a valid Algerian ID to obtain the 12S: a consular registration card, a passport or a national identity card.",
          fr: "Londres précise qu'il faut présenter une pièce d'identité algérienne valide pour obtenir le 12S : carte d'immatriculation consulaire, passeport ou carte nationale d'identité.",
          ar: "تذكر قنصلية لندن أنه يجب تقديم وثيقة هوية جزائرية سارية للحصول على الشهادة: بطاقة تسجيل قنصلي أو جواز سفر أو بطاقة تعريف وطنية.",
          dz: "لندن تقول لازم تجيب ورقة هوية جزائرية صالحة باش تاخذ الـ12S: كارطة التسجيل القنصلي ولا الباسبور ولا كارط ديدونتيتي." } },
        { cites: [WA], text: {
          en: "Warsaw: people born in Algeria and registered with the embassy can apply, and parents can apply for minor children born in Algeria, on the Interior Ministry site. Once generated, the certificate is sent to the mission, progress can be checked under the Application Tracking tab, and when the site says to contact the consulate you go to the civil status service with an Algerian ID. Children under 19 can be included at collection.",
          fr: "Varsovie : les personnes nées en Algérie et immatriculées à l'ambassade peuvent faire la demande, ainsi que les parents pour leurs enfants mineurs nés en Algérie, sur le site du ministère de l'Intérieur. Une fois généré, le certificat est envoyé à la représentation, l'avancement se suit dans l'onglet de suivi des demandes et, quand le site invite à contacter le consulat, on se présente au service d'état civil avec une pièce d'identité algérienne. Les enfants de moins de 19 ans peuvent être inclus au retrait.",
          ar: "وارسو: يمكن لمن وُلد في الجزائر وهو مسجّل لدى السفارة التقدّم بالطلب، وكذلك الوالدان لأبنائهما القاصرين المولودين في الجزائر، عبر موقع وزارة الداخلية. بعد إنشاء الشهادة تُرسل إلى الممثلية، ويمكن متابعة الطلب من تبويب «تتبّع الطلبات»، وعندما يطلب الموقع الاتصال بالقنصلية يُتوجَّه إلى مصلحة الحالة المدنية بوثيقة هوية جزائرية. ويمكن إدراج الأبناء دون 19 سنة عند الاستلام.",
          dz: "فارسوفيا: لي مزدادين في الدزاير ومتسجلين في السفارة يقدرو يطلبو، وحتى الأولياء لولادهم الصغار لي مزدادين في الدزاير، من موقع وزارة الداخلية. كي تتولد الشهادة تتبعث للسفارة، وتتبع الطلب من تبويب «تتبع الطلبات»، وكي يقولك الموقع اتصل بالقنصلية تروح لمصلحة الحالة المدنية بورقة هوية جزائرية. الصغار تحت 19 سنة يدخلو معاك وقت تجبد." } },
        { cites: [NY], text: {
          en: "New York's official fee list shows the 12S as free.",
          fr: "La liste officielle des tarifs de New York indique que le 12S est gratuit.",
          ar: "تُظهر قائمة الرسوم الرسمية لقنصلية نيويورك أن شهادة 12خ مجانية.",
          dz: "لايست السوما الرسمية تاع قنصلية نيويورك تقول الـ12S بلاش." } },
      ],
    },
    {
      id: "born-abroad",
      title: { en: "If you were born outside Algeria", fr: "Si vous êtes né hors d'Algérie", ar: "إذا وُلدت خارج الجزائر", dz: "إذا ولدت برا الدزاير" },
      points: [
        { cites: [W], text: {
          en: "Washington: if you were born in the US, apply through the Ministry of Foreign Affairs or the Embassy with an application form completed in Arabic and French, a registration card and the family book.",
          fr: "Washington : si vous êtes né aux États-Unis, la demande se fait par le ministère des Affaires étrangères ou l'ambassade, avec un formulaire rempli en arabe et en français, une carte d'immatriculation et le livret de famille.",
          ar: "سفارة واشنطن: إذا وُلدت في الولايات المتحدة، يُقدَّم الطلب عبر وزارة الشؤون الخارجية أو السفارة باستمارة مملوءة بالعربية والفرنسية وبطاقة التسجيل ودفتر العائلة.",
          dz: "سفارة واشنطن: إذا ولدت في أمريكا، تطلب عن طريق وزارة الخارجية ولا السفارة باستمارة معمّرة بالعربية والفرنسية، كارطة التسجيل ودفتر العائلة." } },
        { cites: [W], text: {
          en: "Washington, born in another country: if the birth was transcribed at the Algerian mission there, send a copy of the ID (or the guardian's), a copy of the family book if you have it, and a written request. If it was not transcribed, send the original birth certificate, the descriptive form (Arabic and French) and an ID copy. The embassy forwards the file through the Ministry of Foreign Affairs to the mission that should normally issue it, usually in the birth country.",
          fr: "Washington, né dans un autre pays : si la naissance a été transcrite auprès de la représentation algérienne de ce pays, envoyez une copie de la pièce d'identité (ou celle du tuteur), une copie du livret de famille si vous en avez un, et une demande écrite. Si elle n'a pas été transcrite, envoyez l'acte de naissance original, la fiche descriptive (arabe et français) et une copie de la pièce d'identité. L'ambassade transmet le dossier via le ministère des Affaires étrangères à la représentation qui doit normalement le délivrer, généralement celle du pays de naissance.",
          ar: "واشنطن، لمن وُلد في بلد آخر: إذا كان الميلاد مسجّلًا لدى الممثلية الجزائرية في ذلك البلد، تُرسل نسخة من وثيقة الهوية (أو هوية الولي) ونسخة من دفتر العائلة إن وُجد وطلبًا كتابيًا. وإن لم يكن مسجّلًا، تُرسل شهادة الميلاد الأصلية والاستمارة الوصفية (بالعربية والفرنسية) ونسخة من الهوية. وتحيل السفارة الملف عبر وزارة الشؤون الخارجية إلى الممثلية المخوّلة عادة بإصدارها، وهي في الغالب ممثلية بلد الميلاد.",
          dz: "واشنطن، إذا ولدت في بلاد أخرى: إذا الزيادة مسجلة في الممثلية الجزائرية تاع هاداك البلد، ابعث نسخة من الهوية (ولا تاع الولي)، نسخة من دفتر العائلة إذا عندك، وطلب مكتوب. إذا ما كانتش مسجلة، ابعث شهادة الميلاد الأصلية، الاستمارة الوصفية (بالعربية والفرنسية) ونسخة من الهوية. السفارة تبعث الملف عن طريق وزارة الخارجية للممثلية لي لازم تخرجها عادة، وغالبا هي تاع بلد الزيادة." } },
        { cites: [LD], text: {
          en: "London: if you were born in the UK, the London consulate issues it provided the birth was registered there. If you were born abroad and live in Algeria, the Civil Status Office of the Ministry of Foreign Affairs in Algiers issues it, provided the birth was registered at the relevant embassy or consulate.",
          fr: "Londres : si vous êtes né au Royaume-Uni, le consulat de Londres le délivre à condition que la naissance y ait été enregistrée. Si vous êtes né à l'étranger et vivez en Algérie, c'est le service de l'état civil du ministère des Affaires étrangères à Alger qui le délivre, à condition que la naissance ait été enregistrée à l'ambassade ou au consulat concerné.",
          ar: "لندن: إذا وُلدت في المملكة المتحدة فإن قنصلية لندن تصدرها بشرط أن يكون الميلاد مسجّلًا لديها. وإذا وُلدت في الخارج وتقيم في الجزائر فإن مصلحة الحالة المدنية بوزارة الشؤون الخارجية في الجزائر العاصمة تصدرها، بشرط أن يكون الميلاد مسجّلًا لدى السفارة أو القنصلية المعنية.",
          dz: "لندن: إذا ولدت في بريطانيا، قنصلية لندن تخرجهالك إذا الزيادة مسجلة عندهم. وإذا ولدت برا وساكن في الدزاير، مصلحة الحالة المدنية في وزارة الخارجية بالجزائر العاصمة هي لي تخرجها، بشرط الزيادة تكون مسجلة في السفارة ولا القنصلية المعنية." } },
        { cites: [IS], text: {
          en: "Istanbul: for people born in Turkey (except Ankara), the consulate accepts S12 requests if the birth is already in its civil registers. For people born abroad and registered at Istanbul, requests are forwarded to the mission where the birth took place.",
          fr: "Istanbul : pour les personnes nées en Turquie (sauf Ankara), le consulat accepte les demandes de S12 si la naissance figure déjà dans ses registres d'état civil. Pour les personnes nées à l'étranger et immatriculées à Istanbul, les demandes sont transmises à la représentation du lieu de naissance.",
          ar: "إسطنبول: بالنسبة للمولودين في تركيا (باستثناء أنقرة) تقبل القنصلية طلبات 12خ إذا كان الميلاد مسجّلًا في سجلاتها للحالة المدنية. وبالنسبة للمولودين في الخارج والمسجّلين في إسطنبول تُحال الطلبات إلى الممثلية التي جرى فيها الميلاد.",
          dz: "إسطنبول: للي مزدادين في تركيا (ماعدا أنقرة) القنصلية تقبل طلبات الـS12 إذا الزيادة موجودة في سجلاتها. وللي مزدادين برا ومتسجلين في إسطنبول، الطلبات تتبعث للممثلية لي صرات فيها الزيادة." } },
        { cites: [PAR], text: {
          en: "Paris: on presentation of the family book and an Algerian ID, its civil status service can issue family sheets and extracts of birth, marriage and death records drawn up by communes in Algeria or by Algerian missions. It can also translate family books and civil-status records written in Arabic into French.",
          fr: "Paris : sur présentation du livret de famille et d'une pièce d'identité algérienne, son service de l'état civil peut délivrer des fiches familiales et des extraits d'actes (naissance, mariage, décès) établis par les communes en Algérie ou par les postes diplomatiques et consulaires. Il peut aussi traduire en français les livrets de famille et actes d'état civil établis en langue nationale.",
          ar: "باريس: عند تقديم دفتر العائلة ووثيقة هوية جزائرية، يمكن لمصلحة الحالة المدنية بالقنصلية تسليم بطاقات عائلية ومستخرجات من عقود (الميلاد والزواج والوفاة) حرّرتها البلديات في الجزائر أو الممثليات الدبلوماسية والقنصلية. ويمكنها أيضًا ترجمة دفاتر العائلة وعقود الحالة المدنية المحرَّرة بالعربية إلى الفرنسية.",
          dz: "باريس: بدفتر العائلة وورقة هوية جزائرية، مصلحة الحالة المدنية في القنصلية تقدر تعطيك فيش عائلية ومستخرجات (زيادة، زواج، وفاة) تاع البلديات في الدزاير ولا تاع السفارات والقنصليات. وتقدر تترجملك لفرنسية دفاتر العائلة والعقود لي مكتوبين بالعربية." } },
      ],
    },
    {
      id: "in-algeria",
      title: { en: "In Algeria", fr: "En Algérie", ar: "في الجزائر", dz: "في الدزاير" },
      points: [
        { cites: [BN, OR], text: {
          en: "The ordinary birth certificate is issued at any commune or administrative annex, or online at etatcivil.interieur.gov.dz, immediately. The Interior Ministry says it is valid for ten years; Oran adds this holds unless the marginal mentions change.",
          fr: "L'acte de naissance ordinaire est délivré immédiatement dans toute commune ou annexe administrative, ou en ligne sur etatcivil.interieur.gov.dz. Le ministère de l'Intérieur indique une validité de dix ans ; Oran précise que c'est sauf modification des mentions marginales.",
          ar: "تُسلَّم شهادة الميلاد العادية فورًا في أي بلدية أو ملحقة إدارية، أو عبر الإنترنت في etatcivil.interieur.gov.dz. وتذكر وزارة الداخلية أن مدة صلاحيتها عشر سنوات، وتضيف ولاية وهران أن ذلك ما لم تتغير البيانات الهامشية.",
          dz: "شهادة الميلاد العادية تخرجها في أي بلدية ولا ملحقة إدارية، ولا من الأنترنت في etatcivil.interieur.gov.dz، في نفس الوقت. وزارة الداخلية تقول صالحة عشر سنين، ووهران تزيد بلي هذا إذا ما تبدلتش البيانات الهامشية." } },
        { cites: [MFA, BN], text: {
          en: "People born abroad who are in Algeria: the Ministry of Foreign Affairs' Civil Status Service can issue copies of records already held by Algerian missions, and the Interior Ministry says these documents are issued in all communes of Algiers wilaya and in the main-town communes of the other wilayas.",
          fr: "Personnes nées à l'étranger et se trouvant en Algérie : le service de l'état civil du ministère des Affaires étrangères peut délivrer des copies des actes détenus par les représentations algériennes, et le ministère de l'Intérieur indique que ces documents sont délivrés dans toutes les communes de la wilaya d'Alger et dans les communes chefs-lieux des autres wilayas.",
          ar: "المولودون في الخارج المتواجدون في الجزائر: يمكن لمصلحة الحالة المدنية بوزارة الشؤون الخارجية تسليم نسخ من العقود المحفوظة لدى الممثليات الجزائرية، وتذكر وزارة الداخلية أن هذه الوثائق تُسلَّم في كل بلديات ولاية الجزائر وفي البلديات مقرّ الولاية في باقي الولايات.",
          dz: "للي مزدادين برا وراهم في الدزاير: مصلحة الحالة المدنية في وزارة الخارجية تقدر تعطيهم نسخ من العقود لي عند السفارات والقنصليات، ووزارة الداخلية تقول هاذ الوثائق تخرج في كل بلديات ولاية الجزائر وفي بلديات مقر الولاية في باقي الولايات." } },
        { cites: [BN, OR], text: {
          en: "Civil-status documents meant for use abroad are legalised at the central administration of the Ministry of Foreign Affairs.",
          fr: "La légalisation des documents d'état civil destinés à l'étranger se fait auprès de l'administration centrale du ministère des Affaires étrangères.",
          ar: "تتم المصادقة على وثائق الحالة المدنية الموجهة للاستعمال في الخارج لدى الإدارة المركزية لوزارة الشؤون الخارجية.",
          dz: "تصديق وثائق الحالة المدنية لي رايحين يستعملوهم في الخارج يكون عند الإدارة المركزية تاع وزارة الخارجية." } },
      ],
    },
  ] as GuideSection[],
  fees: [] as FeeRow[],
};
