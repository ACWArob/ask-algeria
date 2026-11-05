import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVars } from "./fonts";
import { getDict, htmlLang, isRtl } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { isPublic, SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDict((await getLocale()));
  return {
    title: { default: dict.brand.name, template: `%s · ${dict.brand.name}` },
    description: dict.brand.tagline,
    metadataBase: new URL(SITE_URL),
    // The independence notice goes into link previews too, so a shared link never looks like a government site.
    openGraph: { type: "website", siteName: dict.brand.name, title: `${dict.brand.name} · ${dict.strip.independent}`, description: dict.brand.tagline, url: "/" },
    robots: isPublic()
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F6FB" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1424" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={htmlLang(locale)} dir={isRtl(locale) ? "rtl" : "ltr"} className={fontVars}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
