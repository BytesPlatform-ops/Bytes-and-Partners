import Link from "next/link";
import Logo from "./Logo";
import { projects } from "@/data/projects";

const SERVICES = [
  "AI Agents & Automation",
  "Web Applications",
  "Mobile Applications",
  "CRM & Business Systems",
  "AI Consulting",
  "Custom Software",
];

const COMPANY = [
  { label: "About the studio", href: "/#about" },
  { label: "How we work", href: "/#services" },
  { label: "Selected work", href: "/#work" },
  { label: "Contact", href: "/#contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/8 px-5 pt-20 pb-10 sm:px-8 lg:px-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -bottom-[42%] left-1/2 h-[620px] w-[1100px] -translate-x-1/2 rounded-full opacity-45 blur-[130px] animate-drift"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(77,141,255,0.30), rgba(155,123,255,0.16) 46%, transparent 74%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,2fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-titanium">
              Building intelligent digital experiences — AI-powered products, scalable
              applications and the systems that run behind them.
            </p>
            <p className="mt-4 max-w-xs text-[0.8125rem] leading-relaxed text-titanium-dim">
              Delivered through <span className="text-titanium">BytesPlatform</span>, our
              technology platform and subsidiary.
            </p>
            <div className="mt-7 flex gap-2.5">
              {[
                {
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/company/bytes-and-partners",
                  d: "M4.5 6.5v7M4.5 3.6v.1M8 13.5v-4a2 2 0 0 1 4 0v4",
                },
                { label: "Email", href: "mailto:info@bytesandpartners.co", d: "M2 5l6 4 6-4M2 4.5h12v7H2z" },
                { label: "Phone", href: "tel:+16313889360", d: "M3 3.5h3l1 3-1.5 1a8 8 0 0 0 4 4l1-1.5 3 1v3a12 12 0 0 1-10.5-10.5Z" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noreferrer noopener" : undefined}
                  aria-label={s.label}
                  className="glass grid h-10 w-10 place-items-center rounded-xl text-titanium transition-all duration-400 hover:border-white/25 hover:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d={s.d} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <nav aria-label="Services">
              <h2 className="eyebrow">Services</h2>
              <ul className="mt-5 space-y-2.5">
                {SERVICES.map((s) => (
                  <li key={s}>
                    <Link
                      href="/#services"
                      className="text-[0.875rem] text-titanium transition-colors duration-300 hover:text-white"
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Projects">
              <h2 className="eyebrow">Projects</h2>
              <ul className="mt-5 space-y-2.5">
                {projects.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/work/${p.slug}`}
                      className="text-[0.875rem] text-titanium transition-colors duration-300 hover:text-white"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <nav aria-label="Company">
                <h2 className="eyebrow">Company</h2>
                <ul className="mt-5 space-y-2.5">
                  {COMPANY.map((c) => (
                    <li key={c.href}>
                      <Link
                        href={c.href}
                        className="text-[0.875rem] text-titanium transition-colors duration-300 hover:text-white"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <h2 className="eyebrow mt-9">Contact</h2>
              <address className="mt-5 space-y-2.5 not-italic">
                <a
                  href="mailto:info@bytesandpartners.co"
                  className="block text-[0.875rem] text-titanium transition-colors hover:text-white"
                >
                  info@bytesandpartners.co
                </a>
                <a
                  href="tel:+16313889360"
                  className="block text-[0.875rem] text-titanium transition-colors hover:text-white"
                >
                  +1 (631) 388-9360
                </a>
                <p className="text-[0.875rem] leading-relaxed text-titanium-dim">
                  675 Hawkins Road East
                  <br />
                  Coram, NY 11727
                </p>
              </address>
            </div>
          </div>
        </div>

        {/* wordmark */}
        <div className="mask-fade-b relative mt-20 select-none" aria-hidden>
          <p className="display-tight whitespace-nowrap text-center text-[clamp(1.75rem,9vw,8.25rem)] font-medium leading-none text-transparent [-webkit-background-clip:text] [background-clip:text]"
             style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02))" }}>
            Bytes and Partners
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-7 sm:flex-row">
          <p className="font-mono text-[0.6875rem] text-titanium-dim">
            © {year} Bytes and Partners. All rights reserved.
          </p>
          <p className="font-mono text-[0.6875rem] text-titanium-dim">
            Designed &amp; engineered in-house · New York
          </p>
        </div>
      </div>
    </footer>
  );
}
