"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./FeaturedWork.css";

import { createRootCardsScene } from "@/lib/work/rootCardsScene";

gsap.registerPlugin(ScrollTrigger);

/**
 * FEATURED WORK — the root and card spiral (lib/work/rootCardsScene).
 *
 * The section pins while the page scrolls through SCROLL_LENGTH; that scroll,
 * as 0..1, is the scene's scroll progress (the prototype used the whole
 * document's scroll — here it is this section's). The scene smooths toward
 * it and orbits the camera down the root.
 */

/** how much scroll the camera's descent takes */
const SCROLL_LENGTH = "+=500%";

export default function FeaturedWork() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    const canvas = section?.querySelector<HTMLCanvasElement>("[data-work-canvas]");
    if (!section || !canvas) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    async function initialize() {
      await document.fonts.load('600 84px Rajdhani').catch(() => {});
      if (cancelled) return;
      if (!section || !canvas) return;

      let scene: ReturnType<typeof createRootCardsScene>;
      try {
        scene = createRootCardsScene(canvas);
      } catch {
        return; // no WebGL
      }

      const resize = () => {
        const r = section.getBoundingClientRect();
        scene.resize(r.width, r.height);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(section);
      resize();

      const trigger = ScrollTrigger.create({
        trigger: section,
        pin: true,
        start: "top top",
        end: SCROLL_LENGTH,
        scrub: true,
        onUpdate: (self) => scene.setProgress(self.progress),
      });
      scene.setProgress(trigger.progress);

      let visible = false;
      const syncVisibility = () => scene.setVisible(visible && !document.hidden);
      const io = new IntersectionObserver(([e]) => {
        visible = e?.isIntersecting ?? false;
        syncVisibility();
      }, {
        rootMargin: "200px",
      });
      io.observe(section);
      syncVisibility();
      document.addEventListener("visibilitychange", syncVisibility);

      const tick = () => {
        if (visible && !document.hidden) scene.frame();
      };
      gsap.ticker.add(tick);

      cleanup = () => {
        document.removeEventListener("visibilitychange", syncVisibility);
        gsap.ticker.remove(tick);
        trigger.kill();
        io.disconnect();
        ro.disconnect();
        scene.dispose();
      };
    }
    void initialize();
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  return (
    <section
      id="work"
      ref={root}
      data-featured-work
      aria-label="Featured work"
      className="relative h-[100svh] overflow-hidden bg-[#f4f1eb]"
    >
      <canvas data-work-canvas className="absolute inset-0 h-full w-full" />
    </section>
  );
}
