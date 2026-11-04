"use client";

import { useState } from "react";
import type { Dict, Locale } from "@/lib/i18n";

/** "Contact us" form (About page). Sends the message to /api/feedback; nothing is stored in the browser. */
export function ContactForm({ dict, locale }: { dict: Dict; locale: Locale }) {
  const c = dict.about.contact;
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 3 || state === "sending") return;
    setState("sending");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "contact", message, replyTo: email, lang: locale }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState("sent");
      setMessage("");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={send} className="mt-5 max-w-prose space-y-4" noValidate>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block font-semibold">{c.message}</label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (state !== "sending") setState("idle");
          }}
          rows={5}
          maxLength={2000}
          dir="auto"
          required
          aria-describedby="contact-note"
          className="field"
        />
        <p id="contact-note" className="mt-1.5 text-sm text-muted">{c.noPersonal}</p>
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block font-semibold">{c.email}</label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          dir="ltr"
          maxLength={254}
          aria-describedby="contact-email-hint"
          className="field"
        />
        <p id="contact-email-hint" className="mt-1.5 text-sm text-muted">{c.emailHint}</p>
      </div>
      <button type="submit" className="btn-primary" disabled={state === "sending" || message.trim().length < 3}>
        {state === "sending" ? c.sending : c.send}
      </button>
      <p role="status" aria-live="polite" className="min-h-[1.5rem] text-sm font-semibold">
        {state === "sent" && <span className="text-brand">{c.sent}</span>}
        {state === "error" && <span className="text-accent">{c.error}</span>}
      </p>
    </form>
  );
}
