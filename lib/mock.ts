import type { Locale } from "@/lib/i18n";

/** Canned output for MOCK_LLM=1 so the full UI can be exercised without an API key. */
export function mockAnswer(lang: Locale, nSources: number): string {
  const c = nSources > 0 ? "[1]" : "";
  const c2 = nSources > 1 ? "[2]" : c;
  const t: Record<Locale, string> = {
    en: `**Mock answer (MOCK_LLM=1).** This text is canned so you can test the interface; it is not drawn from real official content ${c}.

### What you need / steps
1. Open the official page linked in the sources ${c}.
2. Check the list of required documents published there ${c2}.

### Next steps
- Confirm the procedure on the official website before you act ${c}.`,
    fr: `**Réponse fictive (MOCK_LLM=1).** Ce texte est préenregistré pour tester l'interface ; il ne provient pas d'un vrai contenu officiel ${c}.

### Ce qu'il faut / étapes
1. Ouvrez la page officielle indiquée dans les sources ${c}.
2. Vérifiez la liste des pièces demandées publiée sur cette page ${c2}.

### Prochaines étapes
- Confirmez la procédure sur le site officiel avant d'agir ${c}.`,
    ar: `**إجابة تجريبية (MOCK_LLM=1).** هذا نص جاهز لاختبار الواجهة، وليس مأخوذًا من محتوى رسمي حقيقي ${c}.

### ما تحتاجه / الخطوات
1. افتح الصفحة الرسمية المذكورة في المصادر ${c}.
2. راجع قائمة الوثائق المطلوبة المنشورة فيها ${c2}.

### الخطوات التالية
- تحقّق من الإجراء على الموقع الرسمي قبل أن تتصرف ${c}.`,
    dz: `**جواب تجريبي (MOCK_LLM=1).** هاد النص واجد باش تجرّب الواجهة، ماشي من محتوى رسمي صحيح ${c}.

### واش لازمك / الخطوات
1. حلّ الصفحة الرسمية لي في المصادر ${c}.
2. شوف ليستة الوراق لي طالبين فيها ${c2}.

### واش دير من بعد
- تأكد من الإجراء في الموقع الرسمي قبل ما تدير حتى حاجة ${c}.`,
  };
  return t[lang];
}

export function mockTranslation(lang: Locale, mode: "full" | "summary"): string {
  const head: Record<Locale, string> = {
    en: "Mock result (MOCK_LLM=1)",
    fr: "Résultat fictif (MOCK_LLM=1)",
    ar: "نتيجة تجريبية (MOCK_LLM=1)",
    dz: "نتيجة تجريبية (MOCK_LLM=1)",
  };
  return `### ${head[lang]}\n\n${mode === "full" ? "Full translation would appear here." : "A plain-language summary and a list of actions would appear here."}`;
}

/** Turns a string into a ReadableStream that emits it in small pieces, to mimic token streaming. */
export function streamText(text: string, delayMs = 15): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  const parts = text.match(/[\s\S]{1,12}/g) ?? [];
  return new ReadableStream({
    async start(controller) {
      for (const p of parts) {
        controller.enqueue(enc.encode(p));
        if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
      }
      controller.close();
    },
  });
}
