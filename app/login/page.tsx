import type { Metadata } from "next";
import { PageBackdrop } from "@/components/Backdrop";
import { Footer, Header, IndependenceStrip } from "@/components/Header";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Login" };

type ErrorKey = "error" | "tooMany" | "notConfigured";

export default function LoginPage({ searchParams }: { searchParams: { error?: string; next?: string } }) {
  const locale = getLocale();
  const dict = getDict(locale);
  const err = (["error", "tooMany", "notConfigured"] as const).includes(searchParams.error as ErrorKey)
    ? dict.login[searchParams.error as ErrorKey]
    : null;
  const next = typeof searchParams.next === "string" && searchParams.next.startsWith("/") && !searchParams.next.startsWith("//") ? searchParams.next : "/";

  return (
    <>
      <PageBackdrop strong />
      <IndependenceStrip dict={dict} />
      <Header dict={dict} locale={locale} authed={false} />
      <main id="main" className="mx-auto flex max-w-5xl justify-center px-4 pt-12 sm:pt-20">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-line border-t-4 border-t-brand bg-surface px-6 py-10 text-center">
            <h1 className="display text-3xl font-bold">{dict.login.title}</h1>
            <p className="mt-3 text-muted">{dict.login.intro}</p>
            <form action="/api/login" method="post" className="mt-8 space-y-4 text-start">
              <input type="hidden" name="next" value={next} />
              <div>
                <label htmlFor="password" className="mb-1.5 block font-semibold">{dict.login.password}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  autoFocus
                  className="field"
                  aria-invalid={err ? true : undefined}
                  aria-describedby={err ? "login-error" : undefined}
                />
              </div>
              {err && (
                <p id="login-error" role="alert" className="text-sm font-semibold text-alert">{err}</p>
              )}
              <button type="submit" className="btn-primary w-full">{dict.login.submit}</button>
            </form>
          </div>
          <p className="mt-6 text-center text-sm text-muted">{dict.brand.tagline}</p>
        </div>
      </main>
      <Footer dict={dict} authed={false} />
    </>
  );
}
