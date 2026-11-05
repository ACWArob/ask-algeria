import type { Locale } from "@/lib/i18n";
import table from "@/data/mission-i18n.json";

/**
 * Consulate opening hours and notes in the reader's language. data/missions.json keeps the official wording
 * (mostly English); data/mission-i18n.json maps each exact string to fr / ar / dz. A string without a
 * translation (a new or edited entry) is shown as it is. tests/mission-page.test.ts checks every string is covered.
 */
type Tr = Partial<Record<Exclude<Locale, "en">, string>>;
const T = table as { hours: Record<string, Tr>; notes: Record<string, Tr> };

export function localHours(text: string, locale: Locale): string {
  if (!text || locale === "en") return text;
  return T.hours[text]?.[locale] || text;
}

export function localNote(text: string, locale: Locale): string {
  if (!text || locale === "en") return text;
  return T.notes[text]?.[locale] || text;
}
