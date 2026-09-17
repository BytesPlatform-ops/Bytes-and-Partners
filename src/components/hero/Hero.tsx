"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import ParticleField from "./ParticleField";
import MagneticButton from "@/components/ui/MagneticButton";

const LINE_1 = ["We", "build"];
const LINE_2 = ["intelligent"];
const LINE_3 = ["digital", "experiences."];

const STATS = [
  { v: "7+", l: "Products shipped" },
  { v: "5", l: "Delivery surfaces" },
  { v: "3", l: "Continents served" },
  { v: "100%", l: "In-house engineering" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 22, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 90, damping: 22, mass: 0.6 });

  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    px.set((e.clientX - r.left - r.width / 2) / r.width);
    py.set((e.clientY - r.top - r.height / 2) / r.height);
  };

  const t1x = useTransform(sx, (v) => v * -34);
  const t1y = useTransform(sy, (v) => v * -22);
  const t2x = useTransform(sx, (v) => v * 46);
  const t2y = useTransform(sy, (v) => v * 30);
  const t3x = useTransform(sx, (v) => v * -20);
  const t3y = useTransform(sy, (v) => v * 36);
  const glowX = useTransform(sx, (v) => v * 60);
  const glowY = useTransform(sy, (v) => v * 40);

  const word = {
    hidden: { opacity: 0, y: "0.3em", filter: "blur(14px)" },
    show: (i: number) => ({
      opacity: 1,
      y: "0em",
      filter: "blur(0px)",
      transition: { duration: 0.85, delay: 0.08 + i * 0.05, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  let idx = 0;
  const renderLine = (words: string[], accent = false) => (
    <span className="block pb-[0.04em]">
      {words.map((w) => {
        const i = idx++;
        return (
          <motion.span
            key={w + i}
            custom={i}
            variants={word}
            initial="hidden"
            animate="show"
            className={`inline-block will-change-transform ${accent ? "text-gradient-ai" : "text-gradient"}`}
          >
            {w}
            {" "}
          </motion.span>
        );
      })}
    </span>
  );

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pt-28 pb-16 sm:px-8 lg:px-12"
      aria-label="Bytes and Partners — intelligent digital experiences"
    >
      {/* ---------- atmosphere ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#05060a]" />
        <motion.div
          style={{ x: glowX, y: glowY }}
          className="absolute -top-[18%] left-1/2 h-[860px] w-[1240px] -translate-x-1/2 rounded-full opacity-[0.62] blur-[120px] animate-drift"
          // aurora core
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(48% 52% at 50% 44%, rgba(77,141,255,0.42) 0%, rgba(155,123,255,0.22) 42%, rgba(5,6,10,0) 72%)",
            }}
          />
        </motion.div>
        <div
          className="absolute -right-[12%] top-[8%] h-[560px] w-[560px] rounded-full opacity-40 blur-[110px] animate-drift"
          style={{
            animationDelay: "-8s",
            background:
              "radial-gradient(circle at 50% 50%, rgba(88,230,255,0.30), rgba(5,6,10,0) 68%)",
          }}
        />
        <div
          className="absolute -left-[14%] bottom-[2%] h-[520px] w-[520px] rounded-full opacity-45 blur-[120px] animate-drift"
          style={{
            animationDelay: "-15s",
            background:
              "radial-gradient(circle at 50% 50%, rgba(155,123,255,0.32), rgba(5,6,10,0) 70%)",
          }}
        />
        {/* precision grid */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "88px 88px",
            maskImage:
              "radial-gradient(ellipse 78% 62% at 50% 42%, #000 20%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 78% 62% at 50% 42%, #000 20%, transparent 78%)",
          }}
        />
        <ParticleField className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#05060a] to-transparent" />
      </div>

      <motion.div style={{ y, opacity, scale }} className="relative mx-auto w-full max-w-[1320px]">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="glass glass-edge inline-flex items-center gap-2.5 rounded-full px-4 py-2"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#58e6ff] animate-pulse-ring" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#58e6ff]" />
              </span>
              <span className="eyebrow !text-[0.6875rem] !text-white/70">
                Technology studio · New York
              </span>
            </motion.div>

            <h1 className="display mt-8 text-[clamp(2.75rem,8.4vw,7rem)] text-white">
              {renderLine(LINE_1)}
              {renderLine(LINE_2, true)}
              {renderLine(LINE_3)}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-[38rem] text-[1.0625rem] leading-relaxed text-titanium sm:text-lg"
            >
              Bytes and Partners creates AI-powered products, scalable applications
              and intelligent systems that help businesses transform — from a
              regulated trading platform on five surfaces to the automation running
              quietly behind a growing company.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-wrap items-center gap-3.5"
            >
              <MagneticButton href="#work">
                View our work
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </MagneticButton>
              <MagneticButton href="#contact" variant="outline">
                Start a conversation
              </MagneticButton>
            </motion.div>
          </div>

          {/* ---------- floating glass stack ---------- */}
          <div className="relative hidden h-[460px] flex-col justify-center gap-4 lg:flex" aria-hidden>
            <motion.div
              style={{ x: t1x, y: t1y }}
              initial={{ opacity: 0, y: 40, rotateX: 12 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass glass-edge ml-auto w-[290px] rounded-2xl p-4 shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow !text-[0.625rem]">Agent runtime</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              </div>
              <div className="mt-3.5 space-y-2.5">
                {[
                  ["Intake classified", "0.42s"],
                  ["Enrichment complete", "1.08s"],
                  ["CRM record written", "1.61s"],
                ].map(([k, v], i) => (
                  <div key={k} className="flex items-center justify-between text-[0.8125rem]">
                    <span className="flex items-center gap-2 text-white/75">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: ["#58e6ff", "#4d8dff", "#9b7bff"][i] }}
                      />
                      {k}
                    </span>
                    <span className="font-mono text-[0.6875rem] text-titanium-dim">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "82%" }}
                  transition={{ duration: 2.2, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#58e6ff,#4d8dff,#9b7bff)" }}
                />
              </div>
            </motion.div>

            <motion.div
              style={{ x: t2x, y: t2y }}
              initial={{ opacity: 0, y: 46 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
              className="glass glass-edge mr-auto w-[244px] rounded-2xl p-4 shadow-lift"
            >
              <span className="eyebrow !text-[0.625rem]">Uptime</span>
              <p className="display mt-2 text-[2.1rem] text-white">99.98%</p>
              <div className="mt-3 flex items-end gap-[3px]">
                {[38, 52, 44, 67, 58, 79, 71, 88, 76, 94, 85, 100].map((v, i) => (
                  <motion.span
                    key={i}
                    initial={{ height: 2 }}
                    animate={{ height: `${v * 0.34}px` }}
                    transition={{ duration: 0.8, delay: 1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full rounded-sm"
                    style={{
                      background:
                        i > 8
                          ? "linear-gradient(180deg,#58e6ff,#4d8dff)"
                          : "rgba(255,255,255,0.14)",
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              style={{ x: t3x, y: t3y }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.86, ease: [0.16, 1, 0.3, 1] }}
              className="glass glass-edge ml-auto flex w-[228px] items-center gap-3 rounded-2xl p-3.5 shadow-lift"
            >
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                style={{ background: "linear-gradient(135deg,rgba(88,230,255,0.22),rgba(155,123,255,0.22))" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1.5 14 5v6l-6 3.5L2 11V5l6-3.5Z"
                    stroke="#bcd4ff"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="8" r="2" fill="#7fb4ff" />
                </svg>
              </div>
              <div>
                <p className="text-[0.8125rem] font-medium text-white">Model routed</p>
                <p className="font-mono text-[0.6875rem] text-titanium-dim">p95 · 240ms</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ---------- stat rail ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] sm:mt-20 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.l} className="bg-[#070810]/70 px-5 py-5 backdrop-blur-xl sm:px-6">
              <p className="display text-[1.75rem] text-white sm:text-[2rem]">{s.v}</p>
              <p className="mt-1 text-[0.8125rem] text-titanium-dim">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        aria-hidden
      >
        <span className="eyebrow !text-[0.5625rem]">Scroll</span>
        <div className="h-9 w-px overflow-hidden bg-white/12">
          <motion.div
            animate={{ y: ["-100%", "220%"] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
            className="h-4 w-px bg-gradient-to-b from-transparent via-white to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
}
