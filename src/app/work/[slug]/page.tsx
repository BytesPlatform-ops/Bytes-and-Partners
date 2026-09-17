import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/data/projects";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { BrowserFrame, DeviceFrame, ScrollingSite } from "@/components/work/Frames";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.category}`,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: {
      title: `${p.name} — ${p.category} · Bytes and Partners`,
      description: p.summary,
      url: `/work/${p.slug}`,
      images: [{ url: p.shots[0].src, width: 1500, height: 938, alt: p.name }],
    },
  };
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === slug);
  const next = projects[(idx + 1) % projects.length];
  const isDevice = project.media === "device";
  const gallery = [...project.shots, ...(project.extra ?? [])];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    about: project.category,
    description: project.summary,
    creator: { "@type": "Organization", name: "Bytes and Partners" },
    dateCreated: project.year,
  };

  return (
    <article className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ---------- hero ---------- */}
      <header className="relative isolate overflow-hidden px-5 pt-36 pb-16 sm:px-8 sm:pt-44 lg:px-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute left-1/2 top-[-18%] h-[640px] w-[1000px] -translate-x-1/2 rounded-full opacity-80 blur-[130px] animate-drift"
            style={{ background: project.accent.glow }}
          />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "88px 88px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000, transparent 76%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000, transparent 76%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-[1320px]">
          <Reveal>
            <Link
              href="/#work"
              className="inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-titanium transition-colors hover:text-white"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All work
            </Link>
          </Reveal>

          <Reveal delay={0.06}>
            <p
              className="mt-8 inline-flex rounded-full px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em]"
              style={{
                color: project.accent.from,
                background: `color-mix(in srgb, ${project.accent.from} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${project.accent.from} 26%, transparent)`,
              }}
            >
              {project.category}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <h1 className="display mt-5 max-w-4xl text-[clamp(2.5rem,6.4vw,5rem)] text-gradient">
              {project.name}
            </h1>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="mt-6 max-w-2xl text-[1.125rem] leading-relaxed text-titanium">
              {project.headline}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] sm:grid-cols-4">
              {project.metrics.map((m) => (
                <div key={m.label} className="bg-[#070810]/80 px-5 py-5 backdrop-blur-xl">
                  <dd className="display text-[1.75rem] text-white">{m.value}</dd>
                  <dt className="mt-1 text-[0.75rem] leading-snug text-titanium-dim">{m.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 grid gap-6 border-t border-white/8 pt-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Client", project.client],
                ["Year", project.year],
                ["Surfaces", project.surfaces],
                ["Scope", project.discipline.join(" · ")],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="eyebrow">{k}</p>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-white">{v}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </header>

      {/* ---------- lead visual ---------- */}
      <section className="px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <Reveal amount={0.15}>
            {isDevice ? (
              <div
                className="glass-edge relative overflow-hidden rounded-3xl border border-white/8"
                style={{
                  background: `radial-gradient(90% 90% at 50% 0%, ${project.accent.glow}, rgba(8,10,16,0.9) 62%)`,
                }}
              >
                <div className="flex items-end justify-center gap-3 px-4 pt-12 sm:gap-5 sm:px-8 sm:pt-16">
                  {project.shots.slice(0, 5).map((s, i) => {
                    const depth = Math.abs(i - 2);
                    return (
                      <div
                        key={s.src}
                        className={[
                          "w-[30%] max-w-[240px] transition-transform duration-700",
                          depth === 2 ? "hidden lg:block" : "",
                          depth === 1 ? "hidden sm:block" : "",
                        ].join(" ")}
                        style={{
                          transform: `translateY(${depth * 26}px) rotate(${(i - 2) * 2.2}deg)`,
                          opacity: 1 - depth * 0.18,
                          zIndex: 10 - depth,
                        }}
                      >
                        <DeviceFrame
                          src={s.src}
                          alt={`${project.name} — ${s.caption}`}
                          priority={depth === 0}
                        />
                      </div>
                    );
                  })}
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#05060a] to-transparent"
                />
              </div>
            ) : (
              <div className="glass-edge overflow-hidden rounded-3xl shadow-lift">
                <Image
                  src={project.shots[0].src}
                  alt={`${project.name} — ${project.shots[0].caption}`}
                  width={1500}
                  height={938}
                  sizes="(max-width: 1320px) 94vw, 1320px"
                  priority
                  className="h-auto w-full"
                />
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ---------- narrative ---------- */}
      <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <h2 className="display text-[clamp(1.75rem,3.2vw,2.6rem)] text-gradient">
                The brief
              </h2>
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-titanium">
                {project.summary}
              </p>
              {project.link && (
                <MagneticButton
                  href={project.link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  variant="outline"
                  className="mt-7 !px-5 !py-2.5 !text-[0.875rem]"
                  strength={0.2}
                >
                  Visit {project.link.label}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M3 9L9 3M9 3H4.5M9 3v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </MagneticButton>
              )}
            </Reveal>
          </div>

          <div className="space-y-12">
            {[
              { k: "Problem", v: project.problem },
              { k: "Solution", v: project.solution },
            ].map((b, i) => (
              <Reveal key={b.k} delay={i * 0.08}>
                <div className="border-l border-white/10 pl-6 sm:pl-8">
                  <p className="eyebrow">{b.k}</p>
                  <p className="mt-4 text-[1.0625rem] leading-relaxed text-white/88">{b.v}</p>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.16}>
              <div className="border-l border-white/10 pl-6 sm:pl-8">
                <p className="eyebrow">Outcome</p>
                <ul className="mt-5 space-y-4">
                  {project.outcome.map((o) => (
                    <li key={o} className="flex gap-3.5 text-[0.9375rem] leading-relaxed text-titanium">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: project.accent.from }}
                      />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="border-l border-white/10 pl-6 sm:pl-8">
                <p className="eyebrow">Stack &amp; integrations</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="glass-soft rounded-full px-3 py-1.5 font-mono text-[0.6875rem] text-titanium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- gallery ---------- */}
      <section className="relative px-5 pb-24 sm:px-8 lg:px-12" aria-label={`${project.name} screens`}>
        <div className="mx-auto max-w-[1320px]">
          <Reveal>
            <div className="flex items-end justify-between gap-6 border-t border-white/8 pt-10">
              <h2 className="display text-[clamp(1.5rem,2.8vw,2.25rem)] text-white">
                Every screen, from the build
              </h2>
              <span className="hidden font-mono text-[0.6875rem] tracking-[0.18em] text-titanium-dim sm:block">
                {String(gallery.length).padStart(2, "0")} VIEWS
              </span>
            </div>
          </Reveal>

          {isDevice ? (
            <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {gallery.map((s, i) =>
                s.src.includes("/web-") ? (
                  <Reveal key={s.src} delay={(i % 4) * 0.05} amount={0.15} className="col-span-2">
                    <BrowserFrame
                      src={s.src}
                      alt={`${project.name} — ${s.caption}`}
                      url={project.link?.label}
                      caption={s.caption}
                    />
                  </Reveal>
                ) : (
                  <Reveal key={s.src} delay={(i % 4) * 0.05} amount={0.15}>
                    <figure className={i % 2 === 1 ? "lg:translate-y-7" : ""}>
                      <DeviceFrame
                        src={s.src}
                        alt={`${project.name} — ${s.caption}`}
                      />
                      <figcaption className="mt-3 font-mono text-[0.6875rem] leading-snug text-titanium-dim">
                        {s.caption}
                      </figcaption>
                    </figure>
                  </Reveal>
                )
              )}
            </div>
          ) : (
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {project.full && (
                <Reveal amount={0.15} className="lg:col-span-2">
                  <div className="glass glass-edge flex flex-col items-center gap-8 rounded-3xl p-6 sm:p-10 lg:flex-row lg:justify-between">
                    <div className="max-w-md">
                      <p className="eyebrow">The full page</p>
                      <h3 className="display mt-4 text-[1.75rem] text-white">
                        Designed as one continuous scroll.
                      </h3>
                      <p className="mt-4 text-[0.9375rem] leading-relaxed text-titanium">
                        Hover the frame to travel the entire page as a visitor sees it —
                        every section, in order, at real proportions.
                      </p>
                    </div>
                    <ScrollingSite
                      src={project.full}
                      alt={`${project.name} full page`}
                      url={project.link?.label}
                      width={400}
                    />
                  </div>
                </Reveal>
              )}
              {gallery.map((s, i) => (
                <Reveal key={s.src} delay={(i % 2) * 0.06} amount={0.15}>
                  <BrowserFrame
                    src={s.src}
                    alt={`${project.name} — ${s.caption}`}
                    url={project.link?.label}
                    caption={s.caption}
                  />
                </Reveal>
              ))}
            </div>
          )}

          {project.note && (
            <Reveal>
              <p className="mt-10 max-w-2xl border-l border-white/10 pl-5 text-[0.8125rem] leading-relaxed text-titanium-dim">
                {project.note}
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {/* ---------- next ---------- */}
      <section className="px-5 pb-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <Link
            href={`/work/${next.slug}`}
            className="group glass glass-edge relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl p-8 transition-all duration-600 hover:shadow-lift sm:flex-row sm:items-center sm:p-12"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style={{ background: `radial-gradient(70% 120% at 100% 50%, ${next.accent.glow}, transparent 70%)` }}
            />
            <div className="relative">
              <p className="eyebrow">Next project</p>
              <p className="display mt-3 text-[clamp(1.75rem,4vw,3rem)] text-white">{next.name}</p>
              <p className="mt-2 text-[0.9375rem] text-titanium">{next.category}</p>
            </div>
            <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/12 text-white transition-all duration-500 group-hover:border-white group-hover:bg-white group-hover:text-[#06070b]">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
      </section>
    </article>
  );
}
