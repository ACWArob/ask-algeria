import type { Metadata } from "next";
import { DirectoryClient, type DirGroup } from "@/components/DirectoryClient";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { SOURCES, sourceName } from "@/lib/sources";
import { CATEGORIES } from "@/lib/types";
import { corpusById } from "@/lib/corpus";
import { freshness } from "@/lib/freshness";
import { checkedDate } from "@/lib/verification";

/** Per-domain page count and most recent "checked" date from the corpus + page-state. */
function domainStats() {
  const { state } = freshness();
  const stats = new Map<string, { pages: number; checked: string | null }>();
  for (const r of corpusById().values()) {
    const d = r.domain.replace(/^www\./, "");
    const cur = stats.get(d) ?? { pages: 0, checked: null };
    cur.pages++;
    const c = checkedDate(r.fetched, state[r.url]);
    if (c && (!cur.checked || c > cur.checked)) cur.checked = c;
    stats.set(d, cur);
  }
  return stats;
}

export function generateMetadata(): Metadata {
  return { title: getDict(getLocale()).directory.heading };
}

export default function DirectoryPage() {
  const locale = getLocale();
  const dict = getDict(locale);
  const labels = dict.categories as Record<string, string>;
  const stats = domainStats();
  const order = [...CATEGORIES, ...new Set(SOURCES.map((s) => s.category).filter((c) => !(CATEGORIES as string[]).includes(c)))];
  const groups: DirGroup[] = order
    .map((category) => ({
      category,
      label: labels[category] ?? category,
      entries: SOURCES.filter((s) => s.category === category)
        .sort((a, b) => a.priority - b.priority || sourceName(a, locale).localeCompare(sourceName(b, locale)))
        .map((s) => ({
          name: sourceName(s, locale),
          altName: locale === "ar" || locale === "dz" ? s.name_fr : s.name_ar,
          domain: s.domain,
          url: s.url,
          category: s.category,
          pages: stats.get(s.domain.replace(/^www\./, ""))?.pages ?? s.pages,
          checked: stats.get(s.domain.replace(/^www\./, ""))?.checked ?? undefined,
          // fetch_status itself is never shown; unverified entries only expose the evidence note.
          evidence: s.reachable ? undefined : s.evidence,
        })),
    }))
    .filter((g) => g.entries.length > 0);

  return (
    <div className="pt-10 sm:pt-14">
      <h1 className="display text-4xl font-bold sm:text-5xl">{dict.directory.heading}</h1>
      <p className="mt-4 max-w-prose text-lg text-muted">{dict.directory.sub}</p>
      <div className="mt-10">
        <DirectoryClient dict={dict} groups={groups} locale={locale} />
      </div>
    </div>
  );
}
