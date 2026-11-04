/**
 * Public vs private demo. One switch: PUBLIC_SITE=1 removes the password gate and lets search engines index the
 * site (robots.txt, sitemap, meta robots, X-Robots-Tag). Anything else keeps the private, noindex demo.
 * Changing it needs a redeploy (next.config.mjs reads it at build time for the headers).
 */
export const SITE_URL = "https://www.algeriagov.online";

export function isPublic(env: Record<string, string | undefined> = process.env): boolean {
  return env.PUBLIC_SITE === "1" || env.PUBLIC_SITE === "true";
}

export function robotsTxt(publicSite: boolean): string {
  return publicSite
    ? `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /login\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
}
