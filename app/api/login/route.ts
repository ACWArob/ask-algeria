import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/config";
import { safeEqual, signToken } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeNext(v: unknown): string {
  const s = typeof v === "string" ? v : "/";
  // A path on this site only: "/\\evil.com" or "//evil.com" would be read as another host.
  return /^\/(?![/\\])/.test(s) && !s.startsWith("/api/") && !/[\u0000-\u001f\\]/.test(s) ? s : "/";
}

/** Accepts JSON {password, next} or a classic form post (works without JS). */
export async function POST(req: Request) {
  const isForm = (req.headers.get("content-type") ?? "").includes("form");
  let password = "";
  let next = "/";
  try {
    if (isForm) {
      const f = await req.formData();
      password = String(f.get("password") ?? "");
      next = safeNext(f.get("next"));
    } else {
      const j = (await req.json()) as { password?: unknown; next?: unknown };
      password = typeof j.password === "string" ? j.password : "";
      next = safeNext(j.next);
    }
  } catch {
    /* fall through with empty password */
  }

  const fail = (code: string, status: number) =>
    isForm
      ? NextResponse.redirect(new URL(`/login?error=${code}&next=${encodeURIComponent(next)}`, req.url), 303)
      : NextResponse.json({ ok: false, error: code }, { status });

  const rl = rateLimit(`login:${clientIp(req.headers)}`, 10);
  if (!rl.ok) return fail("tooMany", 429);

  const expected = process.env.SITE_PASSWORD;
  if (!expected) return fail("notConfigured", 500);
  if (!(await safeEqual(password, expected))) return fail("error", 401);

  const token = await signToken({ AUTH_SECRET: process.env.AUTH_SECRET, SITE_PASSWORD: expected }, COOKIE.maxAgeSeconds);
  const res = isForm ? NextResponse.redirect(new URL(next, req.url), 303) : NextResponse.json({ ok: true, next });
  res.cookies.set(COOKIE.session, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !process.env.INSECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE.maxAgeSeconds,
  });
  return res;
}
