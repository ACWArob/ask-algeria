import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Thumbs up/down. MVP: logs only the rating and answer language — never the question text. */
export async function POST(req: Request) {
  try {
    const j = (await req.json()) as { rating?: unknown; lang?: unknown; sources?: unknown };
    const rating = j.rating === "up" || j.rating === "down" ? j.rating : null;
    if (rating) console.log(`[feedback] rating=${rating} lang=${String(j.lang ?? "")} sources=${Number(j.sources ?? 0)}`);
  } catch {
    /* ignore */
  }
  return NextResponse.json({ ok: true });
}
