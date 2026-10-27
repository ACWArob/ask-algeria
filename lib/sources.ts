import rawSources from "@/data/sources.json";
import type { Locale } from "@/lib/i18n";
import type { Source } from "@/lib/types";

function clean(list: unknown): Source[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object" && typeof (s as { url?: unknown }).url === "string")
    .map((s) => {
      const url = String(s.url);
      let domain = typeof s.domain === "string" && s.domain ? s.domain : "";
      if (!domain) {
        try { domain = new URL(url).hostname; } catch { domain = url; }
      }
      const name_fr = String(s.name_fr ?? s.name_en ?? s.name_ar ?? domain);
      return {
        name_en: String(s.name_en ?? name_fr),
        name_fr,
        name_ar: String(s.name_ar ?? name_fr),
        domain: domain.replace(/^www\./, ""),
        url,
        category: String(s.category ?? "federal-core"),
        languages: Array.isArray(s.languages) ? s.languages.map(String) : [],
        description: String(s.description ?? ""),
        priority: Number(s.priority ?? 3) || 3,
        reachable: s.reachable !== false,
        pages: typeof s.pages === "number" ? s.pages : typeof s.page_count === "number" ? (s.page_count as number) : undefined,
      } satisfies Source;
    });
}

export const SOURCES: Source[] = clean(rawSources as unknown);

export function sourceName(s: Source, locale: Locale): string {
  if (locale === "fr") return s.name_fr;
  if (locale === "ar" || locale === "dz") return s.name_ar;
  return s.name_en;
}
