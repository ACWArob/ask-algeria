import type { Locale } from "@/lib/i18n";

/**
 * /legal: legal notice (mentions légales), privacy and terms. Same keys in every language (tests/site.test.ts).
 * The publisher is a non-professional, independent project, identified through its host as French law allows
 * (LCEN art. 6); contact goes through the form on the About page.
 */
type Section = { title: string; body: string[] };
export interface LegalStrings {
  nav: string;
  heading: string;
  updated: string;
  notice: Section;
  privacy: Section;
  terms: Section;
}

const HOST = "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA (vercel.com)";

const en: LegalStrings = {
  nav: "Legal & privacy",
  heading: "Legal notice, privacy and terms",
  updated: "Last updated: 10 November 2026",
  notice: {
    title: "Legal notice",
    body: [
      "Ask Algeria (algeriagov.online) is an independent, non-commercial project. It is not affiliated with, endorsed by or run by the Algerian State, any ministry, wilaya, consulate or public body.",
      "Publisher: the Ask Algeria team. Contact: the form on the About page.",
      `Host: ${HOST}.`,
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "What we process: the questions you ask, documents you upload for translation, ratings and comments you choose to send, and messages sent through Contact us. ID, phone, card and account numbers and emails are removed from questions before they are sent.",
      "Who processes it for us: Vercel (hosting and logs), Anthropic (writes answers and translations when you ask for them), Upstash (a 24-hour answer cache and request counters) and, for feedback and contact messages, a private Google spreadsheet. Contact messages are also emailed to our support inbox. If you use the microphone button, your browser's own speech service (Google in Chrome, Apple in Safari) turns your voice into text; we never receive the audio.",
      "How long: written answers 24 hours; request counters 2 days, stored with a scrambled (hashed) form of your IP address; server logs as long as the host keeps them; feedback and contact messages until they have been reviewed. Uploaded documents are not stored.",
      "In your browser only: your language, where you live, and your Prepare my file details if you choose to remember them. You can clear them at any time.",
      "No ads, no tracking cookies, no selling of data. To ask what we hold about you or to have it deleted, write to us through the contact form.",
    ],
  },
  terms: {
    title: "Terms of use",
    body: [
      "Information only. Everything here is taken from official pages, which can change or disagree. It is not legal advice and it does not replace the office that handles your file.",
      "Always confirm with the official page or the office before you act. We are not responsible for decisions made from this site.",
      "Don't use the site to send personal documents of other people, to attempt abuse, or to automate requests.",
    ],
  },
};

const fr: LegalStrings = {
  nav: "Mentions légales",
  heading: "Mentions légales, confidentialité et conditions",
  updated: "Dernière mise à jour : 10 novembre 2026",
  notice: {
    title: "Mentions légales",
    body: [
      "Ask Algeria (algeriagov.online) est un projet indépendant et non commercial. Il n'est ni affilié, ni approuvé, ni géré par l'État algérien, un ministère, une wilaya, un consulat ou un organisme public.",
      "Éditeur : l'équipe Ask Algeria (éditeur non professionnel). Contact : le formulaire de la page À propos.",
      `Hébergeur : ${HOST}.`,
    ],
  },
  privacy: {
    title: "Confidentialité",
    body: [
      "Ce que nous traitons : les questions posées, les documents importés pour traduction, les avis et commentaires que vous choisissez d'envoyer, et les messages envoyés via « Nous contacter ». Les numéros d'identité, de téléphone, de carte et de compte ainsi que les e-mails sont retirés des questions avant l'envoi.",
      "Sous-traitants : Vercel (hébergement et journaux), Anthropic (rédige les réponses et traductions quand vous les demandez), Upstash (cache des réponses de 24 heures et compteurs de demandes) et, pour les avis et messages, un tableur Google privé. Les messages « Nous contacter » sont aussi envoyés par e-mail à notre adresse d'assistance. Si vous utilisez le bouton micro, le service de reconnaissance vocale de votre navigateur (Google dans Chrome, Apple dans Safari) transforme votre voix en texte ; nous ne recevons jamais l'audio.",
      "Durées : réponses rédigées 24 heures ; compteurs de demandes 2 jours, avec une forme brouillée (hachée) de votre adresse IP ; journaux du serveur selon la durée de l'hébergeur ; avis et messages jusqu'à leur examen. Les documents importés ne sont pas conservés.",
      "Uniquement dans votre navigateur : votre langue, votre lieu de résidence et, si vous le choisissez, vos informations « Préparer mon dossier ». Vous pouvez les effacer à tout moment.",
      "Pas de publicité, pas de cookies de suivi, aucune revente de données. Pour savoir ce que nous détenons sur vous ou le faire supprimer, écrivez-nous via le formulaire de contact.",
    ],
  },
  terms: {
    title: "Conditions d'utilisation",
    body: [
      "Information seulement. Tout provient de pages officielles, qui peuvent changer ou se contredire. Ce n'est pas un conseil juridique et cela ne remplace pas le service qui traite votre dossier.",
      "Vérifiez toujours sur la page officielle ou auprès du service avant d'agir. Nous ne sommes pas responsables des décisions prises à partir de ce site.",
      "N'utilisez pas le site pour envoyer les documents personnels d'autres personnes, pour des abus ou pour automatiser des demandes.",
    ],
  },
};

