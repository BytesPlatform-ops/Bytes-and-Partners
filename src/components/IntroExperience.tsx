"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import Hero from "./hero/Hero";
import FluidVideoTransition from "./sections/FluidVideoTransition";
import { createFloatingCards, type FloatingCards } from "@/lib/hero/floatingCards";
import { createInkTrail, type InkTrail } from "@/lib/hero/inkTrail";
import { createFluidVideoRenderer } from "@/lib/fluid/createFluidVideoRenderer";
import { createPinnedScene } from "@/lib/fluid/pinnedScene";
import { createTextLiquid } from "@/lib/intro/textLiquid";
import { createOrbitalLines } from "@/lib/intro/orbitalLines";
import { isCoarsePointer, prefersReducedMotion } from "@/lib/animation/prefs";

const responsive = (width: number) => width < 768
  ? { strength: 0.6, duration: 1.3 }
  : width < 1024 ? { strength: 0.8, duration: 1.5 } : { strength: 1, duration: 1.7 };

/** One persistent canvas, renderer and visual tick for the first two sections. */
export default function IntroExperience() {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = root.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const hero = container.querySelector<HTMLElement>("[data-hero]")!;
    const studio = container.querySelector<HTMLElement>("[data-fluid-transition]")!;
    const start = container.querySelector<HTMLElement>("[data-media-start]")!;
    const end = container.querySelector<HTMLElement>("[data-media-end]")!;
    const video = container.querySelector<HTMLVideoElement>("[data-fluid-video]")!;
    const word = container.querySelector<HTMLElement>("[data-word]")!;
    const footer = container.querySelector<HTMLElement>("[data-hero-foot]")!;
    const reduced = prefersReducedMotion();
    const coarse = isCoarsePointer();
    const loading = new AbortController();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch { return; }
    const textLiquid = createTextLiquid(container.querySelector<HTMLElement>("[data-fluid-copy]")!);
    renderer.setClearColor(0, 0);
    const lines = createOrbitalLines();
    const fluid = createFluidVideoRenderer(renderer, {
      video, segments: coarse ? [48, 32] : [72, 48],
      radius: [14, 12], strength: responsive(window.innerWidth).strength, mipmaps: true,
    });
    let cards: FloatingCards | null = null;
    let ink: InkTrail | null = null;
    let disposed = false;
    let width = 1;
    let height = 1;
    let heroHeight = 1;
    let studioHeight = 1;
    let dpr = 1;
    let needsResize = true;
    let videoVisible = false;
    const pointer = { x: 0, y: 0, has: false };
    const onPointer = (event: PointerEvent) => { pointer.x = event.clientX; pointer.y = event.clientY; pointer.has = true; };
    const onLeave = () => { pointer.has = false; ink?.setMouse(-1, -1); };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // Composite both modes over the same scene using the same live ink field.
    const sceneTarget = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
    const inkScene = new THREE.Scene();
    const camera = new THREE.Camera();
    const inkGeometry = new THREE.PlaneGeometry(2, 2);
    const inkUniforms = {
      uInk: { value: null as THREE.Texture | null }, uScene: { value: sceneTarget.texture },
      uViewport: { value: new THREE.Vector2() }, uHeroBottom: { value: 1 },
      uStudio: { value: new THREE.Vector2() }, uTime: { value: 0 }, uHasInk: { value: 0 },
    };
    const inkMaterial = new THREE.ShaderMaterial({
      uniforms: inkUniforms, depthTest: false, depthWrite: false, blending: THREE.NoBlending,
      vertexShader: `varying vec2 vUv;
        void main() { vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uInk, uScene;
        uniform vec2 uViewport, uStudio;
        uniform float uHeroBottom, uTime, uHasInk;
        float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p) {
          vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.0),f.x),f.y);
        }
        void main() {
          vec4 base=texture2D(uScene,vUv);
          if(uHasInk<0.5) { gl_FragColor=base; return; }
          vec4 ink=texture2D(uInk,vUv);
          float screenY=(1.0-vUv.y)*uViewport.y;
          float studioMode=smoothstep(uHeroBottom-8.0,uHeroBottom+8.0,screenY);
          float inStudio=step(uStudio.x,screenY)*(1.0-step(uStudio.y,screenY));
          vec4 hero=vec4(ink.rgb+base.rgb*(1.0-ink.a),ink.a+base.a*(1.0-ink.a));
          vec2 p=vUv*vec2(uViewport.x/uViewport.y,1.0)*7.0;
          vec2 flow=vec2(noise(p+vec2(uTime*.22,-uTime*.15)),noise(p+12.7-uTime*.18))-.5;
          // Clear liquid only: bend the scene underneath without adding color.
          vec2 waves=vec2(sin(p.y*4.2+flow.x*5.0-uTime*1.9),
            cos(p.x*3.8+flow.y*5.0+uTime*1.6));
          vec2 texel=1.0/uViewport;
          // Feather only the displacement boundary, not the hero's reveal.
          float wet=ink.a*0.4;
          wet+=texture2D(uInk,vUv+texel*vec2(5,0)).a*.15;
          wet+=texture2D(uInk,vUv-texel*vec2(5,0)).a*.15;
          wet+=texture2D(uInk,vUv+texel*vec2(0,5)).a*.15;
          wet+=texture2D(uInk,vUv-texel*vec2(0,5)).a*.15;
          vec2 offset=(flow*.6+waves*.4)*vec2(uViewport.y/uViewport.x,1.0)*.052*wet*inStudio;
          vec4 liquid=texture2D(uScene,clamp(vUv+offset,0.001,0.999));
          gl_FragColor=mix(hero,liquid,studioMode);
        }`,
    });
    const inkMesh = new THREE.Mesh(inkGeometry, inkMaterial);
    inkMesh.frustumCulled = false;
    inkScene.add(inkMesh);

    const state = { progress: 0 };
    const tune = responsive(window.innerWidth);
    const timeline = gsap.timeline({ paused: true });
    timeline.to(state, { progress: 1, duration: tune.duration, ease: "sine.inOut" }, 0);
    timeline.to(studio, { "--fade": 1, duration: tune.duration * 0.4, ease: "power2.in" }, 0);
    gsap.set(studio, { "--fade": 0 });
    const pinned = reduced ? null : createPinnedScene(studio, timeline, { hold: "+=45%", reverseAt: 0.5 });

    const measure = () => { needsResize = true; };
    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    observer.observe(studio);
    window.addEventListener("resize", measure, { passive: true });

    if (!reduced) void createFloatingCards(loading.signal).then(loaded => {
      if (!loaded) return;
      if (disposed) { loaded.destroy(); return; }
      cards = loaded;
      ink = createInkTrail(renderer, cards.canvas);
      inkUniforms.uInk.value = ink?.texture ?? null;
      needsResize = true;
    });

    const tick = (_time: number, elapsed: number) => {
      if (disposed || document.hidden) return;
      const bounds = container.getBoundingClientRect();
      const stage = canvas.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const studioRect = studio.getBoundingClientRect();
      if (needsResize) {
        needsResize = false;
        width = Math.max(1, stage.width);
        height = Math.max(1, stage.height);
        heroHeight = heroRect.height;
        studioHeight = studioRect.height;
        dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        cards?.resize(heroRect.width, heroHeight);
        ink?.resize(width, height, dpr);
        sceneTarget.setSize(Math.round(width * dpr), Math.round(height * dpr));
        lines.resize(width, height, heroHeight, studioHeight);
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
        textLiquid.update(0, pointer.x, pointer.y, false);
        return;
      }
      const dt = Math.min(elapsed / 1000, 0.05);
      textLiquid.update(dt, pointer.x, pointer.y, !reduced && inStudio && pointer.has);
      const inHero = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
      renderer.autoClear = true;
      if (ink && cards && (inHero || inStudio)) {
        const x = pointer.has ? (pointer.x - stage.left) / width : -1;
        const y = pointer.has ? 1 - (pointer.y - stage.top) / height : -1;
        ink.setMouse(x, y);
        if (inHero) cards.render(dt, pointer.has ? x : 0.5, pointer.has ? y : 0.5);
        ink.setHeroRegion(heroRect.top - stage.top, heroHeight, height);
        ink.render(dt);
      }
      renderer.setRenderTarget(sceneTarget);
      renderer.clear();
      renderer.autoClear = false;
      const scroll = Math.max(0, -bounds.top);
      const length = heroHeight + (pinned ? pinned.trigger.end - pinned.trigger.start : studioHeight * 0.45);
      lines.render(renderer, stage.top - bounds.top, reduced ? 1 : Math.min(1, scroll / Math.max(1, length)));
      if (fluid && inStudio && video.readyState >= 2 && !reduced) {
        const rect = (element: HTMLElement) => {
          const r = element.getBoundingClientRect();
          return { x: r.left - stage.left, y: r.top - stage.top, w: r.width, h: r.height };
        };
        fluid.layout({ w: width, h: height }, rect(start), rect(end));
        fluid.debugMode = Number(studio.dataset.debugMode || 0);
        fluid.render(state.progress);
        video.style.opacity = "0";
      }
      renderer.setRenderTarget(null);
      renderer.clear();
      inkUniforms.uHasInk.value = ink ? 1 : 0;
      inkUniforms.uHeroBottom.value = heroRect.bottom - stage.top;
      inkUniforms.uStudio.value.set(studioRect.top - stage.top, studioRect.bottom - stage.top);
      inkUniforms.uTime.value += dt;
      renderer.render(inkScene, camera);
      if (!reduced) {
        const progress = Math.min(1, scroll / Math.max(1, heroHeight));
        const ease = progress * progress * (3 - 2 * progress);
        word.style.transform = `translate3d(0,${-heroHeight * 0.4 * ease}px,0)`;
        word.style.opacity = `${1 - Math.max(0, (progress - 0.5) / 0.5)}`;
        const opacity = Math.max(0, 1 - progress * 2.4);
        footer.style.transform = `translate3d(0,${50 * ease}px,0)`;
        footer.style.opacity = `${opacity}`;
        footer.style.pointerEvents = opacity < 0.05 ? "none" : "";
      }
      const readout = studio.querySelector<HTMLElement>("[data-fluid-readout]");
      if (readout) readout.textContent = `Progress ${state.progress.toFixed(2)} · shared canvas ${canvas.width}×${canvas.height} · lines ${(Math.min(1, scroll / length) * 100).toFixed(0)}%`;
    };
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (videoVisible && !reduced) video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    gsap.ticker.add(tick);
    return () => {
      disposed = true;
      loading.abort();
      gsap.ticker.remove(tick);
      pinned?.kill();
      timeline.kill();
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      video.pause();
      video.style.opacity = "";
      studio.style.removeProperty("--fade");
      textLiquid.dispose();
      ink?.destroy();
      cards?.destroy();
      fluid?.dispose();
      lines.dispose();
      sceneTarget.dispose();
      inkGeometry.dispose();
      inkMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={root} data-intro-experience className="relative">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <canvas ref={canvasRef} data-intro-canvas className="sticky top-0 block h-[100svh] w-full" />
      </div>
      <Hero />
      <FluidVideoTransition />
    </div>
  );
}
