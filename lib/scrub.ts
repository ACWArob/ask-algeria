import type { Locale } from "@/lib/i18n";

/**
 * Removes "my pages / the sources provided / اللي عندي" phrasing that the model still produces now and then,
 * so a missing detail reads as a fact about the official pages, not about the bot.
 * Applied per sentence while streaming.
 */
const RULES: [RegExp, string][] = [
  // English
  [/\b(?:the )?(?:official )?(?:pages|sources|excerpts|information) (?:available to me|I have(?: on this office)?|provided(?: here)?)\b/gi, "the official pages"],
  [/\bnone of the official pages provided\b/gi, "none of the official pages"],
  [/\bthe provided (?:official )?(?:sources|pages|excerpts)\b/gi, "the official pages"],
  [/\b(?:official )?(?:page|pages|sources)? ?provided here\b/gi, "official page"],
  [/\b(?:the )?excerpts\b/gi, "the official pages"],
  [/\bin our consular map\b/gi, ""],
  // French
  [/\b(?:les )?(?:pages|sources|extraits)(?: officielles)? (?:consultées |)dont je dispose\b/gi, "les pages officielles"],
  [/\b(?:les )?(?:pages|sources)(?: officielles)? consultées\b/gi, "les pages officielles"],
  [/\bles extraits(?: dont je dispose)?\b/gi, "les pages officielles"],
  [/\s*dont je dispose\b/gi, ""],
  // Arabic / Darija
  [/\s*(?:اللي|الي) عندي/g, ""],
  [/\s*المتاحة لي/g, " الرسمية"],
  [/\s*المتوفرة لدي/g, " الرسمية"],
  [/المقتطفات/g, "الصفحات الرسمية"],
];

/** Moroccan forms the model sometimes slips into Darija answers → the Algerian equivalent. */
const DZ_RULES: [RegExp, string][] = [
  [/(?<![\p{L}])ديالي(?![\p{L}])/gu, "تاعي"],
  [/(?<![\p{L}])ديالك(?![\p{L}])/gu, "تاعك"],
  [/(?<![\p{L}])ديالو(?![\p{L}])/gu, "تاعو"],
  [/(?<![\p{L}])ديالها(?![\p{L}])/gu, "تاعها"],
  [/(?<![\p{L}])ديالهم(?![\p{L}])/gu, "تاعهم"],
  [/(?<![\p{L}])ديالنا(?![\p{L}])/gu, "تاعنا"],
  [/(?<![\p{L}])ديال(?![\p{L}])/gu, "تاع"],
  [/(?<![\p{L}])دابا(?![\p{L}])/gu, "ضرك"],
];

export function scrubHedges(text: string, lang?: Locale): string {
  let out = text;
  for (const [re, to] of lang === "dz" ? [...RULES, ...DZ_RULES] : RULES)
    out = out.replace(re, (m) => (/^[A-ZÀ-Ý]/.test(m) && to ? to[0].toUpperCase() + to.slice(1) : to));
  // Tidy only what a rule touched; French puts a space before ":" and ";" on purpose.
  return out === text ? text : out.replace(/ {2,}/g, " ").replace(/ ([,.،])/g, "$1");
}

const BOUNDARY = /[.!?؟؛\n](?=\s|$)|\n/g;

/** Streaming helper: push model text in, get scrubbed text out at sentence boundaries; flush() at the end. */
export function makeScrubber(lang?: Locale) {
  let buf = "";
  return {
    push(chunk: string): string {
      buf += chunk;
      let cut = -1;
      BOUNDARY.lastIndex = 0;
      for (let m = BOUNDARY.exec(buf); m; m = BOUNDARY.exec(buf)) cut = m.index + m[0].length;
      if (cut < 0) return "";
      const ready = buf.slice(0, cut);
      buf = buf.slice(cut);
      return scrubHedges(ready, lang);
    },
    flush(): string {
      const rest = scrubHedges(buf, lang);
      buf = "";
      return rest;
    },
  };
}
