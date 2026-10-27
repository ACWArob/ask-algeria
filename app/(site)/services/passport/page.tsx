import type { Metadata } from "next";
import Link from "next/link";
import { ExternalIcon } from "@/components/Icon";
import { corpusById } from "@/lib/corpus";
import { PASSPORT_GUIDE as G } from "@/lib/guides/passport";
import { fmt, getDict, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: G.title[getLocale()] };
}

export default function PassportGuidePage() {
  const locale: Locale = getLocale();
  const dict = getDict(locale);
  const g = dict.guide;
  const corpus = corpusById();

  // Number sources in order of first citation.
  const order: string[] = [];
  const cite = (ids: string[]) =>
    ids
      .filter((id) => corpus.has(id))
      .map((id) => {
        if (!order.includes(id)) order.push(id);
        return order.indexOf(id) + 1;
      })
      .sort((a, b) => a - b);

  const sections = G.sections.map((s) => ({ ...s, points: s.points.map((p) => ({ text: p.text[locale], nums: cite(p.cites) })) }));
  const fees = G.fees.map((f) => ({ office: f.office[locale], items: f.items[locale], payment: f.payment[locale], nums: cite(f.cites) }));
  const sources = order.map((id, i) => ({ n: i + 1, rec: corpus.get(id)! }));
  const fetched = sources.map((s) => s.rec.fetched).filter(Boolean).sort().at(-1);

  const Cites = ({ nums }: { nums: number[] }) => (
    <>
      {nums.map((n) => (
        <a key={n} href={`#src-${n}`} className="cite" aria-label={`${g.sourcesTitle} ${n}`}>{n}</a>
      ))}
    </>
  );

  return (
    <div className="pt-8 sm:pt-12">
      <Link href="/#popular" className="link text-sm">{g.back}</Link>
      <h1 className="display mt-4 text-4xl font-semibold sm:text-5xl">{G.title[locale]}</h1>
      <p className="mt-3 max-w-prose text-lg text-muted">{G.lead[locale]}</p>

      <p className="mt-6 max-w-prose rounded-2xl border border-line border-s-4 border-s-accent bg-surface px-4 py-3 text-[0.9375rem]">{g.abroadNote}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {G.portals.map((p) => (
          <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" className="btn-quiet !min-h-[40px] text-sm">
            {p.label[locale]}
            <ExternalIcon />
            <span className="sr-only">({dict.services.opensNew})</span>
          </a>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,44rem)_1fr]">
        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`h-${s.id}`} className="scroll-mt-6">
              <h2 id={`h-${s.id}`} className="display text-2xl font-semibold">{G.sections.find((x) => x.id === s.id)!.title[locale]}</h2>
              <ul className="mt-4 space-y-3">
                {s.points.map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    <p>
                      {p.text} <Cites nums={p.nums} />
                    </p>
                  </li>
                ))}
              </ul>

              {s.id === "documents" && (
                <section aria-labelledby="h-fees" className="mt-10">
                  <h2 id="h-fees" className="display text-2xl font-semibold">{g.feesTitle}</h2>
                  <dl className="mt-4 divide-y divide-line border-y border-line">
                    {fees.map((f) => (
                      <div key={f.office} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-4">
                        <dt className="font-semibold">{f.office}</dt>
                        <dd>
                          <p>
                            {f.items} <Cites nums={f.nums} />
                          </p>
                          <p className="mt-1 text-sm text-muted">{f.payment}</p>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
            </section>
          ))}

          <p className="font-semibold">{dict.footer.confirm}</p>
          <Link href="/" className="btn-primary">{g.askFollowUp}</Link>
        </div>

        <aside aria-labelledby="h-sources" className="lg:sticky lg:top-6 lg:self-start">
          <h2 id="h-sources" className="display text-lg font-semibold">{g.sourcesTitle}</h2>
          <ol className="mt-3 space-y-3">
            {sources.map(({ n, rec }) => (
              <li key={rec.id} id={`src-${n}`} className="flex scroll-mt-6 gap-2.5">
                <span className="cite !m-0 shrink-0" aria-hidden="true">{n}</span>
                <div className="min-w-0 flex-1">
                  <a href={rec.url} target="_blank" rel="noopener noreferrer" className="link block text-sm font-semibold leading-snug" dir="auto">{rec.title}</a>
                  <span className="block truncate text-xs text-muted" dir="ltr">{rec.domain}</span>
                </div>
              </li>
            ))}
          </ol>
          {fetched && <p className="mt-4 text-xs text-muted">{fmt(g.fetched, { date: fetched.slice(0, 10) })}</p>}
        </aside>
      </div>
    </div>
  );
}
