"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { createFluidVideoRenderer, type FluidVideoRenderer } from "@/lib/fluid/createFluidVideoRenderer";
import { createPinnedScene } from "@/lib/fluid/pinnedScene";
import type { Rect } from "@/lib/fluid/sheet";
import { prefersReducedMotion, isCoarsePointer } from "@/lib/animation/prefs";

// ------------------------------------------------------------------ tuning

/**
 * The reel, as masters of different widths, smallest first. The grown panel
 * is measured and the smallest master at least that many PHYSICAL pixels wide
 * is served — so a 4K master added here reaches Retina screens automatically,
 * and nobody else downloads it. Currently only the 1080p stand-in exists.
 */
const VIDEO_SOURCES: Array<{ src: string; width: number }> = [
  { src: "/video/reel-1080.mp4", width: 1920 },
];
const VIDEO_SRC = VIDEO_SOURCES[0].src;

function pickSource(physicalWidth: number) {
  return (VIDEO_SOURCES.find((v) => v.width >= physicalWidth) ?? VIDEO_SOURCES[VIDEO_SOURCES.length - 1]).src;
}

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

/** the pin: how long the section holds, and where scrolling up reverses it */
const HOLD = "+=45%";
const REVERSE_AT = 0.5;

const RADIUS: [number, number] = [14, 12];

/** the same transition everywhere, calmer and quicker on smaller screens */
function responsive(width: number) {
  if (width < 768) return { strength: 0.6, duration: 1.3 };
  if (width < 1024) return { strength: 0.8, duration: 1.5 };
  return { strength: 1, duration: 1.7 };
}

const CAPABILITIES: Array<[string, string]> = [
  ["AI products & agents", "Assistants and agents wired into your data and tools, running in production."],
  ["Custom software", "Internal platforms, portals and back-office systems shaped around how you operate."],
  ["Web & mobile apps", "Customer-facing products for web, iOS and Android."],
  ["Automation & CRM", "CRM builds, pipelines and the integrations between your systems."],
];

type Status = "IDLE" | "PLAYING" | "COMPLETE" | "REVERSING";
const DEBUG_MODES = ["normal", "undistorted", "distortion map"] as const;

// ---------------------------------------------------------------- component

