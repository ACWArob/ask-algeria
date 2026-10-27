import { AskClient } from "@/components/AskClient";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default function AskPage() {
  const locale = getLocale();
  const dict = getDict(locale);
  return (
    <div className="pt-10 sm:pt-16">
      <div className="max-w-3xl">
        <h1 className="display text-[2.5rem] font-bold sm:text-6xl">{dict.ask.heading}</h1>
        <p className="mt-4 max-w-prose text-lg text-muted">{dict.ask.sub}</p>
      </div>
      <div className="mt-8 sm:mt-10">
        <AskClient key={locale} dict={dict} locale={locale} />
      </div>
    </div>
  );
}
