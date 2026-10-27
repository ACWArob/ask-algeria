import { describe, expect, it } from "vitest";
import * as core from "../scripts/lib/refresh-core.mjs";

const { contentHash, normalizeForHash, parseRobots, isAllowed, htmlToText, nextState, looksBlockedOrEmpty, looksSoft404, yearsMentioned, decodeBody } = core;

describe("normalizeForHash / contentHash", () => {
  it("ignores whitespace, case, tashkeel, tatweel and digit scripts", () => {
    expect(normalizeForHash("  Frais :\n 60  EUR ")).toBe("frais : 60 eur");
    expect(contentHash("جَوَاز السفر ١٢")).toBe(contentHash("جواز  الســفر 12"));
    expect(contentHash("Passeport​ biométrique")).toBe(contentHash("passeport biométrique"));
  });

  it("ignores volatile tokens (clock times, counters, © years)", () => {
    expect(contentHash("Fee 60 EUR. Updated 10:42. © 2025 MFA")).toBe(contentHash("Fee 60 EUR. Updated 09:01. © 2026 MFA"));
    expect(contentHash("Visiteurs : 12 345\nTexte")).toBe(contentHash("Visiteurs : 99 999\nTexte"));
  });

  it("detects real content changes", () => {
    expect(contentHash("Fee: 60 EUR")).not.toBe(contentHash("Fee: 70 EUR"));
    expect(contentHash("x")).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe("robots.txt", () => {
  const txt = `
# comment
User-agent: *
Disallow: /admin
Disallow: /private/
Allow: /private/public-page
Disallow: /*.pdf$

User-agent: AskAlgeriaBot
User-agent: OtherBot
Disallow: /no-bots

User-agent: BadBot
Disallow: /
`;
  const groups = parseRobots(txt);

  it("parses groups with shared user-agents", () => {
    expect(groups).toHaveLength(3);
    expect(groups[1].agents).toEqual(["askalgeriabot", "otherbot"]);
  });

  it("uses our specific group when present (and only that group)", () => {
    expect(isAllowed(groups, "https://x.dz/no-bots/page")).toBe(false);
    expect(isAllowed(groups, "https://x.dz/admin")).toBe(true); // "*" rules don't apply when a specific group matches
  });

  it("applies longest-match with Allow winning ties, wildcards and $", () => {
    const star = parseRobots(txt.split("User-agent: AskAlgeriaBot")[0]);
    expect(isAllowed(star, "https://x.dz/admin/users")).toBe(false);
    expect(isAllowed(star, "https://x.dz/private/secret")).toBe(false);
    expect(isAllowed(star, "https://x.dz/private/public-page")).toBe(true);
    expect(isAllowed(star, "https://x.dz/docs/guide.pdf")).toBe(false);
    expect(isAllowed(star, "https://x.dz/docs/guide.pdf?v=2")).toBe(true);
    expect(isAllowed(star, "https://x.dz/")).toBe(true);
  });

  it("treats empty / missing robots as allow-all, and Disallow: / as block", () => {
    expect(isAllowed(parseRobots(""), "https://x.dz/anything")).toBe(true);
    expect(isAllowed(parseRobots("User-agent: *\nDisallow:"), "https://x.dz/a")).toBe(true);
    expect(isAllowed(parseRobots("User-agent: *\nDisallow: /"), "https://x.dz/a")).toBe(false);
  });
});

describe("htmlToText", () => {
  it("prefers main content and drops nav/footer/scripts", () => {
    const body = "Les pièces à fournir pour le passeport biométrique sont les suivantes. ".repeat(6);
    const html = `<html><head><title>Passeport</title><script>var x=1</script></head><body>
      <nav>Accueil | Contact</nav><main><h1>Passeport</h1><p>${body}</p><ul><li>Extrait 12S</li></ul></main>
      <footer>© 2026 Consulat</footer></body></html>`;
    const { title, text } = htmlToText(html);
    expect(title).toBe("Passeport");
    expect(text).toContain("Extrait 12S");
    expect(text).not.toContain("Accueil");
    expect(text).not.toContain("var x");
    expect(text).not.toContain("© 2026");
  });

  it("decodes charsets", () => {
    const latin1 = new Uint8Array([0x63, 0x61, 0x66, 0xe9]); // "café" in ISO-8859-1
    expect(decodeBody(latin1, "text/html; charset=ISO-8859-1")).toBe("café");
  });
});

describe("page heuristics", () => {
  it("flags block pages and soft 404s", () => {
    expect(looksBlockedOrEmpty("Access denied")).toBe(true);
    expect(looksBlockedOrEmpty("x".repeat(500))).toBe(false);
    expect(looksSoft404("Page introuvable", "Erreur 404")).toBe(true);
    expect(looksSoft404("Passeport", "x".repeat(3000))).toBe(false);
  });

  it("extracts plausible years", () => {
    expect(yearsMentioned("Loi 02-01 du 5 février 2002, modifiée en 2019. Tel 2131234567", new Date("2026-10-27")).newest).toBe(2019);
    expect(yearsMentioned("no years").newest).toBeNull();
  });
});

describe("nextState", () => {
  const day = "2026-11-02";
  it("baselines, detects changes, and keeps unchanged", () => {
    const a = nextState(undefined, { kind: "ok", hash: "h1", httpStatus: 200 }, day, "2026-10-27");
    expect(a.action).toBe("baseline");
    expect(a.state).toMatchObject({ hash: "h1", status: "ok", lastChanged: "2026-10-27", lastChecked: day });
    const b = nextState(a.state, { kind: "ok", hash: "h1", httpStatus: 200 }, "2026-11-09");
    expect(b.action).toBe("unchanged");
    const c = nextState(b.state, { kind: "ok", hash: "h2", httpStatus: 200 }, "2026-11-16");
    expect(c).toMatchObject({ action: "changed", state: { status: "changed", lastChanged: "2026-11-16", hash: "h2" } });
  });

  it("needs two consecutive 404/410s before 'gone'; unreachable never drops", () => {
    const one = nextState({ hash: "h" }, { kind: "gone", httpStatus: 404 }, day);
    expect(one.action).toBe("gone-pending");
    const two = nextState(one.state, { kind: "gone", httpStatus: 404 }, day);
    expect(two).toMatchObject({ action: "gone", state: { status: "gone" } });
    const reset = nextState(one.state, { kind: "ok", hash: "h", httpStatus: 200 }, day);
    expect(reset.state.goneCount).toBe(0);
    const un = nextState({ hash: "h", goneCount: 1 }, { kind: "unreachable", note: "timeout" }, day);
    expect(un).toMatchObject({ action: "unreachable", state: { status: "unreachable", hash: "h", goneCount: 1, note: "timeout" } });
  });
});
