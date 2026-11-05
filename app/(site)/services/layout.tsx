import { PrepareCta } from "@/components/PrepareCta";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

/** Service guides, plus a link to "Prepare my file" when the guide has a printable packet. */
export default async function ServicesLayout({ children }: { children: React.ReactNode }) {
  const dict = getDict((await getLocale()));
  return (
    <>
      {children}
      <PrepareCta t={dict.prepare.cta} />
    </>
  );
}
