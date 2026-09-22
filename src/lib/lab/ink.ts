/**
 * INK — milestone 2: feedback buffer
 *
 * A liquid ink field, used as a REVEAL MASK over whatever sits underneath the
 * canvas in the DOM.
 *
 * Two passes a frame:
 *
 *   1. SIM  (ping-pong, reduced resolution)
 *        previous field  ──advect along a curl-noise flow──┐
 *                        ──bleed where still wet───────────┤
 *                        ──patchy decay────────────────────┤──▶ next field
 *        new stroke segment (head A → head B) ─────────────┘
 *
 *      The field has memory: every frame starts from the last one.
 *        R = pigment  (what the mask is made of; fades slowly)
 *        G = wetness  (fresh ink only; dries fast, drives the bleed)
 *        B = pending  (ink laid down but not yet soaked in; develops into R)
 *
 *      Ink never lands at full strength. It goes into B and soaks into R over
 *      ~a quarter second, so the leading edge is always under-developed: thin,
 *      split and tapering, while the body fills in behind it. Without this the
 *      head is the densest point of the trail and reads as a round cap.
 *
 *   2. DISPLAY (full canvas)
 *        Samples the field through a small drifting domain warp and turns it
 *        into a mask with a noise-varying threshold, so ageing ink breaks up
 *        into ragged islands instead of fading as one flat gradient. Outputs
 *        the cream cover with alpha = 1 − mask: ink punches the cover away.
 *
 * Precision: the field wants half-float. A multiplicative decay stalls in
 * 8-bit (0.985 · 8/255 rounds back to 8/255), so the 8-bit fallback leans on a
 * subtractive floor large enough to always cross one step per frame.
 */

export type InkView = "composite" | "mask" | "feedback";

const VIEW_ID: Record<InkView, number> = { composite: 0, mask: 1, feedback: 2 };

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
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}

