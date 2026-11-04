"use client";

import { useMemo, useState } from "react";
import { fmt, type Dict, type Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/dates";

export interface DirEntry {
  name: string;
  altName: string;
  domain: string;
  url: string;
  category: string;
  pages?: number;
  /** ISO date of the most recent check of any page of this domain. */
  checked?: string;
  /** Present only when the site could not be verified by fetching it. */
  evidence?: string;
}

export interface DirGroup {
  category: string;
  label: string;
  entries: DirEntry[];
}

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ًͯ-ٟ]/g, "");
}

export function DirectoryClient({ dict, groups, locale }: { dict: Dict; groups: DirGroup[]; locale: Locale }) {
  const t = dict.directory;
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return groups;
    return groups
      .map((g) => ({ ...g, entries: g.entries.filter((e) => norm(`${e.name} ${e.altName} ${e.domain} ${g.label}`).includes(n)) }))
      .filter((g) => g.entries.length > 0);
  }, [q, groups]);
  const total = filtered.reduce((a, g) => a + g.entries.length, 0);

  return (
    <div>
      <div className="max-w-md">
        <label htmlFor="dir-search" className="mb-1.5 block font-semibold">{t.search}</label>
        <input id="dir-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder} className="field" />
        <p className="mt-2 text-sm text-muted" aria-live="polite">{fmt(t.count, { n: total })}</p>
      </div>

      {filtered.length === 0 && <p className="mt-10 text-lg">{fmt(t.empty, { q })}</p>}

      <div className="mt-10 space-y-12">
        {filtered.map((g) => (
          <section key={g.category} aria-labelledby={`cat-${g.category}`}>
            <h2 id={`cat-${g.category}`} className="display flex items-baseline gap-3 border-b-2 border-ink pb-2 text-2xl font-semibold">
              {g.label}
              <span className="text-base font-normal text-muted">{g.entries.length}</span>
            </h2>
            <ul className="divide-y divide-line">
              {g.entries.map((e) => (
                <li key={e.url} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
                  <div className="min-w-0">
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="link font-semibold">{e.name}</a>
                    {e.altName && e.altName !== e.name && <p className="text-sm text-muted"><bdi>{e.altName}</bdi></p>}
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-4 text-sm text-muted sm:justify-end">
                    <span dir="ltr">{e.domain}</span>
                    {typeof e.pages === "number" && <span>{fmt(t.domainPages, { n: e.pages })}</span>}
                    {e.checked && <span>{fmt(t.lastChecked, { date: formatDate(e.checked, locale) })}</span>}
                  </div>
                  {e.evidence && (
                    <details className="group mt-1 text-xs text-muted sm:col-span-2">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-line px-2 py-0.5 hover:text-ink [&::-webkit-details-marker]:hidden">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-muted" />
                        {t.unverified}
                      </summary>
                      <p className="mt-1.5 max-w-prose">
                        {/* Our research notes (e.evidence) stay internal: only this plain explanation is shown. */}
                        {t.unverifiedHint}
                      </p>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
