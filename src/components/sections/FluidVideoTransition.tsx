"use client";

import { useEffect, useState, type MouseEvent } from "react";
import ActionPill from "@/components/ui/ActionPill";
import ShowreelPlayer from "./ShowreelPlayer";
import "./FluidVideoTransition.css";

const DEBUG_MODES = ["normal", "undistorted", "distortion map"] as const;

/** DOM layout only; IntroExperience owns the shared visual system. */
export default function FluidVideoTransition() {
  const [debug, setDebug] = useState(false);
  const [mode, setMode] = useState(0);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerPointer, setPlayerPointer] = useState({ x: 0, y: 0 });
  const openPlayer = (event: MouseEvent<HTMLButtonElement>) => {
    setPlayerPointer({ x: event.clientX, y: event.clientY });
    setPlayerOpen(true);
  };

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      new URLSearchParams(window.location.search).has("fluid-debug")
    ) {
      setDebug(true);
    }
  }, []);

  return (
    <section
      data-fluid-transition
      aria-label="Showreel"
      className="
        relative
        h-[150svh]
        overflow-hidden
        [--fluid-travel:0.28]

        sm:h-[152svh]
        sm:[--fluid-travel:0.32]

        md:h-[150svh]
        md:[--fluid-travel:0.36]

        lg:h-[145svh]
        lg:[--fluid-travel:0.48]

        xl:h-[145svh]
        xl:[--fluid-travel:0.48]

        2xl:h-[150svh]
        2xl:[--fluid-travel:0.50]

        motion-reduce:h-auto
        motion-reduce:min-h-[100svh]
      "
    >
      <div
        className="
          relative
          h-full
          px-[var(--bp-gut)]

          motion-reduce:flex
          motion-reduce:flex-col
          motion-reduce:gap-10
          motion-reduce:py-24
        "
      >
        <div
          data-fluid-copy
          className="
            absolute
            left-[var(--bp-gut)]
            right-[var(--bp-gut)]
            top-[10svh]

            lg:left-[52%]
            lg:top-[11svh]
            lg:max-w-[43rem]

            ml-10

            motion-reduce:static
            motion-reduce:order-first
          "
        >
          <h2 className="max-w-[12ch] text-[clamp(2.65rem,4.15vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.055em] text-ink">
            Ideas in motion.
            <br />
            <span className="text-blue">Made to be seen.</span>
          </h2>

          <p className="mt-6 max-w-[39ch] text-[clamp(1rem,1.2vw,1.2rem)] leading-[1.5] tracking-[-0.015em] text-ink-mute">
            A fast cut through the digital products, brand systems, 3D worlds,
            and interactive experiences we bring to life.
          </p>

          <ActionPill
            href="#work"
            label="Explore our work"
            className="mt-8"
          />
        </div>

        <div
          data-media-start
          className="
            absolute
            left-[var(--bp-gut)]
            top-[max(72svh,34rem)]
            aspect-video
            w-[calc(100%-2*var(--bp-gut))]

            lg:top-[38svh]
            lg:w-[48%]

            motion-reduce:relative
            motion-reduce:left-auto
            motion-reduce:top-auto
            motion-reduce:w-full

            lg:motion-reduce:top-auto
            lg:motion-reduce:w-full
          "
        >
          <video
            data-fluid-video
            muted
            loop
            playsInline
            preload="metadata"
            poster="/showreel/card-poster.webp"
            aria-hidden
            className="absolute inset-0 h-full w-full rounded-[14px] object-cover object-center"
          >
            <source
              src="/showreel/card-preview.webm"
              type='video/webm; codecs="av01"'
            />
            <source
              src="/showreel/card-preview.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        <div
          data-media-end
          className="
            pointer-events-none
            absolute
            left-[var(--bp-gut)]
            right-[var(--bp-gut)]

            top-[58svh]
            h-[62svh]

            sm:top-[60svh]
            sm:h-[64svh]

            md:top-[58svh]
            md:h-[68svh]

            lg:top-[54svh]
            lg:h-[80svh]

            xl:top-[58svh]
            xl:h-[80svh]

            2xl:top-[66svh]
            2xl:h-[80svh]

            motion-reduce:hidden
          "
        >
          {/* Revealed by IntroExperience as the video settles into this frame. */}
          <div
            data-reel-overlay
            style={{
              opacity: 0,
              visibility: "hidden",
            }}
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              gap-[clamp(0.75rem,2.6vw,3rem)]
              text-paper
            "
          >
            <span
              aria-hidden
              className="text-[clamp(2.75rem,8vw,10rem)] font-light uppercase leading-none tracking-[-0.03em]"
            >
              Play
            </span>

            <button
              type="button"
              data-showreel-trigger
              aria-label="Play showreel"
              onClick={openPlayer}
              className="
                reel-button
                pointer-events-auto
                relative
                isolate
                flex
                h-[clamp(3.5rem,6.5vw,7.5rem)]
                w-[clamp(5.75rem,11vw,12.5rem)]
                shrink-0
                cursor-pointer
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-paper
                text-ink

                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-paper
              "
            >
              <span
                aria-hidden
                className="reel-button__fill absolute inset-0 -z-10 bg-blue"
              />

              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-[32%] w-auto translate-x-[6%]"
                fill="currentColor"
              >
                <path d="M6 3.5v17a1 1 0 0 0 1.52.85l13.6-8.5a1 1 0 0 0 0-1.7L7.52 2.65A1 1 0 0 0 6 3.5Z" />
              </svg>
            </button>

            <span
              aria-hidden
              className="text-[clamp(2.75rem,8vw,10rem)] font-light uppercase leading-none tracking-[-0.03em]"
            >
              Reel
            </span>
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
              onClick={() => {
                setMode(i);

                document.querySelector<HTMLElement>(
                  "[data-fluid-transition]",
                )!.dataset.debugMode = String(i);
              }}
              className={`rounded px-2.5 py-1.5 ${
                mode === i
                  ? "bg-black text-paper"
                  : "text-black/60 hover:text-black"
              }`}
            >
              {label}
            </button>
          ))}

          <span
            data-fluid-readout
            className="px-2 text-black/70"
          />
        </div>
      )}

      <ShowreelPlayer
        open={playerOpen}
        initialPointer={playerPointer}
        onClose={() => setPlayerOpen(false)}
      />
    </section>
  );
}
