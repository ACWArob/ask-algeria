import type { Metadata } from "next";
import { DirectoryClient, type DirGroup } from "@/components/DirectoryClient";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { SOURCES, sourceName } from "@/lib/sources";
import { CATEGORIES } from "@/lib/types";

export function generateMetadata(): Metadata {
  return { title: getDict(getLocale()).directory.heading };
}

export default function DirectoryPage() {
  const locale = getLocale();
  const dict = getDict(locale);
  const labels = dict.categories as Record<string, string>;
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
          pages: s.pages,
        })),
    }))
    .filter((g) => g.entries.length > 0);

  return (
    <div className="pt-10 sm:pt-14">
      <h1 className="display text-4xl font-bold sm:text-5xl">{dict.directory.heading}</h1>
      <p className="mt-4 max-w-prose text-lg text-muted">{dict.directory.sub}</p>
      <div className="mt-10">
        <DirectoryClient dict={dict} groups={groups} />
      </div>
    </div>
  );
}
