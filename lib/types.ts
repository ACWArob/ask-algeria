import type { Locale } from "@/lib/i18n";

export type Category =
  | "federal-core" | "identity-travel" | "tax-business" | "social-protection" | "jobs-education" | "health"
  | "utilities" | "law-justice" | "police-safety" | "regulators" | "wilayas" | "diaspora" | "stats-data";

export const CATEGORIES: Category[] = [
  "federal-core", "identity-travel", "tax-business", "social-protection", "jobs-education", "health",
  "utilities", "law-justice", "police-safety", "regulators", "wilayas", "diaspora", "stats-data",
];

export interface Source {
  name_en: string;
  name_fr: string;
  name_ar: string;
  domain: string;
  url: string;
  category: Category | string;
  languages: string[];
  description: string;
  priority: number;
  reachable: boolean;
  pages?: number;
}

/** Sent to the browser as the first NDJSON line of /api/ask. */
export interface AskMeta {
  type: "meta";
  answerLang: Locale;
  detectedLang: Locale | null;
  sources: { n: number; title: string; url: string; domain: string }[];
  redactedServer: number;
}
