"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { createFloatingCards, type FloatingCards } from "@/lib/hero/floatingCards";

import HeroNav from "./HeroNav";
import HeroInk from "./HeroInk";
import HeroTypography from "./HeroTypography";

import { createInkTrail, type InkTrail } from "@/lib/hero/inkTrail";
import { prefersReducedMotion, isCoarsePointer, fontsReady } from "@/lib/animation/prefs";
import { mountScroll } from "@/lib/animation/scroll";

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = <T extends Element>(s: string) => el.querySelector<T>(s);

    const hero = q<HTMLElement>("[data-hero]");
    const contentCanvas = q<HTMLCanvasElement>("[data-ink]");
    const word = q<HTMLElement>("[data-word]");
    const period = q<HTMLElement>("[data-period]");
    const footer = q<HTMLElement>("[data-hero-foot]");
    if (!hero || !word) return;

    const reduced = prefersReducedMotion();
    const coarse = isCoarsePointer();
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);

    let trail: InkTrail | null = null;
    let cards: FloatingCards | null = null;
    const cardLoading = new AbortController();
    /** last pointer position in client px */
    const pointer = { cx: 0, cy: 0, has: false };
    let releaseScroll: (() => void) | null = null;
    let visible = true;

    // ------------------------------------------------------------ geometry
    function layout() {
      const r = hero!.getBoundingClientRect();
      cards?.resize(r.width, r.height);
      trail?.resize(r.width, r.height, dpr);
    }

    // --------------------------------------------------------------- trail
    // The blob reveals a live, depth-sorted card scene.
    async function startTrail() {
      if (!contentCanvas) return;
      const loaded = await createFloatingCards(cardLoading.signal);
      if (!loaded) return;
      if (cardLoading.signal.aborted) { loaded.destroy(); return; }
      cards = loaded;
      trail = createInkTrail(contentCanvas, cards.canvas);
      if (!trail) { cards.destroy(); cards = null; return; }
      layout();
      gsap.ticker.add(trailTick);
    }

    const onPointerMove = (e: PointerEvent) => {
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
      pointer.has = true;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const trailTick = (_t: number, dt: number) => {
      if (!trail || document.hidden || !visible) return;
      const r = hero.getBoundingClientRect();
      const x = pointer.has ? (pointer.cx - r.left) / r.width : 0.5;
      const y = pointer.has ? 1 - (pointer.cy - r.top) / r.height : 0.5;
      trail.setMouse(x, y);
      const delta = Math.min(dt, 50) / 1000;
      cards?.render(delta, x, y);
      trail.render(delta);
      // Show the canvas once its first frame is ready
      if (contentCanvas!.style.visibility) {
        contentCanvas!.style.visibility = "";
      }
    };

    // -------------------------------------------------------------- scroll
    // the word is carried up and the footer lifts away. The header is fixed
    // and never moves (HeroNav).
    const scrollTick = () => {
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / vh));
      const e = p * p * (3 - 2 * p);

      word.style.transform = `translate3d(0,${-vh * 0.4 * e}px,0)`;
      word.style.opacity = `${1 - Math.max(0, (p - 0.5) / 0.5)}`;
      if (footer) {
        const o = Math.max(0, 1 - p * 2.4);
        footer.style.transform = `translate3d(0,${50 * e}px,0)`;
        footer.style.opacity = `${o}`;
        footer.style.pointerEvents = o < 0.05 ? "none" : "";
      }
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
      if (reduced) return;
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

    // ------------------------------------------------------- the word morph
    // Every letter starts as a blurred blob; the #hero-morph threshold turns
    // the blur into hard-edged liquid. The tracking starts tight so the blobs
    // merge, then opens as they condense into letterforms, left to right. At
    // the end the threshold relaxes to identity and the filter comes off, so
    // the word is left as plain, antialiased text.
    let morphTl: gsap.core.Timeline | null = null;
    let finishMorph: (() => void) | null = null;
    let cancelled = false;

    function runMorph() {
      const chars = Array.from(word!.querySelectorAll<HTMLElement>("[data-char]"));
      const matrix = el!.querySelector("[data-morph-matrix]");
      if (!chars.length || !matrix) {
        word!.dataset.morph = "done";
        return;
      }

      const cs = getComputedStyle(word!);
      const size = parseFloat(cs.fontSize) || 100;
      const tracking = parseFloat(cs.letterSpacing) || 0;

      /** alpha' = slope · alpha + offset — steep = liquid, (1, 0) = identity */
      const threshold = { slope: 22, offset: -10 };
      const writeMatrix = () =>
        matrix.setAttribute(
          "values",
          `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${threshold.slope} ${threshold.offset}`,
        );
      writeMatrix();

      gsap.set(chars, { opacity: 0, filter: `blur(${size * 0.28}px)` });
      gsap.set(word, { letterSpacing: `${tracking - size * 0.09}px` });
      word!.dataset.morph = "run";

      const finish = () => {
        word!.dataset.morph = "done";
        gsap.set(chars, { clearProps: "opacity,filter" });
        gsap.set(word, { clearProps: "letterSpacing" });
        finishMorph = null;
      };
      finishMorph = finish;

      const STAGGER = 0.07;
      const SHARPEN = 1.3;
      /** when the last letter is all but sharp */
      const sharp = STAGGER * (chars.length - 1) + SHARPEN - 0.4;

      morphTl = gsap.timeline({ onComplete: finish });
      morphTl
        .to(chars, { opacity: 1, duration: 0.5, ease: "power1.out", stagger: STAGGER }, 0)
        .to(chars, { filter: "blur(0px)", duration: SHARPEN, ease: "power3.out", stagger: STAGGER }, 0)
        .to(word, { letterSpacing: `${tracking}px`, duration: 1.8, ease: "expo.out" }, 0.1)
        // relax the threshold to identity so the edges regain antialiasing
        .to(threshold, {
          slope: 1,
          offset: 0,
          duration: 0.4,
          ease: "power2.inOut",
          onUpdate: writeMatrix,
        }, sharp);
    }

    // ------------------------------------------------------------- startup
    // Reduced motion: the composition is simply there — no morph, no trail,
    // no parallax.
    if (reduced) {
      word.dataset.morph = "done";
      releaseScroll = mountScroll({ smooth: false });
      return cleanup;
    }

    releaseScroll = mountScroll({ smooth: !coarse });
    gsap.ticker.add(scrollTick);
    void startTrail();
    // wait for the webfont so the letters condense into their final shapes
    fontsReady(900).then(() => {
      if (!cancelled) runMorph();
    });

    function cleanup() {
      cancelled = true;
      cardLoading.abort();
      morphTl?.kill();
      // never leave the word blurred or filtered behind a killed timeline
      finishMorph?.();
      periodTl?.kill();
      gsap.ticker.remove(scrollTick);
      gsap.ticker.remove(trailTick);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      period?.removeEventListener("pointerenter", onPeriodEnter);
      period?.removeEventListener("pointerleave", onPeriodLeave);
      cancelAnimationFrame(resizeRaf);
      releaseScroll?.();
      trail?.destroy();
      trail = null;
      cards?.destroy();
      cards = null;
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
        <HeroInk />

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
    </div>
  );
}
