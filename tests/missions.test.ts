import { describe, expect, it } from "vitest";
import { isMissionContactQuestion, matchMissions, MISSIONS, missionExcerpt, missionName, parsePhone } from "@/lib/missions";
import { usStateOffices } from "@/lib/posts";

describe("missions.json", () => {
  it("every verified mission has a source_url and at least one of address/phones/emails", () => {
    const verified = MISSIONS.filter((m) => m.status === "verified");
    expect(verified.length).toBeGreaterThan(0);
    for (const m of verified) {
      expect(m.source_url, m.id).toMatch(/^https?:\/\//);
      expect(Boolean(m.address || m.phones.length || m.emails.length), m.id).toBe(true);
    }
  });

  it("has unique ids and names in every language", () => {
    expect(new Set(MISSIONS.map((m) => m.id)).size).toBe(MISSIONS.length);
    for (const m of MISSIONS) for (const l of ["en", "fr", "ar", "dz"] as const) expect(missionName(m, l), `${m.id} ${l}`).toBeTruthy();
  });

  it("maps every US state to a listed mission", () => {
    const states = usStateOffices();
    expect(states.length).toBeGreaterThanOrEqual(50);
    for (const s of states) expect(matchMissions("", s.domains, 1)[0], s.state).toBeTruthy();
  });
});

describe("chat helpers", () => {
  it("detects contact questions in 4 languages", () => {
    expect(isMissionContactQuestion("What is the address of the consulate in San Francisco?")).toBe(true);
    expect(isMissionContactQuestion("Quel est le numéro de téléphone du consulat de Lyon ?")).toBe(true);
    expect(isMissionContactQuestion("ما هو عنوان السفارة الجزائرية في القاهرة؟")).toBe(true);
    expect(isMissionContactQuestion("وين راهي القنصلية تاع ليون؟")).toBe(true);
    expect(isMissionContactQuestion("How do I renew my passport?")).toBe(false);
  });

  it("matches by office domain, city and country", () => {
    expect(matchMissions("", ["cgsanfrancisco.mfa.gov.dz"])[0].id).toBe("cgsanfrancisco");
    expect(matchMissions("consulat de Lyon")[0].id).toBe("cglyon");
    expect(matchMissions("السفارة في مصر")[0].country).toBe("Egypt");
  });

  it("splits phone labels", () => {
    expect(parsePhone("Fax: +20 2 7366659")).toEqual({ label: "Fax", display: "+20 2 7366659", tel: "+2027366659" });
    expect(parsePhone("+1 (202) 265-2800").tel).toBe("+12022652800");
  });
});

describe("review fixes: mission matching", () => {
  const ids = (q: string, ctx = "") => matchMissions(q, [], 3, ctx).map((m) => m.city);
  it("DRC question does not also pull in Republic of the Congo", () => {
    expect(ids("What is the phone number of the embassy in the Democratic Republic of the Congo?")).toEqual(["Kinshasa"]);
  });
  it("everyday words are not places", () => {
    expect(ids("Can you give me a nice summary of the embassy hours?")).toEqual([]);
    expect(ids("Jordan needs the embassy phone number")).toEqual([]);
    expect(ids("رقم هاتف السفارة المالي")).toEqual([]);
  });
  it("ambiguous names still match after a locative", () => {
    expect(ids("phone of the consulate in Nice")).toEqual(["Nice"]);
    expect(ids("adresse du consulat à Nice")).toEqual(["Nice"]);
    expect(ids("embassy in Jordan address")).toEqual(["Amman"]);
  });
  it("question place beats earlier conversation; context is the fallback", () => {
    expect(ids("consulate in Lyon phone", "I live in Paris")).toEqual(["Lyon"]);
    expect(ids("what's their phone number?", "consulate in Lyon")).toEqual(["Lyon"]);
  });
  it("keyword gate is word-bounded", () => {
    expect(isMissionContactQuestion("I need a consultation, what are the hours?")).toBe(false);
  });
  it("public notes reach the model", () => {
    const ad = matchMissions("embassy in Abu Dhabi hours", [], 1)[0];
    if (ad.note && /closed|appointment/i.test(ad.note)) expect(missionExcerpt(ad)).toContain(ad.note);
  });
});
