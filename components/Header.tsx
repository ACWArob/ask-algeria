import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Mark } from "./Mark";
import { NavLinks } from "./NavLinks";

export function IndependenceStrip({ dict }: { dict: Dict }) {
  return (
    <div className="bg-ink text-paper">
      <p className="mx-auto max-w-5xl px-4 py-1.5 text-center text-[0.8125rem] font-semibold">{dict.strip.independent}</p>
    </div>
  );
}

export function Header({ dict, locale, authed = true }: { dict: Dict; locale: Locale; authed?: boolean }) {
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg">
          <Mark />
          <span className="display text-xl font-bold">{dict.brand.name}</span>
        </Link>
        <div className="ms-auto">
          <LanguageSwitcher current={locale} label={dict.lang.label} />
        </div>
        {authed && <NavLinks dict={dict} />}
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
          <div className="flex items-center gap-4">
            <Link href="/about" className="link">{dict.nav.about}</Link>
            <form action="/api/logout" method="post">
              <button type="submit" className="link">{dict.nav.logout}</button>
            </form>
          </div>
        )}
      </div>
    </footer>
  );
}
