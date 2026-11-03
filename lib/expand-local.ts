/**
 * When to skip the query-expansion model call (lib/llm.ts expandQuery) and expand locally for free.
 *
 * The model call detects the language and writes FR/AR/EN search queries. For a short first question about a
 * concept the synonym list (lib/synonyms.ts) or the glossary (lib/detect.ts) already knows, that adds little:
 * the synonyms already carry the concept in every language. Long, ambiguous or follow-up questions keep the model.
 *
 * Rule (all must hold):
 * 1. No conversation context (follow-ups need the model to merge the previous question).
 * 2. At most LOCAL_MAX_WORDS words.
 * 3. A known concept (synonyms) or a glossary entry matches.
 * 4. At most LOCAL_MAX_UNKNOWN content words that no concept covers (e.g. a place name: "passport lyon").
 * 5. The language is clear locally: detectLanguage gives one, or it is a keyword search of at most
 *    LOCAL_KEYWORD_WORDS words ("casier judiciaire"), which is answered in the UI language (lib/detect.ts chooseAnswerLang).
 */
import { detectLanguage, glossaryQueries } from "@/lib/detect";
import { expandQuery as synonymExpand } from "@/lib/synonyms";
import type { Locale } from "@/lib/i18n";

export const LOCAL_MAX_WORDS = 6;
export const LOCAL_MAX_UNKNOWN = 1;
export const LOCAL_KEYWORD_WORDS = 3;

export interface LocalDecision {
  local: boolean;
  /** Why (for tests and logs). */
  reason: "context" | "long" | "no_concept" | "unknown_words" | "lang_unclear" | "ok";
  concepts: string[];
  /** Extra search queries from synonyms + glossary (the question itself not included). */
  extra: string[];
}

export function localExpansionDecision(question: string, context = ""): LocalDecision {
  const q = question.trim();
  let exp: { concepts: string[]; query: string; groups: unknown[] } = { concepts: [], query: "", groups: [] };
  try {
    exp = synonymExpand(q);
  } catch {
    /* synonyms module unavailable or changed shape: fall through to the model */
  }
  const concepts = Array.isArray(exp.concepts) ? exp.concepts : [];
  const glossary = glossaryQueries(q);
  const extra = [...new Set([exp.query, ...glossary].filter((s): s is string => typeof s === "string" && Boolean(s.trim())))];
  const base = { concepts, extra };
  if (context.trim()) return { local: false, reason: "context", ...base };
  const words = q.split(/\s+/).filter(Boolean).length;
  if (words > LOCAL_MAX_WORDS) return { local: false, reason: "long", ...base };
  if (!concepts.length && !glossary.length) return { local: false, reason: "no_concept", ...base };
  const unknown = Math.max(0, (Array.isArray(exp.groups) ? exp.groups.length : 0) - concepts.length);
  if (unknown > LOCAL_MAX_UNKNOWN) return { local: false, reason: "unknown_words", ...base };
  if (!detectLanguage(q) && words > LOCAL_KEYWORD_WORDS) return { local: false, reason: "lang_unclear", ...base };
  return { local: true, reason: "ok", ...base };
}

/** Same shape as the model expansion (lib/llm.ts Expansion). */
export function localExpansion(question: string, d: LocalDecision): { lang: Locale | null; queries: string[]; topic: string } {
  return { lang: detectLanguage(question), queries: [...new Set([question, ...d.extra])], topic: "" };
}
