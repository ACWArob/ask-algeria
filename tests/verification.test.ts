import { describe, expect, it } from "vitest";
import { checkedDate, verificationNotes, type AccuracyReport } from "@/lib/verification";
import { answerUserPrompt } from "@/lib/prompts";

const report: AccuracyReport = {
  conflicts: [
    { id: "c1", field: "fee", a: { id: "dc", value: "$75" }, b: { id: "ny", value: "$70" }, classification: "real_conflict" },
    { id: "c2", field: "fee", a: { id: "dc", value: "$75" }, b: { id: "ldn", value: "£55" }, classification: "post_specific" },
    { id: "c3", field: "validity", a: { id: "old", value: "5 years" }, b: { id: "dc", value: "10 years" }, classification: "outdated", outdatedId: "old" },
  ],
  stale: [{ id: "ny", newestYear: 2016 }],
};
const domains: Record<string, string> = { dc: "embwashington.mfa.gov.dz", ny: "algeria-cgny.org", old: "cgx.mfa.gov.dz", ldn: "cglondon.mfa.gov.dz" };

describe("verificationNotes", () => {
  it("cites both sides when both are selected and skips post-specific differences", () => {
    const notes = verificationNotes(report, new Map([["dc", 1], ["ny", 3]]), (id) => domains[id]);
    expect(notes[0]).toContain('"$75" [1] vs "$70" [3]');
    expect(notes.join(" ")).not.toContain("£55");
    expect(notes.some((n) => n.includes("[3] mentions no year later than 2016"))).toBe(true);
  });

  it("names the other page when only one side is selected", () => {
    const notes = verificationNotes(report, new Map([["dc", 2]]), (id) => domains[id]);
    expect(notes.find((n) => n.includes("$70"))).toContain("algeria-cgny.org");
    expect(notes.find((n) => n.includes("validity"))).toMatch(/outdated/i);
  });

  it("returns nothing without a report or matching sources", () => {
    expect(verificationNotes(null, new Map([["dc", 1]]), () => undefined)).toEqual([]);
    expect(verificationNotes(report, new Map([["zzz", 1]]), () => undefined)).toEqual([]);
  });
});

describe("checkedDate", () => {
  it("prefers a successful check, falls back to fetched", () => {
    expect(checkedDate("2026-10-01", { lastChecked: "2026-11-02", status: "ok" })).toBe("2026-11-02");
    expect(checkedDate("2026-10-01T12:00:00Z", { lastChecked: "2026-11-02", status: "unreachable" })).toBe("2026-10-01");
    expect(checkedDate(undefined, undefined)).toBeNull();
  });
});

describe("answerUserPrompt", () => {
  it("adds verification notes and checked dates only when present", () => {
    const src = [{ n: 1, title: "T", url: "https://x.dz", domain: "x.dz", excerpts: ["e"], checked: "2026-11-02" }];
    const withNotes = answerUserPrompt("q", src, "", ['Official sources disagree on fee: "$75" [1] vs "$70" [3].']);
    expect(withNotes).toContain("<verification_notes>");
    expect(withNotes).toContain('checked="2026-11-02"');
    expect(answerUserPrompt("q", src)).not.toContain("<verification_notes>");
  });
});
