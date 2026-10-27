/** Central configuration: model names and limits live here only. */
export const MODELS = {
  /** Writes answers and translations. */
  answer: process.env.ANSWER_MODEL || "claude-haiku-5-5",
  /** Language detection + multilingual query expansion. */
  expand: "claude-haiku-5-5",
};

export const LIMITS = {
  questionMaxChars: 1000,
  translateMaxChars: 20000,
  uploadMaxBytes: 5 * 1024 * 1024,
  rateLimitPerMinute: 20,
  topChunks: 8,
  answerMaxTokens: 1200,
  translateMaxTokens: 1800,
} as const;

export const COOKIE = {
  session: "aa_session",
  lang: "aa_lang",
  maxAgeSeconds: 60 * 60 * 24 * 7,
} as const;

export function isMock(): boolean {
  return process.env.MOCK_LLM === "1" || process.env.MOCK_LLM === "true";
}
