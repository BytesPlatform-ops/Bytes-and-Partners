"use client";

import { useEffect, useState } from "react";
import "./FluidVideoTransition.css";
const VIDEO_SRC = "/video/reel-1080.mp4";
const DEBUG_MODES = ["normal", "undistorted", "distortion map"] as const;

/** DOM layout only; IntroExperience owns the shared visual system. */
export default function FluidVideoTransition() {
  const [debug, setDebug] = useState(false);
  const [mode, setMode] = useState(0);
  const [sound, setSound] = useState(false);
  // The reel loops muted in the background; the button restarts it with sound.
  const toggleSound = () => {
    const video = document.querySelector<HTMLVideoElement>("[data-fluid-video]");
    if (!video) return;
    if (sound) { video.muted = true; setSound(false); return; }
    video.currentTime = 0;
    video.muted = false;
    video.play().catch(() => {});
    setSound(true);
  };
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).has("fluid-debug")) setDebug(true);
  }, []);
  return (
    <section
      data-fluid-transition
      aria-label="Our approach"
      className="relative h-[153svh] overflow-hidden [--fluid-travel:0.32] md:[--fluid-travel:0.06] lg:h-[140svh] lg:[--fluid-travel:0.32] motion-reduce:h-auto motion-reduce:min-h-[100svh]"
    >
      <div className="relative h-full px-[var(--bp-gut)] motion-reduce:flex motion-reduce:flex-col motion-reduce:gap-10 motion-reduce:py-24">
        <div data-fluid-copy className="absolute left-[var(--bp-gut)] right-[var(--bp-gut)] top-[10svh] lg:left-[52%] lg:top-[11svh] lg:max-w-[43rem] motion-reduce:static motion-reduce:order-first ml-10">
          <h2 className="max-w-[12ch] text-[clamp(2.65rem,4.15vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.055em] text-ink">
            The whole thing.<br /><span className="text-blue">Built together.</span>
          </h2>
          <p className="mt-6 max-w-[39ch] text-[clamp(1rem,1.2vw,1.2rem)] leading-[1.5] tracking-[-0.015em] text-ink-mute">
            From the first screen to the last API call. Design, code, and the
            details between them — by the people you meet.
          </p>
          <a href="#work" className="group mt-8 inline-flex min-h-14 items-center gap-9 rounded-full bg-blue py-2 pl-7 pr-2 text-sm font-medium text-paper shadow-[0_12px_30px_rgba(36,87,255,0.18)] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue">
            Our approach
            <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-blue transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </span>
          </a>
        </div>
        <div data-media-start className="absolute left-[var(--bp-gut)] top-[max(72svh,34rem)] aspect-video w-[calc(100%-2*var(--bp-gut))] lg:top-[38svh] lg:w-[48%] motion-reduce:relative motion-reduce:left-auto motion-reduce:top-auto motion-reduce:w-full lg:motion-reduce:top-auto lg:motion-reduce:w-full">
          <video data-fluid-video src={VIDEO_SRC} muted loop playsInline preload="auto" aria-hidden
            className="absolute inset-0 h-full w-full rounded-[14px] object-cover object-center" />
        </div>
        <div data-media-end className="pointer-events-none absolute left-[var(--bp-gut)] right-[var(--bp-gut)] top-[52svh] h-[70svh] md:top-[39svh] md:h-[64svh] lg:top-[54svh] lg:h-[72svh] 2xl:top-[58svh] motion-reduce:hidden">
          {/* Revealed by IntroExperience as the video settles into this frame. */}
          <div data-reel-overlay style={{ opacity: 0, visibility: "hidden" }} className="absolute inset-0 flex items-center justify-center gap-[clamp(0.75rem,2.6vw,3rem)] text-paper">
            <span aria-hidden className="text-[clamp(2.75rem,9.5vw,10rem)] font-light uppercase leading-none tracking-[-0.03em]">Play</span>
            <button
              type="button"
              aria-label={sound ? "Mute reel" : "Play reel with sound"}
              aria-pressed={sound}
              onClick={toggleSound}
              className="reel-button pointer-events-auto relative isolate flex h-[clamp(3.5rem,7.5vw,7.5rem)] w-[clamp(5.75rem,12.5vw,12.5rem)] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-paper text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
            >
              <span aria-hidden className="reel-button__fill absolute inset-0 -z-10 bg-blue" />
              {sound ? (
                <svg aria-hidden viewBox="0 0 24 24" className="h-[32%] w-auto" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1" /><rect x="14" y="4" width="5" height="16" rx="1" /></svg>
              ) : (
                <svg aria-hidden viewBox="0 0 24 24" className="h-[32%] w-auto translate-x-[6%]" fill="currentColor"><path d="M6 3.5v17a1 1 0 0 0 1.52.85l13.6-8.5a1 1 0 0 0 0-1.7L7.52 2.65A1 1 0 0 0 6 3.5Z" /></svg>
              )}
            </button>
            <span aria-hidden className="text-[clamp(2.75rem,9.5vw,10rem)] font-light uppercase leading-none tracking-[-0.03em]">Reel</span>
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
