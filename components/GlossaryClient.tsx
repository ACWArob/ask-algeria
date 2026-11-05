"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { filterGlossary, type GlossaryEntry } from "@/lib/glossary";
import { fmt, type Locale } from "@/lib/i18n";
import type { Extra } from "@/lib/i18n-extra";

/** Searchable list of glossary terms (filtering happens in the browser; nothing is sent anywhere). */
export function GlossaryClient({ entries, locale, t }: { entries: GlossaryEntry[]; locale: Locale; t: Extra["glossary"] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => filterGlossary(entries, q), [entries, q]);

  return (
    <div className="mt-8">
      <label htmlFor="glossary-q" className="mb-1.5 block font-semibold">{t.search}</label>
      <input
        id="glossary-q"
        type="search"
        dir="auto"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.placeholder}
        className="field max-w-prose"
        autoComplete="off"
        aria-describedby="glossary-count"
      />
      <p id="glossary-count" role="status" className="mt-2 text-sm text-muted">{fmt(t.count, { n: shown.length })}</p>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-xl border border-line bg-surface px-4 py-3">{t.none}</p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {shown.map((e) => (
            <li key={e.id} id={`term-${e.id}`} className="scroll-mt-6 py-5">
              <h2 className="display text-xl font-semibold" dir="auto">{locale === "fr" ? e.fr : locale === "en" ? e.en : e.ar}</h2>
              <p className="mt-1.5 max-w-prose">{e.explain[locale]}</p>
              <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[0.9375rem] sm:grid-cols-2">
                {(["fr", "ar", "en", "dz"] as const).map((k) => (
                  <div key={k} className="flex flex-wrap gap-x-2">
                    <dt className="text-muted">{t[k]}:</dt>
                    <dd lang={k === "dz" ? "arq" : k} dir="auto" className="font-semibold">{e[k]}</dd>
                  </div>
                ))}
              </dl>
              {e.guide && (
                <Link href={`/services/${e.guide}`} className="link mt-2 inline-flex min-h-[40px] items-center text-sm">{t.guide}</Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
