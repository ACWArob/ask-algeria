"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalIcon } from "@/components/Icon";
import { LANGUAGE_NAMES, type Dict, type Locale } from "@/lib/i18n";
import { packetFiles } from "@/lib/packet-html";
import {
  buildPacket,
  cleanDetails,
  DETAIL_FIELDS,
  emptyDetails,
  LETTER_LANGS,
  OPTIONAL_FIELDS,
  type DetailField,
  type Details,
  type LetterLang,
  type LetterText,
  type Packet,
  type PacketDoc,
  type PrepareProcedure,
} from "@/lib/prepare";
import { zipBlob } from "@/lib/zip";

/**
 * PRIVACY: the details typed here never leave the browser. This component makes no network request with them
 * (no fetch, no form POST, no logging). They are kept in localStorage only when the person asks for it.
 */
const STORE_KEY = "aa_prepare";

type FieldKind = { type: string; autoComplete?: string; dir?: "ltr" | "auto" };
const KIND: Record<DetailField, FieldKind> = {
  lastName: { type: "text", autoComplete: "family-name", dir: "auto" },
  firstName: { type: "text", autoComplete: "given-name", dir: "auto" },
  nameAr: { type: "text", autoComplete: "off", dir: "auto" },
  birthDate: { type: "date", autoComplete: "bday" },
  birthPlace: { type: "text", autoComplete: "off", dir: "auto" },
  father: { type: "text", autoComplete: "off", dir: "auto" },
  mother: { type: "text", autoComplete: "off", dir: "auto" },
  address: { type: "text", autoComplete: "street-address", dir: "auto" },
  city: { type: "text", autoComplete: "address-level2", dir: "auto" },
  phone: { type: "tel", autoComplete: "tel", dir: "ltr" },
  email: { type: "email", autoComplete: "email", dir: "ltr" },
  office: { type: "text", autoComplete: "off", dir: "auto" },
  nin: { type: "text", autoComplete: "off", dir: "ltr" },
  consularNo: { type: "text", autoComplete: "off", dir: "ltr" },
};

