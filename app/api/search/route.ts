import { bodyError, readJson } from "@/lib/body";
import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import { instantSearch } from "@/lib/instant";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { redact } from "@/lib/redact";
import { parseWhere } from "@/lib/where";
import { count } from "@/lib/metrics";

export const runtime = "nodejs";

/**
 * Free search over the official pages (no model call). The site shows these results first and only calls
 * /api/ask (Claude) when the person asks for a written answer or asks a follow-up.
 */
export async function POST(req: Request) {
  if (!rateLimit(`search:${clientIp(req.headers)}`, 60).ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  let body: { question?: unknown; lang?: unknown; context?: unknown; where?: unknown };
  try {
    body = await readJson(req, 16_000);
  } catch (e) {
    const { error, status } = bodyError(e);
    return NextResponse.json({ error }, { status });
  }
  const raw = typeof body.question === "string" ? body.question.trim() : "";
  if (!raw) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (raw.length > 1000) return NextResponse.json({ error: "too_long" }, { status: 413 });
  const lang = isLocale(body.lang) ? body.lang : "fr";
  const { text: question } = redact(raw);
  const context = typeof body.context === "string" ? redact(body.context.trim().slice(0, 500)).text : "";
  count("search");
  const result = instantSearch(question, lang, req.headers, context, parseWhere(body.where));
  // One line per search so we can compare how often people still ask for an AI answer.
  console.log(`[search] ${JSON.stringify({ lang, pages: result.pages.length, guides: result.guides.map((g) => g.slug), office: Boolean(result.office), mission: Boolean(result.mission) })}`);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
