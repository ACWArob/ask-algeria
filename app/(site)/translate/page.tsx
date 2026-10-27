import type { Metadata } from "next";
import { TranslateClient } from "@/components/TranslateClient";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getDict(getLocale()).translate.heading };
}

export default function TranslatePage() {
  const locale = getLocale();
  const dict = getDict(locale);
  return (
    <div className="pt-10 sm:pt-14">
      <h1 className="display text-4xl font-bold sm:text-5xl">{dict.translate.heading}</h1>
      <p className="mt-4 max-w-prose text-lg text-muted">{dict.translate.sub}</p>
      <div className="mt-10">
        <TranslateClient key={locale} dict={dict} locale={locale} />
      </div>
    </div>
  );
}
