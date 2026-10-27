import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { COOKIE } from "@/lib/config";

const PUBLIC_PATHS = new Set(["/login", "/api/login", "/robots.txt"]);

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!PUBLIC_PATHS.has(pathname)) {
    const ok = await verifyToken(
      { AUTH_SECRET: process.env.AUTH_SECRET, SITE_PASSWORD: process.env.SITE_PASSWORD },
      req.cookies.get(COOKIE.session)?.value,
    );
    if (!ok) {
      if (pathname.startsWith("/api/")) {
        return withNoIndex(NextResponse.json({ error: "unauthorized" }, { status: 401 }));
      }
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
      return withNoIndex(NextResponse.redirect(url));
    }
  }
  return withNoIndex(NextResponse.next());
}

function withNoIndex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  // Everything except Next static assets and public files with an extension (icons, fonts, robots.txt).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|woff2?)$).*)"],
};
