import * as THREE from "three";

/** The supplied fluid solver, embedded as a transparent hero reveal mask. */
export type InkTrail = {
  setMouse(x: number, y: number): void;
  resize(width: number, height: number, dpr: number): void;
  render(dt: number): void;
  destroy(): void;
};

const SIM_SIZE = 256;
const DYE_SIZE = 1024;
const VELOCITY_DISSIPATION = 0.915;
const DYE_DISSIPATION = 0.96;
const PRESSURE_ITERATIONS = 24;
const CURL_STRENGTH = 7;
const SPLAT_RADIUS = 0.002;
const FORCE = 44;
const STEP = 1 / 60;

const vertexShader = `varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(
        position.xy,
        0.0,
        1.0
    );
}`;
const advectionShader = `precision highp float;
varying vec2 vUv;
uniform sampler2D uSource;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
uniform float uDt;
uniform float uDissipation;
void main() {
    vec2 vel =
        texture2D(
            uVelocity,
            vUv
        ).xy;
    // Velocity is already stored in normalized screen-space units.
    // Do not multiply by texel size here; that made the deformation
    // hundreds of times slower than the cursor/reference.
    vec2 coord =
        vUv -
        uDt *
        vel *
        1.05;
    vec4 value =
        texture2D(
            uSource,
            coord
        );
    gl_FragColor =
        value *
        uDissipation;
}`;
const splatShader = `precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec3 uValue;
uniform float uRadius;
uniform float uAspect;
void main() {
    vec2 p =
        vUv -
        uPoint;
    p.x *= uAspect;
    float d =
        dot(
            p,
            p
        );
    float influence =
        exp(
            -d /
            uRadius
        );
    vec3 base =
        texture2D(
            uTarget,
            vUv
        ).xyz;
    base +=
        uValue *
        influence;
    gl_FragColor =
        vec4(
            base,
            1.0
        );
}`;
const curlShader = `precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
void main() {
    float left =
        texture2D(
            uVelocity,
            vUv -
            vec2(
                uTexelSize.x,
                0.0
            )
        ).y;
    float right =
        texture2D(
            uVelocity,
            vUv +
            vec2(
                uTexelSize.x,
                0.0
            )
        ).y;
    float bottom =
        texture2D(
            uVelocity,
            vUv -
            vec2(
                0.0,
                uTexelSize.y
            )
        ).x;
    float top =
        texture2D(
            uVelocity,
            vUv +
            vec2(
                0.0,
                uTexelSize.y
            )
        ).x;
    float value =
        0.5 *
        (
            right -
            left -
            top +
            bottom
        );
    gl_FragColor =
        vec4(
            value,
            0.0,
            0.0,
            1.0
        );
}`;
const vorticityShader = `precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexelSize;
uniform float uCurlStrength;
uniform float uDt;
void main() {
    float L =
        abs(
            texture2D(
                uCurl,
                vUv -
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).x
        );
    float R =
        abs(
            texture2D(
                uCurl,
                vUv +
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).x
        );
    float B =
        abs(
            texture2D(
                uCurl,
                vUv -
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).x
        );
    float T =
        abs(
            texture2D(
                uCurl,
                vUv +
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).x
        );
    float C =
        texture2D(
            uCurl,
            vUv
        ).x;
    vec2 force =
        0.5 *
        vec2(
            T - B,
            R - L
        );
    force /=
        length(force) +
        0.0001;
    force *=
        uCurlStrength *
        C;
    force.y *= -1.0;
    vec2 velocity =
        texture2D(
            uVelocity,
            vUv
        ).xy;
    velocity +=
        force *
        uDt;
    gl_FragColor =
        vec4(
            velocity,
            0.0,
            1.0
        );
}`;
const divergenceShader = `precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
void main() {
    float L =
        texture2D(
            uVelocity,
            vUv -
            vec2(
                uTexelSize.x,
                0.0
            )
        ).x;
    float R =
        texture2D(
            uVelocity,
            vUv +
            vec2(
                uTexelSize.x,
                0.0
            )
        ).x;
    float B =
        texture2D(
            uVelocity,
            vUv -
            vec2(
                0.0,
                uTexelSize.y
            )
        ).y;
    float T =
        texture2D(
            uVelocity,
            vUv +
            vec2(
                0.0,
                uTexelSize.y
            )
        ).y;
    float divergence =
        0.5 *
        (
            R -
            L +
            T -
            B
        );
    gl_FragColor =
        vec4(
            divergence,
            0.0,
            0.0,
            1.0
        );
}`;
const pressureShader = `precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexelSize;
void main() {
    float L =
        texture2D(
            uPressure,
            vUv -
            vec2(
                uTexelSize.x,
                0.0
            )
        ).x;
    float R =
        texture2D(
            uPressure,
            vUv +
            vec2(
                uTexelSize.x,
                0.0
            )
        ).x;
    float B =
        texture2D(
            uPressure,
            vUv -
            vec2(
                0.0,
                uTexelSize.y
            )
        ).x;
    float T =
        texture2D(
            uPressure,
            vUv +
            vec2(
                0.0,
                uTexelSize.y
            )
        ).x;
    float divergence =
        texture2D(
            uDivergence,
            vUv
        ).x;
    float pressure =
        (
            L +
            R +
            B +
            T -
            divergence
        ) *
        0.25;
    gl_FragColor =
        vec4(
            pressure,
            0.0,
            0.0,
            1.0
        );
}`;
const gradientShader = `precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
void main() {
    float L =
        texture2D(
            uPressure,
            vUv -
            vec2(
                uTexelSize.x,
                0.0
            )
        ).x;
    float R =
        texture2D(
            uPressure,
            vUv +
            vec2(
                uTexelSize.x,
                0.0
            )
        ).x;
    float B =
        texture2D(
            uPressure,
            vUv -
            vec2(
                0.0,
                uTexelSize.y
            )
        ).x;
    float T =
        texture2D(
            uPressure,
            vUv +
            vec2(
                0.0,
                uTexelSize.y
            )
        ).x;
    vec2 velocity =
        texture2D(
            uVelocity,
            vUv
        ).xy;
    velocity -=
        0.5 *
        vec2(
            R - L,
            T - B
        );
    gl_FragColor =
        vec4(
            velocity,
            0.0,
            1.0
        );
}`;

