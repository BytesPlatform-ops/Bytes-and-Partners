"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
    const io = new IntersectionObserver(([e]) => (visible = e?.isIntersecting ?? false), {
      rootMargin: "200px",
    });
    io.observe(section);

    const tick = () => {
      if (visible && !document.hidden) scene.frame();
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
      io.disconnect();
      ro.disconnect();
      scene.dispose();
    };
  }, []);

  return (
    <section
      ref={root}
      data-featured-work
      aria-label="Featured work"
      className="relative h-[100svh] overflow-hidden bg-[#f7f3f5]"
    >
      <canvas data-work-canvas aria-hidden className="absolute inset-0 h-full w-full" />
    </section>
  );
}
