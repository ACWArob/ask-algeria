import "server-only";
import { corpusById } from "@/lib/corpus";
import { GUIDES } from "@/lib/guides";
import { getDict, type Locale } from "@/lib/i18n";
import { LETTER_LANGS, PROCEDURES, type LetterLang, type PacketSource, type PrepareProcedure } from "@/lib/prepare";

type Situations = Record<string, string>;

/**
 * The procedures for the "Prepare my file" page in one UI language. Checklist points are the guide's own
 * cited points (lib/guides), and sources are the corpus records those points cite — nothing else.
 */
export function prepareProcedures(locale: Locale): PrepareProcedure[] {
  const corpus = corpusById();
  const dict = getDict(locale);
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
            points: sec.points.map((pt) => ({
              text: pt.text[locale],
              // Office matching also looks at the Latin-script versions: people type "Lyon" in any UI language.
              match: [pt.text[locale], pt.text.en, pt.text.fr].join(" \n "),
              nums: num(pt.cites),
            })),
          }));
        const sources: PacketSource[] = order.map((id, i) => {
          const r = corpus.get(id)!;
          return { n: i + 1, title: r.title, url: r.url, domain: r.domain };
        });
        const letterSubject = Object.fromEntries(
          LETTER_LANGS.map((l) => [l, `${G.title[l]} — ${(getDict(l).prepare.situations as Situations)[s.id] ?? s.id}`]),
        ) as Record<LetterLang, string>;
        return { id: s.id, label: labels[s.id] ?? s.id, office: s.office, groups, sources, letterSubject };
      }),
    };
  });
}
