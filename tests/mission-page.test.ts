import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n";
import { MISSION_STRINGS, topicLabel } from "@/lib/i18n-mission";
import { findMission, groupByTopic, hasLaissezPasser, missionBadge, missionNotes, missionRecords, toPageLink, type MissionPageLink } from "@/lib/mission-page";
import { MISSIONS, type Mission } from "@/lib/missions";
import { normalizeCorpus, type CorpusRecord } from "@/lib/search-core.mjs";

const rec = (over: Partial<CorpusRecord>): CorpusRecord => ({
  id: "x",
  title: "T",
  url: "https://example.org/",
  domain: "example.org",
  lang: "en",
  topic: "passport",
  fetched: "2026-10-28",
  text: "",
  ...over,
});

const mission = (over: Partial<Mission>): Mission => ({ ...MISSIONS[0], alt_websites: [], ...over });

/** Deep key paths of an object, sorted. */
const keys = (o: object, prefix = ""): string[] =>
  Object.entries(o)
    .flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]))
    .sort();

describe("findMission", () => {
  it("finds a known mission by id", () => {
    expect(findMission("cglyon")?.city).toBe("Lyon");
  });

  it("returns undefined for unknown ids and prototype keys", () => {
    for (const id of ["nope", "", "__proto__", "constructor", "toString", "hasOwnProperty"]) expect(findMission(id), id).toBeUndefined();
  });

  it("works on a custom list", () => {
    const list = [mission({ id: "a" }), mission({ id: "b", city: "B" })];
    expect(findMission("b", list)?.city).toBe("B");
    expect(findMission("c", list)).toBeUndefined();
  });
});

describe("missionRecords", () => {
  const m = mission({ id: "cgx", website: "https://www.cgx.mfa.gov.dz/fr", alt_websites: ["https://cgx-old.org"] });
  const records = [
    rec({ id: "1", domain: "cgx.mfa.gov.dz" }),
    rec({ id: "2", domain: "www.cgx-old.org", url: "https://www.cgx-old.org/a" }),
    rec({ id: "3", domain: "mfa.gov.dz" }),
    rec({ id: "4", domain: "cgy.mfa.gov.dz" }),
    rec({ id: "5", domain: "cgx.mfa.gov.dz", url: "javascript:alert(1)" }),
  ];

  it("keeps only pages from the mission's own hosts (website and alt websites), http(s) links only", () => {
    expect(missionRecords(m, records).map((r) => r.id)).toEqual(["1", "2"]);
  });

  it("returns nothing when the mission has no website", () => {
    expect(missionRecords(mission({ website: "", alt_websites: [] }), records)).toEqual([]);
  });

  it("finds real pages for a well-covered consulate in data/corpus.json", () => {
    const corpus = normalizeCorpus(JSON.parse(readFileSync(path.join(process.cwd(), "data/corpus.json"), "utf8")));
    const sf = findMission("cgsanfrancisco")!;
    const pages = missionRecords(sf, corpus);
    expect(pages.length).toBeGreaterThan(5);
    expect(pages.every((r) => r.domain === "cgsanfrancisco.mfa.gov.dz")).toBe(true);
    expect(hasLaissezPasser(pages)).toBe(true);
  });
});

describe("toPageLink", () => {
  it("shows the archived date only for archived copies", () => {
    expect(toPageLink(rec({ extraction: "archived", fetched: "2026-08-15" })).archived).toBe("2026-08-15");
    expect(toPageLink(rec({ extraction: "verbatim", fetched: "2026-08-15" })).archived).toBe("");
    expect(toPageLink(rec({ topic: "" })).topic).toBe("other");
  });
});

describe("groupByTopic", () => {
  const link = (id: string, topic: string, title = id): MissionPageLink => ({ id, title, url: `https://e.org/${id}`, topic, archived: "" });

  it("groups by topic, consular topics first, general/other last, unknown topics in between", () => {
    const groups = groupByTopic([
      link("a", "general"),
      link("b", "passport", "Zeta"),
      link("c", "tourism"),
      link("d", "passport", "Alpha"),
      link("e", "consular_registration"),
      link("f", "other"),
      link("g", ""),
    ]);
    expect(groups.map((g) => g.topic)).toEqual(["consular_registration", "passport", "tourism", "general", "other"]);
    expect(groups[1].pages.map((p) => p.title)).toEqual(["Alpha", "Zeta"]);
    expect(groups.at(-1)!.pages.map((p) => p.id).sort()).toEqual(["f", "g"]);
  });

  it("returns no groups for no pages", () => {
    expect(groupByTopic([])).toEqual([]);
  });
});

describe("hasLaissezPasser", () => {
  it("detects laissez-passer pages in en/fr/ar", () => {
    expect(hasLaissezPasser([{ title: "Consular Pass (Laissez-Passer)", text: "" }])).toBe(true);
    expect(hasLaissezPasser([{ title: "Autres services", text: "Le laissez passer est délivré…" }])).toBe(true);
    expect(hasLaissezPasser([{ title: "خدمات", text: "جواز المرور" }])).toBe(true);
    expect(hasLaissezPasser([{ title: "Biometric passport", text: "Validity is 10 years." }])).toBe(false);
  });
});

describe("status and notes", () => {
  it("maps unknown statuses to unverified and hides notes for unverified missions", () => {
    expect(missionBadge(mission({ status: "verified", source_url: "https://cglondon.mfa.gov.dz/" }))).toBe("verified");
    expect(missionBadge(mission({ status: "verified", source_url: "https://web.archive.org/web/2026id_/https://x.mfa.gov.dz/" }))).toBe("archived");
    expect(missionBadge(mission({ status: "website-only" }))).toBe("website-only");
    expect(missionBadge(mission({ status: "weird" }))).toBe("unverified");
    expect(missionNotes(mission({ status: "unverified", note: "Closed on Friday" })).note).toBe("");
    expect(missionNotes(mission({ status: "verified", note: "Closed on Friday" })).note).toBe("Closed on Friday");
    expect(missionNotes(mission({ status: "verified", note: "internal crawl note" })).note).toBe("");
    expect(missionNotes(mission({ status: "verified", phones: ["a", "b"], note: "The second number may be a fax." })).faxNote).toBe(true);
  });
});

describe("lib/i18n-mission strings", () => {
  it("has the same keys in every locale, all non-empty", () => {
    const ref = keys(MISSION_STRINGS.en);
    for (const l of LOCALES) {
      expect(keys(MISSION_STRINGS[l]), l).toEqual(ref);
      for (const k of ref) {
        const v = k.split(".").reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], MISSION_STRINGS[l]);
        expect(typeof v === "string" && v.trim().length > 0, `${l}.${k}`).toBe(true);
      }
    }
  });

  it("labels every topic of the mission pages we hold, and falls back for unknown ones", () => {
    const corpus = JSON.parse(readFileSync(path.join(process.cwd(), "data/corpus.json"), "utf8")) as { topic?: string }[];
    for (const t of new Set(corpus.map((r) => r.topic).filter(Boolean) as string[])) expect(Object.hasOwn(MISSION_STRINGS.en.topics, t), t).toBe(true);
    expect(topicLabel(MISSION_STRINGS.fr, "__proto__")).toBe(MISSION_STRINGS.fr.topics.other);
  });

  it("keeps Darija Algerian (no Moroccan markers)", () => {
    const dz = JSON.stringify(MISSION_STRINGS.dz);
    expect(dz).not.toMatch(/ديال|دابا|غادي|بغيت|كنعرف|واخا/);
  });
});
