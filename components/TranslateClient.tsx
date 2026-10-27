"use client";

import { useRef, useState } from "react";
import { fmt, LOCALES, type Dict, type Locale } from "@/lib/i18n";
import { redact } from "@/lib/redact";
import { Markdown } from "./Markdown";
import { ERROR_MARK, readStream } from "./stream";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];

type Status = "idle" | "working" | "done" | "error";

export function TranslateClient({ dict, locale }: { dict: Dict; locale: Locale }) {
  const t = dict.translate;
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<Locale>(locale);
  const [mode, setMode] = useState<"summary" | "full">("summary");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  function pickFile(f: File | null) {
    setError(null);
    if (!f) return setFile(null);
    if (!ACCEPT.includes(f.type)) {
      setError(t.badType);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(t.tooLarge);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setFile(f);
  }

  async function submit() {
    setError(null);
    if (!text.trim() && !file) return setError(t.needInput);
    const red = redact(text);
    setNotice(red.removed > 0 ? fmt(t.redacted, { n: red.removed }) : null);
    if (red.removed > 0) setText(red.text);

    const fd = new FormData();
    if (red.text.trim()) fd.set("text", red.text);
    if (file) fd.set("file", file);
    fd.set("target", target);
    fd.set("mode", mode);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setStatus("working");
    setResult("");
    try {
      const res = await fetch("/api/translate", { method: "POST", body: fd, signal: ac.signal });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        const code = ((await res.json().catch(() => ({}))) as { error?: string }).error;
        setError(code === "too_large" ? t.tooLarge : code === "bad_type" ? t.badType : code === "rate_limited" ? dict.ask.rateLimited : t.error);
        setStatus("error");
        return;
      }
      const full = await readStream(res, (all) => setResult(all.replace(ERROR_MARK, "")), ac.signal);
      if (full.includes(ERROR_MARK)) {
        setError(t.error);
        setStatus("error");
      } else setStatus("done");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(t.error);
      setStatus("error");
    }
  }

  const busy = status === "working";
  const outDir = target === "ar" || target === "dz" ? "rtl" : "ltr";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div>
          <label htmlFor="doc-text" className="mb-1.5 block font-semibold">{t.pasteLabel}</label>
          <textarea
            id="doc-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            dir="auto"
            placeholder={t.placeholder}
            className="field resize-y"
          />
        </div>

        <div className="flex items-center gap-3 text-sm text-muted" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          {t.or}
          <span className="h-px flex-1 bg-line" />
        </div>

        <div>
          <label htmlFor="doc-file" className="mb-1.5 block font-semibold">{t.upload}</label>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-surface p-4">
            <input
              ref={fileRef}
              id="doc-file"
              type="file"
              accept={ACCEPT.join(",")}
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              aria-describedby="file-hint"
              className="w-full text-sm file:me-3 file:min-h-[40px] file:cursor-pointer file:rounded-full file:border-0 file:bg-brand file:px-4 file:font-semibold file:text-brand-ink"
            />
            <p id="file-hint" className="text-sm text-muted">{t.uploadHint}</p>
            {file && (
              <button
                type="button"
                className="link text-sm"
                onClick={() => {
                  setFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                {t.remove}
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="target" className="mb-1.5 block font-semibold">{t.target}</label>
            <select id="target" value={target} onChange={(e) => setTarget(e.target.value as Locale)} className="field">
              {LOCALES.map((l) => (
                <option key={l} value={l}>{dict.lang[l]}</option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="mb-1.5 font-semibold">{t.mode}</legend>
            <div className="space-y-2">
              {(["summary", "full"] as const).map((m) => (
                <label key={m} className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5 has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                  <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="mt-1.5 accent-[rgb(var(--brand))]" />
                  <span>{m === "full" ? t.modeFull : t.modeSummary}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <p className="flex gap-2 text-sm text-muted">
          <LockIcon />
          {t.privacy}
        </p>
        {notice && <p role="status" className="rounded-xl bg-brand-soft px-3 py-2 text-sm font-semibold text-brand">{notice}</p>}
        {error && <p role="alert" className="text-sm font-semibold text-alert">{error}</p>}
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={busy}>
          {busy ? t.working : t.submit}
        </button>
      </form>

      <section aria-labelledby="result-h" aria-live="polite" aria-busy={busy} className="min-w-0">
        <h2 id="result-h" className="display text-2xl font-semibold">{t.result}</h2>
        <div className="mt-4 min-h-[12rem] rounded-3xl border border-line bg-surface p-5 sm:p-7">
          {status === "idle" && <p className="text-muted">{t.sub}</p>}
          {busy && !result && <p className="animate-pulse text-muted">{t.working}</p>}
          {result && (
            <div dir={outDir} lang={target === "dz" ? "arq" : target} className={busy ? "caret" : ""}>
              <Markdown text={result} />
            </div>
          )}
          {status === "done" && <p className="mt-6 border-s-4 border-brand ps-3 text-sm font-semibold">{t.disclaimer}</p>}
        </div>
      </section>
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </svg>
  );
}
