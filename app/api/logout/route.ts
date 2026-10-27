import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/config";

export const runtime = "nodejs";

function logout(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url), 303);
  res.cookies.set(COOKIE.session, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}

export const POST = logout;
export const GET = logout;