float fbm3(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.07 + 11.3;
    a *= 0.5;
  }
  return v / 0.875;
}
`;

const VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const SIM = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uPrev;
uniform float uAspect;
uniform float uTime;
uniform float uDt;
uniform vec2  uHeadA;     // stroke segment, aspect-corrected space
uniform vec2  uHeadB;
uniform float uRadius;
uniform float uInk;       // 0 = pen lifted
uniform float uFlow;      // curl velocity scale
uniform float uBleed;     // wet spread rate
uniform float uFade;      // pigment decay, 1/s
uniform float uFloor;     // subtractive decay, 1/s
uniform float uDry;       // wetness decay, 1/s
uniform float uDevelop;   // pending → pigment soak rate, 1/s
${NOISE}

float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
  return length(pa - ba * h);
}

/** divergence-free drift: the curl of a slowly evolving noise potential */
vec2 curl(vec2 p, float freq, vec2 o) {
  const float e = 0.01;
  p = p * freq + o;
  float n1 = fbm3(p + vec2(0.0, e));
  float n2 = fbm3(p - vec2(0.0, e));
  float n3 = fbm3(p + vec2(e, 0.0));
  float n4 = fbm3(p - vec2(e, 0.0));
  return vec2(n1 - n2, n4 - n3) / (2.0 * e);
}

void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  vec2 toUv = vec2(1.0 / uAspect, 1.0);

  // ---- advect: pull the field back along the flow (semi-Lagrangian)
  // a broad current carries the ink, a finer one shears its edges into wisps
  vec2 v = curl(p, 1.7, vec2(0.0, uTime * 0.06)) * uFlow
         + curl(p, 5.5, vec2(uTime * 0.11, 3.7)) * uFlow * 0.3;
  vec2 back = vUv - v * toUv * uDt;
  vec3 c = texture(uPrev, back).rgb;

  // ---- neighbourhood, in fixed scene units so spread is resolution-independent
  vec2 o = 0.0035 * toUv;
  vec3 n0 = texture(uPrev, back + vec2(o.x, 0.0)).rgb;
  vec3 n1 = texture(uPrev, back - vec2(o.x, 0.0)).rgb;
  vec3 n2 = texture(uPrev, back + vec2(0.0, o.y)).rgb;
  vec3 n3 = texture(uPrev, back - vec2(0.0, o.y)).rgb;
  vec3 nMax = max(max(n0, n1), max(n2, n3));
  vec3 nAvg = (n0 + n1 + n2 + n3) * 0.25;

  float dens = c.r;
  float wet = c.g;
  float pend = c.b;

  // ---- soak: pending ink develops into pigment, fast at first then easing in
  float soak = 1.0 - exp(-uDevelop * uDt);
  dens = mix(dens, max(dens, pend), soak);
  pend *= exp(-0.5 * uDt);

  // ---- capillary bleed: wet ink creeps outward along a paper-grain pattern,
  // ---- so the spread is fibrous and uneven rather than a uniform grow.
  // ---- This is what gives the stroke its width: the pen lays a narrow line
  // ---- and the body swells behind it, so the head stays a thin tip. The
  // ---- falloff per step makes the spread self-limiting (~8 steps to halve).
  float grain = smoothstep(0.3, 0.75, fbm(p * vec2(34.0, 22.0) + 3.1));
  float bleed = clamp(nMax.g * grain * uBleed * uDt, 0.0, 1.0);
  pend = mix(pend, max(pend, nMax.b * 0.9), bleed);
  wet = mix(wet, max(wet, nMax.g * 0.86), bleed);

  // a touch of diffusion keeps the field from aliasing, not enough to blur it
  dens = mix(dens, nAvg.r, clamp(uDt * 3.0, 0.0, 1.0) * 0.35);

  // ---- decay in patches: some regions let go of the pigment sooner
  float patchy = 0.45 + 1.1 * fbm3(p * 3.4 + vec2(uTime * 0.05, -uTime * 0.03));
  dens *= exp(-uFade * patchy * uDt);
  dens = max(dens - uFloor * uDt, 0.0);
  wet *= exp(-uDry * uDt);

  // ---- new ink: the segment travelled since last frame. A union of ragged
  // ---- stamps is still a smooth envelope, so the edge is NOT made here: the
  // ---- profile is laid down deliberately soft, and the display pass's noisy
  // ---- threshold carves the contour out of that slope. A steep profile would
  // ---- leave the threshold noise nothing to move.
  // ---- Pigment is also laid down unevenly (fixed in scene space, so it does
  // ---- not shimmer), and the thin parts are the first to let go later.
  if (uInk > 0.0) {
    float d = sdSeg(p, uHeadA, uHeadB);
    float r = uRadius * 0.72 * (0.8 + 0.4 * fbm(p * 6.0 + uTime * 0.3));
    float stroke = 1.0 - smoothstep(0.0, r * 1.6, d);
    float load = fbm(p * 8.5 + 5.2) * 0.65 + fbm(p * vec2(26.0, 19.0)) * 0.35;
    float body = mix(0.55, 1.0, smoothstep(0.3, 0.68, load));
    pend = max(pend, stroke * body * uInk);
    wet = max(wet, stroke * uInk);
  }

  outColor = vec4(clamp(dens, 0.0, 1.0), clamp(wet, 0.0, 1.0), clamp(pend, 0.0, 1.0), 1.0);
}
`;

const DISPLAY = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uField;
uniform float uAspect;
uniform float uTime;
uniform vec3  uCover;
uniform float uView;     // 0 composite, 1 mask, 2 feedback
uniform float uWarp;
${NOISE}

