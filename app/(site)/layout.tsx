import { PageBackdrop } from "@/components/Backdrop";
import { Footer, Header, IndependenceStrip } from "@/components/Header";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const dict = getDict(locale);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        {locale === "en" ? "Skip to content" : locale === "fr" ? "Aller au contenu" : "انتقل إلى المحتوى"}
      </a>
      <PageBackdrop />
      <IndependenceStrip dict={dict} />
      <Header dict={dict} locale={locale} />
      <main id="main" className="mx-auto max-w-5xl px-4">
        {children}
      </main>
      <Footer dict={dict} />
    </>
  );
}
