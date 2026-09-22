/**
 * THE FLUID REVEAL
 *
 * The fluid is a *mask*, not a layer of ink. The hero content sits in the DOM
 * underneath an opaque cover the exact colour of the page; this shader paints
 * that cover, and punches it away wherever the fluid has reached. What you see
 * inside the shape is the real composition showing through — the typography is
 * never drawn here, never touched, and stays live DOM text throughout.
 *
 *   cover alpha = (1 - revealed) * (1 - open)
 *
 * A real feedback trail drives it. Two RGBA framebuffers are ping-ponged:
 * every frame the previous field is resampled along a velocity field
 * (advection), faded (decay), and fresh ink is injected along the segment the
 * head travelled this frame (splat).
 *
 *     field(n) = advect(field(n-1), velocity) * decay + splat(head)
 *
 * Everything that makes it read as fluid falls out of that loop rather than
 * being drawn: the stretched tail is old ink still being carried, the strands
 * and wisps are curl noise pulling that ink apart, the varying thickness is
 * ink piling up where the head slowed. None of it is a curve or a capsule.
 *
 * R carries density (the live fluid, which decays), G carries freshness (the
 * working front, for the edge colour) and B carries what has been revealed —
 * which never decays, so ground the fluid has covered stays open behind it.
 */

const QUAD = new Float32Array([-1, -1, 3, -1, -1, 3]);

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/** shared noise, used by both passes */
const NOISE = `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.02 + 19.3;
    a *= 0.5;
  }
  return v;
}
float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}
`;

/** pass A — advect the previous field, decay it, inject new ink */
const STEP = `
precision highp float;
${NOISE}

uniform sampler2D uPrev;
uniform vec2  uRes;
uniform float uAspect;
uniform float uTime;
uniform float uDecay;
uniform vec2  uHeadA;    // where the head was last frame
uniform vec2  uHeadB;    // where it is now
uniform float uRadius;
uniform float uInject;
uniform vec2  uHeadVel;
uniform float uScroll;
uniform float uSwirl;
uniform float uReclaim;  // <1 lets revealed ground close back up

/** curl of an fbm potential: divergence-free, so it swirls instead of blowing up */
vec2 curl(vec2 p) {
  float e = 0.012;
  float n1 = fbm(p + vec2(0.0, e));
  float n2 = fbm(p - vec2(0.0, e));
  float n3 = fbm(p + vec2(e, 0.0));
  float n4 = fbm(p - vec2(e, 0.0));
  return vec2(n1 - n2, n4 - n3) / (2.0 * e);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * uAspect, uv.y);

  // --- velocity: an ambient swirl, plus the head dragging ink along with it
  vec2 v = curl(p * 1.5 + vec2(uTime * 0.05, -uTime * 0.035)) * 0.0030 * uSwirl;
  v += curl(p * 3.6 - vec2(uTime * 0.07, uTime * 0.04)) * 0.0014 * uSwirl;
  v += curl(p * 8.1 + vec2(uTime * 0.11, uTime * 0.06)) * 0.0012 * uSwirl;

  float dh = sdSeg(p, uHeadA, uHeadB);
  v += uHeadVel * exp(-dh * dh * 26.0) * 0.55;
  v.y += uScroll * 0.0022;

  // --- advect: this pixel takes the ink that was upstream of it
  vec2 back = uv - vec2(v.x / uAspect, v.y);
  vec4 prev = texture2D(uPrev, back);

  // faint ink dissolves faster than dense ink, which is what frays the tail
  float dens = prev.r;
  float dec = uDecay - 0.05 * (1.0 - dens);
  dens = max(0.0, dens * dec - 0.0026);

  // freshness fades much faster, so it only ever marks the working front
  float fresh = max(0.0, prev.g * 0.90 - 0.004);

  // what has been revealed stays revealed — this is the mask the cover is
  // punched out of, so the composition does not close up behind the fluid
  // Reclaim lets the transition run backwards: the revealed ground closes up
  // again so scrolling away is the same fluid system, not a fade.
  float open = max(0.0, prev.b * uReclaim - (1.0 - uReclaim) * 0.02);

  // --- inject along the segment the head covered this frame, so fast motion
  // --- lays a continuous stream instead of a string of beads
  float s = exp(-(dh * dh) / max(uRadius * uRadius, 1e-6)) * uInject;
  dens = min(1.0, dens + s);
  fresh = min(1.0, max(fresh, s * 1.25));
  open = min(1.0, max(open, smoothstep(0.10, 0.55, dens)));

  gl_FragColor = vec4(dens, fresh, open, 1.0);
}
`;

