import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import { LEGAL_STRINGS } from "@/lib/i18n-legal";

// Reads the language cookie on every request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: LEGAL_STRINGS[(await getLocale())].heading };
}

export default async function LegalPage() {
  const locale = await getLocale();
  const L = LEGAL_STRINGS[locale];
  const dict = getDict(locale);
  return (
    <div className="pb-16 pt-10 sm:pt-14">
      <h1 className="display text-4xl font-bold sm:text-5xl">{L.heading}</h1>
      <p className="mt-3 text-sm text-muted">{L.updated}</p>
      {[L.notice, L.privacy, L.terms].map((s, i) => (
        <section key={i} aria-labelledby={`legal-${i}`} className="mt-10 max-w-prose">
          <h2 id={`legal-${i}`} className="display text-2xl font-semibold">{s.title}</h2>
          <ul className="mt-4 list-disc space-y-3 ps-5 marker:text-brand">
            {s.body.map((p, j) => <li key={j}>{p}</li>)}
          </ul>
        </section>
      ))}
      <p className="mt-12">
        <Link href="/about#contact" className="btn-quiet">{dict.nav.contact}</Link>
      </p>
    </div>
  );
}
