import { cookies, headers } from "next/headers";
import { COOKIE } from "@/lib/config";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./index";

/** Locale from cookie, then Accept-Language, then default. */
export async function getLocale(): Promise<Locale> {
  const c = (await cookies()).get(COOKIE.lang)?.value;
  if (isLocale(c)) return c;
  const al = (await headers()).get("accept-language")?.toLowerCase() ?? "";
  if (al.startsWith("ar")) return "ar";
  if (al.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}
