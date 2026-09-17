"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Reveal from "@/components/ui/Reveal";

const PANELS = [
  { label: "Ingest", detail: "Documents · APIs · Events", x: "-34%", y: "-18%", d: 0 },
  { label: "Reason", detail: "Retrieval · Tools · Policy", x: "32%", y: "-26%", d: 0.1 },
  { label: "Act", detail: "Write-backs · Alerts", x: "-28%", y: "24%", d: 0.2 },
  { label: "Verify", detail: "Evals · Human review", x: "36%", y: "20%", d: 0.3 },
];

export default function IntelligenceLayer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const yA = useTransform(scrollYProgress, [0, 1], ["14%", "-14%"]);
  const yB = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const rot = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1.04, 0.96]);
  const blurOut = useTransform(scrollYProgress, [0, 0.45, 1], [8, 0, 8]);
  const filter = useTransform(blurOut, (v) => `blur(${v}px)`);

  return (
    <section
      ref={ref}
      aria-labelledby="intelligence-title"
      className="relative isolate overflow-hidden px-5 py-32 sm:px-8 sm:py-40 lg:px-12"
    >
      {/* liquid glass field */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          style={{ y: yA, rotate: rot, scale }}
          className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[110px]"
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "conic-gradient(from 140deg at 50% 50%, rgba(88,230,255,0.24), rgba(77,141,255,0.30), rgba(155,123,255,0.26), rgba(88,230,255,0.24))",
            }}
          />
        </motion.div>
        <motion.div
          style={{ y: yB }}
          className="absolute inset-0 opacity-[0.22]"
          // fine mesh
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
              maskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000, transparent 76%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000, transparent 76%)",
            }}
          />
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-[1100px]">
        {/* orbital panels */}
        <div className="relative mx-auto hidden h-[380px] w-full max-w-[820px] lg:block" aria-hidden>
          <motion.div
            style={{ filter }}
            className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          >
            <div className="glass glass-edge grid h-32 w-32 place-items-center rounded-full shadow-lift">
              <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="4" fill="#8fc4ff" />
                <circle cx="16" cy="16" r="10" stroke="rgba(255,255,255,0.28)" />
                <circle cx="16" cy="16" r="14.5" stroke="rgba(255,255,255,0.14)" />
              </svg>
            </div>
            <span className="absolute inset-0 rounded-full border border-[#4d8dff]/25 animate-pulse-ring" />
          </motion.div>

          {PANELS.map((p) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.2 + p.d, ease: [0.16, 1, 0.3, 1] }}
              style={{ left: `calc(50% + ${p.x})`, top: `calc(50% + ${p.y})` }}
              className="glass glass-edge absolute w-[194px] -translate-x-1/2 -translate-y-1/2 rounded-2xl px-4 py-3.5 shadow-glass animate-float-slow"
            >
              <p className="text-[0.875rem] font-medium text-white">{p.label}</p>
              <p className="mt-1 font-mono text-[0.625rem] text-titanium-dim">{p.detail}</p>
            </motion.div>
          ))}

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 820 380" fill="none">
            <ellipse cx="410" cy="190" rx="240" ry="120" stroke="rgba(255,255,255,0.08)" />
            <ellipse cx="410" cy="190" rx="330" ry="160" stroke="rgba(255,255,255,0.05)" />
          </svg>
        </div>

        <div className="mx-auto max-w-3xl text-center lg:mt-4">
          <Reveal>
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#4d8dff]" />
              <span className="eyebrow">The intelligence layer</span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#9b7bff]" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              id="intelligence-title"
              className="display mt-6 text-[clamp(1.9rem,4.4vw,3.4rem)] text-gradient"
            >
              AI only matters when it
              <br />
              <span className="text-gradient-ai">changes what happens next.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-titanium">
              A demo that answers a question is easy. We build the part that is hard:
              the agent that reads a document, decides, writes the result into your
              CRM, and leaves a reviewable trail behind it — running every day without
              anyone watching.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
