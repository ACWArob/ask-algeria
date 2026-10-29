import type { Metadata } from "next";
import { GuideView } from "@/components/GuideView";
import { PASSPORT_GUIDE } from "@/lib/guides/passport";
import { getLocale } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: PASSPORT_GUIDE.title[getLocale()] };
}

export default function PassportGuidePage() {
  return <GuideView guide={PASSPORT_GUIDE} />;
}
