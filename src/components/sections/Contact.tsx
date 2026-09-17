"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";

const INTERESTS = [
  "AI agents & automation",
  "Web application",
  "Mobile app",
  "CRM / internal tools",
  "Website & SEO",
  "Something else",
];

export default function Contact() {
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const company = String(data.get("company") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");

    const body = [
      `Name: ${name}`,
      `Company: ${company}`,
      `Email: ${email}`,
      `Interested in: ${interest}`,
      "",
      message,
    ].join("\n");

    window.location.href = `mailto:info@bytesandpartners.co?subject=${encodeURIComponent(
      `New project enquiry — ${company || name || "Bytes and Partners"}`
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field =
    "w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-[0.9375rem] text-white outline-none transition-colors duration-300 placeholder:text-titanium-dim focus:border-[#4d8dff]/60 focus:bg-white/[0.06]";

  return (
    <section
      id="contact"
      className="relative isolate scroll-mt-24 overflow-hidden px-5 py-28 sm:px-8 sm:py-36 lg:px-12"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-60 blur-[130px] animate-drift"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(77,141,255,0.28), rgba(155,123,255,0.16) 44%, transparent 72%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-gradient-to-r from-[#4d8dff] to-transparent" />
                <span className="eyebrow">Get in touch</span>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display mt-5 text-[clamp(2.25rem,5.4vw,4.25rem)] text-gradient">
                Let&apos;s build
                <br />
                <span className="text-gradient-ai">something serious.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-titanium">
                Tell us what you are building and what is currently in the way. You will
                hear back from the people who would actually do the work — not an
                account manager.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-10 space-y-px overflow-hidden rounded-2xl border border-white/8">
                {[
                  {
                    k: "Email",
                    v: "info@bytesandpartners.co",
                    href: "mailto:info@bytesandpartners.co",
                  },
                  { k: "Phone", v: "+1 (631) 388-9360", href: "tel:+16313889360" },
                  {
                    k: "Studio",
                    v: "675 Hawkins Road East, Coram, NY 11727",
                    href: "https://maps.google.com/?q=675+Hawkins+Road+East,+Coram,+NY+11727",
                  },
                ].map((c) => (
                  <a
                    key={c.k}
                    href={c.href}
                    target={c.k === "Studio" ? "_blank" : undefined}
                    rel={c.k === "Studio" ? "noreferrer noopener" : undefined}
                    className="group flex items-center justify-between gap-4 bg-white/[0.022] px-5 py-4 transition-colors duration-400 hover:bg-white/[0.055]"
                  >
                    <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-titanium-dim">
                      {c.k}
                    </span>
                    <span className="flex items-center gap-2.5 text-right text-[0.9375rem] text-white">
                      {c.v}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                        className="shrink-0 opacity-40 transition-all duration-400 group-hover:translate-x-0.5 group-hover:opacity-100"
                      >
                        <path d="M3 9L9 3M9 3H4.5M9 3v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} amount={0.2}>
            <form onSubmit={onSubmit} className="glass glass-edge rounded-3xl p-6 shadow-lift sm:p-8">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-titanium-dim">
                    Name
                  </span>
                  <input name="name" required placeholder="Jane Smith" className={field} />
                </label>
                <label className="block">
                  <span className="mb-2 block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-titanium-dim">
                    Company
                  </span>
                  <input name="company" placeholder="Acme Inc." className={field} />
                </label>
              </div>

              <label className="mt-3.5 block">
                <span className="mb-2 block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-titanium-dim">
                  Email
                </span>
                <input type="email" name="email" required placeholder="jane@company.com" className={field} />
              </label>

              <fieldset className="mt-5">
                <legend className="mb-2.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-titanium-dim">
                  Interested in
                </legend>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInterest(i)}
                      aria-pressed={interest === i}
                      className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-all duration-300 ${
                        interest === i
                          ? "border-[#4d8dff]/60 bg-[#4d8dff]/14 text-white"
                          : "border-white/10 text-titanium hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="mt-5 block">
                <span className="mb-2 block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-titanium-dim">
                  Project
                </span>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="What are you building, and what is in the way?"
                  className={`${field} resize-none`}
                />
              </label>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <MagneticButton strength={0.22}>
                  Start the conversation
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </MagneticButton>
                <p className="text-[0.75rem] leading-snug text-titanium-dim" role="status">
                  {sent
                    ? "Opening your email client — if nothing happens, write to info@bytesandpartners.co"
                    : "Opens in your email client. Typical reply within one business day."}
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
