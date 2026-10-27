import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { AccuracyReport, PageState } from "@/lib/verification";

/** Optional outputs of the weekly refresh job. Missing files are fine (empty data). */
function read<T>(file: string, fallback: T): T {
  const p = path.join(process.cwd(), "data", file);
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch (err) {
    console.error(`[freshness] could not parse ${file}:`, err);
    return fallback;
  }
}

let cache: { state: Record<string, PageState>; report: AccuracyReport | null } | null = null;

export function freshness() {
  cache ??= { state: read<Record<string, PageState>>("page-state.json", {}), report: read<AccuracyReport | null>("accuracy-report.json", null) };
  return cache;
}