export function createInkTrail(canvas: HTMLCanvasElement, content: HTMLCanvasElement): InkTrail | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  } catch { return null; }
  if (!renderer.extensions.has("EXT_color_buffer_float")) {
    renderer.dispose();
    return null;
  }
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const initialMaterial = new THREE.ShaderMaterial();
  const quad = new THREE.Mesh(geometry, initialMaterial);
  initialMaterial.dispose();
  scene.add(quad);
  const targets: THREE.WebGLRenderTarget[] = [];
  const materials: THREE.ShaderMaterial[] = [];
  function target(size: number) {
    const result = new THREE.WebGLRenderTarget(size, size, {
      type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      depthBuffer: false, stencilBuffer: false,
    });
    targets.push(result);
    renderer.setRenderTarget(result);
    renderer.clear();
    renderer.setRenderTarget(null);
    return result;
  }
  function doubleTarget(size: number) {
    return { read: target(size), write: target(size), swap() { [this.read, this.write] = [this.write, this.read]; } };
  }
  function material(fragmentShader: string, uniforms: Record<string, THREE.IUniform>) {
    const result = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms,
      depthTest: false, depthWrite: false, blending: THREE.NoBlending });
    materials.push(result);
    return result;
  }
  const velocity = doubleTarget(SIM_SIZE);
  const dye = doubleTarget(DYE_SIZE);
  const pressure = doubleTarget(SIM_SIZE);
  const divergence = target(SIM_SIZE);
  const curl = target(SIM_SIZE);
  const texel = () => ({ value: new THREE.Vector2(1 / SIM_SIZE, 1 / SIM_SIZE) });
  const texture = () => ({ value: null as THREE.Texture | null });
  const advectionMaterial = material(advectionShader, {
    uSource: texture(), uVelocity: texture(), uTexelSize: texel(), uDt: { value: STEP }, uDissipation: { value: 0.99 },
  });
  const splatMaterial = material(splatShader, {
    uTarget: texture(), uPoint: { value: new THREE.Vector2() }, uValue: { value: new THREE.Vector3() },
    uRadius: { value: SPLAT_RADIUS }, uAspect: { value: 1 },
  });
  const curlMaterial = material(curlShader, { uVelocity: texture(), uTexelSize: texel() });
  const vorticityMaterial = material(vorticityShader, {
    uVelocity: texture(), uCurl: texture(), uTexelSize: texel(), uCurlStrength: { value: CURL_STRENGTH }, uDt: { value: STEP },
  });
  const divergenceMaterial = material(divergenceShader, { uVelocity: texture(), uTexelSize: texel() });
  const pressureMaterial = material(pressureShader, { uPressure: texture(), uDivergence: texture(), uTexelSize: texel() });
  const gradientMaterial = material(gradientShader, { uPressure: texture(), uVelocity: texture(), uTexelSize: texel() });
  const contentTexture = new THREE.CanvasTexture(content);
  contentTexture.generateMipmaps = false;
  contentTexture.minFilter = THREE.LinearFilter;
  // Raw canvas colors are already display encoded; the display shader copies
  // them directly, without tone mapping or another sRGB conversion.
  const displayMaterial = material(`
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uDye;
    uniform sampler2D uContent;
    void main() {
      float ink = smoothstep(0.085, 0.095, texture2D(uDye, vUv).r);
      vec3 color = texture2D(uContent, vUv).rgb;
      gl_FragColor = vec4(color * ink, ink);
    }
  `, { uDye: texture(), uContent: { value: contentTexture } });
  function renderPass(material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null = null) {
    quad.material = material;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
  }
  const pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, initialized: false };
