import Link from "next/link";
import Image from "next/image";
import { projects } from "@/data/projects";
import ProjectShowcase from "@/components/work/ProjectShowcase";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const FEATURED = [
  "quantiva-hq",
  "nonnis-placement",
  "benavente-group",
  "angels-of-cascades",
  "aegis-creek",
];

export default function Work() {
  const featured = FEATURED.map((s) => projects.find((p) => p.slug === s)!).filter(Boolean);
  const rest = projects.filter((p) => !FEATURED.includes(p.slug));

  return (
    <section id="work" className="relative scroll-mt-20">
      <div className="px-5 pt-28 pb-4 sm:px-8 sm:pt-36 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <SectionHeading
            eyebrow="Selected work"
            title={
              <>
                Products in production,
                <br />
                not concepts in a deck.
              </>
            }
            lead="Every screen below is from a shipped build — an approved App Store release, a live web platform, a site running search traffic today. Scroll each project to move through it."
          />
        </div>
      </div>

      {featured.map((p, i) => (
        <ProjectShowcase key={p.slug} project={p} index={i} total={projects.length} />
      ))}

      {/* ---------- remaining work ---------- */}
      <div className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <h3 className="display text-[clamp(1.5rem,2.6vw,2.25rem)] text-white">
                Also in the studio
              </h3>
              <span className="hidden font-mono text-[0.6875rem] tracking-[0.18em] text-titanium-dim sm:block">
                {String(rest.length).padStart(2, "0")} PROJECTS
              </span>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08} amount={0.2}>
                <Link
                  href={`/work/${p.slug}`}
                  className="group glass glass-edge relative block overflow-hidden rounded-3xl p-3 transition-all duration-600 hover:shadow-lift"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    style={{ background: `radial-gradient(90% 60% at 50% 0%, ${p.accent.glow}, transparent 70%)` }}
                  />
                  <div className="relative overflow-hidden rounded-2xl bg-[#0a0b10]">
                    <Image
                      src={p.shots[0].src}
                      alt={`${p.name} — ${p.shots[0].caption}`}
                      width={1500}
                      height={938}
                      sizes="(max-width: 768px) 92vw, 620px"
                      className="h-auto w-full transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05060a]/80 via-transparent to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-3 flex-wrap gap-1.5 p-4 opacity-0 transition-all duration-600 group-hover:translate-y-0 group-hover:opacity-100">
                      {p.tech.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/12 bg-black/50 px-2.5 py-1 font-mono text-[0.625rem] text-white/80 backdrop-blur-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="relative flex items-end justify-between gap-4 px-3 pb-2 pt-5">
                    <div>
                      <p
                        className="font-mono text-[0.625rem] uppercase tracking-[0.18em]"
                        style={{ color: p.accent.from }}
                      >
                        {p.category}
                      </p>
                      <p className="mt-1.5 text-[1.125rem] font-medium tracking-[-0.02em] text-white">
                        {p.name}
                      </p>
                      <p className="mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-titanium">
                        {p.headline}
                      </p>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 text-white transition-all duration-500 group-hover:border-white/40 group-hover:bg-white group-hover:text-[#06070b]">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M4 12L12 4M12 4H6M12 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
