import "server-only";
import { corpusById } from "@/lib/corpus";
import { GUIDES } from "@/lib/guides";
import { getDict, type Locale } from "@/lib/i18n";
import { MISSIONS, missionHosts } from "@/lib/missions";
import { LETTER_LANGS, PROCEDURES, type LetterLang, type PacketSource, type PrepareProcedure } from "@/lib/prepare";

type Situations = Record<string, string>;

/** Cities with an Algerian consulate or embassy, as whole, capitalised words (so "Nice" the city, not "nice"). */
const CITY_RES = [...new Set([...MISSIONS.map((m) => m.city).filter(Boolean), "Washington"])].map(
  (c) => [c, new RegExp(`(?<![\\p{L}\\p{N}])${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "u")] as const,
);
/** Hosts of consulates and embassies (their own sites and *.mfa.gov.dz posts), not the ministry itself. */
const CONSULAR_HOSTS = new Set(MISSIONS.flatMap((m) => missionHosts(m)).map((h) => h.replace(/^www\./, "").toLowerCase()).filter((h) => h !== "mfa.gov.dz"));
const isConsularHost = (domain: string) => {
  const h = domain.replace(/^www\./, "").toLowerCase();
  return CONSULAR_HOSTS.has(h) || (/\.mfa\.gov\.dz$/.test(h) && h !== "www.mfa.gov.dz");
};

/** The consulate cities a guide point names (in its English or French text). */
export function namedOffices(text: string): string[] {
  return CITY_RES.filter(([, re]) => re.test(text)).map(([c]) => c);
}

/**
 * The procedures for the "Prepare my file" page in one UI language. Checklist points are the guide's own
 * cited points (lib/guides), and sources are the corpus records those points cite — nothing else.
 */
export function prepareProcedures(locale: Locale): PrepareProcedure[] {
  const corpus = corpusById();
  const dict = getDict(locale);
  /** A consulate's rule: names a consulate city, or every page it cites is a consulate's. Not for people in Algeria. */
  const consularPoint = (pt: { text: { en: string; fr: string }; cites: string[] }) =>
    namedOffices(`${pt.text.en} \n ${pt.text.fr}`).length > 0 || pt.cites.every((c) => isConsularHost(corpus.get(c)?.domain ?? ""));
  const labels = dict.prepare.situations as Situations;
  return PROCEDURES.filter((p) => Object.hasOwn(GUIDES, p.slug)).map((p) => {
    const G = GUIDES[p.slug];
    return {
      slug: p.slug,
      title: G.title[locale],
      guideHref: `/services/${p.slug}`,
      portals: G.portals.map((x) => ({ label: x.label[locale], url: x.url })),
      situations: p.situations.map((s) => {
        const order: string[] = [];
        const num = (ids: string[]) =>
          ids
            .filter((id) => corpus.has(id))
            .map((id) => {
              if (!order.includes(id)) order.push(id);
              return order.indexOf(id) + 1;
            })
            .sort((a, b) => a - b);
        const ids = [...new Set([...p.base, ...s.sections])];
        const groups = ids
          .map((id) => G.sections.find((x) => x.id === id))
          .filter((x): x is NonNullable<typeof x> => Boolean(x))
          .map((sec) => ({
            title: sec.title[locale],
            // Living in Algeria: no consulate's rules, not even from shared sections (fees, languages, cases).
            points: sec.points
              .filter((pt) => s.place !== "algeria" || !consularPoint(pt))
              .map((pt) => ({
              text: pt.text[locale],
              // Office matching also looks at the Latin-script versions: people type "Lyon" in any UI language.
              match: [pt.text[locale], pt.text.en, pt.text.fr].join(" \n "),
              nums: num(pt.cites),
              offices: namedOffices(`${pt.text.en} \n ${pt.text.fr}`),
              consular: consularPoint(pt),
            })),
          }));
        const sources: PacketSource[] = order.map((id, i) => {
          const r = corpus.get(id)!;
          return { n: i + 1, title: r.title, url: r.url, domain: r.domain };
        });
        const letterSubject = Object.fromEntries(
          LETTER_LANGS.map((l) => [l, `${G.title[l]}: ${(getDict(l).prepare.situations as Situations)[s.id] ?? s.id}`]),
        ) as Record<LetterLang, string>;
        return { id: s.id, label: labels[s.id] ?? s.id, office: s.office, place: s.place, groups, sources, letterSubject };
      }),
    };
  });
}
