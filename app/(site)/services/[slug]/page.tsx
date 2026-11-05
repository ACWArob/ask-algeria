import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideView } from "@/components/GuideView";
import { GUIDES } from "@/lib/guides";
import { getLocale } from "@/lib/i18n/server";

// Rendered per request so the page follows the visitor's language cookie.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = Object.hasOwn(GUIDES, slug) ? GUIDES[slug] : undefined;
  return { title: g ? g.title[(await getLocale())] : undefined };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = Object.hasOwn(GUIDES, slug) ? GUIDES[slug] : undefined;
  if (!g) notFound();
  return <GuideView guide={g} />;
}
