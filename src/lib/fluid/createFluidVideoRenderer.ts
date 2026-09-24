/**
 * The Three.js side of the fluid video transition: one renderer, one plane,
 * one VideoTexture. It knows nothing about scroll or GSAP — the component
 * hands it a progress value and it draws that state.
 *
 * Resolution: the canvas covers the section's sticky stage, which is always
 * exactly the viewport. Its drawing buffer is sized to the stage's CSS size ×
 * a capped devicePixelRatio, and re-sized whenever the stage changes, so it is
 * never a small buffer stretched by CSS. The sheet GROWS inside that
 * full-resolution canvas; the canvas itself never scales.
 */

import * as THREE from "three";

import { fluidFragmentShader, fluidVertexShader } from "@/lib/shaders/fluidVideoTransition";
import { cornersAt, sizeOf, type Rect } from "./sheet";

export type FluidVideoRenderer = {
  /** stage size in CSS px, plus where the card and the panel sit in it */
  layout(stage: { w: number; h: number }, from: Rect, to: Rect): void;
  /** draw the transition at progress 0..1 */
  render(progress: number): void;
  /** 0 normal · 1 undistorted · 2 distortion map */
  debugMode: number;
  strength: number;
  /** measured facts, for the debug readout and verification */
  readonly stats: { buffer: [number, number]; css: [number, number]; dpr: number; video: [number, number] };
  dispose(): void;
};

export type FluidVideoOptions = {
  video: HTMLVideoElement;
  maxDpr: number;
  segments: [number, number];
  radius: [number, number];
  strength: number;
  /** trilinear filtering: the card shows the frame ~3× smaller than its
   *  source, where plain linear filtering shimmers */
  mipmaps: boolean;
};

export function createFluidVideoRenderer(
  canvas: HTMLCanvasElement,
  opts: FluidVideoOptions,
): FluidVideoRenderer | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);

  const texture = new THREE.VideoTexture(opts.video);
  // The shader writes the sampled colour straight out, and the renderer adds
  // no output conversion for a ShaderMaterial — so leaving the texture
  // untagged (NoColorSpace) passes the video's sRGB values through unchanged.
  texture.colorSpace = THREE.NoColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = opts.mipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  texture.generateMipmaps = opts.mipmaps;

  const uniforms = {
    uTexture: { value: texture },
    uEnvelope: { value: 0 },
    uTime: { value: 0 },
    uStrength: { value: opts.strength },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uImageResolution: { value: new THREE.Vector2(16, 9) },
    uCanvas: { value: new THREE.Vector2(1, 1) },
    uC0: { value: new THREE.Vector2() },
    uC1: { value: new THREE.Vector2() },
    uC2: { value: new THREE.Vector2() },
    uC3: { value: new THREE.Vector2() },
    uRadius: { value: opts.radius[0] },
    uDebug: { value: 0 },
  };

  const geometry = new THREE.PlaneGeometry(1, 1, opts.segments[0], opts.segments[1]);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: fluidVertexShader,
    fragmentShader: fluidFragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false; // the vertex shader writes clip space directly
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.Camera();

  let from: Rect = { x: 0, y: 0, w: 1, h: 1 };
  let to: Rect = { x: 0, y: 0, w: 1, h: 1 };
  const stats: FluidVideoRenderer["stats"] = { buffer: [0, 0], css: [0, 0], dpr: 1, video: [0, 0] };

  const api: FluidVideoRenderer = {
    debugMode: 0,
    strength: opts.strength,
    stats,

    layout(stage, a, b) {
      from = a;
      to = b;
      const dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr);
      renderer.setPixelRatio(dpr);
      // false: leave the CSS size alone — the canvas is laid out at 100% of
      // the stage by its classes; this sets only the drawing buffer
      renderer.setSize(stage.w, stage.h, false);
      uniforms.uCanvas.value.set(stage.w, stage.h);
      stats.css = [stage.w, stage.h];
      stats.buffer = [canvas.width, canvas.height];
      stats.dpr = dpr;
    },

    render(t) {
      const vw = opts.video.videoWidth;
      const vh = opts.video.videoHeight;
      if (vw && vh) {
        uniforms.uImageResolution.value.set(vw, vh);
        stats.video = [vw, vh];
      }
      const corners = cornersAt(from, to, t);
      uniforms.uC0.value.set(...corners[0]);
      uniforms.uC1.value.set(...corners[1]);
      uniforms.uC2.value.set(...corners[2]);
      uniforms.uC3.value.set(...corners[3]);
      const [w, h] = sizeOf(corners);
      uniforms.uResolution.value.set(Math.max(w, 1), Math.max(h, 1));
      uniforms.uEnvelope.value = Math.sin(Math.PI * t);
      uniforms.uTime.value = t * 3; // progress-derived: frozen when idle
      uniforms.uRadius.value = opts.radius[0] + (opts.radius[1] - opts.radius[0]) * t;
      uniforms.uDebug.value = api.debugMode;
      uniforms.uStrength.value = api.strength;
      renderer.render(scene, camera);
    },

    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    },
  };

  return api;
}
