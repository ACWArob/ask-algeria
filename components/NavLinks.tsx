"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/i18n";

export function NavLinks({ dict }: { dict: Dict }) {
  const path = usePathname();
  const items = [
    { href: "/", label: dict.nav.ask },
    { href: "/translate", label: dict.nav.translate },
    { href: "/directory", label: dict.nav.directory },
    { href: "/about", label: dict.nav.about },
  ];
  return (
    <nav aria-label={dict.nav.menu} className="-mx-1 w-full overflow-x-auto md:order-none md:mx-0 md:w-auto">
      <ul className="flex gap-1 whitespace-nowrap text-[0.9375rem]">
        {items.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-[40px] items-center rounded-full px-3 font-semibold transition-colors ${
                  active ? "bg-door/10 text-door" : "text-muted hover:text-ink"
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
