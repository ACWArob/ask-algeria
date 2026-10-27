import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { LIMITS, MODELS, isMock } from "@/lib/config";
import { isLocale, type Locale } from "@/lib/i18n";
import { redact } from "@/lib/redact";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { translateSystemPrompt } from "@/lib/prompts";
import { anthropic } from "@/lib/llm";
import { mockTranslation, streamText } from "@/lib/mock";

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
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
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
    content.push({ type: "text", text: `<document>\n${redact(rawText).text}\n</document>` });
  }
  if (content.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });
  content.push({ type: "text", text: mode === "full" ? "Translate this document." : "Summarise this document and list what I need to do." });

  const headers = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };
  if (isMock()) return new Response(streamText(mockTranslation(target, mode)), { headers });

  const enc = new TextEncoder();
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
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") controller.enqueue(enc.encode(ev.delta.text));
        }
      } catch (err) {
        console.error("[translate] failed:", err instanceof Error ? err.message : err);
        controller.enqueue(enc.encode("\n\n\u0000ERROR"));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(out, { headers });
}
