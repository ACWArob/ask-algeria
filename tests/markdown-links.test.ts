import { describe, expect, it } from "vitest";
import missions from "@/data/missions.json";
import sources from "@/data/sources.json";
import { isOfficialUrl, OFFICIAL_NON_DZ_HOSTS } from "@/lib/official-hosts";

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
};

describe("official links in answers", () => {
  it("knows every consulate and source site outside .dz (regenerate lib/official-hosts.ts if this fails)", () => {
    const list = (Array.isArray(missions) ? missions : (missions as { missions: unknown[] }).missions) as Record<string, string>[];
    const urls = [...list.flatMap((m) => [m.website, m.appointment_url, m.source_url]), ...(sources as { url: string }[]).map((s) => s.url)];
    for (const h of urls.map((u) => (u ? host(u) : null)))
      if (h && !h.endsWith(".dz")) expect(OFFICIAL_NON_DZ_HOSTS, h).toContain(h);
  });

  it("accepts .dz and listed consulates, refuses look-alikes and other schemes", () => {
    expect(isOfficialUrl("https://passeport.interieur.gov.dz/fr")).toBe(true);
    expect(isOfficialUrl("https://www.consulat-paris-algerie.fr/passeport")).toBe(true);
    expect(isOfficialUrl("https://algeria-gov-payments.com/pay")).toBe(false);
    expect(isOfficialUrl("https://interieur.gov.dz.evil.com/")).toBe(false);
    expect(isOfficialUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("answer rendering can't run code", () => {
  it("raw HTML and javascript: links in a model answer render as plain text, never as markup", async () => {
    const React = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { Markdown } = await import("@/components/Markdown");
    const evil = [
      "Fee: 30 EUR <script>alert(1)</script>",
      '<img src=x onerror="alert(1)">',
      "[click](javascript:alert(1)) and [data](data:text/html;base64,PHNjcmlwdD4=)",
      '<a href="https://evil.example">official</a> and [look-alike](https://interieur-gov.dz.evil.example/)',
      "[proto](//evil.example/x) [slash](/\\evil.example) [rel](evil.example) [ok](/services/passport) [mail](mailto:a@b.dz)",
    ].join("\n\n");
    const html = renderToStaticMarkup(React.createElement(Markdown, { text: evil }));
    expect(html).not.toMatch(/<script|<img|<a href="https:\/\/evil/i);
    expect(html).toContain("&lt;script&gt;");
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(["/services/passport", "mailto:a@b.dz"]);
  });
});