const DATE_TAG: Record<string, string> = { en: "en-GB", fr: "fr-FR", ar: "ar-DZ", arq: "ar-DZ", dz: "ar-DZ" };
function formatDate(d: Date, lang: string): string {
  try {
    return new Intl.DateTimeFormat(DATE_TAG[lang] ?? lang, { day: "numeric", month: "long", year: "numeric" }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

// Print: only the packet, one document per page, plain black on white.
const PRINT_CSS = `
.packet-doc + .packet-doc { break-before: page; page-break-before: always; }
@media print {
  body > :not(main) { display: none !important; }
  :root { --paper: 255 255 255; --surface: 255 255 255; --ink: 0 0 0; --muted: 70 70 70; --line: 170 170 170; --brand: 0 0 0; --brand-soft: 255 255 255; color-scheme: light; }
  body { background: #fff !important; }
  main { max-width: none !important; padding: 0 !important; }
  .packet-doc { border: 0 !important; border-radius: 0 !important; padding: 0 !important; margin: 0 !important; background: #fff !important; }
  .packet-doc a { color: #000; text-decoration: none; }
  @page { margin: 16mm; }
}
`;

interface Props {
  dict: Dict;
  locale: Locale;
  procedures: PrepareProcedure[];
  letters: Record<LetterLang, LetterText>;
  formLabels: { fr: Record<DetailField, string>; ar: Record<DetailField, string> };
  initial?: string;
}

export function PrepareClient({ dict, locale, procedures, letters, formLabels, initial }: Props) {
  const t = dict.prepare;
  const rtl = locale === "ar" || locale === "dz";
  const [slug, setSlug] = useState(initial ?? procedures[0]?.slug ?? "");
  const proc = procedures.find((p) => p.slug === slug) ?? procedures[0];
  const [situationId, setSituationId] = useState(proc?.situations[0]?.id ?? "");
  const situation = proc?.situations.find((s) => s.id === situationId) ?? proc?.situations[0];
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [remember, setRemember] = useState(false);
  const [letterLang, setLetterLang] = useState<LetterLang>(locale === "en" ? "en" : locale === "fr" ? "fr" : "ar");
  const [notice, setNotice] = useState<string | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Read back saved details (only if the person chose "remember"). Runs once, in the browser.
  useEffect(() => {
    setToday(new Date());
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const v = JSON.parse(raw) as { details?: unknown; slug?: unknown; situation?: unknown; letterLang?: unknown };
        setDetails(cleanDetails(v.details));
        setRemember(true);
        if (!initial && typeof v.slug === "string" && procedures.some((p) => p.slug === v.slug)) {
          setSlug(v.slug);
          const p = procedures.find((x) => x.slug === v.slug)!;
          if (typeof v.situation === "string" && p.situations.some((s) => s.id === v.situation)) setSituationId(v.situation);
          else setSituationId(p.situations[0]?.id ?? "");
        }
        if (typeof v.letterLang === "string" && (LETTER_LANGS as string[]).includes(v.letterLang)) setLetterLang(v.letterLang as LetterLang);
      }
    } catch {
      /* storage blocked or bad value */
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read once on mount
  }, []);

  // Save while "remember" is on; remove as soon as it is turned off.
  useEffect(() => {
    if (!loaded) return;
    try {
      if (remember) localStorage.setItem(STORE_KEY, JSON.stringify({ details, slug, situation: situationId, letterLang }));
      else localStorage.removeItem(STORE_KEY);
    } catch {
      /* storage blocked */
    }
  }, [loaded, remember, details, slug, situationId, letterLang]);

  function pickProcedure(s: string) {
    setSlug(s);
    setSituationId(procedures.find((p) => p.slug === s)?.situations[0]?.id ?? "");
  }

  function erase() {
    setDetails(emptyDetails());
    setRemember(false);
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* storage blocked */
    }
    setNotice(t.erased);
  }

  const packet: Packet | null = useMemo(() => {
    if (!proc || !situation || !today) return null;
    return buildPacket({
      procedure: proc,
      situation,
      details,
      uiLang: locale === "dz" ? "arq" : locale,
      uiDir: rtl ? "rtl" : "ltr",
      text: {
        brand: dict.brand.name,
        independent: dict.strip.independent,
        notOfficial: t.notOfficial,
        prepared: t.prepared,
        docs: t.docs,
        checklistIntro: t.checklistIntro,
        mine: t.mine,
        sources: t.sources,
        detailsIntro: t.detailsIntro,
        linksIntro: t.linksIntro,
        fields: t.fields,
      },
      letterLang,
      letter: letters[letterLang],
      formLabels,
      today,
      formatDate,
    });
  }, [proc, situation, details, today, locale, rtl, dict, t, letterLang, letters, formLabels]);

  function download() {
    if (!packet || !proc) return;
    const url = URL.createObjectURL(zipBlob(packetFiles(packet)));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ask-algeria-${proc.slug}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  if (!proc || !situation) return null;
  const set = (f: DetailField, value: string) => setDetails((d) => ({ ...d, [f]: value }));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="space-y-10 print:hidden">
        <p className="flex max-w-prose gap-3 rounded-2xl border border-line border-s-4 border-s-brand bg-surface px-4 py-3 text-[0.9375rem]">
          <LockIcon />
          <span>
            <strong className="block">{t.privacyTitle}</strong>
            {t.privacy}
          </span>
        </p>

        <section aria-labelledby="prep-step1" className="space-y-5">
          <h2 id="prep-step1" className="display text-2xl font-semibold">{t.step1}</h2>
          <div className="max-w-prose">
            <label htmlFor="prep-procedure" className="mb-1.5 block font-semibold">{t.procedure}</label>
            <select id="prep-procedure" value={proc.slug} onChange={(e) => pickProcedure(e.target.value)} className="field">
              {procedures.map((p) => (
                <option key={p.slug} value={p.slug}>{p.title}</option>
              ))}
            </select>
            <Link href={proc.guideHref} className="link mt-2 inline-block text-sm">{t.guideLink}</Link>
          </div>
          <fieldset className="max-w-prose">
            <legend className="mb-1.5 font-semibold">{t.situation}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {proc.situations.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5 has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                  <input type="radio" name="prep-situation" value={s.id} checked={situation.id === s.id} onChange={() => setSituationId(s.id)} className="mt-1.5 accent-[rgb(var(--brand))]" />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section aria-labelledby="prep-step2" className="space-y-5">
          <div>
            <h2 id="prep-step2" className="display text-2xl font-semibold">{t.step2}</h2>
            <p className="mt-2 text-muted">{t.fieldsHint}</p>
          </div>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} autoComplete="on" noValidate>
            {DETAIL_FIELDS.map((f) => {
              const k = KIND[f];
              const wide = f === "address" || f === "office";
              return (
                <div key={f} className={wide ? "sm:col-span-2" : undefined}>
                  <label htmlFor={`prep-${f}`} className="mb-1.5 block font-semibold">
                    {t.fields[f]}
                    {OPTIONAL_FIELDS.includes(f) && <span className="ms-1.5 text-sm font-normal text-muted">({t.optional})</span>}
                  </label>
                  <input
                    id={`prep-${f}`}
                    name={f}
                    type={k.type}
                    dir={k.dir}
                    autoComplete={k.autoComplete}
                    inputMode={f === "nin" || f === "consularNo" ? "numeric" : undefined}
                    value={details[f]}
                    onChange={(e) => set(f, e.target.value)}
                    aria-describedby={f === "office" ? "prep-office-hint" : undefined}
                    className={`field ${k.dir === "ltr" && rtl ? "text-end" : ""}`}
                    maxLength={300}
                  />
                  {f === "office" && <p id="prep-office-hint" className="mt-1.5 text-sm text-muted">{t.officeHint[situation.office]}</p>}
                </div>
              );
            })}
          </form>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => {
                  setRemember(e.target.checked);
                  setNotice(null);
                }}
                aria-describedby="prep-remember-hint"
                className="mt-1.5 h-4 w-4 shrink-0 accent-brand"
              />
              <span>
                <span className="font-semibold">{t.remember}</span>
                <span id="prep-remember-hint" className="block text-sm text-muted">{t.rememberHint}</span>
              </span>
            </label>
            <button type="button" onClick={erase} className="btn-quiet !min-h-[40px] text-sm">{t.erase}</button>
          </div>
          {notice && <p role="status" className="rounded-xl bg-brand-soft px-3 py-2 text-sm font-semibold text-brand">{notice}</p>}
        </section>

        <section aria-labelledby="prep-step3" className="space-y-4">
          <h2 id="prep-step3" className="display text-2xl font-semibold">{t.step3}</h2>
          <div className="flex flex-wrap items-end gap-3">
            {situation.office !== "online" && (
              <div>
                <label htmlFor="prep-letter-lang" className="mb-1.5 block text-sm font-semibold">{t.letterLang}</label>
                <select id="prep-letter-lang" value={letterLang} onChange={(e) => setLetterLang(e.target.value as LetterLang)} className="field !py-2">
                  {LETTER_LANGS.map((l) => (
                    <option key={l} value={l}>{LANGUAGE_NAMES[locale][l]}</option>
                  ))}
                </select>
              </div>
            )}
            <button type="button" onClick={() => window.print()} className="btn-primary" disabled={!packet}>{t.print}</button>
            <button type="button" onClick={download} className="btn-quiet" disabled={!packet}>{t.download}</button>
          </div>
          <p className="max-w-prose text-sm text-muted">{t.printHint}</p>
          {situation.office === "online" && <p className="max-w-prose rounded-xl border border-line bg-surface px-3 py-2 text-sm">{t.noLetter}</p>}
        </section>
      </div>

      {packet && (
        <div id="prepare-packet" role="region" className="mt-8 space-y-8 print:mt-0 print:space-y-0" aria-label={packet.title}>
          {packet.docs.map((doc) => (
            <DocView key={doc.kind} doc={doc} packet={packet} opensNew={dict.services.opensNew} />
          ))}
        </div>
      )}
    </>
  );
}