const ar: LegalStrings = {
  nav: "إشعار قانوني وخصوصية",
  heading: "الإشعار القانوني والخصوصية وشروط الاستخدام",
  updated: "آخر تحديث: 10 نوفمبر 2026",
  notice: {
    title: "إشعار قانوني",
    body: [
      "‏Ask Algeria ‏(algeriagov.online) مشروع مستقل وغير تجاري، ولا علاقة له بالدولة الجزائرية أو أي وزارة أو ولاية أو قنصلية أو هيئة عمومية، ولا تعتمده ولا تديره.",
      "الناشر: فريق Ask Algeria. التواصل: عبر الاستمارة في صفحة «حول الخدمة».",
      `المستضيف: ${HOST}.`,
    ],
  },
  privacy: {
    title: "الخصوصية",
    body: [
      "ما نعالجه: الأسئلة التي تطرحها، والوثائق التي تحمّلها للترجمة، والتقييمات والتعليقات التي تختار إرسالها، والرسائل المرسلة عبر «اتصل بنا». تُحذف أرقام التعريف والهاتف والبطاقات والحسابات وعناوين البريد من الأسئلة قبل إرسالها.",
      "من يعالجها لحسابنا: Vercel (الاستضافة والسجلات)، وAnthropic (تكتب الإجابات والترجمات عند طلبها)، وUpstash (ذاكرة مؤقتة للإجابات لمدة 24 ساعة وعدّادات الطلبات)، وجدول Google خاص للتقييمات والرسائل. وتُرسَل رسائل «اتصل بنا» أيضًا إلى بريد الدعم الخاص بنا. إذا استخدمت زر الميكروفون، تحوّل خدمة التعرّف على الكلام في متصفحك (Google في Chrome، وApple في Safari) صوتك إلى نص؛ ولا نتلقى التسجيل الصوتي أبدًا.",
      "المدة: الإجابات المكتوبة 24 ساعة؛ عدّادات الطلبات يومان بصيغة مشفّرة (hash) من عنوان IP؛ سجلات الخادم حسب مدة المستضيف؛ التقييمات والرسائل إلى حين مراجعتها. لا تُحفظ الوثائق المحمّلة.",
      "في متصفحك فقط: لغتك ومكان إقامتك، ومعلومات «تحضير ملفي» إن اخترت حفظها، ويمكنك مسحها متى شئت.",
      "لا إعلانات ولا ملفات تعريف للتتبع ولا بيع للبيانات. لمعرفة ما نحتفظ به عنك أو لحذفه، راسلنا عبر استمارة الاتصال.",
    ],
  },
  terms: {
    title: "شروط الاستخدام",
    body: [
      "للإعلام فقط. كل ما هنا مأخوذ من صفحات رسمية قد تتغيّر أو تختلف فيما بينها. ليس استشارة قانونية ولا يغني عن الإدارة التي تعالج ملفك.",
      "تحقّق دائمًا من الصفحة الرسمية أو من الإدارة قبل أي خطوة. لسنا مسؤولين عن القرارات المتخذة اعتمادًا على هذا الموقع.",
      "لا تستعمل الموقع لإرسال وثائق شخصية لغيرك، أو لإساءة الاستخدام، أو لأتمتة الطلبات.",
    ],
  },
};

