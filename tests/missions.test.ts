import { describe, expect, it } from "vitest";
import { foreignMissionHosts, foreignMissionHostsForCountry, isMissionContactQuestion, matchMissions, MISSIONS, missionExcerpt, missionName, parsePhone } from "@/lib/missions";
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

  it("applies the 2026-10-30 tester review (from inside Algeria)", () => {
    const byId = (id: string) => MISSIONS.find((m) => m.id === id)!;
    const ba = byId("embbuenosaires");
    expect(ba.website).toBe("https://embbuenosaires.mfa.gov.dz/en");
    expect(ba.status).toBe("verified");
    expect(ba.checked).toBe("2026-10-30");
    // tester note: another phone number is on the official contact page
    expect(byId("embluanda").phones).toContain("Tel: +244 226 470 031");
    // rows copied from another mission are not applied (Bern had Zagreb's numbers)
    expect(byId("embbern").phones.join(" ")).not.toMatch(/\+385/);
    // third-party-only sources (embassypages.com) are not used
    expect(byId("embhavana").status).toBe("unverified");
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

describe("other countries' consulates never answer for the person", () => {
  it("a Lyon user excludes US/Canada/UK missions but keeps French ones", () => {
    const ex = foreignMissionHosts(["consulat-lyon-algerie.fr", "amb-algerie.fr"]);
    expect(ex).toContain("algeria-cgny.org");
    expect(ex).toContain("cgsanfrancisco.mfa.gov.dz");
    expect(ex).toContain("embassyalgeria.ca");
    expect(ex).not.toContain("consulat-paris-algerie.fr");
    expect(ex).not.toContain("amb-algerie.fr");
  });
  it("a Colorado user keeps NY and DC pages (same country)", () => {
    const ex = foreignMissionHosts(["cgsanfrancisco.mfa.gov.dz"]);
    expect(ex).not.toContain("algeria-cgny.org");
    expect(ex).not.toContain("embwashington.mfa.gov.dz");
    expect(ex).toContain("consulat-paris-algerie.fr");
  });
  it("someone in Algeria gets no consulate pages", () => {
    expect(foreignMissionHosts(["interieur.gov.dz"], true)).toContain("algeria-cgny.org");
  });
  it("country without a city", () => {
    expect(foreignMissionHostsForCountry("France")).toContain("algeria-cgny.org");
    expect(foreignMissionHostsForCountry("France")).not.toContain("consulat-nice-algerie.fr");
  });
});

describe("phone links", () => {
  it("dials only the first number of a shorthand list", async () => {
    const { parsePhone } = await import("@/lib/missions");
    expect(parsePhone("+33 1 53 93 20 74/75/77").tel).toBe("+33153932074");
    expect(parsePhone("Tel: +44 20 7221 7800").tel).toBe("+442072217800");
    expect(parsePhone("+1 202 265 2800 / +1 202 265 2801").tel).toBe("+12022652800");
  });
});