/** pass B — paint the cover and punch the fluid out of it */
const DRAW = `
precision highp float;
${NOISE}

uniform sampler2D uField;
uniform vec2  uRes;
uniform float uAspect;
uniform float uTime;
uniform float uOpen;    // forces the cover fully away at the end
uniform float uAlpha;

/* the exact page colour; any drift here shows as a seam */
const vec3 PAPER = vec3(0.9608, 0.9490, 0.9176);
const vec3 EDGE  = vec3(0.098, 0.106, 0.133);
const vec3 BLUE  = vec3(0.141, 0.341, 1.000);

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * uAspect, uv.y);

  // Heavy domain warp on the mask lookup. This is what gives the silhouette
  // its ink-spreading edge instead of a soft circular falloff — two octaves,
  // both drifting, at a scale large enough to deform the whole shape.
  vec2 w1 = vec2(fbm(p * 1.6 + uTime * 0.05), fbm(p * 1.6 + 23.1 - uTime * 0.04)) - 0.5;
  vec2 w2 = vec2(fbm(p * 4.4 - uTime * 0.07), fbm(p * 4.4 + 57.3 + uTime * 0.06)) - 0.5;
  vec2 suv = uv + w1 * 0.085 + w2 * 0.026;

  vec4 f = texture2D(uField, suv);
  float live = f.r;
  float fresh = f.g;
  float opened = f.b;

  // the mask: everything already revealed, plus wherever the fluid is now
  float m = clamp(max(opened, smoothstep(0.03, 0.30, live)), 0.0, 1.0);
  m = clamp(m + uOpen * 1.15, 0.0, 1.0);

  // the leading edge, where the cover is being torn away
  float edge = m * (1.0 - m) * 4.0;
  float tint = edge * (0.18 + fresh * 0.5) * (1.0 - uOpen);

  vec3 col = mix(PAPER, mix(EDGE, BLUE, clamp(fresh * 1.6, 0.0, 1.0)), clamp(tint * 1.6, 0.0, 1.0));

  float cover = (1.0 - m) * uAlpha;
  float a = max(cover, tint * 0.55 * uAlpha);

  if (a < 0.002) discard;
  gl_FragColor = vec4(col, a);
}
`;

export type Fluid = {
  /** move the head; ink is laid along the segment since the last call */
  setHead(x: number, y: number): void;
  /** 0..1 how much ink the head is laying down */
  inject: number;
  radius: number;
  decay: number;
  swirl: number;
  /** 1 keeps revealed ground open; below 1 closes it back up */
  reclaim: number;
  alpha: number;
  scroll: number;
  /** 0..1 forces the cover fully away, guaranteeing a clean final frame */
  open: number;
  readonly aspect: number;
  resize(cssW: number, cssH: number, scale: number, dpr: number): void;
  render(dt: number): void;
  destroy(): void;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function program(gl: WebGLRenderingContext, frag: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  const pr = gl.createProgram();
  if (!vs || !fs || !pr) return null;
  gl.attachShader(pr, vs);
  gl.attachShader(pr, fs);
  gl.bindAttribLocation(pr, 0, "aPos");
  gl.linkProgram(pr);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
    gl.deleteProgram(pr);
    return null;
  }
  return pr;
}

type Target = { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };

