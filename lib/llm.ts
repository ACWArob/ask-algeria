import "server-only";
import { recordSpend } from "@/lib/spend";
import Anthropic from "@anthropic-ai/sdk";
import { MODELS } from "@/lib/config";
import { expandSystemPrompt } from "@/lib/prompts";
import { detectLanguage, glossaryQueries } from "@/lib/detect";
import { isLocale, type Locale } from "@/lib/i18n";
import { noteAiError, noteAiOk } from "@/lib/health";

let client: Anthropic | null = null;
export function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set (or set MOCK_LLM=1)");
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export interface Expansion {
  lang: Locale | null;
  queries: string[];
  topic: string;
  /** The model call failed and the heuristic fallback was used (answers built on it are not cached). */
  fellBack?: boolean;
}

/** Haiku: detect language + produce FR/AR/EN search queries. Falls back to heuristics on any failure. */
/**
 * Reads the expansion reply. A reply cut off by the token limit is not valid JSON: keep the language and the
 * queries that did arrive rather than throwing them away. Returns null when nothing usable is there.
 */
export function parseExpansion(text: string): { lang?: unknown; queries?: Record<string, unknown>; topic?: unknown } | null {
  const from = text.indexOf("{");
  if (from === -1) return null;
  try {
    return JSON.parse(text.slice(from, text.lastIndexOf("}") + 1));
  } catch {
    const lang = text.match(/"lang"\s*:\s*"([a-z]{2})"/)?.[1];
    const at = text.indexOf('"queries"');
    if (at === -1) return lang ? { lang } : null;
    const queries: Record<string, string[]> = {};
    // Each "fr"/"ar"/"en" array, complete strings only.
    for (const m of text.slice(at).matchAll(/"(fr|ar|en)"\s*:\s*\[([^\]]*)/g)) {
      queries[m[1]] = [...m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
    }
    return { lang, queries };
  }
}

/** Haiku: detect language + produce FR/AR/EN search queries. Falls back to heuristics on any failure. */
export async function expandQuery(question: string, context = ""): Promise<Expansion> {
  const fallback: Expansion = { lang: detectLanguage(question), queries: [question, ...glossaryQueries(context ? `${context} ${question}` : question)], topic: "", fellBack: true };
  let res: Anthropic.Message;
  try {
    res = await anthropic().messages.create({
      model: MODELS.expand,
      max_tokens: 700,
      thinking: { type: "disabled" },
      system: expandSystemPrompt(),
      messages: [{ role: "user", content: context ? `Previous question in this conversation (context only): ${context}\n\nQuestion: ${question}` : question }],
    }, { timeout: 2200, maxRetries: 0 });
  } catch (err) {
    // Only a failed API call counts as an AI problem (health, alerts).
    console.error("[expand] falling back to heuristic:", err instanceof Error ? err.message : err);
    noteAiError(err);
    recordSpend(MODELS.expand, { input_tokens: 600, output_tokens: 200 }); // a timed-out call may still be billed
    return fallback;
  }
  recordSpend(MODELS.expand, res.usage);
  noteAiOk();
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const json = parseExpansion(text);
  // An unreadable reply is not an outage: use the heuristic queries, don't mark the AI as failing.
  if (!json) {
    console.warn("[expand] unreadable reply; using heuristic queries");
    return fallback;
  }
  const qs: string[] = [question];
  for (const k of ["fr", "ar", "en"]) {
    const v = json.queries?.[k];
    if (Array.isArray(v)) for (const q of v) if (typeof q === "string" && q.trim()) qs.push(q.trim().slice(0, 200));
  }
  if (qs.length === 1) return { ...fallback, lang: isLocale(json.lang) ? json.lang : fallback.lang };
  return {
    lang: isLocale(json.lang) ? json.lang : fallback.lang,
    queries: [...new Set(qs)].slice(0, 12),
    topic: typeof json.topic === "string" ? json.topic : "",
  };
}
