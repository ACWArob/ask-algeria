import type { Metadata } from "next";
import { PrepareClient } from "@/components/PrepareClient";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { LETTER_LANGS, PREPARE_SLUGS, type LetterLang, type LetterText } from "@/lib/prepare";
import { prepareProcedures } from "@/lib/prepare-data";

// Reads the language cookie on every request.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return { title: getDict(getLocale()).prepare.heading };
}

export default function PreparePage({ searchParams }: { searchParams: { p?: string | string[] } }) {
  const locale = getLocale();
  const dict = getDict(locale);
  const procedures = prepareProcedures(locale);
  const letters = Object.fromEntries(LETTER_LANGS.map((l) => [l, getDict(l).prepare.letter])) as Record<LetterLang, LetterText>;
  const formLabels = { fr: getDict("fr").prepare.fields, ar: getDict("ar").prepare.fields };
  const p = typeof searchParams.p === "string" && PREPARE_SLUGS.includes(searchParams.p) ? searchParams.p : undefined;
  return (
    <div className="pb-16 pt-10 sm:pt-14 print:p-0">
      <div className="print:hidden">
        <h1 className="display text-4xl font-bold sm:text-5xl">{dict.prepare.heading}</h1>
        <p className="mt-4 max-w-prose text-lg text-muted">{dict.prepare.sub}</p>
      </div>
      <div className="mt-8 print:mt-0">
        <PrepareClient key={locale} dict={dict} locale={locale} procedures={procedures} letters={letters} formLabels={formLabels} initial={p} />
      </div>
    </div>
  );
}
