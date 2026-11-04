import type { Locale } from "@/lib/i18n";

/**
 * UI strings for the glossary, the civil-status register card, guide freshness and the "also bring" list.
 * Kept here (not in lib/i18n/*.json) so these features can ship without touching the shared dictionaries.
 * Same keys in every language (tests/extras.test.ts checks parity). Darija is Algerian, never Moroccan.
 */
const en = {
  glossary: {
    nav: "Glossary",
    title: "Glossary of documents",
    lead: "Common Algerian administrative documents and terms, with their names in French, Arabic and English and the name people use every day.",
    search: "Filter the glossary",
    placeholder: "e.g. 12S, casier, دفتر, Chifa",
    count: "{n} terms",
    none: "No term matches. Try another spelling or language.",
    fr: "French",
    ar: "Arabic",
    en: "English",
    dz: "Everyday name",
    guide: "Read our guide",
    note: "Plain definitions only. Requirements, fees and delays depend on the procedure and the office: check the official page.",
  },
  exemption: {
    title: "You may not have to provide this document",
    lead: "The Ministry of the Interior's civil-status pages say:",
    plain: "In plain words:",
    decree: "an executive decree of 27 July 2015 exempts citizens from presenting civil-status documents that are already in the national automated civil-status register.",
    window: "the ministry's electronic window for secure documents, used in communes, exempts citizens from providing the 12S birth certificate in an ID card or passport application, and from providing documents whose data are already in the database, unless they have changed.",
    limits: "The pages do not list which offices or procedures this covers, and they do not replace the text of the decree.",
    printNotice: "Printed from Ask Algeria (algeriagov.online), an independent site. This is not an official document.",
    show: "Show this if an office asks you for a civil-status document it can get from the register.",
    source: "Source:",
    checked: "checked {date}",
    archived: "archived copy",
    print: "Print this card",
  },
  freshness: {
    checked: "Sources last checked: {range}",
    archived: "{n} of {total} sources are archived copies of the official page (Internet Archive).",
    archivedTag: "archived copy",
  },
  prepareExtras: {
    title: "Also bring, just in case (practical tips, not official requirements)",
    note: "Not from official pages: common-sense extras that can save you a second trip.",
    items: [
      "Photocopies of every document",
      "Extra ID photos",
      "Your old or expired document, if you have one",
      "Proof of address",
      "Your appointment confirmation, if you have one",
      "A pen",
    ],
  },
};

export type Extra = typeof en;

const fr: Extra = {
  glossary: {
    nav: "Glossaire",
    title: "Glossaire des documents",
    lead: "Les documents et termes administratifs algériens courants, avec leur nom en français, en arabe et en anglais, et le nom qu'on utilise au quotidien.",
    search: "Filtrer le glossaire",
    placeholder: "ex. 12S, casier, دفتر, Chifa",
    count: "{n} termes",
    none: "Aucun terme ne correspond. Essayez une autre orthographe ou une autre langue.",
    fr: "Français",
    ar: "Arabe",
    en: "Anglais",
    dz: "Nom courant",
    guide: "Lire notre guide",
    note: "Définitions simples uniquement. Les pièces, frais et délais dépendent de la démarche et du service : vérifiez la page officielle.",
  },
  exemption: {
    title: "Vous n'avez peut-être pas à fournir ce document",
    lead: "Les pages du ministère de l'Intérieur sur l'état civil indiquent :",
    plain: "En clair :",
    decree: "un décret exécutif du 27 juillet 2015 dispense le citoyen de présenter les documents d'état civil déjà contenus dans le registre national automatisé de l'état civil.",
    window: "le guichet électronique des documents sécurisés du ministère, utilisé dans les communes, dispense le citoyen de fournir l'extrait de naissance 12S dans un dossier de carte d'identité ou de passeport, ainsi que les documents dont les données figurent déjà dans la base, sauf s'ils ont changé.",
    limits: "Ces pages ne précisent pas quels services ou démarches sont concernés et ne remplacent pas le texte du décret.",
    printNotice: "Imprimé depuis Ask Algeria (algeriagov.online), un site indépendant. Ce n'est pas un document officiel.",
    show: "Montrez cette fiche si un service vous demande un document d'état civil qu'il peut obtenir dans le registre.",
    source: "Source :",
    checked: "vérifiée le {date}",
    archived: "copie archivée",
    print: "Imprimer cette fiche",
  },
  freshness: {
    checked: "Sources vérifiées pour la dernière fois : {range}",
    archived: "{n} sources sur {total} sont des copies archivées de la page officielle (Internet Archive).",
    archivedTag: "copie archivée",
  },
  prepareExtras: {
    title: "À apporter aussi, au cas où (conseils pratiques, pas des exigences officielles)",
    note: "Ne vient pas des pages officielles : du bon sens qui peut vous éviter un second déplacement.",
    items: [
      "Des photocopies de chaque document",
      "Des photos d'identité supplémentaires",
      "Votre ancien document ou le document expiré, si vous en avez un",
      "Un justificatif de domicile",
      "La confirmation de votre rendez-vous, si vous en avez une",
      "Un stylo",
    ],
  },
};

