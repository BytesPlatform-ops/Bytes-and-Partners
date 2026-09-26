"use client";

import { useEffect, useState } from "react";
const VIDEO_SRC = "/video/reel-1080.mp4";
/**
 * Layout lives in the DOM, on a 12-column grid. The media's start and end
 * boxes are measured, never drawn: the sheet travels from one to the other.
 *
 *   desktop  card: columns 1–7, 19:10 — a large, horizontal editorial card
 *            → panel: the full content width, down to one gutter above the
 *            section's bottom edge — a large, wide cinematic panel (≈2.1:1
 *            at 1920×1080), never full-viewport.
 *   below lg card: full width, 16:10 → panel: full width, 4:3 — stacked
 *            under the text, so the video stays dominant on tablet too.
 *
 * The boxes share a cell, so every item names its column: auto-placement
 * would push the second into an implicit, zero-width column.
 */
const START_BOX =
  "col-start-1 row-start-2 w-full aspect-[16/10] lg:row-start-1 lg:col-start-1 lg:col-span-7 lg:aspect-[19/10]";
const END_CELL = "col-start-1 row-start-2 lg:row-start-1 lg:col-start-1 lg:col-span-12";
const END_BOX =
  "w-full aspect-[4/3] lg:aspect-auto lg:h-[calc(100svh-max(15svh,5.5rem)-var(--bp-gut))]";

const CAPABILITIES: Array<[string, string]> = [
  ["AI products & agents", "Assistants and agents wired into your data and tools, running in production."],
  ["Custom software", "Internal platforms, portals and back-office systems shaped around how you operate."],
  ["Web & mobile apps", "Customer-facing products for web, iOS and Android."],
  ["Automation & CRM", "CRM builds, pipelines and the integrations between your systems."],
];

const DEBUG_MODES = ["normal", "undistorted", "distortion map"] as const;

/** DOM layout only; IntroExperience owns the shared visual system. */
export default function FluidVideoTransition() {
  const [debug, setDebug] = useState(false);
  const [mode, setMode] = useState(0);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).has("fluid-debug")) setDebug(true);
  }, []);
  return (
    <section
      data-fluid-transition
      aria-labelledby="studio-heading"
      className="relative h-[100svh] overflow-hidden"
    >
      <div className="relative grid h-full grid-cols-1 content-start gap-y-8 px-[var(--bp-gut)] pt-[max(15svh,5.5rem)] lg:grid-cols-12 lg:gap-x-6">
        {/* ---- the media: the card as plain HTML until (or unless) WebGL
                 takes over; its box is also where the sheet starts */}
        <div data-media-start className={`relative self-start ${START_BOX}`}>
          <video
            data-fluid-video
            src={VIDEO_SRC}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            className="absolute inset-0 h-full w-full rounded-[14px] object-cover object-center"
          />
        </div>
        {/* measured, never drawn: where the sheet ends */}
        <div aria-hidden className={`pointer-events-none self-start ${END_CELL}`}>
          <div data-media-end className={END_BOX} />
        </div>

        {/* ---- the editorial column: retires as the panel grows over it
                 (desktop). Type, rules and space only. */}
        <div data-fluid-copy className="col-start-1 row-start-1 self-start lg:col-start-9 lg:col-span-4">
          <p className="hero-meta">
            <span className="text-blue">01</span> <span className="mx-2 opacity-40">—</span> Studio
          </p>
          <h2
            id="studio-heading"
            className="mt-5 max-w-[22ch] text-[clamp(1.375rem,2.1vw,2rem)] font-medium leading-[1.12] tracking-[-0.025em] text-ink text-pretty"
          >
            We design and engineer the software companies run on —
            products, AI agents and the systems underneath.
          </h2>
          <p className="mt-4 max-w-[38ch] text-[0.9375rem] leading-[1.5] tracking-[-0.01em] text-ink-mute text-pretty">
            One team from first sketch to production code. We stay on after
            launch to run, measure and improve what we ship.
          </p>

          <div className="mt-10 hidden lg:block">
            <p className="hero-meta pb-3">Capabilities</p>
            <ol className="border-b border-[var(--bp-hairline)]">
              {CAPABILITIES.map(([name, what], i) => (
                <li
                  key={name}
                  className="group grid grid-cols-[2.25rem_1fr] border-t border-[var(--bp-hairline)] py-3.5 transition-colors duration-500 hover:border-blue/40"
                >
                  <span className="pt-px font-mono text-[0.6875rem] tabular-nums text-ink-mute transition-colors duration-500 group-hover:text-blue">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                    <span className="block text-[0.75rem] font-medium uppercase leading-none tracking-[0.06em] text-ink">
                      {name}
                    </span>
                    <span className="mt-1.5 block max-w-[40ch] text-[0.8125rem] leading-[1.4] text-ink-mute/80 transition-colors duration-500 group-hover:text-ink-mute">
                      {what}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {debug && (
        <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-1 rounded-lg border border-black/15 bg-paper/90 p-1.5 font-mono text-[11px] backdrop-blur">
          {DEBUG_MODES.map((label, i) => (
            <button
              key={label}
              type="button"
              data-fluid-mode={i}
              onClick={() => { setMode(i); document.querySelector<HTMLElement>("[data-fluid-transition]")!.dataset.debugMode = String(i); }}
              className={`rounded px-2.5 py-1.5 ${mode === i ? "bg-black text-paper" : "text-black/60 hover:text-black"}`}
            >
              {label}
            </button>
          ))}
          <span data-fluid-readout className="px-2 text-black/70" />
        </div>
      )}
    </section>
  );
}