const dz: LegalStrings = {
  nav: "القانوني والخصوصية",
  heading: "الإشعار القانوني، الخصوصية وشروط الاستعمال",
  updated: "آخر تحديث: 10 نوفمبر 2026",
  notice: {
    title: "الإشعار القانوني",
    body: [
      "‏Ask Algeria ‏(algeriagov.online) مشروع مستقل وماشي تجاري. ما عندو حتى علاقة بالدولة الجزائرية، ولا وزارة، ولا ولاية، ولا قنصلية، ولا هيئة عمومية.",
      "الناشر: فريق Ask Algeria. التواصل: من الاستمارة في صفحة «شكون حنا».",
      `المستضيف: ${HOST}.`,
    ],
  },
  privacy: {
    title: "الخصوصية",
    body: [
      "واش نعالجو: الأسئلة لي تسقسيها، الوثائق لي تحمّلها للترجمة، الرأي والتعليقات لي تختار تبعثهم، والرسائل لي تبعثها من «تواصل معانا». نمرو البطاقة، التيليفون، الكارطة، الحساب والإيمايل يتنحّاو من الأسئلة قبل ما يتبعثو.",
      "شكون يعالجها معانا: Vercel (الاستضافة والسجلات)، Anthropic (تكتب الأجوبة والترجمات كي تطلبهم)، Upstash (ذاكرة للأجوبة 24 ساعة وعدّادات الطلبات)، وجدول Google خاص للرأي والرسائل. والرسائل تاع «تواصل معانا» تتبعث تاني للإيمايل تاع الدعم تاعنا. إذا استعملت زر الميكرو، الخدمة تاع المتصفح (Google في Chrome، وApple في Safari) تحوّل صوتك لكتابة؛ وحنا ما يوصلناش الصوت.",
      "قداش: الأجوبة المكتوبة 24 ساعة؛ عدّادات الطلبات يومين بنسخة مشفّرة (hash) من الـIP تاعك؛ سجلات السيرفور حسب المستضيف؛ الرأي والرسائل حتى نقراوهم. الوثائق لي تحمّلها ما تتحفظش.",
      "في البراوزر تاعك برك: اللغة، وين ساكن، والمعلومات تاع «وجّد الدوسي تاعي» إذا حبيت تحفظها. تقدر تمسحهم وقتما حبيت.",
      "لا إشهار، لا كوكيز تاع التتبع، وما نبيعوش البيانات. باش تعرف واش عندنا عليك ولا باش نمسحوه، اكتبلنا من استمارة التواصل.",
    ],
  },
  terms: {
    title: "شروط الاستعمال",
    body: [
      "للمعلومة برك. كلش هنا جاي من صفحات رسمية تقدر تتبدّل ولا تختلف بيناتها. ماشي نصيحة قانونية وما تعوضش الإدارة لي تعالج الدوسي تاعك.",
      "ديما تأكد من الصفحة الرسمية ولا من الإدارة قبل ما تدير أي حاجة. حنا ماشي مسؤولين على القرارات لي تتدار من هاد السيت.",
      "ما تستعملش السيت باش تبعث وراق شخصية تاع ناس آخرين، ولا باش تتلاعب، ولا باش تأتمت الطلبات.",
    ],
  },
};

export const LEGAL_STRINGS: Record<Locale, LegalStrings> = { en, fr, ar, dz };
