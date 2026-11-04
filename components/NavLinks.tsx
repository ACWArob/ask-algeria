"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/i18n";

export function NavLinks({ dict }: { dict: Dict }) {
  const path = usePathname();
  // About first: new visitors want to know what the site is before using it (tester feedback, 4 Nov 2026).
  const items = [
    { href: "/about", label: dict.nav.about },
    { href: "/", label: dict.nav.ask },
    { href: "/translate", label: dict.nav.translate },
    { href: "/prepare", label: dict.prepare.nav },
    { href: "/embassies", label: dict.nav.embassies },
    { href: "/status", label: dict.nav.status },
    { href: "/glossary", label: dict.nav.glossary },
    { href: "/directory", label: dict.nav.directory },
  ];
  return (
    // On a phone the menu scrolls sideways; the fade at the end shows there is more (every page is also in the footer).
    <nav
      aria-label={dict.nav.menu}
      className="-mx-1 overflow-x-auto [mask-image:linear-gradient(to_right,#000_85%,transparent)] rtl:[mask-image:linear-gradient(to_left,#000_85%,transparent)] lg:mx-0 lg:[mask-image:none] lg:rtl:[mask-image:none]"
    >
      <ul className="flex gap-1 whitespace-nowrap pe-10 text-[0.9375rem] lg:pe-0 lg:text-[0.875rem]">
        {items.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-[40px] items-center rounded-full px-2.5 font-semibold transition-colors ${
                  active ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"
                }`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
