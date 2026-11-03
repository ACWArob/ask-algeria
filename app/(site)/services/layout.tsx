import { PrepareCta } from "@/components/PrepareCta";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

/** Service guides, plus a link to "Prepare my file" when the guide has a printable packet. */
export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const dict = getDict(getLocale());
  return (
    <>
      {children}
      <PrepareCta t={dict.prepare.cta} />
    </>
  );
}