export function createFluid(canvas: HTMLCanvasElement): Fluid | null {
  const gl = (canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  }) ?? null) as WebGLRenderingContext | null;
  if (!gl) return null;

  const stepProg = program(gl, STEP);
  const drawProg = program(gl, DRAW);
  if (!stepProg || !drawProg) return null;

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);


  let a: Target | null = null;
  let b: Target | null = null;
  let lost = false;

  function makeTarget(w: number, h: number): Target | null {
    const tex = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    const fb = gl!.createFramebuffer();
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fb);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
    const ok = gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) === gl!.FRAMEBUFFER_COMPLETE;
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    if (!ok || !fb || !tex) return null;
    // start empty, or the first frames advect garbage
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fb);
    gl!.clearColor(0, 0, 0, 1);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    return { fb, tex, w, h };
  }

  function dropTargets() {
    if (a) {
      gl!.deleteFramebuffer(a.fb);
      gl!.deleteTexture(a.tex);
    }
    if (b) {
      gl!.deleteFramebuffer(b.fb);
      gl!.deleteTexture(b.tex);
    }
    a = b = null;
  }

  const uStep = {
    prev: gl.getUniformLocation(stepProg, "uPrev"),
    res: gl.getUniformLocation(stepProg, "uRes"),
    aspect: gl.getUniformLocation(stepProg, "uAspect"),
    time: gl.getUniformLocation(stepProg, "uTime"),
    decay: gl.getUniformLocation(stepProg, "uDecay"),
    headA: gl.getUniformLocation(stepProg, "uHeadA"),
    headB: gl.getUniformLocation(stepProg, "uHeadB"),
    radius: gl.getUniformLocation(stepProg, "uRadius"),
    inject: gl.getUniformLocation(stepProg, "uInject"),
    headVel: gl.getUniformLocation(stepProg, "uHeadVel"),
    scroll: gl.getUniformLocation(stepProg, "uScroll"),
    swirl: gl.getUniformLocation(stepProg, "uSwirl"),
    reclaim: gl.getUniformLocation(stepProg, "uReclaim"),
  };
  const uDraw = {
    field: gl.getUniformLocation(drawProg, "uField"),
    res: gl.getUniformLocation(drawProg, "uRes"),
    aspect: gl.getUniformLocation(drawProg, "uAspect"),
    time: gl.getUniformLocation(drawProg, "uTime"),
    open: gl.getUniformLocation(drawProg, "uOpen"),
    alpha: gl.getUniformLocation(drawProg, "uAlpha"),
  };

  let time = 0;
  let aspect = 1;
  const prevHead = { x: 0.5, y: 0.5 };
  const head = { x: 0.5, y: 0.5 };
  let seeded = false;

  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const api: Fluid = {
    inject: 0,
    open: 0,
    reclaim: 1,
    radius: 0.22,
    decay: 0.975,
    swirl: 1,
    alpha: 1,
    scroll: 0,
    get aspect() {
      return aspect;
    },

    setHead(x, y) {
      if (!seeded) {
        prevHead.x = head.x = x;
        prevHead.y = head.y = y;
        seeded = true;
        return;
      }
      prevHead.x = head.x;
      prevHead.y = head.y;
      head.x = x;
      head.y = y;
    },

    resize(cssW, cssH, scale, dpr) {
      if (lost || cssW < 2 || cssH < 2) return;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.width = Math.max(2, Math.round(cssW * dpr));
      canvas.height = Math.max(2, Math.round(cssH * dpr));
      aspect = cssW / cssH;

      // the simulation runs coarser than the canvas it is drawn to
      const sw = Math.max(2, Math.round(cssW * scale * dpr));
      const sh = Math.max(2, Math.round(cssH * scale * dpr));
      if (a && a.w === sw && a.h === sh) return;
      dropTargets();
      a = makeTarget(sw, sh);
      b = makeTarget(sw, sh);
      if (!a || !b) lost = true;
    },

    render(dt) {
      if (lost || !a || !b) return;
      time += dt;

      const vx = head.x - prevHead.x;
      const vy = head.y - prevHead.y;

      // ---- pass A: advect + decay + splat, into b, reading a
      gl.useProgram(stepProg);
      gl.bindFramebuffer(gl.FRAMEBUFFER, b.fb);
      gl.viewport(0, 0, b.w, b.h);
      gl.disable(gl.BLEND);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, a.tex);
      gl.uniform1i(uStep.prev, 0);
      gl.uniform2f(uStep.res, b.w, b.h);
      gl.uniform1f(uStep.aspect, aspect);
      gl.uniform1f(uStep.time, time);
      gl.uniform1f(uStep.decay, api.decay);
      gl.uniform2f(uStep.headA, prevHead.x, prevHead.y);
      gl.uniform2f(uStep.headB, head.x, head.y);
      gl.uniform1f(uStep.radius, api.radius);
      gl.uniform1f(uStep.inject, api.inject);
      gl.uniform2f(uStep.headVel, vx, vy);
      gl.uniform1f(uStep.scroll, api.scroll);
      gl.uniform1f(uStep.swirl, api.swirl);
      gl.uniform1f(uStep.reclaim, api.reclaim);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // ---- pass B: paint the field to the screen
      gl.useProgram(drawProg);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, b.tex);
      gl.uniform1i(uDraw.field, 0);
      gl.uniform2f(uDraw.res, canvas.width, canvas.height);
      gl.uniform1f(uDraw.aspect, aspect);
      gl.uniform1f(uDraw.time, time);
      gl.uniform1f(uDraw.open, api.open);
      gl.uniform1f(uDraw.alpha, api.alpha);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // ping-pong
      const t = a;
      a = b;
      b = t;
    },

    destroy() {
      canvas.removeEventListener("webglcontextlost", onLost);
      dropTargets();
      gl.deleteBuffer(buf);
      gl.deleteProgram(stepProg);
      gl.deleteProgram(drawProg);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      lost = true;
    },
  };

  return api;
}
