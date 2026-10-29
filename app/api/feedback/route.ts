import { NextResponse } from "next/server";
import { redact } from "@/lib/redact";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

const REASONS = new Set(["wrong_info", "wrong_office", "not_answered", "wrong_language", "other"]);
const clip = (v: unknown, n: number) => (typeof v === "string" ? redact(v.trim().slice(0, n)).text : "");

/**
 * "Was this helpful?" feedback. Logs one JSON line (Vercel logs) and, when FEEDBACK_WEBHOOK_URL is set
 * (e.g. a Google Apps Script that appends to a Sheet), forwards it there so bad answers can become test cases.
 * The question and answer start are redacted (emails, phones, ID numbers) before they leave this function.
 */
export async function POST(req: Request) {
  if (!rateLimit(`fb:${clientIp(req.headers)}`, 30).ok) return NextResponse.json({ ok: false }, { status: 429 });
  try {
    const j = (await req.json()) as Record<string, unknown>;
    const rating = j.rating === "up" || j.rating === "down" ? j.rating : null;
    if (!rating) return NextResponse.json({ ok: false }, { status: 400 });
    const entry = {
      at: new Date().toISOString(),
      rating,
      reason: typeof j.reason === "string" && REASONS.has(j.reason) ? j.reason : undefined,
      comment: clip(j.comment, 500) || undefined,
      question: clip(j.question, 500) || undefined,
      context: clip(j.context, 500) || undefined,
      answer: clip(j.answer, 400) || undefined,
      lang: ["en", "fr", "ar", "dz"].includes(String(j.lang)) ? String(j.lang) : undefined,
      sources: Number(j.sources ?? 0) || 0,
    };
    console.log(`[feedback] ${JSON.stringify(entry)}`);
    const hook = process.env.FEEDBACK_WEBHOOK_URL;
    if (hook && /^https:\/\//.test(hook)) {
      await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry), signal: AbortSignal.timeout(5000) }).catch(() => {});
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
