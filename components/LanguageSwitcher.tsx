"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { COOKIE } from "@/lib/config";
import { LOCALES, type Locale } from "@/lib/i18n";

const SHORT: Record<Locale, string> = { en: "EN", fr: "FR", ar: "عربي", dz: "دارجة" };
const FULL: Record<Locale, string> = { en: "English", fr: "Français", ar: "العربية الفصحى", dz: "الدارجة الجزائرية" };

export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function choose(l: Locale) {
    if (l === current) return;
    document.cookie = `${COOKIE.lang}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    start(() => router.refresh());
  }

  return (
    <div role="group" aria-label={label} className={`flex rounded-full border border-line bg-surface p-0.5 text-sm ${pending ? "opacity-70" : ""}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          aria-pressed={l === current}
          title={FULL[l]}
          lang={l === "dz" ? "arq" : l}
          className={`min-h-[40px] rounded-full px-2.5 font-semibold transition-colors sm:px-3 ${
            l === current ? "bg-brand text-brand-ink" : "text-muted hover:text-ink"
          }`}
        >
          <span aria-hidden="true">{SHORT[l]}</span>
          <span className="sr-only">{FULL[l]}</span>
        </button>
      ))}
    </div>
  );
}
