import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { MODELS } from "@/lib/config";
import { expandSystemPrompt } from "@/lib/prompts";
import { detectLanguage } from "@/lib/detect";
import { isLocale, type Locale } from "@/lib/i18n";

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
}

/** Haiku: detect language + produce FR/AR/EN search queries. Falls back to heuristics on any failure. */
export async function expandQuery(question: string): Promise<Expansion> {
  const fallback: Expansion = { lang: detectLanguage(question), queries: [question], topic: "" };
  try {
    const res = await anthropic().messages.create({
      model: MODELS.expand,
      max_tokens: 400,
      system: expandSystemPrompt(),
      messages: [{ role: "user", content: question }],
    });
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as {
      lang?: unknown;
      queries?: Record<string, unknown>;
      topic?: unknown;
    };
    const qs: string[] = [question];
    for (const k of ["fr", "ar", "en"]) {
      const v = json.queries?.[k];
      if (Array.isArray(v)) for (const q of v) if (typeof q === "string" && q.trim()) qs.push(q.trim().slice(0, 200));
    }
    return {
      lang: isLocale(json.lang) ? json.lang : fallback.lang,
      queries: [...new Set(qs)].slice(0, 12),
      topic: typeof json.topic === "string" ? json.topic : "",
    };
  } catch (err) {
    console.error("[expand] falling back to heuristic:", err instanceof Error ? err.message : err);
    return fallback;
  }
}
