"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import type { Project } from "@/data/projects";
import { BrowserFrame, DeviceFrame, ScrollingSite } from "./Frames";
import { clamp } from "@/lib/utils";

export default function ProjectShowcase({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastUser = useRef(0);

  const [pin, setPin] = useState(false);
  const [extraScroll, setExtraScroll] = useState(0);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const glow = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const measure = () => {
      const enable = mq.matches && !reduce.matches;
      setPin(enable);
      const el = trackRef.current;
      if (!el || !enable) {
        setExtraScroll(0);
        return;
      }
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      // compress: horizontal travel outruns vertical scroll, capped at 2 viewports
      setExtraScroll(Math.min(max * 0.58, window.innerHeight * 2));
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 700);

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setProgress(clamp(p, 0, 1));
    const el = trackRef.current;
    if (!pin || !el) return;
    if (Date.now() - lastUser.current < 1100) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    el.scrollLeft = clamp(p, 0, 1) * max;
  });

  const markUser = () => {
    lastUser.current = Date.now();
  };

  const isDevice = project.media === "device";
  const shots = project.shots;

  return (
    <section
      ref={sectionRef}
      id={project.slug}
      aria-labelledby={`${project.slug}-title`}
      className="relative scroll-mt-20"
      style={{ height: pin ? `calc(100svh + ${extraScroll}px)` : undefined }}
    >
      <div className={pin ? "sticky top-0 h-[100svh] overflow-hidden" : "relative overflow-hidden py-20"}>
        {/* accent atmosphere */}
        <motion.div
          aria-hidden
          style={{ opacity: pin ? glow : 0.7 }}
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div
            className="absolute -left-[10%] top-[10%] h-[560px] w-[560px] rounded-full blur-[130px]"
            style={{ background: project.accent.glow }}
          />
          <div
            className="absolute -right-[6%] bottom-[4%] h-[420px] w-[420px] rounded-full opacity-70 blur-[120px]"
            style={{ background: project.accent.glow }}
          />
        </motion.div>

        <div className="mx-auto flex h-full max-w-[1520px] flex-col justify-center px-5 sm:px-8 lg:px-12">
          <div className="grid h-full grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)] lg:gap-12">
            {/* ---------- left: the brief ---------- */}
            <div className="relative min-w-0 lg:py-10">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[0.6875rem] tracking-[0.2em] text-titanium-dim">
                  {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <p
                className="mt-6 inline-flex rounded-full px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em]"
                style={{
                  color: project.accent.from,
                  background: `color-mix(in srgb, ${project.accent.from} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${project.accent.from} 26%, transparent)`,
                }}
              >
                {project.category}
              </p>

              <h3
                id={`${project.slug}-title`}
                className="display mt-4 text-[clamp(2rem,3.6vw,3.25rem)] text-white"
              >
                {project.name}
              </h3>

              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-titanium">
                {project.headline}
              </p>

              <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/8 pt-6">
                {project.metrics.slice(0, 4).map((m) => (
                  <div key={m.label}>
                    <dt className="sr-only">{m.label}</dt>
                    <dd className="display text-[1.4rem] text-white">{m.value}</dd>
                    <p className="mt-0.5 text-[0.75rem] leading-snug text-titanium-dim">{m.label}</p>
                  </div>
                ))}
              </dl>

              <div className="mt-7 flex flex-wrap gap-1.5">
                {project.tech.slice(0, 5).map((t) => (
                  <span
                    key={t}
                    className="glass-soft rounded-full px-2.5 py-1 font-mono text-[0.625rem] text-titanium"
                  >
                    {t}
                  </span>
                ))}
                {project.tech.length > 5 && (
                  <span className="rounded-full px-2.5 py-1 font-mono text-[0.625rem] text-titanium-dim">
                    +{project.tech.length - 5}
                  </span>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={`/work/${project.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[0.875rem] font-medium text-[#06070b] transition-transform duration-400 hover:scale-[1.03]"
                >
                  View case study
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform duration-400 group-hover:translate-x-0.5">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                {project.link && (
                  <a
                    href={project.link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 font-mono text-[0.75rem] text-titanium transition-colors hover:text-white"
                  >
                    {project.link.label}
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M3 9L9 3M9 3H4.5M9 3v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                )}
              </div>

              {pin && (
                <div className="mt-9 hidden lg:block">
                  <div className="h-px w-full bg-white/8">
                    <div
                      className="h-px transition-none"
                      style={{
                        width: `${progress * 100}%`,
                        background: `linear-gradient(90deg, ${project.accent.from}, ${project.accent.to})`,
                      }}
                    />
                  </div>
                  <p className="mt-2.5 font-mono text-[0.625rem] tracking-[0.14em] text-titanium-dim">
                    SCROLL OR DRAG · {Math.min(shots.length, 10) + (project.extra?.length ?? 0)} SCREENS
                  </p>
                </div>
              )}
            </div>

            {/* ---------- right: the showcase track ---------- */}
            <div className="relative min-w-0 -mr-5 sm:-mr-8 lg:-mr-12">
              <div
                ref={trackRef}
                onPointerDown={markUser}
                onWheel={markUser}
                onTouchStart={markUser}
                className="scrollbar-none flex snap-x snap-mandatory items-center gap-5 overflow-x-auto overscroll-x-contain py-6 pr-5 sm:gap-6 sm:pr-8 lg:snap-none lg:pr-12"
                style={{ scrollBehavior: "auto" }}
                aria-label={`${project.name} screens`}
              >
                {project.full && (
                  <div className="snap-center">
                    <ScrollingSite
                      src={project.full}
                      alt={`${project.name} full page`}
                      url={project.link?.label ?? project.name.toLowerCase().replace(/[^a-z]/g, "") + ".com"}
                      width={isDevice ? 360 : 400}
                    />
                  </div>
                )}

                {shots.slice(0, 10).map((s, i) => (
                  <div key={s.src} className="snap-center">
                    {isDevice ? (
                      <figure className={`shrink-0 ${i % 2 === 1 ? "lg:translate-y-8" : ""}`}>
                        <DeviceFrame
                          src={s.src}
                          alt={`${project.name} — ${s.caption}`}
                          priority={index === 0 && i < 2}
                          width={272}
                        />
                        <figcaption className="mt-3 max-w-[272px] font-mono text-[0.6875rem] leading-snug text-titanium-dim">
                          {s.caption}
                        </figcaption>
                      </figure>
                    ) : (
                      <BrowserFrame
                        src={s.src}
                        alt={`${project.name} — ${s.caption}`}
                        url={project.link?.label}
                        priority={index === 0 && i < 2}
                        width={660}
                        caption={s.caption}
                      />
                    )}
                  </div>
                ))}

                {project.extra?.map((s) => (
                  <div key={s.src} className="snap-center">
                    <BrowserFrame
                      src={s.src}
                      alt={`${project.name} — ${s.caption}`}
                      url={project.link?.label}
                      width={isDevice ? 720 : 620}
                      caption={s.caption}
                    />
                  </div>
                ))}

                <div className="flex w-[260px] shrink-0 flex-col justify-center gap-4 pl-2">
                  <p className="text-[0.9375rem] leading-relaxed text-titanium">
                    {project.summary}
                  </p>
                  <Link
                    href={`/work/${project.slug}`}
                    className="inline-flex w-fit items-center gap-2 border-b border-white/25 pb-1 text-[0.875rem] text-white transition-colors hover:border-white"
                  >
                    Read the full case study
                  </Link>
                </div>
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-[#05060a] to-transparent lg:block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
