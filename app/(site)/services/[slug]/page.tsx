import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideView } from "@/components/GuideView";
import { GUIDES } from "@/lib/guides";
import { getLocale } from "@/lib/i18n/server";

// Rendered per request so the page follows the visitor's language cookie.
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = Object.hasOwn(GUIDES, params.slug) ? GUIDES[params.slug] : undefined;
  return { title: g ? g.title[getLocale()] : undefined };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = Object.hasOwn(GUIDES, params.slug) ? GUIDES[params.slug] : undefined;
  if (!g) notFound();
  return <GuideView guide={g} />;
}
