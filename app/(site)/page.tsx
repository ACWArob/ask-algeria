import { HomeClient } from "@/components/HomeClient";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { SERVICES } from "@/lib/services";
import { whereOptions } from "@/lib/where";
import stats from "@/data/corpus-stats.json";

const NUMBER_LOCALE = { en: "en-US", fr: "fr-FR", ar: "ar-DZ", dz: "ar-DZ" } as const;

export default async function AskPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  // Formatted here so the server and the browser show the same digits.
  const nf = new Intl.NumberFormat(NUMBER_LOCALE[locale]);
  const coverage = { pages: nf.format(stats.pages), sites: nf.format(stats.sites) };
  return <HomeClient key={locale} dict={dict} locale={locale} services={SERVICES} places={whereOptions(locale)} coverage={coverage} />;
}
