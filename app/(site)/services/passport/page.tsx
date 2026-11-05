import type { Metadata } from "next";
import { GuideView } from "@/components/GuideView";
import { PASSPORT_GUIDE } from "@/lib/guides/passport";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: PASSPORT_GUIDE.title[(await getLocale())] };
}

export default async function PassportGuidePage() {
  return <GuideView guide={PASSPORT_GUIDE} />;
}