export default function FluidVideoTransition() {
  const root = useRef<HTMLElement>(null);
  const [debug, setDebug] = useState(false);
  const [mode, setMode] = useState(0);
  const modeRef = useRef(0);
  const readout = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // development only, and only when asked for
    if (process.env.NODE_ENV === "production") return;
    if (new URLSearchParams(window.location.search).has("fluid-debug")) setDebug(true);
  }, []);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const q = <T extends Element>(s: string) => section.querySelector<T>(s);
    const canvas = q<HTMLCanvasElement>("[data-fluid-canvas]");
    const startBox = q<HTMLElement>("[data-media-start]");
    const endBox = q<HTMLElement>("[data-media-end]");
    const video = q<HTMLVideoElement>("[data-fluid-video]");
    if (!canvas || !startBox || !endBox || !video) return;

    // reduced motion: the card stays a card, the video holds its first frame
    if (prefersReducedMotion()) return;

    const tune = responsive(window.innerWidth);
    const fluid: FluidVideoRenderer | null = createFluidVideoRenderer(canvas, {
      video,
      maxDpr: 2,
      segments: isCoarsePointer() ? [48, 32] : [72, 48],
      radius: RADIUS,
      strength: tune.strength,
      mipmaps: true,
    });

    // ------------------------------------------------------------ timeline
    // ONE tween of `state.progress`. The sheet's geometry (size, position,
    // corners, radius) and the shader's deformation are both computed from
    // that one number each frame, so they cannot drift apart. `--fade` lets
    // CSS retire the statement where the panel grows over it (desktop only).
    const state = { progress: 0 };
    let dirty = true;
    gsap.set(section, { "--fade": 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(state, {
      progress: 1,
      duration: tune.duration,
      ease: "sine.inOut",
      onUpdate: () => {
        dirty = true;
      },
    }, 0);
    tl.to(section, { "--fade": 1, duration: tune.duration * 0.4, ease: "power2.in" }, 0);

    const scene = createPinnedScene(section, tl, { hold: HOLD, reverseAt: REVERSE_AT });

    // --------------------------------------------------------------- layout
    let lastSize = "";
    function measure() {
      const s = section!.getBoundingClientRect();
      const rel = (el: HTMLElement): Rect => {
        const r = el.getBoundingClientRect();
        return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
      };
      fluid?.layout({ w: s.width, h: s.height }, rel(startBox!), rel(endBox!));
      dirty = true;
      const size = `${Math.round(s.width)}x${Math.round(s.height)}`;
      const changed = size !== lastSize;
      lastSize = size;
      return changed;
    }

    const ro = new ResizeObserver(() => {
      if (fluid) fluid.strength = responsive(window.innerWidth).strength;
      // the pin's spacer and positions depend on the section's size
      if (measure()) scene.trigger.refresh();
    });
    ro.observe(section);

    // --------------------------------------------------------------- video
    // Played programmatically (not via the autoplay attribute): Chrome pauses
    // attribute-autoplayed muted video it considers off screen.
    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "100px" },
    );
    io.observe(section);

    // render on new video frames, not blindly every tick
    let frameDirty = true;
    let rvfc = 0;
    const hasRvfc = typeof video.requestVideoFrameCallback === "function";
    const onFrame = () => {
      frameDirty = true;
      rvfc = video.requestVideoFrameCallback(onFrame);
    };
    if (hasRvfc) rvfc = video.requestVideoFrameCallback(onFrame);

    // ---------------------------------------------------------------- tick
    let lastMode = modeRef.current;
    let shown = false;
    const tick = () => {
      if (!fluid || !visible || video.readyState < 2) return;
      if (modeRef.current !== lastMode) {
        lastMode = modeRef.current;
        fluid.debugMode = lastMode;
        dirty = true;
      }
      if (!hasRvfc && !video.paused) frameDirty = true;
      if (dirty || frameDirty) {
        dirty = false;
        frameDirty = false;
        fluid.render(state.progress);
        if (!shown) {
          shown = true;
          // WebGL has a real frame: the HTML video becomes the invisible source
          video.style.opacity = "0";
        }
      }
      if (readout.current) {
        const p = tl.progress();
        const status: Status = tl.isActive()
          ? tl.reversed() ? "REVERSING" : "PLAYING"
          : p >= 1 ? "COMPLETE" : "IDLE";
        const st = fluid.stats;
        readout.current.textContent =
          `Transition: ${status} · Progress: ${state.progress.toFixed(2)} · ` +
          `pin ${scene.trigger.isActive ? "ON" : "off"} ${scene.trigger.progress.toFixed(2)} · ` +
          `canvas ${st.buffer[0]}×${st.buffer[1]} (css ${Math.round(st.css[0])}×${Math.round(st.css[1])} @${st.dpr}x) · ` +
          `video ${st.video[0]}×${st.video[1]}`;
      }
    };
    measure();
    {
      const end = endBox.getBoundingClientRect();
      const src = pickSource(end.width * Math.min(window.devicePixelRatio || 1, 2));
      if (!video.currentSrc.endsWith(src)) {
        video.src = src;
        video.load();
      }
    }
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      scene.kill();
      tl.kill();
      ro.disconnect();
      io.disconnect();
      if (hasRvfc && rvfc) video.cancelVideoFrameCallback(rvfc);
      video.pause();
      video.style.opacity = "";
      section.style.removeProperty("--fade");
      fluid?.dispose();
    };
  }, []);

  return (
    <section
      ref={root}
      data-fluid-transition
      aria-labelledby="studio-heading"
      className="relative h-[100svh] overflow-hidden"
    >
      {/* ---- background drawing: a construction of arcs and one tangent,
               in ink at very low contrast, with a single blue arc and one
               ember segment as the only colour. Behind everything; on small
               screens only the outer arc remains. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMaxYMax slice"
        fill="none"
      >
        <g stroke="var(--color-ink)" strokeOpacity="0.075" strokeWidth="1" vectorEffect="non-scaling-stroke">
          <circle cx="1340" cy="1120" r="760" vectorEffect="non-scaling-stroke" />
          <g className="hidden lg:inline">
            <circle cx="1340" cy="1120" r="520" vectorEffect="non-scaling-stroke" />
            <circle cx="160" cy="-260" r="620" vectorEffect="non-scaling-stroke" />
            <path d="M-40 872 L1640 452" vectorEffect="non-scaling-stroke" />
          </g>
        </g>
        <path
          d="M 580 1120 A 760 760 0 0 1 836 550"
          stroke="var(--color-blue)"
          strokeOpacity="0.55"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="hidden lg:inline"
          d="M 834 1000 A 520 520 0 0 1 879 880"
          stroke="var(--color-ember)"
          strokeOpacity="0.8"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

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

      <canvas
        data-fluid-canvas
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />

      {debug && (
        <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-1 rounded-lg border border-black/15 bg-paper/90 p-1.5 font-mono text-[11px] backdrop-blur">
          {DEBUG_MODES.map((label, i) => (
            <button
              key={label}
              type="button"
              data-fluid-mode={i}
              onClick={() => setMode(i)}
              className={`rounded px-2.5 py-1.5 ${mode === i ? "bg-black text-paper" : "text-black/60 hover:text-black"}`}
            >
              {label}
            </button>
          ))}
          <span ref={readout} data-fluid-readout className="px-2 text-black/70" />
        </div>
      )}
    </section>
  );
}
