"use client";

import { useMemo, useState } from "react";
import { fmt, type Dict } from "@/lib/i18n";

export interface DirEntry {
  name: string;
  altName: string;
  domain: string;
  url: string;
  category: string;
  pages?: number;
}

export interface DirGroup {
  category: string;
  label: string;
  entries: DirEntry[];
}

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ًͯ-ٟ]/g, "");
}

export function DirectoryClient({ dict, groups }: { dict: Dict; groups: DirGroup[] }) {
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
                    {typeof e.pages === "number" && <span>{fmt(t.pages, { n: e.pages })}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
