import { cookies, headers } from "next/headers";
import { COOKIE } from "@/lib/config";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./index";

/** Locale from cookie, then Accept-Language, then default. */
export function getLocale(): Locale {
  const c = cookies().get(COOKIE.lang)?.value;
  if (isLocale(c)) return c;
  const al = headers().get("accept-language")?.toLowerCase() ?? "";
  if (al.startsWith("ar")) return "ar";
  if (al.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}
