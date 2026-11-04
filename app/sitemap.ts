import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";
import { MISSIONS } from "@/lib/missions";
import { isPublic, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Main pages, guides and consulate pages. Empty while the site is a private demo. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublic()) return [];
  const pages = ["/", "/about", "/translate", "/prepare", "/embassies", "/status", "/glossary", "/directory", "/legal"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...Object.keys(GUIDES).map((slug) => ({ url: `${SITE_URL}/services/${slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...MISSIONS.filter((m) => m.id).map((m) => ({ url: `${SITE_URL}/embassies/${m.id}`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
