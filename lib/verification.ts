/**
 * Pure helpers that turn data/accuracy-report.json + data/page-state.json into
 * (a) short notes added to the answer prompt and (b) "checked" dates for the UI.
 * No file access here (see lib/freshness.ts) so it is unit-testable.
 */

export type Classification = "real_conflict" | "post_specific" | "outdated";

export interface Conflict {
  id: string;
  field: string;
  a: { id: string; value: string };
  b: { id: string; value: string };
  classification: Classification;
  outdatedId?: string;
  explanation?: string;
}

export interface StaleFlag {
  id: string;
  newestYear: number;
}

export interface AccuracyReport {
  generatedAt?: string;
  conflicts?: Conflict[];
  stale?: StaleFlag[];
}

export interface PageState {
  hash?: string;
  lastChecked?: string;
  lastChanged?: string | null;
  status?: "ok" | "changed" | "unreachable" | "gone";
  httpStatus?: number | null;
}

/** Date we last confirmed the page content: successful check, else the original fetch date. */
export function checkedDate(fetched: string | undefined, st: PageState | undefined): string | null {
  if (st?.lastChecked && (st.status === "ok" || st.status === "changed")) return st.lastChecked.slice(0, 10);
  return fetched ? fetched.slice(0, 10) : null;
}

const clip = (s: string, n = 140) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/**
 * @param selected map of record id → citation number for the sources in this answer
 * @param domainOf record id → domain, used to name the other side when it is not among the sources
 */
export function verificationNotes(
  report: AccuracyReport | null | undefined,
  selected: Map<string, number>,
  domainOf: (id: string) => string | undefined,
): string[] {
  if (!report) return [];
  const notes: string[] = [];
  const seen = new Set<string>();
  for (const c of report.conflicts ?? []) {
    if (c.classification === "post_specific") continue;
    const na = selected.get(c.a.id);
    const nb = selected.get(c.b.id);
    if (na === undefined && nb === undefined) continue;
    const key = `${c.field}|${[c.a.id, c.b.id].sort().join("|")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const side = (n: number | undefined, id: string, value: string) =>
      n !== undefined ? `"${clip(value)}" [${n}]` : `"${clip(value)}" (another official page, ${domainOf(id) ?? "not in these excerpts"})`;
    if (c.classification === "outdated") {
      const old = c.outdatedId ?? c.a.id;
      const oldN = selected.get(old);
      notes.push(
        `Possibly outdated on ${c.field}: ${side(na, c.a.id, c.a.value)} vs ${side(nb, c.b.id, c.b.value)}.` +
          (oldN !== undefined ? ` Source [${oldN}] is likely the older page.` : "") +
          " Tell the reader to confirm the current rule with the office.",
      );
    } else {
      notes.push(`Official sources disagree on ${c.field}: ${side(na, c.a.id, c.a.value)} vs ${side(nb, c.b.id, c.b.value)}. Say so and tell the reader to confirm with the office.`);
    }
  }
  for (const s of report.stale ?? []) {
    const n = selected.get(s.id);
    if (n === undefined) continue;
    notes.push(`Source [${n}] mentions no year later than ${s.newestYear}; it may be out of date. Mention this if you rely on it for fees, documents or deadlines.`);
  }
  return notes.slice(0, 6);
}
