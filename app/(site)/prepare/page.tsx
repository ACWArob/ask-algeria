import type { Metadata } from "next";
import { PrepareClient } from "@/components/PrepareClient";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { LETTER_LANGS, PREPARE_SLUGS, type LetterLang, type LetterText } from "@/lib/prepare";
import { prepareProcedures } from "@/lib/prepare-data";

// Reads the language cookie on every request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getDict((await getLocale())).prepare.heading };
}

export default async function PreparePage(props: { searchParams: Promise<{ p?: string | string[] }> }) {
  const searchParams = await props.searchParams;
  const locale = await getLocale();
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
        <section aria-labelledby="prep-what" className="mt-8 max-w-3xl rounded-3xl border border-line bg-surface px-5 py-6 sm:px-7">
          <h2 id="prep-what" className="display text-xl font-semibold">{dict.prepare.what.title}</h2>
          <p className="mt-2">{dict.prepare.what.body}</p>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {dict.prepare.what.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden="true" className="display flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-base font-bold text-brand-ink">{i + 1}</span>
                <span className="pt-0.5 text-[0.9375rem]">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="mt-8 print:mt-0">
        <PrepareClient key={locale} dict={dict} locale={locale} procedures={procedures} letters={letters} formLabels={formLabels} initial={p} />
      </div>
    </div>
  );
}
