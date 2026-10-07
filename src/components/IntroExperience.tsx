"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "./hero/Hero";
import FluidVideoTransition from "./sections/FluidVideoTransition";
import ServicesSection from "./sections/ServicesSection";
import FeaturedWork from "./sections/FeaturedWork";
import SiteFooter from "./sections/SiteFooter";
import { createFloatingCards, type FloatingCards } from "@/lib/hero/floatingCards";
import { createInkTrail, type InkTrail } from "@/lib/hero/inkTrail";
import { createFluidVideoRenderer } from "@/lib/fluid/createFluidVideoRenderer";
import { createAutoScrollScene } from "@/lib/fluid/autoScrollScene";
import { createPearlTrail } from "@/lib/intro/pearlTrail";
import { createOrbitalLines } from "@/lib/intro/orbitalLines";
import { createServiceCards } from "@/lib/services/serviceCards";
import { isCoarsePointer, prefersReducedMotion } from "@/lib/animation/prefs";
import LineDrawingTool from "./dev/LineDrawingTool";
import { ENABLE_LINE_DRAWING_TOOL } from "@/lib/intro/lineData";
import { createRootCardsScene } from "@/lib/work/rootCardsScene";

gsap.registerPlugin(ScrollTrigger);

const WORK_SCROLL_LENGTH = "+=500%";

const responsive = (width: number) => width < 768
  ? { strength: 0.6, duration: 1.3 }
  : width < 1024 ? { strength: 0.8, duration: 1.5 } : { strength: 1, duration: 1.7 };

