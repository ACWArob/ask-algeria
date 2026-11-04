import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { LIMITS, MODELS, isMock } from "@/lib/config";
import { isLocale, type Locale } from "@/lib/i18n";
import { redact } from "@/lib/redact";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { translateSystemPrompt } from "@/lib/prompts";
import { anthropic } from "@/lib/llm";
import { mockTranslation, streamText } from "@/lib/mock";
import { allowAi, pdfAllowed, recordSpend, spendSettled } from "@/lib/spend";
import { untag } from "@/lib/prompts";

/** Longer PDFs cost much more (each page is billed as text + image); ask people to send only the pages they need. */
const MAX_PDF_PAGES = Number(process.env.TRANSLATE_MAX_PDF_PAGES) || 10;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

/** Accepts multipart/form-data: text?, file?, target (en|fr|ar|dz), mode (full|summary). Streams Markdown. Nothing is stored. */
export async function POST(req: Request) {
  const rl = rateLimit(`tr:${clientIp(req.headers)}`, 10);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad_form" }, { status: 400 });
  }
  const target: Locale = isLocale(form.get("target")) ? (form.get("target") as Locale) : "fr";
  const mode = form.get("mode") === "full" ? "full" : "summary";
  const rawText = typeof form.get("text") === "string" ? String(form.get("text")).trim() : "";
  const file = form.get("file");

  const content: Anthropic.ContentBlockParam[] = [];
  if (file instanceof File && file.size > 0) {
    if (file.size > LIMITS.uploadMaxBytes) return NextResponse.json({ error: "too_large" }, { status: 413 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (file.type === "application/pdf" && !pdfAllowed(bytes, MAX_PDF_PAGES)) return NextResponse.json({ error: "too_many_pages" }, { status: 413 });
    const data = Buffer.from(bytes).toString("base64");
    if (file.type === "application/pdf") {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data } });
    } else if ((IMAGE_TYPES as readonly string[]).includes(file.type)) {
      content.push({ type: "image", source: { type: "base64", media_type: file.type as ImageType, data } });
    } else {
      return NextResponse.json({ error: "bad_type" }, { status: 415 });
    }
  }
  if (rawText) {
    if (rawText.length > LIMITS.translateMaxChars) return NextResponse.json({ error: "too_long" }, { status: 413 });
    content.push({ type: "text", text: `<document>\n${untag(redact(rawText).text)}\n</document>` });
  }
  if (content.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });
  content.push({ type: "text", text: mode === "full" ? "Translate this document." : "Summarise this document and list what I need to do." });

  const headers = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };
  if (isMock()) return new Response(streamText(mockTranslation(target, mode)), { headers });
  // Spending guard (lib/spend.ts): kill switch, daily budget, per-visitor daily quota.
  const allowed = await allowAi(clientIp(req.headers), "translate");
  if (!allowed.ok) return NextResponse.json({ error: allowed.reason === "quota" ? "rate_limited" : "paused" }, { status: 429 });

  const enc = new TextEncoder();
  // Rough input size for cost accounting if the API doesn't report usage: text ~3 chars/token, a file ~1 token per 3 bytes, capped.
  const estimatedInput = Math.ceil(rawText.length / 3) + (file instanceof File ? Math.min(Math.ceil(file.size / 3), 250_000) : 0);
  let written = 0;
  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = anthropic().messages.stream({
          model: MODELS.answer,
          max_tokens: LIMITS.translateMaxTokens,
          thinking: { type: "disabled" },
          system: translateSystemPrompt(target, mode),
          messages: [{ role: "user", content }],
        });
        req.signal.addEventListener("abort", () => stream.abort());
        try {
          for await (const ev of stream) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              written += ev.delta.text.length;
              controller.enqueue(enc.encode(ev.delta.text));
            }
          }
        } finally {
          // Billed even when the visitor leaves or the stream fails: real usage if available, else an estimate.
          const fin = await stream.finalMessage().catch(() => null);
          recordSpend(MODELS.answer, fin?.usage ?? { input_tokens: estimatedInput, output_tokens: Math.ceil(Math.max(written, 200) / 3) });
        }
      } catch (err) {
        console.error("[translate] failed:", err instanceof Error ? err.message : err);
        controller.enqueue(enc.encode("\n\n\u0000ERROR"));
      } finally {
        await spendSettled(); // shared-store spend write (bounded by its short timeout) before the function can freeze
        controller.close();
      }
    },
  });
  return new Response(out, { headers });
}
