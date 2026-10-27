import type { Locale } from "@/lib/i18n";

/** Locale-aware short date; Darija uses Arabic month names with Latin digits, as is common in Algeria. */
export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const tag = locale === "en" ? "en-GB" : locale === "fr" ? "fr-FR" : "ar-DZ";
  try {
    return new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC", numberingSystem: "latn" }).format(d);
  } catch {
    return iso.slice(0, 10);
  }
}