const ar: Extra = {
  glossary: {
    nav: "المصطلحات",
    title: "مسرد الوثائق",
    lead: "الوثائق والمصطلحات الإدارية الجزائرية الشائعة، بأسمائها بالفرنسية والعربية والإنجليزية، والاسم المتداول في الحياة اليومية.",
    search: "تصفية المسرد",
    placeholder: "مثلاً: 12 خ، casier، دفتر، الشفاء",
    count: "عدد المصطلحات: {n}",
    none: "لا يوجد مصطلح مطابق. جرّب كتابة أخرى أو لغة أخرى.",
    fr: "بالفرنسية",
    ar: "بالعربية",
    en: "بالإنجليزية",
    dz: "الاسم المتداول",
    guide: "اقرأ دليلنا",
    note: "تعريفات مبسطة فقط. الوثائق المطلوبة والرسوم والآجال تختلف حسب الإجراء والإدارة، فارجع إلى الصفحة الرسمية.",
  },
  exemption: {
    title: "قد لا يُطلب منك تقديم هذه الوثيقة",
    lead: "تذكر صفحات وزارة الداخلية الخاصة بالحالة المدنية:",
    plain: "بعبارة بسيطة:",
    decree: "مرسوم تنفيذي مؤرخ في 27 جويلية 2015 يعفي المواطن من تقديم وثائق الحالة المدنية المتوفرة في السجل الوطني الآلي للحالة المدنية.",
    window: "الشباك الإلكتروني للوثائق المؤمنة المستغل في البلديات يعفي المواطن من تقديم شهادة الميلاد 12 خ في ملف بطاقة التعريف الوطنية أو جواز السفر، ومن تقديم الوثائق الموجودة بياناتها في قاعدة المعطيات ما لم تتغير.",
    limits: "لا تحدد هذه الصفحات الإدارات أو الإجراءات المعنية، ولا تغني عن نص المرسوم.",
    printNotice: "مطبوع من موقع Ask Algeria ‏(algeriagov.online)، وهو موقع مستقل. هذه ليست وثيقة رسمية.",
    show: "اعرض هذه البطاقة إذا طلبت منك إدارة وثيقة حالة مدنية يمكنها الحصول عليها من السجل.",
    source: "المصدر:",
    checked: "تم التحقق في {date}",
    archived: "نسخة مؤرشفة",
    print: "اطبع هذه البطاقة",
  },
  freshness: {
    checked: "آخر تحقق من المصادر: {range}",
    archived: "{n} من أصل {total} مصادر نسخ مؤرشفة من الصفحة الرسمية (أرشيف الإنترنت).",
    archivedTag: "نسخة مؤرشفة",
  },
  prepareExtras: {
    title: "أحضر أيضاً احتياطاً (نصائح عملية، وليست شروطاً رسمية)",
    note: "ليست من الصفحات الرسمية: أمور بديهية قد تغنيك عن العودة مرة ثانية.",
    items: [
      "نسخ مصوّرة من كل وثيقة",
      "صور شمسية إضافية",
      "وثيقتك القديمة أو المنتهية الصلاحية، إن وُجدت",
      "ما يثبت عنوان السكن",
      "تأكيد الموعد، إن وُجد",
      "قلم",
    ],
  },
};

