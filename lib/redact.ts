/**
 * Client-side PII redaction. Runs in the browser before anything is sent.
 * Replaces personal numbers with "[removed]" and reports what kinds were found.
 */

export type RedactionKind = "email" | "phone" | "id-number" | "card" | "passport";

export interface RedactionResult {
  text: string;
  removed: number;
  kinds: RedactionKind[];
}

export const REMOVED = "[removed]";

// Matching runs on a copy where Arabic-Indic digits are mapped to ASCII
// (same string length), so patterns only need ASCII digits.
const D = "[0-9]";

function normalizeDigits(s: string): string {
  return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (c) => {
    const code = c.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}
const SEP = "[\\s.\\-]?";

const PATTERNS: { kind: RedactionKind; re: RegExp }[] = [
  { kind: "email", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  // International Algerian numbers: +213 / 00213, then 8–9 digits
  { kind: "phone", re: new RegExp(`(?:\\+|00)\\s?213${SEP}\\(?0?\\)?${SEP}${D}(?:${SEP}${D}){7,8}(?!${D})`, "g") },
  // Long digit runs (optionally grouped by spaces/dashes) of 20 (RIP/RIB), 18 (NIN), 13–19 (cards).
  { kind: "id-number", re: new RegExp(`(?<!${D})${D}(?:[\\s\\-]?${D}){17,21}(?!${D})`, "g") },
  { kind: "card", re: new RegExp(`(?<!${D})${D}(?:[\\s\\-]?${D}){12,16}(?!${D})`, "g") },
  // Local mobiles 05/06/07 + 8 digits, and landlines 02–04 + 7 digits
  { kind: "phone", re: new RegExp(`(?<!${D})0[5-7](?:${SEP}${D}){8}(?!${D})`, "g") },
  { kind: "phone", re: new RegExp(`(?<!${D})0[2-4](?:${SEP}${D}){7}(?!${D})`, "g") },
  // CCP account: up to 10 digits followed by "clé"/"cle"/"key"/"مفتاح" + 2 digits
  { kind: "id-number", re: new RegExp(`(?<!${D})${D}{6,10}\\s*(?:cl[ée]|key|مفتاح)\\s*:?\\s*${D}{2}(?!${D})`, "gi") },
  // Passport-like codes: 1–2 letters followed by 6–9 digits (e.g. A12345678)
  { kind: "passport", re: /(?<![A-Za-z0-9])[A-Za-z]{1,2}\d{6,9}(?![A-Za-z0-9])/g },
  // Bare 9-digit numbers right after a passport keyword
  {
    kind: "passport",
    re: new RegExp(`((?:passport|passeport|jawaz|باسبور|جواز(?:\\s+السفر)?)\\s*(?:n[o°º]?\\.?|number|numéro|رقم)?\\s*:?\\s*)${D}{8,9}(?!${D})`, "gi"),
  },
];

export function redact(input: string): RedactionResult {
  let text = input;
  let norm = normalizeDigits(input);
  let removed = 0;
  const kinds = new Set<RedactionKind>();
  for (const { kind, re } of PATTERNS) {
    let outText = "";
    let outNorm = "";
    let last = 0;
    re.lastIndex = 0;
    for (const m of norm.matchAll(re)) {
      const full = m[0];
      if (full.includes(REMOVED)) continue;
      const prefix = typeof m[1] === "string" && full.startsWith(m[1]) ? m[1].length : 0;
      const start = (m.index ?? 0) + prefix;
      const end = (m.index ?? 0) + full.length;
      outText += text.slice(last, start) + REMOVED;
      outNorm += norm.slice(last, start) + REMOVED;
      last = end;
      removed++;
      kinds.add(kind);
    }
    text = outText + text.slice(last);
    norm = outNorm + norm.slice(last);
  }
  return { text, removed, kinds: [...kinds] };
}
