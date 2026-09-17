"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
import ServiceVisual from "./ServiceVisual";

const SERVICES = [
  {
    id: 1,
    no: "01",
    title: "AI Agents & Automation",
    blurb:
      "Autonomous systems that read context, make a decision and write the result back into the tools your team already uses.",
    points: ["Multi-step agent orchestration", "RAG & vector retrieval", "Voice and chat interfaces", "Human-in-the-loop review"],
    tint: "rgba(88,230,255,0.10)",
  },
  {
    id: 2,
    no: "02",
    title: "Web Applications",
    blurb:
      "Production web platforms — dashboards, marketplaces, portals — built to stay fast as the data and the team grow.",
    points: ["Next.js & React architecture", "Design systems", "Realtime data surfaces", "Role-based access"],
    tint: "rgba(77,141,255,0.10)",
  },
  {
    id: 3,
    no: "03",
    title: "Mobile Applications",
    blurb:
      "iOS and Android products taken from first frame to store approval, including regulated categories.",
    points: ["Native-grade experience", "App Store & Play submission", "In-app purchase & billing", "KYC and identity flows"],
    tint: "rgba(155,123,255,0.10)",
  },
  {
    id: 4,
    no: "04",
    title: "CRM & Business Systems",
    blurb:
      "The operational spine — pipelines, admin consoles and internal tools shaped around how your business actually runs.",
    points: ["Custom CRM & admin panels", "Workflow automation", "Payments & billing", "Reporting and exports"],
    tint: "rgba(88,230,255,0.08)",
  },
  {
    id: 5,
    no: "05",
    title: "AI Consulting",
    blurb:
      "Where AI genuinely pays for itself in your business — scoped, costed and prototyped before anyone commits a roadmap.",
    points: ["Opportunity mapping", "Model & vendor selection", "Evaluation frameworks", "Rollout strategy"],
    tint: "rgba(120,175,255,0.10)",
  },
  {
    id: 6,
    no: "06",
    title: "Custom Software Development",
    blurb:
      "When nothing off the shelf fits: systems engineered around your constraints, your integrations and your compliance surface.",
    points: ["Platform engineering", "Third-party integrations", "Legacy modernisation", "Long-term ownership"],
    tint: "rgba(155,123,255,0.08)",
  },
];

export default function Services() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="services" className="relative isolate scroll-mt-24 overflow-hidden px-5 py-28 sm:px-8 sm:py-36 lg:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[620px] w-[1100px] -translate-x-1/2 rounded-full opacity-35 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(77,141,255,0.22), rgba(155,123,255,0.12) 48%, transparent 74%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-[1320px] -translate-x-1/2 hairline"
      />
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading
          eyebrow="What we do"
          title={
            <>
              Six disciplines,
              <br />
              one engineering standard.
            </>
          }
          lead="We are not a marketplace of freelancers. Every capability below is practised in-house, on production systems, by the same team that will build yours."
        />

        <div className="perspective-1200 mt-16 grid gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.06} amount={0.2}>
              <TiltCard className="group h-full">
                <article
                  onMouseEnter={() => setActive(s.id)}
                  onMouseLeave={() => setActive(null)}
                  className="glass glass-edge relative flex h-full min-h-[286px] flex-col overflow-hidden rounded-3xl p-6 transition-[transform,border-color,box-shadow] duration-500 hover:border-white/18 hover:shadow-lift sm:p-7"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-45 transition-opacity duration-700 group-hover:opacity-100"
                    style={{ background: `radial-gradient(130% 82% at 78% 0%, ${s.tint}, transparent 64%)` }}
                  />

                  <div className="relative flex items-start justify-between">
                    <span className="font-mono text-[0.6875rem] tracking-[0.2em] text-titanium-dim">
                      {s.no}
                    </span>
                    <div className="h-16 w-24 opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100">
                      <ServiceVisual id={s.id} />
                    </div>
                  </div>

                  <h3 className="relative mt-7 text-[1.3125rem] font-medium tracking-[-0.025em] text-white">
                    {s.title}
                  </h3>
                  <p className="relative mt-3 text-[0.9375rem] leading-relaxed text-titanium">
                    {s.blurb}
                  </p>

                  <AnimatePresence initial={false}>
                    {active === s.id && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="relative overflow-hidden"
                      >
                        <div className="mt-5 grid gap-2 border-t border-white/8 pt-5">
                          {s.points.map((p) => (
                            <li key={p} className="flex items-center gap-2.5 text-[0.8125rem] text-white/72">
                              <span className="h-1 w-1 shrink-0 rounded-full bg-[#4d8dff]" />
                              {p}
                            </li>
                          ))}
                        </div>
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  <div className="relative mt-auto flex items-center gap-2 pt-7 text-[0.8125rem] text-titanium-dim transition-colors duration-400 group-hover:text-white">
                    <span>Explore solution</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="transition-transform duration-400 group-hover:translate-x-1"
                      aria-hidden
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
