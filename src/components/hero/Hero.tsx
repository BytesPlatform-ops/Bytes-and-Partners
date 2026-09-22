"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import HeroNav from "./HeroNav";
import HeroField from "./HeroField";
import HeroTypography from "./HeroTypography";
import NextScene from "./NextScene";

import { createFluid, type Fluid } from "@/lib/hero/fluid";
import { prefersReducedMotion, isCoarsePointer, fontsReady } from "@/lib/animation/prefs";
import { mountScroll } from "@/lib/animation/scroll";

/**
 * The scripted opening path, in aspect-corrected hero space (x is multiplied
 * by the aspect ratio, y is 0..1 from the bottom). It enters from the left,
 * dips down through the word, rises past the period and leaves to the right.
 */
const OPENING: Array<[number, number]> = [
  [-0.22, 0.42],
  [0.02, 0.52],
  [0.24, 0.34],
  [0.44, 0.50],
  [0.62, 0.30],
  [0.80, 0.46],
  [0.98, 0.28],
  [1.16, 0.44],
  [1.34, 0.36],
];

/** Catmull-Rom through the opening path so the head moves on a smooth curve. */
function samplePath(pts: Array<[number, number]>, t: number, aspect: number): [number, number] {
  const segs = pts.length - 1;
  const u = Math.min(0.9999, Math.max(0, t)) * segs;
  const i = Math.floor(u);
  const f = u - i;
  const p = (k: number) => pts[Math.min(pts.length - 1, Math.max(0, k))];
  const [x0, y0] = p(i - 1);
  const [x1, y1] = p(i);
  const [x2, y2] = p(i + 1);
  const [x3, y3] = p(i + 2);
  const cr = (a: number, b: number, c: number, d: number) => {
    const f2 = f * f;
    const f3 = f2 * f;
    return 0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f2 + (-a + 3 * b - 3 * c + d) * f3);
  };
  return [cr(x0, x1, x2, x3) * aspect, cr(y0, y1, y2, y3)];
}

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = <T extends Element>(s: string) => el.querySelector<T>(s);

    const hero = q<HTMLElement>("[data-hero]");
    const canvas = q<HTMLCanvasElement>("[data-field]");
    const word = q<HTMLElement>("[data-word]");
    const period = q<HTMLElement>("[data-period]");
    const nav = q<HTMLElement>("header");
    const footer = q<HTMLElement>("[data-hero-foot]");
    const nextDot = q<HTMLElement>("[data-next-dot]");
    const lines = Array.from(el.querySelectorAll<HTMLElement>("[data-line]"));
    if (!hero || !canvas || !word || lines.length === 0) return;

    const reduced = prefersReducedMotion();
    const coarse = isCoarsePointer();
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);
    /** the simulation is diffuse, so it runs coarser than the canvas it paints */
    const SCALE = coarse ? 0.4 : 0.6;

    let fluid: Fluid | null = null;
    let releaseScroll: (() => void) | null = null;
    let tl: gsap.core.Timeline | null = null;
    let disposed = false;
    let settled = false;
    let visible = true;

    /** the head the field follows: a lagged chaser, never the raw pointer */
    const head = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, speed: 0 };

    /** No fluid: the composition is simply there, which is the whole point. */
    function staticComposition() {
      if (canvas) canvas.style.display = "none";
      settled = true;
    }

    // ------------------------------------------------------------ geometry
    function layout() {
      if (!fluid || disposed) return;
      const r = hero!.getBoundingClientRect();
      fluid.resize(r.width, r.height, SCALE, dpr);
    }


    // -------------------------------------------------------------- ticker
    const tick = (_t: number, dt: number) => {
      if (document.hidden || !visible || !fluid) return;
      const s = Math.min(dt, 50) / 1000;

      // inertia: the head eases toward its target, and how hard it is moving
      // is what charges the front
      // inertia, so the front carries its own momentum through the turns
      head.x += (head.tx - head.x) * 0.16;
      head.y += (head.ty - head.y) * 0.16;

      // How hard the head is working. During the opening it lays ink
      // continuously; afterwards only real pointer movement injects, so a
      // resting cursor lets the field decay away to nothing.
      // The fluid is not a cursor follower. It lays ink only while the
      // scripted reveal is running; once the hero is open it stops.
      fluid.setHead(head.x, head.y);

      // At rest the hero is open and there is nothing to composite, so the
      // field is not drawn at all. Scrolling brings it back to carry the
      // transition out.
      const sy = window.scrollY;
      const leaving = sy > 2;
      if (!settled || leaving) {
        canvas.style.display = "";
        fluid.render(s);
      } else if (canvas.style.display !== "none") {
        canvas.style.display = "none";
      }

      if (!settled) return;

      // ---- scroll: the field stretches and drags, the word is carried up
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / vh));
      const e = p * p * (3 - 2 * p);
      fluid.scroll = e;

      if (word) {
        word.style.transform = `translate3d(0,${-vh * 0.4 * e}px,0)`;
        word.style.opacity = `${1 - Math.max(0, (p - 0.5) / 0.5)}`;
      }
      if (nav) {
        const o = Math.max(0, 1 - p * 1.9);
        nav.style.transform = `translate3d(0,${-70 * e}px,0)`;
        nav.style.opacity = `${o}`;
        nav.style.pointerEvents = o < 0.05 ? "none" : "";
      }
      if (footer) {
        const o = Math.max(0, 1 - p * 2.4);
        footer.style.transform = `translate3d(0,${50 * e}px,0)`;
        footer.style.opacity = `${o}`;
        footer.style.pointerEvents = o < 0.05 ? "none" : "";
      }
      if (nextDot) nextDot.style.transform = `scale(${0.35 + e * 0.65})`;

      // the same fluid, running the other way: the cover closes back over the
      // hero from the direction of travel as the next scene arrives
      fluid.open = p > 0.01 ? 0 : 1;
      fluid.reclaim = p > 0.01 ? 0.955 : 1;
      fluid.alpha = 1;
      fluid.inject = p > 0.01 && p < 0.9 ? 0.5 : 0;
      fluid.radius = 0.3;
      head.tx = (0.15 + e * 0.9) * fluid.aspect;
      head.ty = 1.15 - e * 1.5;
    };

    // --------------------------------------------------------------- input

    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        layout();
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "80px" },
    );
    io.observe(hero);
    window.addEventListener("resize", onResize, { passive: true });

    // ----------------------------------------------------------- the period
    let periodTl: gsap.core.Timeline | null = null;
    const onPeriodEnter = () => {
      if (!settled || reduced) return;
      periodTl?.kill();
      periodTl = gsap.timeline();
      periodTl.to(period, { scale: 1.16, duration: 0.5, ease: "expo.out" }, 0);
    };
    const onPeriodLeave = () => {
      if (reduced) return;
      gsap.to(period, { scale: 1, duration: 0.7, ease: "expo.out" });
    };
    period?.addEventListener("pointerenter", onPeriodEnter);
    period?.addEventListener("pointerleave", onPeriodLeave);

    // ------------------------------------------------------------- startup
    if (reduced) {
      staticComposition();
      releaseScroll = mountScroll({ smooth: false });
      return cleanup;
    }

    releaseScroll = mountScroll({ smooth: !coarse });

    let cancelled = false;
    fontsReady(220).then(() => {
      if (cancelled || disposed) return;

      fluid = createFluid(canvas);
      if (!fluid) {
        staticComposition();
        return;
      }
      layout();
      canvas.style.opacity = "1";
      gsap.ticker.add(tick);

      const fl = fluid;
      // seed the whole path at the entry point so the body arrives already
      // formed rather than growing out of a single dot
      const [sx, sy] = samplePath(OPENING, 0, fl.aspect);
      head.x = head.tx = sx;
      head.y = head.ty = sy;
      fl.setHead(sx, sy);

      const drive = { t: 0 };
      tl = gsap.timeline({
        onComplete: () => {
          settled = true;
        },
      });

      // 0.15  the surface starts to move under the cover
      tl.fromTo(fl, { swirl: 0.3 }, { swirl: 1, duration: 0.4, ease: "power2.out" }, 0.15);

      // 0.30–1.70  the fluid crosses the hero, opening it as it goes.
      // Injection is wide and constant, so this sweeps a broad region rather
      // than tracing a line through it.
      tl.fromTo(fl, { inject: 0 }, { inject: 1, duration: 0.25, ease: "power2.out" }, 0.3);
      tl.to(
        drive,
        {
          t: 1,
          duration: 1.4,
          ease: "sine.inOut",
          onUpdate: () => {
            const [x, y] = samplePath(OPENING, drive.t, fl.aspect);
            head.tx = x;
            head.ty = y;
          },
        },
        0.3,
      );

      // the body swells as it crosses, so the opening widens behind it
      tl.fromTo(fl, { radius: 0.13 }, { radius: 0.34, duration: 1.1, ease: "power1.inOut" }, 0.35);

      // 1.5–2.2  it stops laying new fluid, what is there stretches out, and
      // the last of the cover is taken away so the hero is guaranteed clean
      tl.to(fl, { inject: 0, duration: 0.45, ease: "power2.in" }, 1.5);
      tl.to(fl, { swirl: 2.1, duration: 0.8, ease: "power2.out" }, 1.5);
      tl.to(fl, { decay: 0.955, duration: 0.7, ease: "power2.in" }, 1.6);
      tl.fromTo(fl, { open: 0 }, { open: 1, duration: 0.75, ease: "power2.inOut" }, 1.65);
      tl.to(fl, { alpha: 0, duration: 0.35, ease: "power2.out" }, 2.25);
    });

    function cleanup() {
      disposed = true;
      cancelled = true;
      tl?.kill();
      periodTl?.kill();
      gsap.ticker.remove(tick);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      period?.removeEventListener("pointerenter", onPeriodEnter);
      period?.removeEventListener("pointerleave", onPeriodLeave);
      cancelAnimationFrame(resizeRaf);
      releaseScroll?.();
      fluid?.destroy();
      fluid = null;
    }

    return cleanup;
  }, []);

  return (
    <div ref={root}>
      <div
        data-hero
        id="top"
        className="relative flex h-[100svh] flex-col justify-between overflow-clip"
      >
        <HeroField />

        <HeroNav />

        <div className="relative z-10 flex flex-1 items-end px-[var(--bp-gut)] pb-[8svh]">
          <HeroTypography />
        </div>

        <div
          data-hero-foot
          className="relative z-10 flex items-end justify-between gap-6 px-[var(--bp-gut)] pb-[var(--bp-gut)]"
        >
          <p className="hero-meta whitespace-nowrap">
            Technology studio
            <span className="mx-2 opacity-40">/</span>
            New York
          </p>
          <span className="hero-meta flex items-center gap-2.5">
            Scroll
            <span className="hero-rule" aria-hidden>
              <span />
            </span>
          </span>
        </div>
      </div>

      <NextScene />
    </div>
  );
}
