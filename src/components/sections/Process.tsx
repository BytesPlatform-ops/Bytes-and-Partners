"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const STEPS = [
  {
    no: "01",
    title: "Define the real constraint",
    body: "Before architecture, we find the thing that actually decides the outcome — a review board, a compliance surface, a latency budget, a buyer who qualifies you in eight seconds.",
    meta: "Week 1",
  },
  {
    no: "02",
    title: "Design the whole system",
    body: "Every screen, state and edge case mapped as one product — not a happy path with the difficult parts deferred to a later phase that never gets funded.",
    meta: "Weeks 2–4",
  },
  {
    no: "03",
    title: "Engineer for production",
    body: "Built on the stack it will live on, with the integrations wired, the data model settled and the empty states designed. Staged, reviewed, then shipped.",
    meta: "Weeks 4–12",
  },
  {
    no: "04",
    title: "Stay after launch",
    body: "Store submissions, search reporting, paid programs, iteration. Most of our clients are in month twelve, not month two.",
    meta: "Ongoing",
  },
];

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 72%", "end 60%"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="relative px-5 py-28 sm:px-8 sm:py-36 lg:px-12">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading
          eyebrow="How we work"
          title={
            <>
              A method built for products
              <br />
              that cannot ship half-finished.
            </>
          }
          lead="Some products genuinely cannot launch as an MVP. When the cut-down version is not a product, the process has to account for that from week one."
        />

        <div ref={ref} className="relative mt-16 sm:mt-20">
          <div aria-hidden className="absolute left-[15px] top-2 hidden h-full w-px bg-white/8 sm:block">
            <motion.div
              style={{ scaleY, transformOrigin: "top" }}
              className="h-full w-px bg-gradient-to-b from-[#58e6ff] via-[#4d8dff] to-[#9b7bff]"
            />
          </div>

          <ol className="space-y-px">
            {STEPS.map((s, i) => (
              <li key={s.no}>
                <Reveal delay={i * 0.06} amount={0.3}>
                  <div className="group relative grid gap-4 rounded-2xl px-0 py-7 transition-colors duration-500 sm:grid-cols-[32px_minmax(0,1fr)] sm:gap-7 sm:px-4 sm:hover:bg-white/[0.022]">
                    <div className="hidden sm:block">
                      <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#080a10] font-mono text-[0.625rem] text-titanium transition-colors duration-500 group-hover:border-[#4d8dff]/50 group-hover:text-white">
                        {s.no}
                      </span>
                    </div>
                    <div className="grid gap-3 border-b border-white/7 pb-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_110px] md:items-start md:gap-8">
                      <h3 className="text-[1.1875rem] font-medium tracking-[-0.025em] text-white">
                        <span className="mr-2 font-mono text-[0.6875rem] text-titanium-dim sm:hidden">{s.no}</span>
                        {s.title}
                      </h3>
                      <p className="text-[0.9375rem] leading-relaxed text-titanium">{s.body}</p>
                      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-titanium-dim md:text-right">
                        {s.meta}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
