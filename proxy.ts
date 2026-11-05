import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { COOKIE } from "@/lib/config";
import { isPublic } from "@/lib/site";

const PUBLIC_PATHS = new Set(["/login", "/api/login", "/robots.txt"]);

/** Next 16 "proxy" (was middleware.ts): the password gate, robots.txt in public mode and the noindex header. */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Public launch (PUBLIC_SITE=1): no password, indexable, robots.txt from /api/robots, no login page.
  if (isPublic()) {
    if (pathname === "/robots.txt") return NextResponse.rewrite(new URL("/api/robots", req.url));
    if (pathname === "/login") return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

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
  // robots.txt is listed on its own so public mode can serve the indexable version.
  matcher: ["/robots.txt", "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|woff2?)$).*)"],
};