void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  float t = uTime;

  if (uView > 1.5) {
    // the raw accumulated field: pigment in grey, wetness pushed into red,
    // ink still waiting to soak in pushed into blue
    vec3 f = texture(uField, vUv).rgb;
    vec3 col = vec3(f.r);
    col.r = max(col.r, f.g);
    col.gb *= 1.0 - f.g * 0.35;
    col.b = max(col.b, f.b - f.r);
    outColor = vec4(col, 1.0);
    return;
  }

  // ---- a small drifting warp on the lookup: the edge keeps moving like
  // ---- liquid even where the field itself is settling
  vec2 w1 = vec2(fbm(p * 2.3 + vec2(t * 0.05, -t * 0.04)),
                 fbm(p * 2.3 + vec2(-t * 0.04, t * 0.05) + 19.7)) - 0.5;
  vec2 w2 = vec2(fbm(p * 7.5 + w1 + vec2(t * 0.09, t * 0.06)),
                 fbm(p * 7.5 + w1 + vec2(-t * 0.07, t * 0.1) + 41.3)) - 0.5;
  vec2 q = vUv + (w1 * 0.065 + w2 * 0.028) * uWarp * vec2(1.0 / uAspect, 1.0);
  float dens = texture(uField, q).r;

  // ---- noisy threshold: thin ink lets go first, and not all at once
  float th = mix(0.08, 0.4, fbm(p * 4.2 + vec2(t * 0.03, 0.0)));
  // two scales of fray: ragged lobes, and a fine fibrous break-up on top
  float fray = (fbm(p * 11.0 + t * 0.08) - 0.5) * 0.3
             + (fbm(p * 38.0 - t * 0.15) - 0.5) * 0.16;
  float mask = smoothstep(th, th + 0.06, dens + fray * uWarp);
  // older ink also thins a little before it breaks up
  mask *= mix(0.55, 1.0, smoothstep(0.18, 0.7, dens));

  if (uView > 0.5) {
    outColor = vec4(vec3(mask), 1.0);
    return;
  }

  // a faint stain on the cover where the ink edge meets the paper
  float rim = smoothstep(0.0, 0.5, mask) * smoothstep(1.0, 0.5, mask);
  vec3 cover = uCover * (1.0 - 0.07 * rim);
  outColor = vec4(cover, 1.0 - mask);
}
`;

export type Ink = {
  /** move the pen; the segment since the last call is inked next frame */
  moveTo(x: number, y: number): void;
  /** pen down (1) / up (0); fractional thins the stroke */
  ink: number;
  radius: number;
  view: InkView;
  warp: number;
  readonly aspect: number;
  readonly precision: "half-float" | "8-bit";
  clear(): void;
  resize(cssW: number, cssH: number, dpr: number): void;
  render(dt: number): void;
  destroy(): void;
};

type Target = { tex: WebGLTexture; fb: WebGLFramebuffer };

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // surfacing this matters: a silent compile failure looks identical to a
    // mask that is simply never opening
    console.error("ink: shader compile failed\n" + gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function program(gl: WebGL2RenderingContext, frag: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("ink: link failed\n" + gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

function uniforms(gl: WebGL2RenderingContext, prog: WebGLProgram, names: string[]) {
  const out: Record<string, WebGLUniformLocation | null> = {};
  for (const n of names) out[n] = gl.getUniformLocation(prog, n);
  return out;
}

/** sim texels per CSS pixel; the field is soft, it does not need full res */
const SIM_SCALE = 0.5;
const SIM_MAX = 1024;

export function createInk(
  canvas: HTMLCanvasElement,
  cover: [number, number, number],
): Ink | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  const half =
    !!gl.getExtension("EXT_color_buffer_float") ||
    !!gl.getExtension("EXT_color_buffer_half_float");

  const simProg = program(gl, SIM);
  const dispProg = program(gl, DISPLAY);
  if (!simProg || !dispProg) return null;

  const su = uniforms(gl, simProg, [
    "uPrev", "uAspect", "uTime", "uDt", "uHeadA", "uHeadB", "uRadius",
    "uInk", "uFlow", "uBleed", "uFade", "uFloor", "uDry", "uDevelop",
  ]);
  const du = uniforms(gl, dispProg, [
    "uField", "uAspect", "uTime", "uCover", "uView", "uWarp",
  ]);

  const vao = gl.createVertexArray();
  const buf = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  let precision: Ink["precision"] = half ? "half-float" : "8-bit";

  function makeTarget(w: number, h: number): Target | null {
    const tex = gl!.createTexture();
    const fb = gl!.createFramebuffer();
    if (!tex || !fb) return null;
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    if (precision === "half-float") {
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA16F, w, h, 0, gl!.RGBA, gl!.HALF_FLOAT, null);
    } else {
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
    }
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fb);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
    const ok = gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) === gl!.FRAMEBUFFER_COMPLETE;
    gl!.clearColor(0, 0, 0, 1);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    if (!ok) {
      gl!.deleteTexture(tex);
      gl!.deleteFramebuffer(fb);
      return null;
    }
    return { tex, fb };
  }

  function dropTarget(t: Target | null) {
    if (!t) return;
    gl!.deleteTexture(t.tex);
    gl!.deleteFramebuffer(t.fb);
  }

  let read: Target | null = null;
  let write: Target | null = null;
  let simW = 2;
  let simH = 2;
  let time = 0;
  let aspect = 1;
  let lost = false;
  const headA = { x: 0, y: 0 };
  const headB = { x: 0, y: 0 };
  let hasHead = false;

  function buildTargets(w: number, h: number) {
    dropTarget(read);
    dropTarget(write);
    read = makeTarget(w, h);
    write = makeTarget(w, h);
    if ((!read || !write) && precision === "half-float") {
      // advertised but not renderable on this driver — fall back
      dropTarget(read);
      dropTarget(write);
      precision = "8-bit";
      read = makeTarget(w, h);
      write = makeTarget(w, h);
    }
  }

  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const api: Ink = {
    ink: 1,
    radius: 0.07,
    view: "composite",
    warp: 1,
    get aspect() {
      return aspect;
    },
    get precision() {
      return precision;
    },

    moveTo(x, y) {
      if (!hasHead) {
        headA.x = headB.x = x;
        headA.y = headB.y = y;
        hasHead = true;
        return;
      }
      headB.x = x;
      headB.y = y;
    },

    clear() {
      for (const t of [read, write]) {
        if (!t) continue;
        gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },

    resize(cssW, cssH, dpr) {
      if (lost || cssW < 2 || cssH < 2) return;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.width = Math.max(2, Math.round(cssW * dpr));
      canvas.height = Math.max(2, Math.round(cssH * dpr));
      aspect = cssW / cssH;

      const s = Math.min(SIM_SCALE, SIM_MAX / Math.max(cssW, cssH));
      const w = Math.max(2, Math.round(cssW * s));
      const h = Math.max(2, Math.round(cssH * s));
      if (w !== simW || h !== simH || !read) {
        simW = w;
        simH = h;
        buildTargets(w, h);
      }
    },

    render(dt) {
      if (lost || !read || !write) return;
      time += dt;

      // ---- 1. sim: read → write
      gl.disable(gl.BLEND);
      gl.useProgram(simProg);
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.fb);
      gl.viewport(0, 0, simW, simH);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read.tex);
      gl.uniform1i(su.uPrev, 0);
      gl.uniform1f(su.uAspect, aspect);
      gl.uniform1f(su.uTime, time);
      gl.uniform1f(su.uDt, dt);
      gl.uniform2f(su.uHeadA, headA.x, headA.y);
      gl.uniform2f(su.uHeadB, headB.x, headB.y);
      gl.uniform1f(su.uRadius, api.radius);
      gl.uniform1f(su.uInk, hasHead ? api.ink : 0);
      gl.uniform1f(su.uFlow, 0.07);
      gl.uniform1f(su.uBleed, 16);
      gl.uniform1f(su.uFade, 0.24);
      gl.uniform1f(su.uFloor, precision === "half-float" ? 0.02 : 0.26);
      gl.uniform1f(su.uDry, 1.6);
      gl.uniform1f(su.uDevelop, 3.5);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const tmp = read;
      read = write;
      write = tmp;
      headA.x = headB.x;
      headA.y = headB.y;

      // ---- 2. display: field → canvas
      gl.useProgram(dispProg);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, read.tex);
      gl.uniform1i(du.uField, 0);
      gl.uniform1f(du.uAspect, aspect);
      gl.uniform1f(du.uTime, time);
      gl.uniform3f(du.uCover, cover[0], cover[1], cover[2]);
      gl.uniform1f(du.uView, VIEW_ID[api.view]);
      gl.uniform1f(du.uWarp, api.warp);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    destroy() {
      canvas.removeEventListener("webglcontextlost", onLost);
      dropTarget(read);
      dropTarget(write);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(simProg);
      gl.deleteProgram(dispProg);
      // no WEBGL_lose_context here: getContext hands the SAME context back to
      // a remount (React strict mode does exactly that), and a lost one fails
      // every compile with a null log
      lost = true;
    },
  };

  return api;
}
