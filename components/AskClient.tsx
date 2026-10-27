"use client";

import { useEffect, useRef, useState } from "react";
import { fmt, LANGUAGE_NAMES, type Dict, type Locale } from "@/lib/i18n";
import { redact } from "@/lib/redact";
import type { AskMeta } from "@/lib/types";
import { Markdown } from "./Markdown";
import { ERROR_MARK, readStream } from "./stream";

const MAX = 1000;

type Status = "idle" | "loading" | "streaming" | "done" | "error";

export function AskClient({ dict, locale }: { dict: Dict; locale: Locale }) {
  const t = dict.ask;
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [meta, setMeta] = useState<AskMeta | null>(null);
  const [answer, setAnswer] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(raw: string) {
    const trimmed = raw.trim();
    setError(null);
    if (!trimmed) {
      setError(t.empty);
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length > MAX) {
      setError(fmt(t.tooLong, { max: MAX }));
      return;
    }
    const { text, removed } = redact(trimmed);
    setNotice(removed > 0 ? fmt(t.redacted, { n: removed }) : null);
    if (removed > 0) setQ(text);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setAsked(text);
    setStatus("loading");
    setMeta(null);
    setAnswer("");
    setFeedback(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, lang: locale }),
        signal: ac.signal,
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        setError(res.status === 429 ? t.rateLimited : res.status === 413 ? fmt(t.tooLong, { max: MAX }) : t.error);
        setStatus("error");
        return;
      }
      let gotMeta = false;
      const full = await readStream(
        res,
        (all) => {
          const nl = all.indexOf("\n");
          if (nl === -1) return;
          if (!gotMeta) {
            try {
              setMeta(JSON.parse(all.slice(0, nl)) as AskMeta);
            } catch {
              /* ignore malformed meta */
            }
            gotMeta = true;
            setStatus("streaming");
            requestAnimationFrame(() => resultRef.current?.focus({ preventScroll: false }));
          }
          setAnswer(all.slice(nl + 1).replace(ERROR_MARK, ""));
        },
        ac.signal,
      );
      if (full.includes(ERROR_MARK)) {
        setError(t.error);
        setStatus("error");
      } else {
        setStatus("done");
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(t.error);
      setStatus("error");
    }
  }

  function sendFeedback(r: "up" | "down") {
    setFeedback(r);
    console.info("[feedback]", r, { lang: meta?.answerLang, sources: meta?.sources.length });
    void fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: r, lang: meta?.answerLang, sources: meta?.sources.length ?? 0 }),
    }).catch(() => {});
  }

  function reset() {
    abortRef.current?.abort();
    setStatus("idle");
    setAnswer("");
    setMeta(null);
    setAsked("");
    setQ("");
    setNotice(null);
    setError(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  const busy = status === "loading" || status === "streaming";
  const showResult = status !== "idle" && (asked || answer);
  const answerLang = meta?.answerLang;
  const answerDir = answerLang === "ar" || answerLang === "dz" ? "rtl" : "ltr";
  const switched = answerLang && answerLang !== locale;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(q);
        }}
        className="relative max-w-3xl"
      >
        <label htmlFor="question" className="sr-only">{t.label}</label>
        <div className="rounded-[1.75rem] border-2 border-ink/80 bg-surface p-2 shadow-[6px_6px_0_rgb(var(--door))] focus-within:border-door rtl:shadow-[-6px_6px_0_rgb(var(--door))]">
          <textarea
            id="question"
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void ask(q);
              }
            }}
            rows={3}
            maxLength={MAX + 200}
            dir="auto"
            placeholder={t.placeholder}
            aria-describedby="q-hint q-count"
            className="block w-full resize-none bg-transparent px-3 pt-2 text-lg leading-relaxed text-ink placeholder:text-muted/80 focus:outline-none focus-visible:outline-none sm:text-xl"
          />
          <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-2">
            <span id="q-count" className={`text-xs tabular-nums ${q.length > MAX ? "font-bold text-alert" : "text-muted"}`} aria-live="polite">
              {q.length > MAX * 0.8 ? fmt(t.chars, { n: q.length, max: MAX }) : ""}
            </span>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? t.asking : t.submit}
            </button>
          </div>
        </div>
        <p id="q-hint" className="mt-3 text-sm text-muted">{t.privacyHint}</p>
        {notice && (
          <p role="status" className="mt-2 rounded-xl bg-ochre-soft px-3 py-2 text-sm font-semibold text-ochre">{notice}</p>
        )}
        {error && !showResult && (
          <p role="alert" className="mt-2 text-sm font-semibold text-alert">{error}</p>
        )}
      </form>

      {!showResult && (
        <section aria-labelledby="examples" className="mt-12 max-w-3xl">
          <h2 id="examples" className="text-sm font-semibold text-muted">{t.examples}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {t.exampleList.map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  onClick={() => {
                    setQ(ex);
                    void ask(ex);
                  }}
                  className="min-h-[44px] rounded-2xl border border-line bg-surface px-4 py-2 text-start text-[0.9375rem] leading-snug transition-colors hover:border-door hover:text-door"
                >
                  {ex}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showResult && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-live="polite"
          aria-busy={busy}
          aria-labelledby="asked"
          className="dossier-enter mt-10 focus:outline-none"
        >
          <h2 id="asked" dir="auto" className="display text-2xl font-semibold text-ink sm:text-[1.75rem]">{asked}</h2>
          {switched && answerLang && (
            <p className="mt-2 text-sm text-muted">{fmt(t.answeredIn, { lang: LANGUAGE_NAMES[locale][answerLang] })}</p>
          )}

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,44rem)_18rem] lg:gap-12">
            <article
              lang={answerLang === "dz" ? "arq" : answerLang}
              dir={answerLang ? answerDir : undefined}
              className="max-w-prose"
            >
              {status === "loading" && (
                <div className="space-y-3" aria-hidden="true">
                  <div className="h-4 w-11/12 animate-pulse rounded bg-line" />
                  <div className="h-4 w-9/12 animate-pulse rounded bg-line" />
                  <div className="h-4 w-10/12 animate-pulse rounded bg-line" />
                </div>
              )}
              {status === "loading" && <p className="sr-only">{t.asking}</p>}
              {answer && (
                <div className={status === "streaming" ? "caret" : ""}>
                  <Markdown text={answer} cites={meta?.sources} />
                </div>
              )}
              {error && <p role="alert" className="mt-4 font-semibold text-alert">{error}</p>}
              {status === "done" && (
                <p className="mt-8 border-s-4 border-ochre ps-3 font-semibold">{dict.footer.confirm}</p>
              )}
            </article>

            {meta && meta.sources.length > 0 && (
              <aside aria-labelledby="sources-h" className="lg:pt-1">
                <h3 id="sources-h" className="display text-lg font-semibold">{t.sources}</h3>
                <ol className="mt-3 space-y-3">
                  {meta.sources.map((s) => (
                    <li key={s.n} className="flex gap-3">
                      <span className="cite !m-0 shrink-0 !text-[0.8rem]" aria-hidden="true">{s.n}</span>
                      <div className="min-w-0">
                        <a href={s.url} target="_blank" rel="noopener noreferrer" dir="auto" className="link block break-words font-semibold leading-snug">
                          {s.title}
                        </a>
                        <span className="text-sm text-muted" dir="ltr">{s.domain}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </aside>
            )}
          </div>

          {(status === "done" || status === "error") && (
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-6">
              {status === "done" && (
                <div className="flex items-center gap-2" role="group" aria-label={t.helpful}>
                  <span className="text-sm text-muted">{feedback ? t.thanks : t.helpful}</span>
                  {!feedback && (
                    <>
                      <button type="button" onClick={() => sendFeedback("up")} className="btn-quiet !min-h-[40px] !px-4 text-sm">
                        <ThumbIcon /> {t.yes}
                      </button>
                      <button type="button" onClick={() => sendFeedback("down")} className="btn-quiet !min-h-[40px] !px-4 text-sm">
                        <ThumbIcon down /> {t.no}
                      </button>
                    </>
                  )}
                </div>
              )}
              <button type="button" onClick={reset} className="link ms-auto text-sm font-semibold">{t.again}</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ThumbIcon({ down = false }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${down ? "rotate-180" : ""}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M6 9v8H3V9h3Zm0 0 3.5-6c1.2 0 2 .9 1.8 2.1L10.8 8H15a2 2 0 0 1 2 2.3l-1 5A2 2 0 0 1 14 17H6" />
    </svg>
  );
}
