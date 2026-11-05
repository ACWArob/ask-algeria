import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

/** 404 inside the site layout (a guide or consulate that doesn't exist): the layout already has the strip and header. */
export default async function SiteNotFound() {
  const dict = getDict((await getLocale()));
  return (
    <div className="pb-16 pt-14">
      <h1 className="display text-4xl font-bold sm:text-5xl">{dict.notFound.title}</h1>
      <p className="mt-4 max-w-prose text-lg text-muted">{dict.notFound.body}</p>
      <p className="mt-8 flex flex-wrap gap-4">
        <Link href="/" className="btn-primary">{dict.nav.ask}</Link>
        <Link href="/directory" className="btn-quiet">{dict.nav.directory}</Link>
      </p>
    </div>
  );
}
