/**
 * Official sites outside .dz (consulates, embassies, archived copies) from data/missions.json and data/sources.json,
 * so the answer view can tell an official link from any other. Small on purpose: it ships to the browser.
 * tests/markdown-links.test.ts checks it stays in sync with the data files.
 */
export const OFFICIAL_NON_DZ_HOSTS: readonly string[] = [
  "algeria-cgny.org",
  "algerian-consulate.org.uk",
  "algerianemb.or.kr",
  "algerianembassy.dk",
  "algeriegn.org",
  "amb-algerie.fr",
  "ambalg.ma",
  "ambalglibreville.com",
  "consulat-besancon-algerie.fr",
  "consulat-bobigny-algerie.fr",
  "consulat-bordeaux-algerie.fr",
  "consulat-creteil-algerie.fr",
  "consulat-grenoble-algerie.fr",
  "consulat-lille-algerie.fr",
  "consulat-lyon-algerie.fr",
  "consulat-marseille-algerie.fr",
  "consulat-metz-algerie.fr",
  "consulat-montpellier-algerie.fr",
  "consulat-nanterre-algerie.fr",
  "consulat-nantes-algerie.fr",
  "consulat-nice-algerie.fr",
  "consulat-paris-algerie.fr",
  "consulat-pontoise-algerie.fr",
  "consulat-saint-etienne-algerie.fr",
  "consulat-strasbourg-algerie.fr",
  "consulat-toulouse-algerie.fr",
  "consulatalgeriemontreal.com",
  "embalgeria-lb.net",
  "embassyalgeria.ca",
  "konsulat-algerien.de",
  "sonatrach.com",
  "web.archive.org"
];

/** Is this link to an official site: a .dz domain, or one of the listed consulate/embassy sites (or a subdomain)? */
export function isOfficialUrl(url: string): boolean {
  let h: string;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    h = u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return false;
  }
  return h.endsWith(".dz") || OFFICIAL_NON_DZ_HOSTS.some((o) => h === o || h.endsWith(`.${o}`));
}
