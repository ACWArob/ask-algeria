import { NextResponse } from "next/server";
import { redact, sheetSafe } from "@/lib/redact";
import { count } from "@/lib/metrics";
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
    if (j.kind === "contact") return contact(j);
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
    count(rating === "up" ? "feedback_up" : "feedback_down");
    await forward(entry);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

async function forward(entry: Record<string, unknown>) {
  const hook = process.env.FEEDBACK_WEBHOOK_URL;
  if (hook && /^https:\/\//.test(hook)) {
    const safe: Record<string, unknown> = Object.fromEntries(Object.entries(entry).map(([k, v]) => [k, sheetSafe(v)]));
    // Shared key so only this site can post to the script (it emails contact messages to the support inbox).
    if (process.env.FEEDBACK_WEBHOOK_KEY) safe.key = process.env.FEEDBACK_WEBHOOK_KEY;
    await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(safe), signal: AbortSignal.timeout(5000) }).catch(() => {});
  }
}

const EMAIL = /^[^\s@<>]{1,64}@[^\s@<>]{1,190}\.[a-z]{2,}$/i;

/**
 * "Contact us" (About page). The message is redacted like feedback (emails, phones, ID numbers removed); the reply
 * address is kept only when the person typed one in its own field, because they asked for a reply.
 */
async function contact(j: Record<string, unknown>) {
  // Honeypot: a hidden field people never fill; bots that fill every field get a quiet "ok".
  if (typeof j.website === "string" && j.website.trim()) return NextResponse.json({ ok: true });
  const message = clip(j.message, 2000);
  if (message.length < 3) return NextResponse.json({ ok: false }, { status: 400 });
  const reply = typeof j.replyTo === "string" ? j.replyTo.trim().slice(0, 254) : "";
  const entry = {
    at: new Date().toISOString(),
    kind: "contact",
    message,
    replyTo: EMAIL.test(reply) ? reply : undefined,
    lang: ["en", "fr", "ar", "dz"].includes(String(j.lang)) ? String(j.lang) : undefined,
  };
  console.log(`[contact] ${JSON.stringify(entry)}`);
  count("contact");
  await forward(entry);
  return NextResponse.json({ ok: true });
}
