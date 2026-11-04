import { PrintCardButton } from "@/components/PrintCardButton";
import { formatDate } from "@/lib/dates";
import { EXEMPTION_POINTS } from "@/lib/exemption";
import { fmt, type Locale } from "@/lib/i18n";
import { EXTRA } from "@/lib/i18n-extra";
import { sourceMeta } from "@/lib/source-meta";

const ID = "exemption-card";

// Print only this card when its button is used (the button sets data-print-only on <html>).
const PRINT_CSS = `
@media print {
  html[data-print-only="${ID}"] body * { visibility: hidden !important; }
  html[data-print-only="${ID}"] #${ID}, html[data-print-only="${ID}"] #${ID} * { visibility: visible !important; }
  html[data-print-only="${ID}"] #${ID} { position: absolute; inset-inline: 0; top: 0; margin: 0 !important; border: 1px solid #000 !important; background: #fff !important; color: #000 !important; }
  html[data-print-only="${ID}"] #${ID} a { color: #000 !important; }
}
`;

function safeDecode(u: string): string {
  try {
    return decodeURI(u);
  } catch {
    return u;
  }
}

/**
 * Server component: what the Ministry of the Interior's pages say about not providing civil-status documents
 * that are in the national register. Quotes are verbatim (lib/exemption.ts), with link and checked date.
 */
export function ExemptionCard({ locale }: { locale: Locale }) {
  const t = EXTRA[locale].exemption;
  const points = EXEMPTION_POINTS.map((p) => ({ key: p.key, q: p.source[locale], meta: sourceMeta(p.source[locale].id) })).filter((p) => p.meta);
  if (!points.length) return null;

  return (
    <section id={ID} aria-labelledby={`${ID}-h`} className="max-w-prose rounded-3xl border border-line border-t-4 border-t-brand bg-surface px-5 py-6 sm:px-7">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <h2 id={`${ID}-h`} className="display text-2xl font-semibold">{t.title}</h2>
      <p className="mt-3 font-semibold">{t.show}</p>
      <p className="mt-4 text-muted">{t.lead}</p>
      <ol className="mt-3 space-y-5">
        {points.map(({ key, q, meta }) => (
          <li key={key}>
            <blockquote lang={q.lang} dir={q.lang === "ar" ? "rtl" : "ltr"} className="whitespace-pre-line border-s-4 border-line ps-3 text-[0.9375rem]">
              « {q.quote} »
            </blockquote>
            <p className="mt-2">
              <strong>{t.plain}</strong> {t[key]}
            </p>
            <p className="mt-1.5 text-sm text-muted">
              {t.source}{" "}
              <a href={meta!.url} target="_blank" rel="noopener noreferrer" className="link" dir="auto">{meta!.title}</a>{" "}
              <span dir="ltr">({meta!.domain})</span>, {fmt(t.checked, { date: formatDate(meta!.fetched, locale) })}
              {meta!.archived && meta!.archivedUrl && (
                <>
                  {" · "}
                  <a href={meta!.archivedUrl} target="_blank" rel="noopener noreferrer" className="link">{t.archived}</a>
                </>
              )}
              <span className="hidden break-all text-xs print:block" dir="ltr">{safeDecode(meta!.url)}</span>
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm">{t.limits}</p>
      <div className="mt-5">
        <PrintCardButton target={ID} label={t.print} />
      </div>
    </section>
  );
}