const dz: Extra = {
  glossary: {
    nav: "الكلمات",
    title: "قاموس الوراق",
    lead: "الوراق والكلمات الإدارية لي نسمعوها بزاف في الجزائر، بأسماءها بالفرونسي والعربية والنڨليزية، والاسم لي يقولوه الناس كل يوم.",
    search: "قلّب في القاموس",
    placeholder: "مثلاً: 12 خ، casier، دفتر، الشفاء",
    count: "عدد الكلمات: {n}",
    none: "ما كاين حتى كلمة. جرب كتابة أخرى ولا لغة أخرى.",
    fr: "بالفرونسي",
    ar: "بالعربية",
    en: "بالنڨليزية",
    dz: "واش يقولو الناس",
    guide: "اقرا الدليل تاعنا",
    note: "غير تعريفات بسيطة. الوراق والدراهم والمدة يتبدلو على حساب الإجراء والإدارة: شوف الصفحة الرسمية.",
  },
  exemption: {
    title: "ممكن ما يلزمكش تجيب هاذ الوثيقة",
    lead: "صفحات وزارة الداخلية على الحالة المدنية تقول:",
    plain: "بالمختصر:",
    decree: "كاين مرسوم تنفيذي تاع 27 جويلية 2015 يعفي المواطن من تقديم وثائق الحالة المدنية لي راهي كاينة في السجل الوطني الآلي للحالة المدنية.",
    window: "الشباك الإلكتروني تاع الوثائق المؤمنة لي يخدمو بيه في البلديات يعفي المواطن باش ما يجيبش الـ12 خ في ملف بطاقة التعريف ولا الباسبور، وما يجيبش الوراق لي المعلومات تاعهم كاينة في قاعدة المعطيات، إلا إذا تبدلو.",
    limits: "هاذ الصفحات ما تقولش شكون هي الإدارات ولا الإجراءات المعنية، وما تعوضش نص المرسوم.",
    printNotice: "مطبوع من Ask Algeria ‏(algeriagov.online)، سيت مستقل. هادي ماشي وثيقة رسمية.",
    show: "وريها إذا طلبت منك إدارة وثيقة حالة مدنية تقدر تجبدها هي من السجل.",
    source: "المصدر:",
    checked: "شفناها في {date}",
    archived: "نسخة مأرشفة",
    print: "اطبع هاذ البطاقة",
  },
  freshness: {
    checked: "آخر مرة شفنا المصادر: {range}",
    archived: "{n} من {total} مصادر هوما نسخ مأرشفة تاع الصفحة الرسمية (أرشيف الأنترنت).",
    archivedTag: "نسخة مأرشفة",
  },
  prepareExtras: {
    title: "جيب معاك زادة، احتياط برك (نصائح عملية، ماشي شروط رسمية)",
    note: "ماشي من الصفحات الرسمية: حوايج بسيطة باش ما تعاودش الطريق.",
    items: [
      "فوطوكوبي تاع كل وثيقة",
      "تصاور زايدين",
      "الوثيقة القديمة ولا لي فاتت صلاحيتها، إذا عندك",
      "ورقة تثبت وين ساكن",
      "تأكيد الموعد، إذا عندك",
      "ستيلو",
    ],
  },
};

export const EXTRA: Record<Locale, Extra> = { en, fr, ar, dz };
