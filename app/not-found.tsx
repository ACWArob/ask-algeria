import Link from "next/link";
import { PageBackdrop } from "@/components/Backdrop";
import { Footer, Header, IndependenceStrip } from "@/components/Header";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

/** 404 with the same independence strip, header and footer as every other page. */
export default function NotFound() {
  const locale = getLocale();
  const dict = getDict(locale);
  const n = dict.notFound;
  return (
    <>
      <PageBackdrop />
      <IndependenceStrip dict={dict} />
      <Header dict={dict} locale={locale} />
      <main id="main" className="mx-auto max-w-5xl px-4 pb-16 pt-14">
        <h1 className="display text-4xl font-bold sm:text-5xl">{n.title}</h1>
        <p className="mt-4 max-w-prose text-lg text-muted">{n.body}</p>
        <p className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="btn-primary">{dict.nav.ask}</Link>
          <Link href="/directory" className="btn-quiet">{dict.nav.directory}</Link>
        </p>
      </main>
      <Footer dict={dict} />
    </>
  );
}
