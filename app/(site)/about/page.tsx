import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getDict(getLocale()).about.title };
}

export default function AboutPage() {
  const locale = getLocale();
  const dict = getDict(locale);
  // Optional public address for the team (set CONTACT_EMAIL on the host); the form works without it.
  const email = process.env.CONTACT_EMAIL && /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(process.env.CONTACT_EMAIL) ? process.env.CONTACT_EMAIL : null;
  const a = dict.about;
  const [how, notGov, privacy, neutral] = a.sections;
  return (
    <div className="pt-10 sm:pt-14">
      <h1 className="display text-4xl font-bold sm:text-5xl">{a.title}</h1>
      <p className="mt-5 max-w-prose text-xl leading-relaxed">{a.lead}</p>

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <section aria-labelledby="how">
          <h2 id="how" className="display text-2xl font-semibold">{how.title}</h2>
          <ol className="mt-5 space-y-5">
            {how.body.map((p, i) => (
              <li key={i} className="flex gap-4">
                <span aria-hidden="true" className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-brand-ink">
                  {i + 1}
                </span>
                <p className="pt-1">{p}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="notgov" className="rounded-3xl border border-line border-t-4 border-t-accent bg-surface px-6 py-7 sm:px-8">
          <h2 id="notgov" className="display text-2xl font-semibold">{notGov.title}</h2>
          <ul className="mt-5 list-disc space-y-3 ps-5 marker:text-brand">
            {notGov.body.map((p, i) => (
              <li key={i} className={i === 0 ? "font-semibold" : ""}>{p}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="privacy">
          <h2 id="privacy" className="display text-2xl font-semibold">{privacy.title}</h2>
          <ul className="mt-5 list-disc space-y-3 ps-5 marker:text-brand">
            {privacy.body.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </section>

        <section aria-labelledby="neutral">
          <h2 id="neutral" className="display text-2xl font-semibold">{neutral.title}</h2>
          {neutral.body.map((p, i) => <p key={i} className="mt-5">{p}</p>)}
        </section>
      </div>

      <section id="contact" aria-labelledby="contact-title" className="mt-16 scroll-mt-24 rounded-3xl border border-line bg-surface px-6 py-7 sm:px-8">
        <h2 id="contact-title" className="display text-2xl font-semibold">{a.contact.title}</h2>
        <p className="mt-3 max-w-prose">{a.contact.lead}</p>
        <p className="mt-2 max-w-prose text-sm text-muted">{a.contact.independent}</p>
        <ContactForm dict={dict} locale={locale} />
        {email && (
          <p className="mt-2 text-sm">
            {a.contact.emailUs}{" "}
            <a href={`mailto:${email}`} className="link font-semibold" dir="ltr">{email}</a>
          </p>
        )}
      </section>

      <p className="mt-16 flex flex-wrap gap-4">
        <Link href="/" className="btn-primary">{dict.nav.ask}</Link>
        <Link href="/directory" className="btn-quiet">{dict.nav.directory}</Link>
      </p>
    </div>
  );
}
