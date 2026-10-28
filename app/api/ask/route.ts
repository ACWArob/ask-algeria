import { NextResponse } from "next/server";
import { LIMITS, isMock } from "@/lib/config";
import { isLocale, type Locale } from "@/lib/i18n";
import { redact } from "@/lib/redact";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { searchChunks } from "@/lib/search";
import { SOURCES } from "@/lib/sources";
import { answerSystemPrompt, answerUserPrompt, type PromptSource } from "@/lib/prompts";
import { chooseAnswerLang, detectLanguage, glossaryQueries, questionTopics } from "@/lib/detect";
import { anthropic, expandQuery } from "@/lib/llm";
import { MODELS } from "@/lib/config";
import { mockAnswer, streamText } from "@/lib/mock";
import type { AskMeta } from "@/lib/types";
import { freshness } from "@/lib/freshness";
import { checkedDate, verificationNotes } from "@/lib/verification";
import { corpusById } from "@/lib/corpus";
import { detectPost, detectMultiPostCountry } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Response: text/plain stream. The first line is a JSON object (AskMeta) followed by "\n";
 * everything after is the Markdown answer as it is generated.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`ask:${clientIp(req.headers)}`, LIMITS.rateLimitPerMinute);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  let body: { question?: unknown; lang?: unknown; context?: unknown; buffer?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const rawQ = typeof body.question === "string" ? body.question.trim() : "";
  if (!rawQ) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (rawQ.length > LIMITS.questionMaxChars) return NextResponse.json({ error: "too_long" }, { status: 413 });
  const selected: Locale = isLocale(body.lang) ? body.lang : "fr";

  // Defence in depth: the browser already redacts, but never trust the client.
  const { text: question, removed } = redact(rawQ);
  // Optional previous question in the same conversation, so short follow-ups ("and for minors?") can be searched.
  const context = typeof body.context === "string" ? redact(body.context.trim().slice(0, 500)).text : "";

  const started = Date.now();
  const post = detectPost(question) ?? detectPost(context);
  const multiPostCountry = post ? null : detectMultiPostCountry(`${context} ${question}`);
  const topics = questionTopics(`${context} ${question}`);
  const mock = isMock();
  const expansion = mock
    ? {
        lang: detectLanguage(question),
        queries: [question, ...glossaryQueries(context ? `${context} ${question}` : question)],
        topic: "",
      }
    : await expandQuery(question, context);
  const answerLang = chooseAnswerLang(selected, expansion.lang, question);

  const base = [...new Set([...expansion.queries, ...glossaryQueries(`${context} ${question}`)])];
  const queries = post && !post.inAlgeria ? [...base, ...base.slice(0, 3).map((q) => `${q} ${post.place}`)] : base;
  const hits = searchChunks(queries, LIMITS.topChunks, { boostDomains: post?.domains ?? [], topics });

  // Group chunks by page so each page gets one citation number.
  const byDoc = new Map<string, PromptSource>();
  for (const h of hits) {
    let s = byDoc.get(h.docId);
    if (!s) {
      s = { n: byDoc.size + 1, docId: h.docId, title: h.title, url: h.url, domain: h.domain, excerpts: [] };
      byDoc.set(h.docId, s);
    }
    s.excerpts.push(h.text);
  }
  const promptSources = [...byDoc.values()];

  // Freshness + cross-source accuracy notes from the weekly refresh job (optional files).
  const { state, report } = freshness();
  const corpus = corpusById();
  for (const s of promptSources) {
    const rec = corpus.get(s.docId ?? "");
    s.checked = checkedDate(rec?.fetched, state[s.url]);
    if (rec?.extraction === "archived") s.archived = rec.fetched || "unknown date";
  }
  const notes = verificationNotes(
    report,
    new Map(promptSources.map((s) => [s.docId ?? "", s.n])),
    (id) => corpus.get(id)?.domain,
  );

  const meta: AskMeta = {
    type: "meta",
    answerLang,
    detectedLang: expansion.lang,
    sources: promptSources.map(({ n, title, url, domain, checked, archived }) => ({ n, title, url, domain, checked, archived })),
    notes: notes.length,
    redactedServer: removed,
  };

  const enc = new TextEncoder();
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };

  if (mock) {
    const answer = streamText(mockAnswer(answerLang, promptSources.length));
    const out = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(enc.encode(JSON.stringify(meta) + "\n"));
        const reader = answer.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });
    return new Response(out, { headers });
  }

  const MUST = ["mjustice.dz", "marw.dz", "aadl.dz", "interieur.gov.dz", "mfdgi.gov.dz", "cnas.dz", "casnos.com.dz", "anem.dz", "onec.dz", "poste.dz", "dzds.dz", "mfa.gov.dz"];
  const fallbackList = [
    ...SOURCES.filter((s) => MUST.includes(s.domain.replace(/^www\./, ""))),
    ...[...SOURCES].sort((a, b) => a.priority - b.priority),
  ];
  const fallbackSites = [...new Map(fallbackList.map((s) => [s.domain, s])).values()]
    .slice(0, 30)
    .map((s) => `- ${s.name_fr} (${s.name_en}): ${s.url}`)
    .join("\n");

  // Clarifying questions only where they change the answer (decided here, not left to the model).
  const LOCATION_TOPICS = ["passport", "cni", "birth_certificate", "civil_status", "criminal_record", "nationality", "consular_registration", "legalization", "national_service", "consular_visa"];
  const words = question.trim().split(/\s+/).length;
  const mentionsChild = /child|son|daughter|kid|minor|enfant|fils|fille|mineur|ولد|بنت|طفل|ابني|ابنتي|صغير|قاصر|wlid|bent/i.test(`${context} ${question}`);
  const hasAge = /\b\d{1,2}\b|[٠-٩]{1,2}|ans|years?|عام|سنة|سنين|عمر/i.test(`${context} ${question}`);
  const allowClarify =
    words <= 2 ||
    Boolean(multiPostCountry) ||
    (!post && topics.some((t) => LOCATION_TOPICS.includes(t))) ||
    (mentionsChild && !hasAge && topics.some((t) => ["passport", "cni"].includes(t)));
  const system = answerSystemPrompt(answerLang, fallbackSites, { post, multiPostCountry, allowClarify });
  const REPLY_IN: Record<Locale, string> = {
    en: "Reply only in English. If something isn't covered, say it about the office (\"X's page doesn't list…\"), never \"the pages I have/provided\".",
    fr: "Réponds uniquement en français. Si un point manque, dis-le à propos de l'organisme (« la page du consulat ne précise pas… »), jamais « les pages consultées » ni « les extraits ».",
    ar: "أجب باللغة العربية الفصحى فقط. إذا نقصت معلومة فانسبها إلى الجهة («صفحة القنصلية لا تذكر…»)، ولا تقل أبدًا «المصادر المتوفرة لدي» أو «الصفحات المتاحة لي».",
    dz: "جاوب غير بالدارجة الجزائرية بالحروف العربية. إذا كاش حاجة ناقصة قولها على الإدارة («صفحة القنصلية ما تذكرش…»)، وما تقولش أبدًا «الصفحات اللي عندي» ولا «المصادر اللي عندي».",
  };
  const userPrompt = `${answerUserPrompt(question, promptSources, context, notes)}\n\n${REPLY_IN[answerLang]}`;
  // Netlify cuts synchronous functions at ~10 s. Stop generating before that and close cleanly.
  const DEADLINE_MS = 9000;
  const SHORTENED: Record<Locale, string> = {
    en: "\n\n_(Answer shortened to keep it fast. Ask a follow-up for more detail.)_",
    fr: "\n\n_(Réponse raccourcie pour rester rapide. Posez une question de suivi pour plus de détails.)_",
    ar: "\n\n_(تم اختصار الإجابة للسرعة. اطرح سؤالًا آخر لمزيد من التفاصيل.)_",
    dz: "\n\n_(قصّرنا الجواب باش يكون سريع. سقسي سؤال آخر باش تعرف كثر.)_",
  };

  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(enc.encode(JSON.stringify(meta) + "\n"));
      let wrote = 0;
      const models = [MODELS.answer, MODELS.answer, MODELS.fallback];
      try {
        for (let attempt = 0; attempt < models.length; attempt++) {
          const remaining = DEADLINE_MS - (Date.now() - started);
          if (remaining < 2500) break;
          const stream = anthropic().messages.stream(
            {
              model: models[attempt],
              max_tokens: LIMITS.answerMaxTokens,
              thinking: { type: "disabled" },
              system,
              messages: [{ role: "user", content: userPrompt }],
            },
            { maxRetries: 0, timeout: remaining },
          );
          const timer = setTimeout(() => stream.abort(), remaining);
          try {
            for await (const ev of stream) {
              if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
                controller.enqueue(enc.encode(ev.delta.text));
                wrote += ev.delta.text.length;
              }
            }
            clearTimeout(timer);
            const fin = await stream.finalMessage().catch(() => null);
            if (fin?.stop_reason === "max_tokens") controller.enqueue(enc.encode(SHORTENED[answerLang]));
            return; // finished normally
          } catch (err) {
            clearTimeout(timer);
            const timedOut = Date.now() - started >= DEADLINE_MS - 50;
            console.error(`[ask] attempt ${attempt + 1} (${models[attempt]}) failed after ${Date.now() - started}ms:`, err instanceof Error ? err.message : err);
            if (wrote > 0) {
              // Something already reached the user: never restart, just close politely.
              controller.enqueue(enc.encode(SHORTENED[answerLang]));
              return;
            }
            if (timedOut) break;
            await new Promise((r) => setTimeout(r, 250));
          }
        }
        controller.enqueue(enc.encode("\n\n\u0000ERROR"));
      } finally {
        controller.close();
      }
    },
  });
  if (body.buffer === true) {
    // Non-streaming fallback: some hosts occasionally drop long streamed responses.
    const full = await new Response(out).text();
    return new Response(full, { headers });
  }
  return new Response(out, { headers });
}