function splat() {
  if (!pointer.moved)
    return;
  // ----------------------------------------------------------
  // Velocity injection
  // ----------------------------------------------------------
  splatMaterial.uniforms.uTarget.value =
    velocity.read.texture;
  splatMaterial.uniforms.uPoint.value.set(
    pointer.x,
    pointer.y
  );
  splatMaterial.uniforms.uValue.value.set(
    pointer.dx * FORCE,
    pointer.dy * FORCE,
    0
  );
  splatMaterial.uniforms.uRadius.value =
    SPLAT_RADIUS;
  renderPass(
    splatMaterial,
    velocity.write
  );
  velocity.swap();
  // ----------------------------------------------------------
  // Ink injection
  // ----------------------------------------------------------
  const speed =
    Math.sqrt(
      pointer.dx * pointer.dx +
      pointer.dy * pointer.dy
    );
  splatMaterial.uniforms.uTarget.value =
    dye.read.texture;
  splatMaterial.uniforms.uPoint.value.set(
    pointer.x,
    pointer.y
  );
  /*
     Stronger cursor movement creates
     more visible ink.
  */
  const inkAmount =
    Math.min(
      1.22,
      0.37 +
      speed * 23.5
    );
  splatMaterial.uniforms.uValue.value.set(
    inkAmount,
    inkAmount,
    inkAmount
  );
  splatMaterial.uniforms.uRadius.value =
    SPLAT_RADIUS * 0.48;
  renderPass(
    splatMaterial,
    dye.write
  );
  dye.swap();
  pointer.moved = false;
}
// ------------------------------------------------------------
// Simulation
// ------------------------------------------------------------
function simulate(dt: number) {
  // ==========================================================
  // ADVECT VELOCITY
  // ==========================================================
  advectionMaterial.uniforms.uVelocity.value =
    velocity.read.texture;
  advectionMaterial.uniforms.uSource.value =
    velocity.read.texture;
  advectionMaterial.uniforms.uTexelSize.value.set(
    1 / SIM_SIZE,
    1 / SIM_SIZE
  );
  advectionMaterial.uniforms.uDt.value =
    dt;
  advectionMaterial.uniforms.uDissipation.value =
    VELOCITY_DISSIPATION;
  renderPass(
    advectionMaterial,
    velocity.write
  );
  velocity.swap();
  // ==========================================================
  // CURSOR FORCE
  // ==========================================================
  splat();
  // ==========================================================
  // CURL
  // ==========================================================
  curlMaterial.uniforms.uVelocity.value =
    velocity.read.texture;
  renderPass(
    curlMaterial,
    curl
  );
  // ==========================================================
  // VORTICITY
  // ==========================================================
  vorticityMaterial.uniforms.uVelocity.value =
    velocity.read.texture;
  vorticityMaterial.uniforms.uCurl.value =
    curl.texture;
  vorticityMaterial.uniforms.uDt.value =
    dt;
  renderPass(
    vorticityMaterial,
    velocity.write
  );
  velocity.swap();
  // ==========================================================
  // DIVERGENCE
  // ==========================================================
  divergenceMaterial.uniforms.uVelocity.value =
    velocity.read.texture;
  renderPass(
    divergenceMaterial,
    divergence
  );
  // ==========================================================
  // PRESSURE SOLVE
  // ==========================================================
  for (
    let i = 0;
    i < PRESSURE_ITERATIONS;
    i++
  ) {
    pressureMaterial.uniforms.uPressure.value =
      pressure.read.texture;
    pressureMaterial.uniforms.uDivergence.value =
      divergence.texture;
    renderPass(
      pressureMaterial,
      pressure.write
    );
    pressure.swap();
  }
  // ==========================================================
  // REMOVE PRESSURE GRADIENT
  // ==========================================================
  gradientMaterial.uniforms.uPressure.value =
    pressure.read.texture;
  gradientMaterial.uniforms.uVelocity.value =
    velocity.read.texture;
  renderPass(
    gradientMaterial,
    velocity.write
  );
  velocity.swap();
  // ==========================================================
  // ADVECT DYE
  // ==========================================================
  advectionMaterial.uniforms.uVelocity.value =
    velocity.read.texture;
  advectionMaterial.uniforms.uSource.value =
    dye.read.texture;
  advectionMaterial.uniforms.uTexelSize.value.set(
    1 / DYE_SIZE,
    1 / DYE_SIZE
  );
  advectionMaterial.uniforms.uDt.value =
    dt;
  advectionMaterial.uniforms.uDissipation.value =
    DYE_DISSIPATION;
  renderPass(
    advectionMaterial,
    dye.write
  );
  dye.swap();
}

  let accumulator = 0;
  let disposed = false;
  return {
    setMouse(x, y) {
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        pointer.initialized = false;
        pointer.moved = false;
        pointer.dx = pointer.dy = 0;
        return;
      }
      if (!pointer.initialized) {
        pointer.x = x;
        pointer.y = y;
        pointer.initialized = true;
        return;
      }
      if (x === pointer.x && y === pointer.y) return;
      pointer.dx += x - pointer.x;
      pointer.dy += y - pointer.y;
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;
    },
    resize(width, height, dpr) {
      if (disposed || width < 2 || height < 2) return;
      renderer.setPixelRatio(Math.min(dpr, 2));
      renderer.setSize(width, height, false);
      splatMaterial.uniforms.uAspect.value = width / height;
      pointer.initialized = false;
    },
    render(dt) {
      if (disposed) return;
      // Fixed simulation steps preserve the reference's decay at any refresh rate.
      accumulator += Math.min(Math.max(dt, 0), STEP * 3);
      while (accumulator >= STEP) {
        simulate(STEP);
        pointer.dx = pointer.dy = 0;
        accumulator -= STEP;
      }
      contentTexture.needsUpdate = true;
      displayMaterial.uniforms.uDye.value = dye.read.texture;
      renderPass(displayMaterial);
    },
    destroy() {
      disposed = true;
      targets.forEach(target => target.dispose());
      materials.forEach(material => material.dispose());
      geometry.dispose();
      contentTexture.dispose();
      renderer.dispose();
    },
  };
}
