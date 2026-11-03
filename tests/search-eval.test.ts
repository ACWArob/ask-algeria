import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

vi.mock("server-only", () => ({}));
const { instantSearch } = await import("@/lib/instant");

/**
 * Free-search quality gate: qa/search-eval.json holds real-style questions (en/fr/ar/Darija/Arabizi, typos,
 * cross-language) with a regex the title/URL of a relevant page must match. A good page must be in the top 3.
 * When you add synonyms or data, keep this at or above the bar; add the query that failed in real use.
 */
it("finds a relevant official page in the top 3 for at least 95% of the eval questions", () => {
  const cases = JSON.parse(readFileSync("qa/search-eval.json", "utf8")) as { q: string; lang: "en" | "fr" | "ar" | "dz"; want: string }[];
  const misses: string[] = [];
  const t0 = Date.now();
  for (const c of cases) {
    const re = new RegExp(c.want, "i");
    const top = instantSearch(c.q, c.lang).pages.slice(0, 3);
    if (!top.some((p) => re.test(`${p.title} ${p.url}`))) misses.push(`${c.q} -> ${top.map((p) => p.title.slice(0, 40)).join(" | ") || "(none)"}`);
  }
  const rate = 1 - misses.length / cases.length;
  console.log(`search eval: ${cases.length - misses.length}/${cases.length} in top 3, ${Math.round((Date.now() - t0) / cases.length)} ms/query`);
  expect(rate, misses.join("\n")).toBeGreaterThanOrEqual(0.95);
}, 60_000);
