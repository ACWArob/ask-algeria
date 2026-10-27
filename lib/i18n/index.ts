import en from "./en.json";
import fr from "./fr.json";
import ar from "./ar.json";
import dz from "./dz.json";

export const LOCALES = ["en", "fr", "ar", "dz"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export type Dict = typeof en;

const DICTS: Record<Locale, Dict> = { en, fr, ar, dz };

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

export function getDict(locale: Locale): Dict {
  return DICTS[locale];
}

export function isRtl(locale: Locale): boolean {
  return locale === "ar" || locale === "dz";
}

/** BCP-47 tag for the html lang attribute. Darija is "arq" (Algerian Arabic). */
export function htmlLang(locale: Locale): string {
  return locale === "dz" ? "arq" : locale;
}

export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Human name of a language as shown inside a sentence in the UI language. */
export const LANGUAGE_NAMES: Record<Locale, Record<Locale, string>> = {
  en: { en: "English", fr: "French", ar: "Arabic", dz: "Algerian Darija" },
  fr: { en: "anglais", fr: "français", ar: "arabe", dz: "darija algérienne" },
  ar: { en: "الإنجليزية", fr: "الفرنسية", ar: "العربية", dz: "الدارجة الجزائرية" },
  dz: { en: "النڨليزية", fr: "الفرونسية", ar: "العربية", dz: "الدارجة" },
};
