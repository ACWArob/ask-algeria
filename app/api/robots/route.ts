import { isPublic, robotsTxt } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Served at /robots.txt in public mode (middleware rewrites it here); public/robots.txt is the private version. */
export function GET() {
  return new Response(robotsTxt(isPublic()), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
