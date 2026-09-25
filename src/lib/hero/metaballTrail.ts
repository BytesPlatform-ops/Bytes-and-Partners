/**
 * METABALL TRAIL
 *
 * A chain of points chases the pointer — the head eases toward it, and every
 * point after that eases toward the one in front — and the shader sums a
 * metaball field over the chain. The head is thick, the tail thins out, a
 * little sine irregularity and an fbm distortion keep the silhouette organic,
 * and a tight smoothstep turns the field into a hard-edged blob.
 *
 * The animated card texture is masked into one transparent canvas beneath
 * the HTML typography. Normal compositing preserves the original text color.
 * One pass, no framebuffers: the chain itself is the memory.
 */

/** points the shader reads; the chain beyond this would never reach it */
export const TRAIL_POINTS = 20;

const VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uTrail[${TRAIL_POINTS}];
uniform sampler2D uContent;
uniform float uContentAspect; // image width / height

// ======================================
// RANDOM
// ======================================
float random(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// ======================================
// NOISE
// ======================================
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 smoothF = f * f * (3.0 - 2.0 * f);

  return mix(mix(a, b, smoothF.x), mix(c, d, smoothF.x), smoothF.y);
}

// ======================================
// FBM — several layers of noise
// ======================================
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += noise(p) * amplitude;
    p *= 3.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;

  // correct aspect ratio
  vec2 p = uv;
  p.x *= aspect;

  // ======================================
  // METABALL FIELD
  // ======================================
  float field = 0.0;

  for (int i = 0; i < ${TRAIL_POINTS}; i++) {
    vec2 trailPoint = uTrail[i];
    trailPoint.x *= aspect;

    vec2 delta = p - trailPoint;
    float distanceSquared = dot(delta, delta);

    // 0 = head, 24 = end of tail
    float t = float(i) / 24.0;

    // head is thick, tail becomes smaller
    float radius = mix(0.08, 0.025, t);

    // little irregularity
    radius *= 0.85 + sin(float(i) * 1.7 + uTime * 1.5) * 0.15;

    // metaball influence
    field += (radius * radius) / (distanceSquared + 0.0001);
  }

  // ======================================
  // ORGANIC DISTORTION
  // ======================================
  float organicNoise = fbm(p * 5.0 + vec2(uTime * 0.15, -uTime * 0.12));
  field += (organicNoise - 0.5) * 0.5;

  // ======================================
  // TURN FIELD INTO A HARD-EDGED SHAPE
  // ======================================
  // Antialias the mask over approximately one screen pixel.
  float edge = max(fwidth(field), 0.0001);
  float blob = smoothstep(1.0 - edge, 1.0 + edge, field);

  // the animated card scene, object-fit: cover over the canvas
  vec2 q = uv - 0.5;
  if (aspect > uContentAspect) q.y *= uContentAspect / aspect;
  else q.x *= aspect / uContentAspect;
  outColor = vec4(texture(uContent, q + 0.5).rgb, blob);
}
`;

export type MetaballTrail = {
  /** pointer position in 0..1 over the canvas, y up */
  setMouse(x: number, y: number): void;
  resize(cssW: number, cssH: number, dpr: number): void;
  render(dt: number): void;
  destroy(): void;
};

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("metaballTrail: shader compile failed\n" + gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/** One canvas running the masked card shader. */
type View = {
  resize(cssW: number, cssH: number, dpr: number): void;
  draw(time: number, trail: Float32Array): void;
  destroy(): void;
};

function createView(canvas: HTMLCanvasElement, content: HTMLCanvasElement): View | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: true,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("metaballTrail: link failed\n" + gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  const vao = gl.createVertexArray();
  const buf = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const u = {
    time: gl.getUniformLocation(prog, "uTime"),
    resolution: gl.getUniformLocation(prog, "uResolution"),
    trail: gl.getUniformLocation(prog, "uTrail"),
  };

  let tex: WebGLTexture | null = null;
  if (content) {
    tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, content);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(prog, "uContent"), 0);
    gl.uniform1f(
      gl.getUniformLocation(prog, "uContentAspect"),
      content.width / Math.max(1, content.height),
    );
  }

  let textureWidth = content?.width ?? 0;
  let textureHeight = content?.height ?? 0;
  let lost = false;
  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
  };
  canvas.addEventListener("webglcontextlost", onLost);

  return {
    resize(cssW, cssH, dpr) {
      if (lost) return;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.width = Math.max(2, Math.round(cssW * dpr));
      canvas.height = Math.max(2, Math.round(cssH * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.resolution, canvas.width, canvas.height);
    },

    draw(time, trail) {
      if (lost) return;
      if (content && tex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        if (content.width !== textureWidth || content.height !== textureHeight) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, content);
          textureWidth = content.width;
          textureHeight = content.height;
          gl.uniform1f(gl.getUniformLocation(prog, "uContentAspect"), textureWidth / textureHeight);
        } else {
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, content);
        }
      }
      gl.uniform1f(u.time, time);
      gl.uniform2fv(u.trail, trail);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    destroy() {
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
      if (tex) gl.deleteTexture(tex);
      // no WEBGL_lose_context: getContext hands the SAME context back to a
      // remount (React strict mode does exactly that)
      lost = true;
    },
  };
}

/** Returns null when WebGL is unavailable, leaving the plain HTML hero. */
export function createMetaballTrail(
  contentCanvas: HTMLCanvasElement,
  content: HTMLCanvasElement,
): MetaballTrail | null {
  const view = createView(contentCanvas, content);
  if (!view) return null;

  const mouse = { x: 0.5, y: 0.5 };
  /** the chain: [x0, y0, x1, y1, …], head first, all starting at the centre */
  const trail = new Float32Array(TRAIL_POINTS * 2).fill(0.5);
  let time = 0;

  /** a per-frame lerp factor tuned at 60 Hz, made frame-rate independent */
  const ease = (k: number, dt: number) => 1 - Math.pow(1 - k, dt * 60);

  return {
    setMouse(x, y) {
      mouse.x = x;
      mouse.y = y;
    },

    resize(cssW, cssH, dpr) {
      if (cssW < 2 || cssH < 2) return;
      view.resize(cssW, cssH, dpr);
    },

    render(dt) {
      time += dt;

      // HEAD follows the mouse
      const head = ease(0.18, dt);
      trail[0] += (mouse.x - trail[0]) * head;
      trail[1] += (mouse.y - trail[1]) * head;

      // every next point follows the point in front of it
      const follow = ease(0.13, dt);
      for (let i = 1; i < TRAIL_POINTS; i++) {
        trail[i * 2] += (trail[(i - 1) * 2] - trail[i * 2]) * follow;
        trail[i * 2 + 1] += (trail[(i - 1) * 2 + 1] - trail[i * 2 + 1]) * follow;
      }

      view.draw(time, trail);
    },

    destroy() {
      view.destroy();
    },
  };
}
