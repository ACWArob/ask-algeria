"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { fmt, LANGUAGE_NAMES, type Dict, type Locale } from "@/lib/i18n";
import { redact } from "@/lib/redact";
import type { AskMeta } from "@/lib/types";
import { formatDate } from "@/lib/dates";
import { SendIcon } from "./Icon";
import { Markdown } from "./Markdown";
import { ERROR_MARK, readStream } from "./stream";

const MAX = 1000;

type Status = "loading" | "streaming" | "done" | "error";

interface Turn {
  id: number;
  question: string;
  meta: AskMeta | null;
  answer: string;
  status: Status;
  error: string | null;
  feedback: "up" | "down" | null;
}

export interface AskHandle {
  ask: (question: string) => void;
}

export const AskClient = forwardRef<AskHandle, { dict: Dict; locale: Locale; onActiveChange?: (active: boolean) => void }>(function AskClient(
  { dict, locale, onActiveChange },
  ref,
) {
  const t = dict.ask;
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastTurnRef = useRef<HTMLLIElement>(null);
  const nextId = useRef(1);
  const turnsRef = useRef<Turn[]>([]);
  turnsRef.current = turns;

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => onActiveChange?.(turns.length > 0), [turns.length, onActiveChange]);

  // Auto-grow the textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [q]);

  const patch = (id: number, p: Partial<Turn>) => setTurns((ts) => ts.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const ask = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      setFormError(null);
      if (!trimmed) {
        setFormError(t.empty);
        inputRef.current?.focus();
        return;
      }
      if (trimmed.length > MAX) {
        setFormError(fmt(t.tooLong, { max: MAX }));
        return;
      }
      const { text, removed } = redact(trimmed);
      setNotice(removed > 0 ? fmt(t.redacted, { n: removed }) : null);
      setQ("");

      // Last few questions, so "Colorado" after "how do I renew my passport?" + "USA" still means passport renewal.
      // Keep the opening question (it names the topic) plus the last two, so turn 5 still knows it's about a passport.
      const qs = turnsRef.current.map((x) => x.question);
      const prev = (qs.length > 3 ? [qs[0], ...qs.slice(-2)] : qs).join(" | ");
      const prevAnswer = (turnsRef.current.at(-1)?.answer ?? "").slice(0, 700);
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      const id = nextId.current++;
      setTurns((ts) => [
        ...ts.map((x) => (x.status === "loading" || x.status === "streaming" ? { ...x, status: "done" as const } : x)),
        { id, question: text, meta: null, answer: "", status: "loading", error: null, feedback: null },
      ]);
      requestAnimationFrame(() => lastTurnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));

      // One silent automatic retry when the answer fails before any text arrives (e.g. a brief upstream hiccup).
      for (let attempt = 0; attempt < 2; attempt++) {
        let answered = "";
        let failed = false;
        try {
          const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: text, lang: locale, context: prev, prevAnswer, ...(attempt > 0 ? { buffer: true } : {}) }),
            signal: ac.signal,
          });
          if (res.status === 401) {
            window.location.href = "/login";
            return;
          }
          if (!res.ok) {
            if (res.status >= 500 && attempt === 0) continue;
            patch(id, { status: "error", error: res.status === 429 ? t.rateLimited : res.status === 413 ? fmt(t.tooLong, { max: MAX }) : t.error });
            return;
          }
          let gotMeta = false;
          const full = await readStream(
            res,
            (all) => {
              const nl = all.indexOf("\n");
              if (nl === -1) return;
              let meta: AskMeta | null | undefined;
              if (!gotMeta) {
                try {
                  meta = JSON.parse(all.slice(0, nl)) as AskMeta;
                } catch {
                  meta = null;
                }
                gotMeta = true;
              }
              answered = all.slice(nl + 1).replace(ERROR_MARK, "");
              patch(id, { ...(meta !== undefined ? { meta } : {}), status: "streaming", answer: answered });
            },
            ac.signal,
          );
          if (ac.signal.aborted) return;
          failed = full.includes(ERROR_MARK);
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
          failed = true;
        }
        if (!failed) {
          patch(id, { status: "done" });
          return;
        }
        if (attempt === 0) {
          // Retry once in non-streaming mode. Keep any partial text on screen while it loads.
          patch(id, answered.trim() ? { status: "streaming" } : { status: "loading", answer: "" });
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        patch(id, { status: "error", error: t.error });
        return;
      }
    },
    [locale, t],
  );

  useImperativeHandle(ref, () => ({
    ask: (question: string) => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      void ask(question);
    },
  }));

  function sendFeedback(turn: Turn, r: "up" | "down", reason?: string, comment?: string) {
    patch(turn.id, { feedback: r });
    const idx = turnsRef.current.findIndex((x) => x.id === turn.id);
    const context = turnsRef.current.slice(Math.max(0, idx - 3), idx).map((x) => x.question).join(" | ");
    void fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: r,
        reason,
        comment,
        question: turn.question,
        context,
        answer: turn.answer.slice(0, 400),
        lang: turn.meta?.answerLang,
        sources: turn.meta?.sources.length ?? 0,
      }),
    }).catch(() => {});
  }

  function reset() {
    abortRef.current?.abort();
    setTurns([]);
    setQ("");
    setNotice(null);
    setFormError(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  const busy = turns.some((x) => x.status === "loading" || x.status === "streaming");
  const started = turns.length > 0;

  const form = (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        void ask(q);
      }}
      className="w-full"
    >
      <label htmlFor="question" className="sr-only">{t.label}</label>
      <div className="flex items-end gap-2 rounded-[1.75rem] border border-line bg-paper p-2 ps-5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.18)] transition-colors focus-within:border-brand">
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
          rows={1}
          maxLength={MAX + 200}
          dir="auto"
          placeholder={started ? t.followUp : t.placeholder}
          aria-describedby="q-hint q-count"
          className="block max-h-[220px] min-h-[44px] w-full resize-none bg-transparent py-2.5 text-[1.0625rem] leading-relaxed text-ink placeholder:text-muted focus:outline-none focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !q.trim()}
          aria-label={busy ? t.asking : t.submit}
          title={busy ? t.asking : t.submit}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-brand-ink transition-opacity hover:bg-brand/90 disabled:opacity-35"
        >
          {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-ink/40 border-t-brand-ink" aria-hidden="true" /> : <SendIcon />}
        </button>
      </div>
      <div className="mt-2 flex items-start justify-between gap-3 px-2">
        <p id="q-hint" className="text-[0.8125rem] text-muted">{t.privacyHint}</p>
        <span id="q-count" className={`shrink-0 text-xs tabular-nums ${q.length > MAX ? "font-bold text-alert" : "text-muted"}`} aria-live="polite">
          {q.length > MAX * 0.8 ? fmt(t.chars, { n: q.length, max: MAX }) : ""}
        </span>
      </div>
      {notice && <p role="status" className="mt-2 rounded-xl bg-brand-soft px-3 py-2 text-sm font-semibold text-brand">{notice}</p>}
      {formError && <p role="alert" className="mt-2 px-2 text-sm font-semibold text-alert">{formError}</p>}
    </form>
  );

  if (!started) {
    return (
      <div className="flex flex-col items-center">
        {form}
        <ul className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-6" aria-label={t.examples}>
          {t.exampleList.slice(0, 4).map((ex, i) => (
            <li key={ex} className={i >= 3 ? "hidden sm:block" : undefined}>
              <button
                type="button"
                onClick={() => void ask(ex)}
                className="min-h-[40px] rounded-full border border-line bg-paper px-4 py-1.5 text-[0.9375rem] text-ink transition-colors hover:border-brand hover:bg-brand-soft"
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <ol className="space-y-10" aria-label={t.label}>
        {turns.map((turn, i) => (
          <TurnView
            key={turn.id}
            ref={i === turns.length - 1 ? lastTurnRef : undefined}
            turn={turn}
            dict={dict}
            locale={locale}
            onFeedback={(r, reason, comment) => sendFeedback(turn, r, reason, comment)}
            onChip={i === turns.length - 1 ? (c) => void ask(c) : undefined}
          />
        ))}
      </ol>
      <div className="sticky bottom-0 z-10 -mx-4 mt-10 bg-gradient-to-t from-paper via-paper to-paper/0 px-4 pb-4 pt-6">
        {form}
        <div className="mt-1 flex justify-center">
          <button type="button" onClick={reset} className="link text-sm">{t.newChat}</button>
        </div>
      </div>
    </div>
  );
});

const TurnView = forwardRef<
  HTMLLIElement,
  { turn: Turn; dict: Dict; locale: Locale; onFeedback: (r: "up" | "down", reason?: string, comment?: string) => void; onChip?: (chip: string) => void }
>(function TurnView(
  { turn, dict, locale, onFeedback, onChip },
  ref,
) {
  const t = dict.ask;
  const { meta, status } = turn;
  // Once the answer is complete, list only the sources it actually cites (fall back to all if it cites none).
  const cited = new Set(
    [...turn.answer.matchAll(/\[([0-9٠-٩]{1,2}(?:\s*[,،]\s*[0-9٠-٩]{1,2})*)\]/g)].flatMap((m) =>
      m[1].split(/\s*[,،]\s*/).map((d) => Number(d.replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c))))),
    ),
  );
  const allSources = meta?.sources ?? [];
  const shownSources = status === "done" && cited.size ? allSources.filter((s) => cited.has(s.n)) : allSources;
  const answerLang = meta?.answerLang;
  const answerDir = answerLang === "ar" || answerLang === "dz" ? "rtl" : "ltr";
  const busy = status === "loading" || status === "streaming";
  const [askWhy, setAskWhy] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showList, setShowList] = useState(false);
  const steps = status === "done" ? checklistItems(turn.answer) : [];
  const reasons = t.reasons as Record<string, string>;

  return (
    <li ref={ref} className="scroll-mt-24">
      <div className="flex justify-end">
        <p dir="auto" className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-ee-md bg-surface px-4 py-2.5 text-ink">
          <span className="sr-only">{t.you}: </span>
          {turn.question}
        </p>
      </div>

      <article aria-live="polite" aria-busy={busy} className="mt-5 border-s-2 border-accent/70 ps-4 sm:ps-5">
        <span className="sr-only">{t.assistant}:</span>
        {meta && answerLang && answerLang !== locale && (
          <p className="mb-2 text-[0.8125rem] text-muted">{fmt(t.answeredIn, { lang: LANGUAGE_NAMES[locale][answerLang] })}</p>
        )}
        {status === "loading" && (
          <div className="flex items-center gap-2 text-muted">
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand" />
            </span>
            <span className="text-sm">{t.asking}</span>
          </div>
        )}
        {turn.answer && (
          <div lang={answerLang === "dz" ? "arq" : answerLang} dir={answerLang ? answerDir : undefined} className={status === "streaming" ? "caret" : ""}>
            <Markdown text={turn.answer} cites={meta?.sources} />
          </div>
        )}
        {turn.error && <p role="alert" className="mt-3 font-semibold text-alert">{turn.error}</p>}

        {status === "done" && meta?.chips && meta.chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" role="group">
            {meta.chips.map((c) => (
              <button
                key={c}
                type="button"
                disabled={!onChip}
                onClick={() => onChip?.(c)}
                dir="auto"
                className="rounded-full border border-brand/40 bg-surface px-4 py-2 text-sm font-semibold text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white disabled:opacity-50"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {status === "done" && !(meta?.chips && meta.chips.length) && steps.length >= 2 && (
          <div className="mt-4">
            {!showList ? (
              <button type="button" onClick={() => setShowList(true)} className="link text-sm font-semibold">
                {t.checklist}
              </button>
            ) : (
              <Checklist items={steps} title={`${t.checklistTitle}: ${turn.question}`} dict={dict} dir={answerDir} onHide={() => setShowList(false)} />
            )}
          </div>
        )}

        {status === "done" && onChip && !(meta?.chips && meta.chips.length) && (meta?.followups?.length ?? 0) > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-muted">{t.alsoAsk}</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={t.alsoAsk}>
              {meta!.followups!.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onChip(f)}
                  dir="auto"
                  className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-brand hover:bg-brand-soft"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {meta && shownSources.length > 0 && !busy && (
          <section className="mt-6" aria-label={t.sources}>
            <h3 className="text-sm font-semibold text-muted">{t.sources}</h3>
            <ol className="mt-2 grid gap-2 sm:grid-cols-2">
              {shownSources.map((s) => (
                <li key={s.n}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full gap-2.5 rounded-2xl border border-line px-3 py-2.5 transition-colors hover:border-brand"
                  >
                    <span className="cite !m-0 shrink-0" aria-hidden="true">{s.n}</span>
                    <span className="min-w-0">
                      <span dir="auto" className="line-clamp-2 block text-sm font-semibold leading-snug text-ink">{s.title}</span>
                      <span className="block truncate text-xs text-muted">
                        <span dir="ltr">{s.domain}</span>
                        {s.archived ? <> · {fmt(t.archived, { date: formatDate(s.archived, locale) })}</> : s.checked && <> · {fmt(t.checked, { date: formatDate(s.checked, locale) })}</>}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}

        {status === "done" && !(meta?.chips && meta.chips.length) && (
          <>
            {(meta?.notes ?? 0) > 0 && (
              <p className="mt-5 rounded-xl border border-line border-s-4 border-s-accent px-3 py-2 text-sm">{t.disagree}</p>
            )}
            {shownSources.some((s) => s.archived) && (
              <p className="mt-3 text-xs text-muted">{t.archivedNote}</p>
            )}
            <p className="mt-5 text-sm font-semibold text-ink">{dict.footer.confirm}</p>
            <div className="mt-3 flex items-center gap-1.5" role="group" aria-label={t.helpful}>
              <span className="me-1 text-xs text-muted">{turn.feedback ? t.thanks : t.helpful}</span>
              {!turn.feedback && !askWhy && (
                <>
                  <button type="button" onClick={() => onFeedback("up")} aria-label={t.yes} title={t.yes} className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink">
                    <ThumbIcon />
                  </button>
                  <button type="button" onClick={() => setAskWhy(true)} aria-label={t.no} title={t.no} className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink">
                    <ThumbIcon down />
                  </button>
                </>
              )}
            </div>
            {askWhy && !turn.feedback && (
              <div className="mt-2 rounded-2xl border border-line p-3">
                <p className="text-sm font-semibold">{t.whyWrong}</p>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t.whyWrong}>
                  {Object.entries(reasons).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={reason === k}
                      onClick={() => setReason(k)}
                      className={`rounded-full border px-3 py-1.5 text-sm ${reason === k ? "border-brand bg-brand text-white" : "border-line bg-paper hover:border-brand"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  rows={2}
                  dir="auto"
                  placeholder={t.commentPlaceholder}
                  className="field mt-2 w-full text-sm"
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">{t.feedbackNote}</p>
                  <button
                    type="button"
                    disabled={!reason}
                    onClick={() => onFeedback("down", reason ?? "other", comment.trim() || undefined)}
                    className="shrink-0 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-brand-ink disabled:opacity-40"
                  >
                    {t.send}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </article>
    </li>
  );
});

function ThumbIcon({ down = false }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${down ? "rotate-180" : ""}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M6 9v8H3V9h3Zm0 0 3.5-6c1.2 0 2 .9 1.8 2.1L10.8 8H15a2 2 0 0 1 2 2.3l-1 5A2 2 0 0 1 14 17H6" />
    </svg>
  );
}

/** Bullet / numbered lines from the answer's steps, without citations or markdown. */
function checklistItems(answer: string): string[] {
  return answer
    .split("\n")
    .map((l) => l.match(/^\s*(?:[-*•]|[0-9٠-٩]+[.)])\s+(.+)$/)?.[1] ?? "")
    .map((l) => l.replace(/\[[0-9٠-٩,، ]+\]/g, "").replace(/\*\*|__|`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[ \t]+([.,،])(?=\s|$)/g, "$1").trim())
    .filter((l) => l.length > 3)
    .slice(0, 15);
}

function Checklist({ items, title, dict, dir, onHide }: { items: string[]; title: string; dict: Dict; dir: "rtl" | "ltr"; onHide: () => void }) {
  const t = dict.ask;
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  const [copied, setCopied] = useState(false);
  const text = `${title}\n\n${items.map((it, i) => `${done[i] ? "☑" : "☐"} ${it}`).join("\n")}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }
  function print() {
    const w = window.open("", "_blank");
    if (!w) return;
    const esc = (x: string) => x.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
    w.document.write(`<html dir="${dir}"><title>${esc(title)}</title><body style="font-family:system-ui;padding:24px"><h2>${esc(title)}</h2><ul style="list-style:none;padding:0">${items.map((it) => `<li style="margin:8px 0">☐ ${esc(it)}</li>`).join("")}</ul></body></html>`);
    w.document.close();
    w.print();
  }
  return (
    <section dir={dir} className="rounded-2xl border border-line bg-surface p-4" aria-label={t.checklistTitle}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t.checklistTitle}</h3>
        <button type="button" onClick={onHide} className="link text-xs">{t.hide}</button>
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-2.5 text-[0.9375rem]">
              <input
                type="checkbox"
                checked={done[i]}
                onChange={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
                className="mt-1 h-4 w-4 shrink-0 accent-brand"
              />
              <span className={done[i] ? "text-muted line-through" : ""}>{it}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <button type="button" onClick={copy} className="rounded-full border border-line bg-paper px-3 py-1 hover:border-brand">{copied ? t.copied : t.copy}</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line bg-paper px-3 py-1 hover:border-brand">{t.shareWhatsApp}</a>
        <button type="button" onClick={print} className="rounded-full border border-line bg-paper px-3 py-1 hover:border-brand">{t.print}</button>
      </div>
    </section>
  );
}
