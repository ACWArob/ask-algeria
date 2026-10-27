import { NextResponse } from "next/server";
import { LIMITS, isMock } from "@/lib/config";
import { isLocale, type Locale } from "@/lib/i18n";
import { redact } from "@/lib/redact";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { searchChunks } from "@/lib/search";
import { SOURCES } from "@/lib/sources";
import { answerSystemPrompt, answerUserPrompt, type PromptSource } from "@/lib/prompts";
import { chooseAnswerLang, detectLanguage, glossaryQueries } from "@/lib/detect";
import { anthropic, expandQuery } from "@/lib/llm";
import { MODELS } from "@/lib/config";
import { mockAnswer, streamText } from "@/lib/mock";
import type { AskMeta } from "@/lib/types";
import { freshness } from "@/lib/freshness";
import { checkedDate, verificationNotes } from "@/lib/verification";
import { corpusById } from "@/lib/corpus";

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

  let body: { question?: unknown; lang?: unknown; context?: unknown };
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

  const mock = isMock();
  const expansion = mock
    ? {
        lang: detectLanguage(question),
        queries: [question, ...glossaryQueries(context ? `${context} ${question}` : question)],
        topic: "",
      }
    : await expandQuery(question, context);
  const answerLang = chooseAnswerLang(selected, expansion.lang, question);

  const hits = searchChunks(expansion.queries, LIMITS.topChunks);

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

  const fallbackSites = [...SOURCES]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 25)
    .map((s) => `- ${s.name_fr} (${s.name_en}): ${s.url} [${s.category}]`)
    .join("\n");

  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(enc.encode(JSON.stringify(meta) + "\n"));
      try {
        const stream = anthropic().messages.stream({
          model: MODELS.answer,
          max_tokens: LIMITS.answerMaxTokens,
          thinking: { type: "disabled" },
          system: answerSystemPrompt(answerLang, fallbackSites),
          messages: [{ role: "user", content: answerUserPrompt(question, promptSources, context, notes) }],
        });
        req.signal.addEventListener("abort", () => stream.abort());
        const seen: Record<string, number> = {};
        for await (const ev of stream) {
          const k = ev.type + ("delta" in ev && ev.delta && "type" in ev.delta ? ":" + ev.delta.type : "");
          seen[k] = (seen[k] ?? 0) + 1;
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            controller.enqueue(enc.encode(ev.delta.text));
          }
        }
        const fin = await stream.finalMessage();
        if (fin.stop_reason !== "end_turn") console.warn("[ask] stopped:", fin.stop_reason, JSON.stringify(seen));
      } catch (err) {
        console.error("[ask] generation failed:", err instanceof Error ? err.message : err);
        controller.enqueue(enc.encode("\n\n\u0000ERROR"));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(out, { headers });
}
