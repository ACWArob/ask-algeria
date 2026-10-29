import { describe, expect, it } from "vitest";
import { followUps } from "@/lib/followups";
import en from "@/lib/i18n/en.json";
import fr from "@/lib/i18n/fr.json";
import ar from "@/lib/i18n/ar.json";
import dz from "@/lib/i18n/dz.json";

describe("follow-up questions", () => {
  it("offers topic follow-ups in the reply language and skips what was asked", () => {
    const en1 = followUps(["passport"], "how do I renew my passport", "en");
    expect(en1).toEqual(["Which documents do I need?", "How much does it cost?", "And for a child?"]);
    const asked = followUps(["passport"], "how much does a passport cost", "en");
    expect(asked).not.toContain("How much does it cost?");
    expect(followUps(["passport"], "renouveler passeport", "fr")[0]).toBe("Quels documents faut-il ?");
    expect(followUps(["national_service"], "الخدمة الوطنية", "dz")[0]).toMatch(/السورسي/);
    expect(followUps([], "something", "ar")).toHaveLength(3);
    // whole words only: "person" isn't "son", "within" isn't "win"
    expect(followUps(["passport"], "Can a person renew a passport?", "en")).toContain("And for a child?");
    expect(followUps(["civil_status"], "transcription within 30 days", "en")).toContain("Where is the office and when is it open?");
  });
});

function keys(o: unknown, p = ""): string[] {
  return o && typeof o === "object" && !Array.isArray(o)
    ? Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => keys(v, p ? `${p}.${k}` : k))
    : [p];
}

describe("i18n", () => {
  it("all four languages have exactly the same keys", () => {
    const base = keys(en).sort();
    for (const [name, d] of [["fr", fr], ["ar", ar], ["dz", dz]] as const) expect(keys(d).sort(), name).toEqual(base);
  });
});
