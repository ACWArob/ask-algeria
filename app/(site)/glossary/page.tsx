import type { Metadata } from "next";
import { ExemptionCard } from "@/components/ExemptionCard";
import { GlossaryClient } from "@/components/GlossaryClient";
import { GLOSSARY } from "@/lib/glossary";
import { EXTRA } from "@/lib/i18n-extra";
import { getLocale } from "@/lib/i18n/server";

// Reads the language cookie.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: EXTRA[(await getLocale())].glossary.title };
}

export default async function GlossaryPage() {
  const locale = await getLocale();
  const t = EXTRA[locale].glossary;
  return (
    <div className="pt-8 sm:pt-12">
      <h1 className="display text-4xl font-semibold sm:text-5xl">{t.title}</h1>
      <p className="mt-3 max-w-prose text-lg text-muted">{t.lead}</p>
      <p className="mt-4 max-w-prose rounded-2xl border border-line border-s-4 border-s-accent bg-surface px-4 py-3 text-[0.9375rem]">{t.note}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <GlossaryClient entries={GLOSSARY} locale={locale} t={t} />
        <div className="lg:sticky lg:top-6">
          <ExemptionCard locale={locale} />
        </div>
      </div>
    </div>
  );
}
