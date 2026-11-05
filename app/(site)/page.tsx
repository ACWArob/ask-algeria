import { HomeClient } from "@/components/HomeClient";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { SERVICES } from "@/lib/services";
import { whereOptions } from "@/lib/where";

export default async function AskPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  return <HomeClient key={locale} dict={dict} locale={locale} services={SERVICES} places={whereOptions(locale)} />;
}