function DocView({ doc, packet, opensNew }: { doc: PacketDoc; packet: Packet; opensNew: string }) {
  return (
    <article lang={doc.lang} dir={doc.dir} className="packet-doc rounded-3xl border border-line bg-surface p-5 sm:p-8" aria-labelledby={`doc-${doc.kind}`}>
      {doc.kind !== "letter" && (
        <p className="border-b border-line pb-2 text-xs text-muted">
          {packet.brand} · {packet.independent} — {packet.title}
        </p>
      )}
      {doc.kind === "letter" ? (
        <h2 id={`doc-${doc.kind}`} className="sr-only">{doc.title}</h2>
      ) : (
        <h2 id={`doc-${doc.kind}`} className="display mt-5 text-2xl font-semibold">{doc.title}</h2>
      )}
      <div className="mt-3">
        <DocBody doc={doc} opensNew={opensNew} />
      </div>
      <p className="mt-8 border-t border-line pt-2 text-xs text-muted">
        {doc.kind === "letter" ? doc.notice : `${packet.notOfficial} ${packet.prepared}`}
      </p>
    </article>
  );
}

function DocBody({ doc, opensNew }: { doc: PacketDoc; opensNew: string }) {
  switch (doc.kind) {
    case "checklist":
      return (
        <>
          <p className="text-muted">{doc.intro}</p>
          {doc.groups.map((g, gi) => (
            <section key={gi} className="mt-6">
              <h3 className="text-lg font-semibold">{g.title}</h3>
              <ul className="mt-2 divide-y divide-line">
                {g.items.map((it, i) => (
                  <li key={i}>
                    <label className="flex cursor-pointer items-start gap-3 py-2.5">
                      <input type="checkbox" className="mt-1.5 h-4 w-4 shrink-0 accent-brand" />
                      <span>
                        {it.mine && <span className="me-1.5 rounded-md bg-brand-soft px-1.5 py-0.5 text-xs font-bold text-brand print:border print:border-line">{doc.mineLabel}</span>}
                        {it.text}{" "}
                        {it.nums.map((n) => (
                          <span key={n} className="cite" aria-label={`${doc.sourcesTitle} ${n}`}>{n}</span>
                        ))}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {doc.sources.length > 0 && (
            <section className="mt-6">
              <h3 className="text-lg font-semibold">{doc.sourcesTitle}</h3>
              <ol className="mt-2 space-y-2.5">
                {doc.sources.map((s) => (
                  <li key={s.n} className="flex gap-2.5">
                    <span className="cite !m-0 shrink-0" aria-hidden="true">{s.n}</span>
                    <div className="min-w-0 flex-1">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="link block text-sm font-semibold leading-snug" dir="auto">
                        {s.title}
                        <span className="sr-only"> ({opensNew})</span>
                      </a>
                      <span className="block break-all text-xs text-muted" dir="ltr">{s.url}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      );
    case "letter":
      return (
        <div className="mx-auto max-w-prose space-y-4 pt-4">
          <div>
            <span className="block text-xs font-semibold text-muted">{doc.fromLabel}</span>
            {doc.from.map((l, i) => <span key={i} className="block" dir="auto">{l}</span>)}
          </div>
          <div>
            <span className="block text-xs font-semibold text-muted">{doc.toLabel}</span>
            {doc.to.map((l, i) => <span key={i} className="block" dir="auto">{l}</span>)}
          </div>
          <p className="text-end">{doc.placeDate}</p>
          <p><strong>{doc.subjectLabel}</strong> {doc.subject}</p>
          <p>{doc.salutation}</p>
          {doc.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          <p>{doc.closing}</p>
          <div className="pt-6 text-end">
            <span className="block">{doc.signatureLabel}</span>
            <span className="inline-block h-14 w-48 border-b border-ink" aria-hidden="true" />
            <span className="block">{doc.signatureName}</span>
          </div>
        </div>
      );
    case "details":
      return (
        <>
          <p className="text-muted">{doc.intro}</p>
          <table className="mt-4 w-full border-collapse text-[0.9375rem]">
            <tbody>
              {doc.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="w-2/5 border border-line px-3 py-2 text-start align-top font-semibold">
                    {r.label}
                    {r.alt && <span className="block text-xs font-normal text-muted">{r.alt}</span>}
                  </th>
                  <td className="border border-line px-3 py-2 align-top" dir="auto">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    case "links":
      return (
        <>
          <p className="text-muted">{doc.intro}</p>
          <ul className="mt-4 space-y-3">
            {doc.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5 font-semibold">
                  {l.label}
                  <ExternalIcon />
                  <span className="sr-only">({opensNew})</span>
                </a>
                <span className="block break-all text-xs text-muted" dir="ltr">{l.url}</span>
              </li>
            ))}
          </ul>
        </>
      );
  }
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

