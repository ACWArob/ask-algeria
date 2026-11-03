"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/i18n";
import { PREPARE_SLUGS } from "@/lib/prepare";

/** "Prepare my file" call-to-action under a service guide that has a packet (see lib/prepare.ts). */
export function PrepareCta({ t }: { t: Dict["prepare"]["cta"] }) {
  const slug = usePathname().split("/")[2] ?? "";
  if (!PREPARE_SLUGS.includes(slug)) return null;
  return (
    <aside aria-labelledby="prepare-cta-h" className="mt-14 max-w-prose rounded-3xl border border-line bg-surface p-5 sm:p-7 print:hidden">
      <h2 id="prepare-cta-h" className="display text-2xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-muted">{t.text}</p>
      <Link href={`/prepare?p=${encodeURIComponent(slug)}`} className="btn-primary mt-4">{t.button}</Link>
    </aside>
  );
}
