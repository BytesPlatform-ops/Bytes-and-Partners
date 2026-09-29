"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/animation/prefs";
import { jumpTo } from "@/lib/animation/scroll";
import { createDiveScene } from "@/lib/fluid/diveScene";
import ActionPill from "@/components/ui/ActionPill";
import "./ServicesSection.css";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = ["Web development", "SEO", "App development", "Marketing"] as const;

export default function ServicesSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    const handoff = section?.querySelector<HTMLElement>("[data-services-handoff]");
    const stage = section?.querySelector<HTMLElement>("[data-services-stage]");
    const pillWrap = section?.querySelector<HTMLElement>("[data-services-pill-wrap]");
    const pill = section?.querySelector<HTMLElement>("[data-services-pill]");
    const overlay = document.querySelector<HTMLElement>("[data-services-dive-overlay]");
    const canvasLayer = document.querySelector<HTMLCanvasElement>("[data-intro-canvas]")?.parentElement;
    const next = document.querySelector<HTMLElement>("[data-featured-work]");
    if (!section || !handoff || !stage || !pillWrap || !pill || !overlay || !next) return;

    const reduced = prefersReducedMotion();
    const context = gsap.context(() => {
      if (reduced) return;
      const upperWords = gsap.utils.toArray<HTMLElement>("[data-heading-upper] > span");
      const lowerWords = gsap.utils.toArray<HTMLElement>("[data-heading-lower] > span");
      const heading = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 72%", toggleActions: "play none none reverse" } });
      heading
        .fromTo(upperWords, { xPercent: -135, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.15, stagger: { each: 0.12, from: "end" }, ease: "expo.out" })
        .fromTo(lowerWords, { xPercent: 120, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: "expo.out" }, 0.16);

      const cards = gsap.utils.toArray<HTMLElement>("[data-service-card]");
      const pillRect = pill.getBoundingClientRect();
      const cardStarts = cards.map((card) => {
        const cardRect = card.getBoundingClientRect();
        return {
          x: pillRect.left + pillRect.width / 2 - cardRect.left - cardRect.width / 2,
          y: pillRect.top + pillRect.height / 2 - cardRect.top - cardRect.height / 2,
        };
      });
      const constellation = gsap.timeline({
        scrollTrigger: { trigger: handoff, start: "top 48%", end: "top top", scrub: 0.65 },
      });
      constellation.fromTo(pillWrap,
        { scale: 0.52, opacity: 0, filter: "blur(16px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.34, ease: "power3.out" });
      constellation.fromTo(cards, {
        x: (index) => cardStarts[index].x,
        y: (index) => cardStarts[index].y,
        scale: 0.035,
        opacity: 0.35,
        transformOrigin: "50% 50%",
      }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.68, stagger: 0.07, ease: "power3.out" }, 0.28);

    }, section);

    const dive = reduced ? null : createDiveScene({
      section: handoff,
      layers: canvasLayer ? [canvasLayer, stage] : [stage],
      pill,
      overlay,
      next,
      nextContent: () => next.querySelector<HTMLElement>("[data-work-canvas]"),
      startOffset: () => window.innerHeight * 0.04,
      ready: () => true,
      freeze: () => window.dispatchEvent(new Event("intro:dive-freeze")),
      thaw: () => window.dispatchEvent(new Event("intro:dive-thaw")),
      suspendOthers: () => {},
    });
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      dive?.kill();
      context.revert();
    };
  }, []);

  const enterWork = () => {
    const handoff = root.current?.querySelector<HTMLElement>("[data-services-handoff]");
    if (!handoff) return;
    jumpTo(handoff.getBoundingClientRect().top + window.scrollY + window.innerHeight * 0.05);
  };

  return (
    <section id="services" ref={root} data-services className="services-section relative">
      <header className="services-heading relative z-[2] overflow-hidden px-[var(--bp-gut)] py-[clamp(6rem,12vw,12rem)]">
        <h2 className="mx-auto w-full max-w-[1800px] text-[clamp(4.25rem,10.8vw,12rem)] font-normal leading-[0.9] tracking-[-0.075em] text-ink">
          <span data-heading-upper className="flex flex-wrap gap-x-[0.22em]">
            <span>What</span><span>we</span><span>do,</span>
          </span>
          <span data-heading-lower className="flex flex-wrap gap-x-[0.22em] lg:pl-[8%]">
            <span>built</span><span>to</span><span>perform.</span>
          </span>
        </h2>
      </header>

      <div data-services-handoff className="services-handoff relative z-[2] h-[106svh]" aria-label="Our services">
        <div data-services-stage className="services-stage sticky top-0 h-[100svh] overflow-hidden px-[var(--bp-gut)]">
          <div className="relative mx-auto h-full max-w-[1800px]">
            <div data-services-pill-wrap className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <ActionPill portal label="View featured work" onClick={enterWork} className="pointer-events-auto" />
            </div>

            {SERVICES.map((service, index) => (
              <div data-service-card key={service} className={`service-orbit-card service-orbit-card--${index + 1} absolute z-10`}>
                <div data-service-float data-service-card-visual className="service-orbit-card__float">
                  <div data-service-surface className="service-orbit-card__surface">
                    <button type="button" aria-label={service} className="service-orbit-card__body h-full w-full rounded-[1.6rem] bg-transparent focus-visible:outline-2 focus-visible:outline-blue" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
