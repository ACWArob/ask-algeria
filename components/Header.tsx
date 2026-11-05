import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import { isPublic } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavLinks } from "./NavLinks";

export function IndependenceStrip({ dict }: { dict: Dict }) {
  return (
    <div className="border-t-[3px] border-accent bg-brand text-brand-ink">
      <p className="mx-auto max-w-5xl px-4 py-1 text-center text-[0.8125rem] font-semibold">{dict.strip.independent}</p>
    </div>
  );
}

/** Wordmark only: no emblem, flag or crescent. */
export function Wordmark({ dict }: { dict: Dict }) {
  return (
    <span className="display text-[1.25rem] font-bold leading-none text-ink">
      {dict.brand.name}
      <span className="ms-0.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-baseline" aria-hidden="true" />
    </span>
  );
}

export function Header({ dict, locale, authed = true }: { dict: Dict; locale: Locale; authed?: boolean }) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 lg:flex-nowrap">
        <Link href="/" className="inline-flex min-h-[40px] shrink-0 items-center rounded-lg">
          <Wordmark dict={dict} />
        </Link>
        {authed && (
          <div className="order-last w-full min-w-0 lg:order-none lg:w-auto">
            <NavLinks dict={dict} />
          </div>
        )}
        <div className="ms-auto shrink-0">
          <LanguageSwitcher current={locale} label={dict.lang.label} />
        </div>
      </div>
    </header>
  );
}

export function Footer({ dict, authed = true }: { dict: Dict; authed?: boolean }) {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-ink">{dict.footer.independent}</p>
        {authed && (
          <div className="flex flex-wrap items-center gap-x-4">
            {/* Every section, so nothing is hidden behind the scrolling menu on a phone. Padded for 40px tap targets. */}
            {(
              [
                ["/prepare", dict.prepare.nav],
                ["/embassies", dict.nav.embassies],
                ["/status", dict.nav.status],
                ["/glossary", dict.nav.glossary],
                ["/directory", dict.nav.directory],
                ["/about", dict.nav.about],
                ["/about#contact", dict.nav.contact],
                ["/about#contact", dict.nav.report],
                ["/legal", dict.nav.legal],
              ] as const
            ).map(([href, label], i) => (
              <Link key={i} href={href} className="link inline-flex min-h-[40px] items-center">{label}</Link>
            ))}
            {!isPublic() && (
              <form action="/api/logout" method="post">
                <button type="submit" className="link inline-flex min-h-[40px] items-center">{dict.nav.logout}</button>
              </form>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
