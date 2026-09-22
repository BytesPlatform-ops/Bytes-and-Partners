"use client";

import { useEffect, useRef, useState } from "react";
import { createInk, type Ink, type InkView } from "@/lib/lab/ink";

/** the top cover colour, as the shader needs it (0..1) */
const COVER: [number, number, number] = [0.961, 0.949, 0.918];

const VIEWS: InkView[] = ["composite", "mask", "feedback"];

/**
 * A wandering route made of two detuned sines per axis, so the head keeps
 * changing direction without ever repeating on a short loop.
 */
function route(t: number, aspect: number): [number, number] {
  const x = 0.5 + 0.30 * Math.sin(t * 0.37) + 0.13 * Math.sin(t * 0.91 + 1.3);
  const y = 0.5 + 0.24 * Math.cos(t * 0.53) + 0.10 * Math.cos(t * 1.13 + 0.7);
  return [x * aspect, y];
}

/** brush pressure: the stroke swells and thins as it travels */
function pressure(t: number) {
  return 0.8 + 0.2 * Math.sin(t * 0.83) + 0.1 * Math.sin(t * 2.1 + 0.4);
}

export default function InkLab() {
  const wrap = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<InkView>("composite");
  const [penDown, setPenDown] = useState(true);
  const [status, setStatus] = useState("starting…");
  const [fps, setFps] = useState(0);
  const inkRef = useRef<Ink | null>(null);
  const penRef = useRef(true);

  useEffect(() => {
    const host = wrap.current;
    if (!host) return;
    const canvas = host.querySelector<HTMLCanvasElement>("canvas");
    if (!canvas) return;

    const ink = createInk(canvas, COVER);
    if (!ink) {
      setStatus("WebGL2 unavailable — cover disabled, bottom layer exposed");
      canvas.style.display = "none";
      return;
    }
    inkRef.current = ink;

    // the field is soft; past 1.5x the display pass only costs, it adds nothing
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const r = host.getBoundingClientRect();
      ink.resize(r.width, r.height, dpr);
    };
    resize();
    setStatus(ink.precision);
    window.addEventListener("resize", resize, { passive: true });

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let frames = 0;
    let fpsFrom = last;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      if (document.hidden) return;

      t += dt;
      const [x, y] = route(t, ink.aspect);
      ink.moveTo(x, y);
      ink.radius = 0.05 * pressure(t);
      ink.ink = penRef.current ? 1 : 0;
      ink.render(dt);

      frames++;
      if (now - fpsFrom >= 500) {
        setFps(Math.round((frames * 1000) / (now - fpsFrom)));
        frames = 0;
        fpsFrom = now;
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ink.destroy();
      inkRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (inkRef.current) inkRef.current.view = view;
  }, [view]);

  useEffect(() => {
    penRef.current = penDown;
  }, [penDown]);

  const btn = (active: boolean) =>
    `rounded px-2.5 py-1.5 ${active ? "bg-black text-white" : "text-black/60 hover:text-black"}`;

  return (
    <div ref={wrap} className="relative h-[100svh] w-full overflow-hidden">
      {/* ─────────────── LAYER 3 — the test layer, underneath ─────────────── */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(135deg,#0b2bd6 0%,#2457ff 45%,#7fa0ff 100%)" }}
      >
        <div className="absolute left-[8%] top-[14%] h-[26%] w-[34%] bg-[#ff2d1a]" />
        <div className="absolute right-[10%] bottom-[16%] h-[22%] w-[28%] bg-[#ffd400]" />
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 text-center text-[clamp(1.5rem,5.2vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-white">
          BOTTOM LAYER VISIBLE
        </p>
      </div>

      {/* ──────── LAYERS 1 + 2 — the cover, with the ink cut out of it ─────── */}
      <canvas
        data-ink
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />

      {/* ────────────────────────── debug controls ────────────────────────── */}
      <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-1 rounded-lg border border-black/15 bg-white/85 p-1.5 font-mono text-[11px] backdrop-blur">
        {VIEWS.map((v) => (
          <button key={v} type="button" data-view={v} onClick={() => setView(v)} className={btn(view === v)}>
            {v}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-black/15" />
        <button type="button" data-pen onClick={() => setPenDown((d) => !d)} className={btn(!penDown)}>
          {penDown ? "pen down" : "pen up"}
        </button>
        <button type="button" data-clear onClick={() => inkRef.current?.clear()} className={btn(false)}>
          clear
        </button>
        <span className="px-2 text-black/45">
          {status} · <span data-fps>{fps}</span> fps
        </span>
      </div>
    </div>
  );
}
