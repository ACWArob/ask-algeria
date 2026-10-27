import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVars } from "./fonts";
import { getDict, htmlLang, isRtl } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const dict = getDict(getLocale());
  return {
    title: { default: dict.brand.name, template: `%s · ${dict.brand.name}` },
    description: dict.brand.tagline,
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={htmlLang(locale)} dir={isRtl(locale) ? "rtl" : "ltr"} className={fontVars}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
