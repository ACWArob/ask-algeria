"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Dict, Locale } from "@/lib/i18n";
import type { Service } from "@/lib/services";
import type { WhereOptions } from "@/lib/where";
import { AskClient, type AskHandle } from "./AskClient";
import { HeroBackdrop } from "./Backdrop";
import { ExternalIcon, Icon } from "./Icon";

export function HomeClient({ dict, locale, services, places }: { dict: Dict; locale: Locale; services: Service[]; places: WhereOptions }) {
  const askRef = useRef<AskHandle>(null);
  const [active, setActive] = useState(false);
  const s = dict.services;

  return (
    <>
      {/* Full-bleed wrapper so the scene spans the viewport; html/body clip horizontal overflow. */}
      <div className={`relative isolate mx-[calc(50%-50vw)] px-[calc(50vw-50%)] ${active ? "" : "-mt-px"}`}>
        {!active && <HeroBackdrop />}
      <section className={`mx-auto max-w-3xl ${active ? "pt-8" : "flex min-h-[calc(100svh-12.5rem)] flex-col sm:min-h-[calc(100svh-6rem)] justify-center pb-[132px] pt-6 sm:pb-[260px] sm:pt-10"}`}>
        {!active && (
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="display text-[2.25rem] font-semibold sm:text-5xl">{dict.ask.greeting}</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted">{dict.ask.sub}</p>
          </div>
        )}
        <AskClient ref={askRef} dict={dict} locale={locale} places={places} onActiveChange={setActive} />
      </section>
      </div>

      <section aria-labelledby="popular" className={`pt-12 ${active ? "mt-12 border-t border-line" : ""}`}>
        <h2 id="popular" className="display text-2xl font-semibold">{s.heading}</h2>
        <p className="mt-1 text-muted">{s.sub}</p>
        <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {services.map((svc) => (
            <li key={svc.id} className="flex gap-4 border-b border-line py-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Icon name={svc.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold leading-snug">
                  {svc.page ? (
                    <Link href={svc.page} className="hover:text-brand hover:underline hover:underline-offset-4">{svc.name[locale]}</Link>
                  ) : (
                    svc.name[locale]
                  )}
                </h3>
                <p className="mt-0.5 text-[0.9375rem] text-muted">{svc.line[locale]}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <button
                    type="button"
                    onClick={() => askRef.current?.ask(svc.question[locale])}
                    className="min-h-[36px] rounded-full bg-brand px-3.5 font-semibold text-brand-ink hover:bg-brand/90"
                  >
                    {s.askAbout}
                  </button>
                  {svc.portals.map((p) => (
                    <a
                      key={p.url}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link inline-flex min-h-[36px] items-center gap-1 font-semibold"
                    >
                      {s.portal}
                      {p.label ? ` · ${p.label[locale]}` : ""}
                      <ExternalIcon />
                      <span className="sr-only">({s.opensNew})</span>
                    </a>
                  ))}
                </div>
              </div>
            </li>
          ))}
          <li className="flex gap-4 border-b border-line py-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Icon name="embassy" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold leading-snug">
                <Link href="/embassies" className="hover:text-brand hover:underline hover:underline-offset-4">{dict.embassies.homeName}</Link>
              </h3>
              <p className="mt-0.5 text-[0.9375rem] text-muted">{dict.embassies.homeLine}</p>
              <div className="mt-3 text-sm">
                <Link href="/embassies" className="inline-flex min-h-[36px] items-center rounded-full bg-brand px-3.5 font-semibold text-brand-ink hover:bg-brand/90">
                  {dict.embassies.homeCta}
                </Link>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </>
  );
}
