/**
 * "Sources last checked" for a guide: the range of `fetched` dates of the corpus records it cites,
 * and how many of them are archived copies (extraction "archived"). Pure; GuideView feeds it corpus records.
 */
export interface CheckedRecord { fetched?: string; extraction?: string }
export interface CheckedRange { from: string; to: string; archived: number; total: number }

export function checkedRange(records: CheckedRecord[]): CheckedRange | null {
  const dates = records.map((r) => (r.fetched ?? "").slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  if (!dates.length) return null;
  return {
    from: dates[0],
    to: dates[dates.length - 1],
    archived: records.filter((r) => r.extraction === "archived").length,
    total: records.length,
  };
}

/** "from – to", or a single date when they are the same day. */
export function rangeLabel(r: Pick<CheckedRange, "from" | "to">, format: (iso: string) => string): string {
  return r.from === r.to ? format(r.from) : `${format(r.from)} – ${format(r.to)}`;
}
