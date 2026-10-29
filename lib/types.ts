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
  /** How we know the site is official (shown only for unverified entries). */
  evidence?: string;
}

/** Sent to the browser as the first NDJSON line of /api/ask. */
export interface AskMeta {
  type: "meta";
  answerLang: Locale;
  detectedLang: Locale | null;
  /** One-tap answers to a clarifying question asked before answering. */
  chips?: string[];
  /** One-tap next questions for this topic, shown under a finished answer. */
  followups?: string[];
  sources: { n: number; title: string; url: string; domain: string; checked?: string | null; archived?: string }[];
  /** Number of cross-source verification notes given to the model (conflicts / possibly outdated). */
  notes?: number;
  redactedServer: number;
}