/** One persistent canvas, renderer and visual tick for every visual section. */
export default function IntroExperience() {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = root.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const canvasLayer = canvas.parentElement as HTMLElement;
    const hero = container.querySelector<HTMLElement>("[data-hero]")!;
    const studio = container.querySelector<HTMLElement>("[data-fluid-transition]")!;
    const services = container.querySelector<HTMLElement>("[data-services]")!;
    const work = container.querySelector<HTMLElement>("[data-featured-work]")!;
    const footer = container.querySelector<HTMLElement>("[data-site-footer]")!;
    const nav = container.querySelector<HTMLElement>("[data-hero-nav]")!;
    const start = container.querySelector<HTMLElement>("[data-media-start]")!;
    const end = container.querySelector<HTMLElement>("[data-media-end]")!;
    const video = container.querySelector<HTMLVideoElement>("[data-fluid-video]")!;
    const reel = container.querySelector<HTMLElement>("[data-reel-overlay]");
    const serviceCardElements = Array.from(container.querySelectorAll<HTMLElement>("[data-service-card-visual]"));
    let reelShown = -1;
    const reduced = prefersReducedMotion();
    const coarse = isCoarsePointer();
    const loading = new AbortController();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch { return; }
    renderer.setClearColor(0, 0);
    const lines = createOrbitalLines();
    const serviceCards = createServiceCards();
    const fluid = createFluidVideoRenderer(renderer, {
      video, segments: coarse ? [48, 32] : [72, 48],
      radius: [18, 28], strength: responsive(window.innerWidth).strength, mipmaps: true,
    });
    let cards: FloatingCards | null = null;
    let ink: InkTrail | null = null;
    let disposed = false;
    let width = 1;
    let height = 1;
    let heroHeight = 1;
    let studioHeight = 1;
    let servicesHeight = 1;
    let dpr = 1;
    let needsResize = true;
    let videoVisible = false;
    let loaderProgress = 0;
    let loaderActive = false;
    let holdWorkForLoader = false;
    let workVisible = false;
    let workInteractive = false;
    let workScene: ReturnType<typeof createRootCardsScene> | null = null;
    let workTrigger: ScrollTrigger | null = null;
    const pointer = { x: 0, y: 0, has: false };
    const onPointer = (event: PointerEvent) => { pointer.x = event.clientX; pointer.y = event.clientY; pointer.has = true; };
    const onLeave = () => { pointer.has = false; ink?.setMouse(-1, -1); };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    const onLoaderState = (event: Event) => {
      const detail = (event as CustomEvent<{
        progress: number;
        active: boolean;
        direction: "forward" | "backward";
        holdWork: boolean;
      }>).detail;
      loaderProgress = THREE.MathUtils.clamp(detail.progress, 0, 1);
      loaderActive = detail.active;
      holdWorkForLoader = detail.holdWork;
    };
    window.addEventListener("intro:loader-state", onLoaderState);

    // Composite the hero reveal over the shared scene; studio has its own ribbon.
    const sceneTarget = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
    const pearlTrail = createPearlTrail(renderer, sceneTarget.texture);
    const inkScene = new THREE.Scene();
    const camera = new THREE.Camera();
    const inkGeometry = new THREE.PlaneGeometry(2, 2);
    const inkUniforms = {
      uInk: { value: null as THREE.Texture | null }, uScene: { value: sceneTarget.texture },
      uViewport: { value: new THREE.Vector2() }, uHeroBottom: { value: 1 },
      uHasInk: { value: 0 },
    };
    const inkMaterial = new THREE.ShaderMaterial({
      uniforms: inkUniforms, depthTest: false, depthWrite: false, blending: THREE.NoBlending,
      vertexShader: `varying vec2 vUv;
        void main() { vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uInk, uScene;
        uniform vec2 uViewport;
        uniform float uHeroBottom, uHasInk;
        void main() {
          vec4 base=texture2D(uScene,vUv);
          if(uHasInk<0.5) { gl_FragColor=base; return; }
          vec4 ink=texture2D(uInk,vUv);
          float screenY=(1.0-vUv.y)*uViewport.y;
          float studioMode=smoothstep(uHeroBottom-8.0,uHeroBottom+8.0,screenY);
          vec4 hero=vec4(ink.rgb+base.rgb*(1.0-ink.a),ink.a+base.a*(1.0-ink.a));
          gl_FragColor=mix(hero,base,studioMode);
        }`,
    });
    const inkMesh = new THREE.Mesh(inkGeometry, inkMaterial);
    inkMesh.frustumCulled = false;
    inkScene.add(inkMesh);

    const state = { progress: 0 };
    const tune = responsive(window.innerWidth);
    const timeline = gsap.timeline({ paused: true });
    timeline.to(state, { progress: 1, duration: tune.duration, ease: "sine.inOut" }, 0);
    const sceneScroll = reduced ? null : createAutoScrollScene(studio, timeline);

    type Layout = { bounds: DOMRect; stage: DOMRect; heroRect: DOMRect; studioRect: DOMRect; servicesRect: DOMRect; workRect: DOMRect; startRect: DOMRect; endRect: DOMRect };
    const measureLayout = (): Layout => ({
      bounds: container.getBoundingClientRect(), stage: canvas.getBoundingClientRect(),
      heroRect: hero.getBoundingClientRect(), studioRect: studio.getBoundingClientRect(),
      servicesRect: services.getBoundingClientRect(),
      workRect: work.getBoundingClientRect(),
      startRect: start.getBoundingClientRect(), endRect: end.getBoundingClientRect(),
    });
    let frozenLayout: Layout | null = null;
    const freezeLayout = () => { frozenLayout = measureLayout(); };
    const thawLayout = () => { frozenLayout = null; };
    window.addEventListener("intro:dive-freeze", freezeLayout);
    window.addEventListener("intro:dive-thaw", thawLayout);
    const measure = () => { needsResize = true; };
    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    observer.observe(studio);
    observer.observe(services);
    observer.observe(work);
    window.addEventListener("resize", measure, { passive: true });

    let workCancelled = false;
    void document.fonts.load("600 84px Rajdhani").catch(() => {}).then(() => {
      if (disposed || workCancelled) return;
      try {
        workScene = createRootCardsScene(canvas, renderer);
      } catch {
        return;
      }
      workScene.resize(Math.max(1, window.innerWidth), Math.max(1, window.innerHeight));
      workTrigger = ScrollTrigger.create({
        trigger: work,
        pin: true,
        start: "top top",
        end: WORK_SCROLL_LENGTH,
        scrub: true,
        onUpdate: self => workScene?.setProgress(self.progress),
      });
      workScene.setProgress(workTrigger.progress);
      workScene.setVisible(false);
      ScrollTrigger.refresh();
    });

    if (!reduced) void createFloatingCards(loading.signal).then(loaded => {
      if (!loaded) return;
      if (disposed) { loaded.destroy(); return; }
      cards = loaded;
      ink = createInkTrail(renderer, cards.canvas);
      inkUniforms.uInk.value = ink?.texture ?? null;
      needsResize = true;
    });

    const tick = (time: number, elapsed: number) => {
      if (disposed || document.hidden) return;
      const { bounds, stage, heroRect, studioRect, servicesRect, workRect, startRect, endRect } = frozenLayout ?? measureLayout();
      // A shared full-screen canvas cannot use intersection preloading here:
      // drawing Work even one frame early replaces the still-visible Services
      // scene. Activate it only once its pinned section reaches the viewport.
      // The pinned element's DOMRect changes coordinate modes when GSAP
      // releases it. Drive the outro from the trigger's absolute scroll range
      // instead so the value stays continuous across that handoff.
      const workStart = workTrigger?.start ?? Number.POSITIVE_INFINITY;
      const workEnd = workTrigger?.end ?? Number.POSITIVE_INFINITY;
      const scrollY = window.scrollY;
      const footerRevealHeight = footer.offsetHeight;
      const workDeparture = workTrigger
        ? THREE.MathUtils.clamp(scrollY - workEnd, 0, footerRevealHeight)
        : 0;
      const workOnStage = workTrigger
        ? scrollY >= workStart - 1 && scrollY < workEnd + height
        : workRect.top <= 1 && workRect.bottom > 1;
      // Once its pin releases, move the complete Work viewport upward as one
      // rigid panel. The footer stays fixed beneath it; only the panel's actual
      // bottom corners are rounded (there is no shrinking mask or crop).
      if (workDeparture > 0) {
        const radius = THREE.MathUtils.clamp(width * 0.035, 28, 64);
        const departure = -workDeparture;
        canvas.style.transform = `translate3d(0, ${departure}px, 0)`;
        canvas.style.borderRadius = `0 0 ${radius}px ${radius}px`;
        nav.style.transform = `translate3d(0, ${departure}px, 0)`;
        canvasLayer.style.zIndex = "2";
        canvasLayer.style.pointerEvents = "none";
        footer.style.visibility = "visible";
      } else {
        canvas.style.transform = "none";
        canvas.style.borderRadius = "0";
        nav.style.transform = "none";
        canvasLayer.style.zIndex = "0";
        canvasLayer.style.pointerEvents = "";
        footer.style.visibility = "hidden";
      }
      // On the way back, keep Work alive underneath the descending blue wipe
      // until the handoff jumps to Services; otherwise the canvas flashes blank.
      const shouldRenderWork = workOnStage || holdWorkForLoader;
      const shouldInteractWithWork = workOnStage && workDeparture === 0 && !loaderActive;
      if (workVisible !== shouldRenderWork || workInteractive !== shouldInteractWithWork) {
        workVisible = shouldRenderWork;
        workInteractive = shouldInteractWithWork;
        workScene?.setVisible(workVisible && !document.hidden, workInteractive && !document.hidden);
      }
      if (needsResize) {
        needsResize = false;
        width = Math.max(1, stage.width);
        height = Math.max(1, stage.height);
        heroHeight = heroRect.height;
        studioHeight = studioRect.height;
        servicesHeight = servicesRect.height;
        dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        cards?.resize(heroRect.width, heroHeight);
        ink?.resize(width, height, dpr);
        sceneTarget.setSize(Math.round(width * dpr), Math.round(height * dpr));
        lines.resize(width, height, heroHeight, studioHeight, servicesHeight);
        workScene?.resize(width, height);
        inkUniforms.uViewport.value.set(width, height);
        if (fluid) fluid.strength = responsive(width).strength;
      }
      const inStudio = studioRect.top < window.innerHeight && studioRect.bottom > 0;
      if (videoVisible !== inStudio) {
        videoVisible = inStudio;
        if (inStudio && !reduced) video.play().catch(() => {});
        else video.pause();
      }
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
        pearlTrail.update(0, 0, 0, false, width, height);
        return;
      }
      const dt = Math.min(elapsed / 1000, 0.05);
      const trailPointer = !reduced && !coarse && pointer.has && pointer.y >= studioRect.top && pointer.y < workRect.bottom;
      pearlTrail.update(dt, pointer.x - stage.left, pointer.y - stage.top, trailPointer, width, height);
      const inHero = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
      renderer.autoClear = true;
      if (ink && cards && inHero) {
        const heroPointer = pointer.has && pointer.y < heroRect.bottom;
        const x = heroPointer ? (pointer.x - stage.left) / width : -1;
        const y = heroPointer ? 1 - (pointer.y - stage.top) / height : -1;
        ink.setMouse(x, y);
        if (inHero) cards.render(dt, pointer.has ? x : 0.5, pointer.has ? y : 0.5);
        ink.setHeroRegion(heroRect.top - stage.top, heroHeight, height);
        ink.render(dt);
      }
      renderer.setRenderTarget(sceneTarget);
      renderer.clear();
      renderer.autoClear = false;
      const scroll = Math.max(0, -bounds.top);
      // Nothing at the top; the one continuous path draws itself from its start
      // as the page scrolls through sections 1 → 2, tip always in view.
      const lineProgress = lines.progressAtScroll(scroll);
      lines.render(renderer, stage.top - bounds.top, reduced ? 1 : lineProgress);
      const inServices = servicesRect.top < window.innerHeight && servicesRect.bottom > 0;
      if (inServices) serviceCards.render(renderer, serviceCardElements, stage, pointer, reduced ? 0 : time, dt);
      if (fluid && inStudio && video.readyState >= 2 && !reduced) {
        const rect = (r: DOMRect) => ({ x: r.left - stage.left, y: r.top - stage.top, w: r.width, h: r.height });
        fluid.layout({ w: width, h: height }, rect(startRect), rect(endRect));
        fluid.debugMode = Number(studio.dataset.debugMode || 0);
        fluid.render(state.progress);
        video.style.opacity = "0";
      }
      // Fade the reel title in as the video settles into its final frame.
      const reelOpacity = reduced ? 0 : Math.round(Math.min(1, Math.max(0, (state.progress - 0.7) / 0.3)) * 100) / 100;
      if (reel && reelOpacity !== reelShown) {
        reelShown = reelOpacity;
        reel.style.opacity = String(reelOpacity);
        reel.style.visibility = reelOpacity > 0 ? "visible" : "hidden";
      }
      renderer.setRenderTarget(null);
      renderer.clear();
      inkUniforms.uHasInk.value = ink ? 1 : 0;
      inkUniforms.uHeroBottom.value = heroRect.bottom - stage.top;
      renderer.render(inkScene, camera);

      // Work joins the same renderer after the earlier sections leave view.
      if (workScene && workVisible) workScene.frame();

      // The loader is a WebGL layer too, so the shared canvas never breaks.
      if (loaderProgress > 0) {
        const blueHeight = Math.ceil(height * loaderProgress);
        renderer.setScissor(0, height - blueHeight, width, blueHeight);
        renderer.setScissorTest(true);
        renderer.setClearColor(0x2457ff, 1);
        renderer.clear(true, true, true);
        renderer.setScissorTest(false);
        renderer.setClearColor(0, 0);
      }

      // The same liquid trail is the final pass over Reel, Services, loader and Work.
      renderer.setScissorTest(false);
      pearlTrail.render();
      const readout = studio.querySelector<HTMLElement>("[data-fluid-readout]");
      if (readout) readout.textContent = `Progress ${state.progress.toFixed(2)} · shared canvas ${canvas.width}×${canvas.height} · lines ${(lineProgress * 100).toFixed(0)}%`;
    };
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (videoVisible && !reduced) video.play().catch(() => {});
      workScene?.setVisible(workVisible && !document.hidden, workInteractive && !document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);
    gsap.ticker.add(tick);
    return () => {
      disposed = true;
      workCancelled = true;
      loading.abort();
      gsap.ticker.remove(tick);
      sceneScroll?.kill();
      timeline.kill();
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("intro:dive-freeze", freezeLayout);
      window.removeEventListener("intro:dive-thaw", thawLayout);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("intro:loader-state", onLoaderState);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      video.pause();
      video.style.opacity = "";
      canvas.style.transform = "";
      canvas.style.borderRadius = "";
      nav.style.transform = "";
      canvasLayer.style.zIndex = "";
      canvasLayer.style.pointerEvents = "";
      footer.style.visibility = "";
      pearlTrail.dispose();
      ink?.destroy();
      cards?.destroy();
      fluid?.dispose();
      serviceCards.dispose();
      workTrigger?.kill();
      workScene?.dispose();
      lines.dispose();
      sceneTarget.dispose();
      inkGeometry.dispose();
      inkMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={root} data-intro-experience className="relative">
      <div className="absolute inset-0 z-0">
        <canvas ref={canvasRef} data-intro-canvas className="pointer-events-none sticky top-0 block h-[100svh] w-full" />
      </div>
      <Hero />
      <FluidVideoTransition />
      <ServicesSection />
      <div
        data-services-dive-overlay
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-[100] flex items-center justify-center opacity-0 [will-change:clip-path]"
      >
        <h2
          data-dive-title
          className="overflow-hidden px-[0.08em] pb-[0.1em] text-center text-[clamp(3.5rem,9vw,9rem)] font-medium leading-none tracking-[-0.07em] text-paper"
        >
          <span data-dive-title-word className="inline-block">Featured</span>{" "}
          <span data-dive-title-word className="inline-block">Work</span>
        </h2>
      </div>
      <FeaturedWork />
      <SiteFooter />
      {ENABLE_LINE_DRAWING_TOOL && <LineDrawingTool root={root} />}
    </div>
  );
}
