
import * as THREE from 'three';
import gsap from 'gsap';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { lockScroll } from '@/lib/animation/scroll';
import { createCardPortal } from './cardPortal';
import { projects } from '@/data/projects';

/**
 * Embedded version of shader-learning; the section owns scrolling and frames.
 * @param {HTMLCanvasElement} canvas
 * @param {THREE.WebGLRenderer} [sharedRenderer]
 */
export function createRootCardsScene(canvas, sharedRenderer) {
const events = new AbortController();
let disposed = false;
let suspended = false;




// ======================================================
// GLOBAL CONFIG
// ======================================================

const CAMERA_FOV = 55;
const CAMERA_OPEN_FOV = 52;
const CAMERA_FOV_TRANSITION_SPEED = 5;

const CAMERA_START_Y = 8.9;
// Stop on the seventh and final card: its Y (FIRST_CARD_Y - 6 * CARD_Y_GAP)
// and orbit angle, offset like the first card is from the camera start.
const CAMERA_END_Y = 3.75;

const CAMERA_START_ANGLE = 0.25;
const CAMERA_END_ANGLE = 3.79;

const CAMERA_BASE_RADIUS = 12;


// ======================================================
// CARD CONFIG
// ======================================================

const CARD_COUNT = projects.length;

const CARD_DISTANCE = 8.0;
const CARD_HOVER_LIFT = 0.32;
const CARD_HOVER_TILT = 0.05;

const CARD_Y_GAP = 0.85;

const FIRST_CARD_Y = 8.8;

const CARD_BASE_ANGLE =
  THREE.MathUtils.degToRad(18);

const CARD_ANGLE_DIFFERENCE =
  THREE.MathUtils.degToRad(34);

const CARD_TILT_X =
  THREE.MathUtils.degToRad(0);

const CARD_TILT_Z =
  THREE.MathUtils.degToRad(0);

const CARD_YAW =
  THREE.MathUtils.degToRad(0);

const CARD_SCALE = 1;


// ======================================================
// PANEL CONFIG
// ======================================================

// size
const CARD_WIDTH = 3.8;
const CARD_HEIGHT = 2.45;

// Radius in card-local units, independent of geometry depth.
const CARD_CORNER_RADIUS = 0.18;
const CARD_THICKNESS = 0.05;
const CARD_BEVEL = 0.025;


// ======================================================
// GLASS CONFIG
// ======================================================

const GLASS_DISTORTION = 0.004;
const GLASS_CHROMATIC = 0.0008;
const GLASS_DARKNESS = 0.18;
const GLASS_EDGE_STRENGTH = 0.12;
const GLASS_NOISE = 0.025;
const GLASS_ALPHA = 0.98;
const GLASS_SATURATION = 0.88;
const GLASS_BRIGHTNESS = 0.95;
const GLASS_SCENE_MIX = 0.18;
const GLASS_SCENE_BRIGHTNESS = 0.28;
const INACTIVE_SCENE_MIX = 0.46;
const IMAGE_TRANSITION_SECONDS = 0.55;
const GLASS_BLUR = 3.5; // Screen pixels at full drawing-buffer resolution.
const GLASS_LIQUID = 0.024;
const GLASS_FLOW_SPEED = 0.22;
const GLASS_RIM_WIDTH = 0.09; // Apparent bevel thickness in card units.
const CARD_SKEW = -0.04; // Local Y shear; card centers and orbit stay fixed.


// ======================================================
// IMAGE CONFIG
// ======================================================

const IMAGE_OPACITY = 0.35; // Image contribution over the glass, from 0 to 1.

// One landscape cover per project: device-first projects (phone/tablet
// screens) use their first web shot, browser projects their hero shot.
const PROJECT_COVERS = projects.map(project =>
  (project.media === 'device' && project.extra?.[0]) || project.shots[0]
);


// ======================================================
// TEXT CONFIG
// ======================================================

// text floats slightly IN FRONT
// of the single glass sheet
const CARD_TEXT_Z = 0.4;

const CARD_TEXT_SCALE = 1;

const CARD_TEXT_FONT_SIZE = 84;

const CARD_TEXT_COLOR = '#f5f2ea'; // Heading color, including the text shader.
const CARD_TEXT_OPACITY = 0.84;
const CARD_TEXT_FLOW = 0.0025;
const CARD_TEXT_FONT = 'Rajdhani';
const ORBIT_RING_COUNT = 22;
const ORBIT_RING_RADIUS = 6.2;
const ORBIT_BEADS_PER_RING = 42;

// Project names on two lines, broken at the last space.
const CARD_TITLES = projects.map(project =>
  project.name.toUpperCase().replace(/ (?=[^ ]*$)/, '\n')
);


// ======================================================
// SCENE
// ======================================================

const scene =
  new THREE.Scene();

// A light pearl/cyan backdrop also participates in the glass capture pass.
const backgroundCanvas = document.createElement('canvas');
backgroundCanvas.width = 1024;
backgroundCanvas.height = 1024;
const backgroundContext = backgroundCanvas.getContext('2d');
backgroundContext.fillStyle = '#f5f2ea';
backgroundContext.fillRect(0, 0, 1024, 1024);
for (const [x, y, radius, color] of [
  [180, 300, 740, 'rgba(192, 213, 234, 0.35)'],
  [850, 660, 740, 'rgba(228, 211, 183, 0.3)'],
  [540, 100, 600, 'rgba(245, 242, 234, 0.72)']
]) {
  const gradient = backgroundContext.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(245, 242, 234, 0)');
  backgroundContext.fillStyle = gradient;
  backgroundContext.fillRect(0, 0, 1024, 1024);
}
const backgroundTexture = new THREE.CanvasTexture(backgroundCanvas);
backgroundTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = backgroundTexture;


// ======================================================
// CAMERA
// ======================================================

const camera =
  new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth /
      window.innerHeight,
    0.1,
    100
  );

scene.add(camera);


// ======================================================
// RENDERER
// ======================================================

const ownsRenderer = !sharedRenderer;
const renderer = sharedRenderer ?? new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

const portal = createCardPortal(renderer);

if (ownsRenderer) {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.classList.add('webgl');
}




// ======================================================
// LIGHTING
// ======================================================

const ambientLight =
  new THREE.AmbientLight(
    0xffffff,
    1.45
  );

scene.add(
  ambientLight
);


const purpleLight =
  new THREE.DirectionalLight(
    0xfff4df,
    3.2
  );

purpleLight.position.set(
  4,
  6,
  5
);

scene.add(
  purpleLight
);


const blueLight =
  new THREE.DirectionalLight(
    0xc6ddff,
    2.4
  );

blueLight.position.set(
  -5,
  1,
  -4
);

scene.add(
  blueLight
);


const pinkLight =
  new THREE.PointLight(
    0xfff4e4,
    2.1,
    20
  );

pinkLight.position.set(
  3,
  2,
  4
);

scene.add(
  pinkLight
);


// glass highlight lights
const glassRimLight =
  new THREE.DirectionalLight(
    0xffffff,
    2.3
  );

glassRimLight.position.set(
  -3,
  4,
  7
);

scene.add(
  glassRimLight
);


const glassSideLight =
  new THREE.PointLight(
    0x8bdcff,
    1.4,
    30
  );

glassSideLight.position.set(
  6,
  1,
  -2
);

scene.add(
  glassSideLight
);


// ======================================================
// ROOT GROUP
// ======================================================

const rootGroup =
  new THREE.Group();

scene.add(
  rootGroup
);


// ======================================================
// PEARL BRAID AND ORBITAL SURROUNDINGS
// ======================================================

const environmentGenerator = new THREE.PMREMGenerator(renderer);
const studio = new RoomEnvironment();
const studioEnvironment = environmentGenerator.fromScene(studio, 0.04);
scene.environment = studioEnvironment.texture;
scene.environmentIntensity = 0.65;
studio.dispose();
environmentGenerator.dispose();

const pearlMaterial = new THREE.MeshStandardMaterial({
  color: 0xc8c1b3, roughness: 0.3, metalness: 0.4
});
const silverMaterial = new THREE.MeshStandardMaterial({
  color: 0xd6e5ee, roughness: 0.16, metalness: 0.72
});
const filamentMaterial = new THREE.MeshStandardMaterial({
  color: 0x699fff, emissive: 0x2164ff, emissiveIntensity: 1.6,
  roughness: 0.22, metalness: 0.2
});
const grooveMaterial = new THREE.MeshStandardMaterial({
  color: 0xd6d1c7, roughness: 0.36, metalness: 0.28
});

function braidPoint(y, phase, radius = 0.57) {
  const angle = y * 0.46 + phase;
  return new THREE.Vector3(
    Math.cos(angle) * radius + Math.sin(y * 0.21) * 0.12,
    y,
    Math.sin(angle) * radius
  );
}

function braidCurve(phase, radius, offset = 0) {
  return new THREE.CatmullRomCurve3(Array.from({ length: 181 }, (_, i) => {
    const y = -18 + i * 0.2;
    const point = braidPoint(y, phase, radius);
    point.x += Math.cos(y * 0.46 + phase + offset) * 0.025;
    return point;
  }));
}

for (let strand = 0; strand < 3; strand++) {
  const phase = strand * Math.PI * 2 / 3;
  const ribbon = new THREE.Mesh(
    new THREE.TubeGeometry(braidCurve(phase, 0.57), 420, 0.34, 20, false),
    pearlMaterial
  );
  rootGroup.add(ribbon);
  // Fine longitudinal ribs give the pearl strands a woven surface.
  for (let rib = -3; rib <= 3; rib++) {
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: 181 }, (_, i) => {
      const y = -18 + i * 0.2;
      const point = braidPoint(y, phase);
      const angle = y * 0.46 + phase + rib * 0.15;
      point.x += Math.cos(angle) * 0.342;
      point.z += Math.sin(angle) * 0.342;
      return point;
    }));
    rootGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 300, 0.007, 4, false), grooveMaterial));
  }
  rootGroup.add(new THREE.Mesh(
    new THREE.TubeGeometry(braidCurve(phase + 0.13, 0.95), 420, 0.052, 10, false), silverMaterial
  ));
  rootGroup.add(new THREE.Mesh(
    new THREE.TubeGeometry(braidCurve(phase + 0.13, 1.025), 420, 0.02, 8, false), filamentMaterial
  ));
}

const surroundings = new THREE.Group();
scene.add(surroundings);
const orbitMaterial = new THREE.LineBasicMaterial({
  color: 0x88aceb, transparent: true, opacity: 0.32, depthWrite: false
});
const beadMaterial = new THREE.MeshStandardMaterial({
  color: 0x9dbfff, roughness: 0.2, metalness: 0.28,
  emissive: 0x618dcc, emissiveIntensity: 0.12
});
const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), beadMaterial, ORBIT_RING_COUNT * ORBIT_BEADS_PER_RING);
const beadTransform = new THREE.Object3D();
let beadIndex = 0;
const random = THREE.MathUtils.seededRandom;
random(42);
for (let ring = 0; ring < ORBIT_RING_COUNT; ring++) {
  const y = 17 - ring * (34 / (ORBIT_RING_COUNT - 1));
  const radius = ORBIT_RING_RADIUS + (ring % 4) * 0.45;
  const points = [];
  for (let i = 0; i <= 240; i++) {
    const angle = i / 240 * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius,
      y + Math.sin(angle + ring * 0.7) * 0.6, Math.sin(angle) * radius));
  }
  surroundings.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), orbitMaterial));
  for (let i = 0; i < ORBIT_BEADS_PER_RING; i++) {
    const angle = random() * Math.PI * 2;
    beadTransform.position.set(Math.cos(angle) * radius,
      y + Math.sin(angle + ring * 0.7) * 0.6 + (random() - 0.5) * 0.09,
      Math.sin(angle) * radius);
    beadTransform.scale.setScalar(i % 9 === 0 ? 0.045 + random() * 0.025 : 0.012 + random() * 0.018);
    beadTransform.updateMatrix();
    beads.setMatrixAt(beadIndex++, beadTransform.matrix);
  }
}
surroundings.add(beads);

// Small suspended motes concentrate near the braid, with a lighter outer field.
const dustPositions = [];
for (let i = 0; i < 2200; i++) {
  const y = random() * 36 - 18;
  const angle = random() * Math.PI * 2;
  const radius = i < 1500 ? 0.95 + random() * 0.35 : 2 + random() * 6;
  dustPositions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
}
const dustGeometry = new THREE.BufferGeometry();
dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
const moteCanvas = document.createElement('canvas');
moteCanvas.width = moteCanvas.height = 32;
const moteContext = moteCanvas.getContext('2d');
const moteGradient = moteContext.createRadialGradient(16, 16, 0, 16, 16, 16);
moteGradient.addColorStop(0, 'rgba(255,255,255,1)');
moteGradient.addColorStop(0.35, 'rgba(255,255,255,0.9)');
moteGradient.addColorStop(1, 'rgba(255,255,255,0)');
moteContext.fillStyle = moteGradient;
moteContext.fillRect(0, 0, 32, 32);
const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
  color: 0x83a8d8, size: 0.055, map: new THREE.CanvasTexture(moteCanvas),
  transparent: true, opacity: 0.7, depthWrite: false
}));
scene.add(dust);

function updateSurroundings(elapsed) {
  surroundings.rotation.y = elapsed * 0.025;
  dust.rotation.y = -elapsed * 0.018;
}


// ======================================================
// CARDS GROUP
// ======================================================

const cardsGroup =
  new THREE.Group();

scene.add(
  cardsGroup
);


// ======================================================
// SINGLE SHEET GEOMETRY
// ======================================================

// One closed slab: front, rear and connecting bevel/sidewalls in one mesh.
// Inset the extrusion outline so bevel expansion preserves the card footprint.
function createCardGeometry() {
  const bevel = Math.min(CARD_BEVEL, CARD_THICKNESS * 0.45, CARD_CORNER_RADIUS * 0.5);
  const x = CARD_WIDTH / 2 - bevel;
  const y = CARD_HEIGHT / 2 - bevel;
  const radius = Math.max(0.001, Math.min(CARD_CORNER_RADIUS - bevel, x, y));
  const shape = new THREE.Shape();
  shape.moveTo(-x + radius, -y);
  shape.lineTo(x - radius, -y);
  shape.absarc(x - radius, -y + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(x, y - radius);
  shape.absarc(x - radius, y - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(-x + radius, y);
  shape.absarc(-x + radius, y - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(-x, -y + radius);
  shape.absarc(-x + radius, -y + radius, radius, Math.PI, Math.PI * 1.5, false);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: CARD_THICKNESS - bevel * 2,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 16,
    steps: 1
  });
  // Keep the front at its original Z=0, and extend thickness behind it.
  geometry.translate(0, 0, -CARD_THICKNESS + bevel);
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  const uv = geometry.attributes.uv;
  const face = new Float32Array(positions.count);
  for (let i = 0; i < positions.count; i++) {
    uv.setXY(i, positions.getX(i) / CARD_WIDTH + 0.5, positions.getY(i) / CARD_HEIGHT + 0.5);
    // Preserve local face orientation before skew transforms the normals.
    face[i] = normals.getZ(i);
  }
  geometry.setAttribute('cardFace', new THREE.BufferAttribute(face, 1));
  geometry.clearGroups();
  return geometry;
}
const cardGeometry = createCardGeometry();


// Shear the sheet and its text together without changing the orbit transforms.
function skewCardGeometry(geometry) {
  geometry.applyMatrix4(new THREE.Matrix4().set(
    1, 0, 0, 0,
    CARD_SKEW, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ));
}
skewCardGeometry(cardGeometry);

// Capture the root/background separately so glass can blur and warp what is
// behind it. Linear half-float color avoids applying tone mapping twice.
const glassSceneTarget = new THREE.WebGLRenderTarget(1, 1, {
  type: THREE.HalfFloatType,
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter
});
glassSceneTarget.depthTexture = new THREE.DepthTexture(1, 1);
const glassViewport = new THREE.Vector2();
function resizeGlassTarget() {
  renderer.getDrawingBufferSize(glassViewport);
  glassSceneTarget.setSize(glassViewport.x, glassViewport.y);
}
resizeGlassTarget();

// ======================================================
// IMAGE CREATOR
// ======================================================

const imageLoader = new THREE.TextureLoader();
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

// `ready` and `aspect` stay on the media record so the card and portal
// shaders can fall back to tinted glass and cover-fit once it loads.
function createImageTexture(source) {
  const media = { ready: false, aspect: 16 / 9, texture: null };
  media.texture = imageLoader.load(source, texture => {
    if (disposed) return;
    media.aspect = texture.image.width / texture.image.height;
    media.ready = true;
  });
  // Image textures use an sRGB internal format, so samples arrive linear.
  media.texture.colorSpace = THREE.SRGBColorSpace;
  media.texture.anisotropy = Math.min(8, maxAnisotropy);
  media.texture.wrapS = THREE.ClampToEdgeWrapping;
  media.texture.wrapT = THREE.ClampToEdgeWrapping;
  return media;
}


// ======================================================
// SINGLE GLASS + IMAGE MATERIAL
// ======================================================

function createGlassImageMaterial(
  imageTexture
) {

  return new THREE.ShaderMaterial({
    uniforms: {
      uImage: { value: imageTexture },
      uScene: { value: glassSceneTarget.texture },
      uSceneDepth: { value: glassSceneTarget.depthTexture },
      uViewport: { value: glassViewport },
      uSceneMix: { value: GLASS_SCENE_MIX },
      uSceneBrightness: { value: GLASS_SCENE_BRIGHTNESS },
      uInactiveSceneMix: { value: INACTIVE_SCENE_MIX },
      uBlur: { value: GLASS_BLUR },
      uLiquid: { value: GLASS_LIQUID },
      uFlowSpeed: { value: GLASS_FLOW_SPEED },
      uRimWidth: { value: GLASS_RIM_WIDTH },
      uImageReady: { value: 0 },
      uImageBlend: { value: 0 },
      uImageOpacity: { value: IMAGE_OPACITY },
      uImageAspect: { value: 16 / 9 },
      uHover: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      // Card-local resolution keeps the SDF radius equal on both axes.
      uResolution: { value: new THREE.Vector2(CARD_WIDTH, CARD_HEIGHT) },
      uCornerRadius: { value: CARD_CORNER_RADIUS },
      uDistortionStrength: { value: GLASS_DISTORTION },
      uChromaticStrength: { value: GLASS_CHROMATIC },
      uGlassDarkness: { value: GLASS_DARKNESS },
      uEdgeStrength: { value: GLASS_EDGE_STRENGTH },
      uNoiseStrength: { value: GLASS_NOISE },
      uAlpha: { value: GLASS_ALPHA },
      uSaturation: { value: GLASS_SATURATION },
      uBrightness: { value: GLASS_BRIGHTNESS }
    },
    vertexShader: `
      attribute float cardFace;
      varying float vCardFace;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDirection;

      void main() {
        vUv = uv;
        vCardFace = cardFace;
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDirection = -viewPosition.xyz;
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      varying float vCardFace;
      uniform sampler2D uImage;
      uniform sampler2D uScene;
      uniform sampler2D uSceneDepth;
      uniform vec2 uViewport;
      uniform float uSceneMix;
      uniform float uSceneBrightness;
      uniform float uInactiveSceneMix;
      uniform float uBlur;
      uniform float uLiquid;
      uniform float uFlowSpeed;
      uniform float uRimWidth;
      uniform float uImageReady;
      uniform float uImageBlend;
      uniform float uImageOpacity;
      uniform float uImageAspect;
      uniform float uHover;
      uniform vec2 uPointer;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uCornerRadius;
      uniform float uDistortionStrength;
      uniform float uChromaticStrength;
      uniform float uGlassDarkness;
      uniform float uEdgeStrength;
      uniform float uNoiseStrength;
      uniform float uAlpha;
      uniform float uSaturation;
      uniform float uBrightness;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDirection;

      float roundedRectangle(vec2 p, vec2 halfSize, float radius) {
        vec2 q = abs(p) - halfSize + radius;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
      }

      float hashNoise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 cell = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hashNoise(cell), hashNoise(cell + vec2(1.0, 0.0)), f.x),
          mix(hashNoise(cell + vec2(0.0, 1.0)), hashNoise(cell + vec2(1.0)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float value = 0.0;
        float weight = 0.5;
        for (int i = 0; i < 4; i++) {
          value += noise(p) * weight;
          p = mat2(0.8, -0.6, 0.6, 0.8) * p * 2.03 + 7.1;
          weight *= 0.5;
        }
        return value;
      }

      vec3 sceneSample(vec2 uv, vec2 originalUv) {
        uv = clamp(uv, vec2(0.001), vec2(0.999));
        // Prevent refracting foreground root fragments into the glass.
        if (texture2D(uSceneDepth, uv).r < gl_FragCoord.z) uv = originalUv;
        return texture2D(uScene, uv).rgb;
      }

      vec3 blurredScene(vec2 uv, vec2 originalUv) {
        vec2 stepUv = vec2(uBlur) / uViewport;
        vec3 result = sceneSample(uv, originalUv) * 0.2;
        result += sceneSample(uv + vec2(stepUv.x, 0.0), originalUv) * 0.12;
        result += sceneSample(uv - vec2(stepUv.x, 0.0), originalUv) * 0.12;
        result += sceneSample(uv + vec2(0.0, stepUv.y), originalUv) * 0.12;
        result += sceneSample(uv - vec2(0.0, stepUv.y), originalUv) * 0.12;
        result += sceneSample(uv + stepUv, originalUv) * 0.08;
        result += sceneSample(uv - stepUv, originalUv) * 0.08;
        result += sceneSample(uv + vec2(stepUv.x, -stepUv.y), originalUv) * 0.08;
        result += sceneSample(uv + vec2(-stepUv.x, stepUv.y), originalUv) * 0.08;
        return result;
      }

      void main() {
        vec2 p = (vUv - 0.5) * uResolution;
        float radius = clamp(uCornerRadius, 0.0, min(uResolution.x, uResolution.y) * 0.5);
        float distanceToEdge = roundedRectangle(p, uResolution * 0.5, radius);
        float aa = max(fwidth(distanceToEdge), 0.0001);
        // The rounded silhouette is now geometry, including real sidewalls.
        float mask = 1.0;

        vec2 warp = vec2(
          sin(vUv.y * 5.0 + uTime * 0.24),
          cos(vUv.x * 4.0 - uTime * 0.19)
        );
        // Cover-fit the project image to the card, cropping the long axis.
        float cardAspect = uResolution.x / uResolution.y;
        vec2 cover = cardAspect > uImageAspect ? vec2(1.0, uImageAspect / cardAspect) : vec2(cardAspect / uImageAspect, 1.0);
        vec2 imageUv = (vUv - 0.5) * cover + 0.5 + warp * uDistortionStrength;
        vec2 chromaticOffset = (vUv - 0.5) * uChromaticStrength;
        // A visible glass tint remains while media loads or if a file is missing.
        float flowTime = uTime * uFlowSpeed;
        vec2 drift = vec2(flowTime, -flowTime * 0.7);
        vec2 circulation = vec2(sin(p.y * 2.4 + flowTime), cos(p.x * 2.1 - flowTime * 0.8));
        vec2 domain = vec2(fbm(p * 1.8 + drift + circulation * 0.5),
          fbm(p * 1.8 - drift + 9.2 - circulation * 0.4));
        float clouds = fbm(p * 3.2 + domain * 4.5 + circulation * 0.65);
        float caustic = pow(1.0 - abs(2.0 * fbm(p * 4.0 + domain * 5.0 - drift) - 1.0), 12.0);
        float veins = 1.0 - smoothstep(0.015, 0.09, abs(clouds - 0.48));
        vec3 color = mix(vec3(0.018, 0.035, 0.046), vec3(0.10, 0.16, 0.18),
          smoothstep(0.25, 0.72, clouds));
        color += vec3(0.025, 0.035, 0.05) * veins;
        color += vec3(0.025, 0.055, 0.065) * caustic;
        // Back-facing glass never samples the image, including during a handoff.
        float imageBlend = vCardFace > 0.999 ? smoothstep(0.0, 1.0, uImageBlend) * clamp(uImageOpacity, 0.0, 1.0) : 0.0;
        if (uImageReady > 0.5 && imageBlend > 0.001) {
          vec3 imageColor = vec3(
            texture2D(uImage, clamp(imageUv + chromaticOffset, 0.0, 1.0)).r,
            texture2D(uImage, clamp(imageUv, 0.0, 1.0)).g,
            texture2D(uImage, clamp(imageUv - chromaticOffset, 0.0, 1.0)).b
          );
          color = mix(color, imageColor, imageBlend);
        }
        float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(luminance), color, uSaturation);
        color = mix(vec3(0.18), color, 0.94);
        color *= (1.0 - uGlassDarkness) * uBrightness;
        color = mix(color, color * vec3(0.88, 0.96, 1.08) + vec3(0.006, 0.008, 0.018), 0.35);

        vec2 screenUv = gl_FragCoord.xy / uViewport;
        vec2 liquid = vec2(
          sin(p.y * 7.0 + sin(p.x * 4.0 + uTime * 0.32)),
          cos(p.x * 6.0 + sin(p.y * 5.0 - uTime * 0.27))
        );
        float bevel = 1.0 - smoothstep(0.0, max(uRimWidth, 0.001), -distanceToEdge);
        vec2 bentUv = screenUv + liquid * uLiquid * vec2(uViewport.y / uViewport.x, 1.0);
        bentUv += (domain - 0.5) * uLiquid * 0.7;
        bentUv += normalize(p + vec2(0.0001)) * bevel * uRimWidth * 0.15;
        vec3 behindGlass = blurredScene(bentUv, screenUv);
        behindGlass *= vec3(0.88, 0.94, 1.0) * uSceneBrightness;
        color = mix(color, behindGlass, mix(uInactiveSceneMix, uSceneMix, imageBlend));

        float fresnel = pow(1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewDirection))), 0.0, 1.0), 3.0);
        float edge = exp(-max(-distanceToEdge, 0.0) / 0.065);
        color += vec3(0.45, 0.7, 1.0) * uEdgeStrength * (edge * 0.65 + fresnel * 0.35);
        // Face rim blends into the geometric bevel and tinted sidewalls.
        float rimLight = 0.5 + 0.5 * dot(normalize(p + vec2(0.0001)), normalize(vec2(-0.6, 0.8)));
        vec3 rimColor = color * 0.32 + vec3(0.09, 0.15, 0.19) * rimLight;
        color = mix(color, rimColor, bevel * (0.65 + 0.25 * fresnel));
        color += vec3(0.35, 0.55, 0.65) * pow(bevel, 7.0) * 0.12 * rimLight;
        float innerLip = exp(-pow((-distanceToEdge - uRimWidth * 0.8) / 0.012, 2.0));
        color += vec3(0.22, 0.36, 0.42) * innerLip * rimLight * 0.16;
        float sideAmount = 1.0 - smoothstep(0.05, 0.98, abs(vCardFace));
        vec3 surfaceNormal = normalize(vNormal);
        vec3 viewDirection = normalize(vViewDirection);
        vec3 lightDirection = normalize(vec3(-0.5, 0.8, 0.9));
        float sideLight = max(dot(surfaceNormal, lightDirection), 0.0);
        float glint = pow(max(dot(surfaceNormal, normalize(lightDirection + viewDirection)), 0.0), 48.0);
        vec3 sideColor = behindGlass * 0.22 + vec3(0.018, 0.055, 0.07);
        sideColor += vec3(0.10, 0.19, 0.22) * sideLight + vec3(0.32, 0.46, 0.5) * glint;
        color = mix(color, sideColor, sideAmount);
        // Card-anchored micrograin: visible frosting without frame-to-frame flicker.
        vec2 grainGrid = vUv * uResolution * 210.0;
        float grain = hashNoise(floor(grainGrid)) - 0.5;
        float micrograin = noise(p * 75.0) - 0.5;
        float grainAA = 1.0 - smoothstep(0.7, 2.0, max(fwidth(grainGrid.x), fwidth(grainGrid.y)));
        color += (grain * grainAA + micrograin * 0.55) * uNoiseStrength;
        gl_FragColor = vec4(max(color, 0.0), clamp(uAlpha, 0.0, 1.0) * mask);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    // The closed slab has outward-facing rear/side geometry. No mirrored image.
    side: THREE.FrontSide,
    // See-through color comes from the scene capture; depth writes keep the
    // slab's front, bevel and rear from blending over one another.
    transparent: false,
    depthTest: true,
    depthWrite: true
  });
}


// ======================================================
// TEXT TEXTURE
// ======================================================

function createTextTexture(
  title,
  index
) {

  const canvas =
    document.createElement(
      'canvas'
    );


  canvas.width =
    1024;

  canvas.height =
    576;


  const context =
    canvas.getContext(
      '2d'
    );


  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  context.textAlign =
    'center';

  context.textBaseline =
    'middle';


  // ====================================================
  // TITLE
  // ====================================================

  context.fillStyle =
    CARD_TEXT_COLOR;


  context.font =
    `600 ${CARD_TEXT_FONT_SIZE}px "${CARD_TEXT_FONT}", "Arial Narrow", sans-serif`;


  const lines =
    title.split(
      '\n'
    );


  const lineHeight =
    CARD_TEXT_FONT_SIZE *
    0.92;


  const totalHeight =
    (
      lines.length -
      1
    ) *
    lineHeight;


  const startY =
    canvas.height / 2 -
    totalHeight / 2;


  lines.forEach(
    (
      line,
      lineIndex
    ) => {

      context.fillText(
        line,

        canvas.width / 2,

        startY +
          lineIndex *
          lineHeight
      );

    }
  );


  const texture =
    new THREE.CanvasTexture(
      canvas
    );


  texture.colorSpace =
    THREE.SRGBColorSpace;


  texture.minFilter =
    THREE.LinearFilter;


  texture.magFilter =
    THREE.LinearFilter;


  texture.needsUpdate =
    true;


  return texture;
}


// ======================================================
// TEXT PLANE
// ======================================================

function createCardText(
  title,
  index
) {

  const texture =
    createTextTexture(
      title,
      index
    );


  const geometry =
    new THREE.PlaneGeometry(
      3.75,
      2.1
    );


  skewCardGeometry(geometry);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uText: { value: texture },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(CARD_TEXT_COLOR) },
      uOpacity: { value: CARD_TEXT_OPACITY },
      uFlow: { value: CARD_TEXT_FLOW }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vUv = uv;
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = -p.xyz;
        gl_Position = projectionMatrix * p;
      }
    `,
    fragmentShader: `
      uniform sampler2D uText;
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uFlow;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
      float ink(vec2 uv) {
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
        return texture2D(uText, uv).a;
      }
      void main() {
        float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
        // Visibility belongs to each title, not to the active image selection.
        float angleAway = 1.0 - smoothstep(0.12, 0.92, facing);
        float distanceAway = smoothstep(9.0, 17.0, length(vView));
        float away = max(angleAway, distanceAway);
        float glitch = smoothstep(0.06, 0.85, away);
        float frame = floor(uTime * 9.0);
        float strip = floor(vUv.x * 160.0);
        float band = floor(vUv.y * 24.0);
        float shift = (hash(band + frame * 0.17) - 0.5) * 0.025 * glitch;
        vec2 flow = vec2(
          sin(vUv.y * 19.0 + uTime * 1.15) + 0.35 * sin(vUv.x * 27.0 - uTime * 0.7),
          cos(vUv.x * 16.0 - uTime * 0.85)
        ) * uFlow;
        vec2 uv = vUv + vec2(shift, 0.0) + flow;
        float center = ink(uv);
        float split = 0.007 * glitch;
        vec3 channels = vec3(ink(uv + vec2(split, 0.0)), center, ink(uv - vec2(split, 0.0)));
        // Repeated horizontal silhouettes, broken into narrow vertical slivers.
        for (int i = 1; i <= 3; i++) {
          float offset = float(i) * 0.024 * glitch;
          float gate = step(0.38, hash(strip + float(i) * 19.0 + frame * 0.07));
          vec2 echoUv = uv + vec2(offset, 0.0);
          vec3 echo = vec3(ink(echoUv + vec2(split, 0.0)), ink(echoUv), ink(echoUv - vec2(split, 0.0)));
          channels = max(channels, echo * gate * glitch * (0.7 - float(i) * 0.12));
        }
        float dropout = mix(1.0, step(0.22, hash(strip + frame * 0.11)), glitch * 0.7);
        float fade = (1.0 - smoothstep(0.65, 1.0, away)) * dropout;
        float coverage = max(channels.r, max(channels.g, channels.b));
        float shimmer = 0.94 + 0.06 * sin(vUv.x * 11.0 + vUv.y * 5.0 - uTime * 1.4);
        float sweep = exp(-pow((fract(vUv.x * 0.65 - uTime * 0.12) - 0.5) * 7.0, 2.0));
        float alpha = coverage * fade * uOpacity * shimmer * (0.9 + sweep * 0.1);
        if (alpha < 0.002) discard;
        gl_FragColor = vec4(uColor * channels / max(coverage, 0.001), alpha);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.FrontSide,
    toneMapped: false
  });


  const textMesh =
    new THREE.Mesh(
      geometry,
      material
    );


  textMesh.position.set(
    0,
    0,
    CARD_TEXT_Z
  );


  textMesh.scale.setScalar(
    CARD_TEXT_SCALE
  );


  // Let text and glass participate in normal back-to-front depth sorting.
  textMesh.renderOrder =
    0;


  return textMesh;
}


// ======================================================
// CARD DATA
// ======================================================

const cardData =
  Array.from(
    {
      length:
        CARD_COUNT
    },

    (
      _,
      index
    ) => ({

      y:
        FIRST_CARD_Y -
        CARD_Y_GAP *
        index,

      title:
        CARD_TITLES[
          index %
          CARD_TITLES.length
        ],

      image:
        PROJECT_COVERS[
          index %
          PROJECT_COVERS.length
        ].src

    })
  );


// ======================================================
// CREATE CARDS
// ======================================================

const cardPivots = [];


cardData.forEach(
  (
    data,
    index
  ) => {

    // ==================================================
    // PIVOT
    // ==================================================

    const orbitAngle =
      CARD_BASE_ANGLE +
      index *
      CARD_ANGLE_DIFFERENCE;


    const pivot =
      new THREE.Group();


    pivot.position.set(
      0,
      data.y,
      0
    );


    pivot.rotation.y =
      orbitAngle;


    cardsGroup.add(
      pivot
    );


    // ==================================================
    // IMAGE
    // ==================================================

    const media =
      createImageTexture(
        data.image
      );

    const texture =
      media.texture;


    // ==================================================
    // SINGLE GLASS SHEET
    // ==================================================

    const material =
      createGlassImageMaterial(
        texture
      );


    const card =
      new THREE.Mesh(
        cardGeometry,
        material
      );


    card.position.set(
      0,
      0,
      CARD_DISTANCE
    );


    card.rotation.x =
      CARD_TILT_X;


    card.rotation.y =
      CARD_YAW;


    card.rotation.z =
      CARD_TILT_Z;


    card.scale.setScalar(
      CARD_SCALE
    );


    card.castShadow =
      true;


    card.receiveShadow =
      true;


    pivot.add(
      card
    );


    // ==================================================
    // TEXT
    // ==================================================

    const textLayer =
      createCardText(
        data.title,
        index
      );


    card.add(
      textLayer
    );


    // ==================================================
    // STORE
    // ==================================================

    cardPivots.push({

      pivot,

      card,

      textLayer,

      media,

      texture,

      material,

      baseOrbit:
        orbitAngle,

      index

    });

  }
);


// ======================================================
// SCROLL
// ======================================================

let targetScroll =
  0;

let smoothScroll =
  0;


// ======================================================
// GET SCROLL PROGRESS
// ======================================================

function updateCamera() {

  smoothScroll +=
    (
      targetScroll -
      smoothScroll
    ) *
    0.055;


  const angle =
    THREE.MathUtils.lerp(
      CAMERA_START_ANGLE,
      CAMERA_END_ANGLE,
      smoothScroll
    );


  const radius =
    CAMERA_BASE_RADIUS +

    Math.sin(
      smoothScroll *
        Math.PI *
        2
    ) *
    0.22;


  const cameraY =
    THREE.MathUtils.lerp(
      CAMERA_START_Y,
      CAMERA_END_Y,
      smoothScroll
    );


  camera.position.x =
    Math.sin(angle) *
    radius;


  camera.position.z =
    Math.cos(angle) *
    radius;


  camera.position.y =
    cameraY;


  camera.lookAt(
    0,
    cameraY - 0.1,
    0
  );
}


// ======================================================
// CARD MOTION
// ======================================================

const clock =
  new THREE.Clock();


let previousCardTime = 0;

function updateCards(
  elapsed
) {

  const delta = Math.min(elapsed - previousCardTime, 0.1);
  previousCardTime = elapsed;
  cardPivots.forEach(
    (
      item,
      index
    ) => {

      const hover = item === hoveredCard && !caseStudy.open ? 1 : 0;
      const hoverUniform = item.material.uniforms.uHover;
      if (hover && !item.wasHovered) {
        item.material.uniforms.uPointer.value.copy(hoverUv);
      }
      item.wasHovered = Boolean(hover);
      hoverUniform.value = THREE.MathUtils.damp(hoverUniform.value, hover, 7, delta);
      const hoverMotion = reducedMotion.matches ? 0 : hoverUniform.value;
      item.card.position.z = CARD_DISTANCE + CARD_HOVER_LIFT * hoverMotion;
      if (item === hoveredCard) item.material.uniforms.uPointer.value.lerp(hoverUv, 1 - Math.exp(-12 * delta));
      const localPointer = item.material.uniforms.uPointer.value;
      item.card.rotation.x = CARD_TILT_X + (localPointer.y - 0.5) * CARD_HOVER_TILT * hoverMotion;
      item.card.rotation.y = CARD_YAW - (localPointer.x - 0.5) * CARD_HOVER_TILT * hoverMotion;
      item.material.uniforms.uTime.value = elapsed;
      item.textLayer.material.uniforms.uTime.value = elapsed;
      item.material.uniforms.uImageReady.value = item.media.ready ? 1 : 0;
      item.material.uniforms.uImageAspect.value = item.media.aspect;
      const target = item === activeCard && item.material.uniforms.uImageReady.value ? 1 : 0;
      item.material.uniforms.uImageBlend.value = THREE.MathUtils.clamp(
        item.material.uniforms.uImageBlend.value + (target ? 1 : -1) * delta / IMAGE_TRANSITION_SECONDS,
        0, 1
      );

      item.card.position.y =
        Math.sin(
          elapsed *
            0.42 +
          index *
            1.2
        ) *
        0.03;


      item.pivot.rotation.y =
        item.baseOrbit +

        Math.sin(
          elapsed *
            0.12 +
          index *
            0.8
        ) *
        (CARD_ANGLE_DIFFERENCE === 0 ? 0 : 0.01);

    }
  );
}


// Choose the prominent front-facing card without coupling layout to the camera.
let activeCard = null;
const cardWorldPosition = new THREE.Vector3();
const cardWorldNormal = new THREE.Vector3();
const cardToCamera = new THREE.Vector3();
const projectedCard = new THREE.Vector3();
const viewProjection = new THREE.Matrix4();
const cardFrustum = new THREE.Frustum();

function updateActiveCard() {
  if (caseStudy.open || caseBusy) return;
  scene.updateMatrixWorld(true);
  viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  cardFrustum.setFromProjectionMatrix(viewProjection);
  let nextCard = null;
  let bestScore = 0;
  let currentScore = 0;
  for (const item of cardPivots) {
    item.card.getWorldPosition(cardWorldPosition);
    cardWorldNormal.set(0, 0, 1).transformDirection(item.card.matrixWorld);
    cardToCamera.subVectors(camera.position, cardWorldPosition);
    const distanceSquared = cardToCamera.lengthSq();
    const facing = cardWorldNormal.dot(cardToCamera.normalize());
    if (facing <= 0.08 || !cardFrustum.intersectsObject(item.card)) continue;
    projectedCard.copy(cardWorldPosition).project(camera);
    const score = facing / (distanceSquared * (1 + projectedCard.x ** 2 + projectedCard.y ** 2));
    if (item === activeCard) currentScore = score;
    if (score > bestScore) {
      bestScore = score;
      nextCard = item;
    }
  }
  // A small margin keeps subtle motion from rapidly toggling neighboring cards.
  if (currentScore > 0 && bestScore < currentScore * 1.15) nextCard = activeCard;
  activeCard = nextCard;
}

// Measure focus using camera-space angles, independent of the animated FOV.
// This avoids a feedback loop where widening the lens changes its own target.
const focusPosition = new THREE.Vector3();
let previousFovTime = 0;
function updateCameraFov(elapsed) {
  const delta = Math.min(elapsed - previousFovTime, 0.1);
  previousFovTime = elapsed;
  let focus = 0;
  const normalHalfHeight = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV * 0.5));
  for (const item of cardPivots) {
    item.card.getWorldPosition(focusPosition);
    cardToCamera.subVectors(camera.position, focusPosition).normalize();
    cardWorldNormal.set(0, 0, 1).transformDirection(item.card.matrixWorld);
    const facing = cardWorldNormal.dot(cardToCamera);
    focusPosition.applyMatrix4(camera.matrixWorldInverse);
    if (focusPosition.z >= 0 || facing <= 0) continue;
    const x = focusPosition.x / (-focusPosition.z * normalHalfHeight * camera.aspect);
    const y = focusPosition.y / (-focusPosition.z * normalHalfHeight);
    const centered = 1 - THREE.MathUtils.smoothstep(Math.hypot(x, y), 0.12, 0.6);
    focus = Math.max(focus, centered * THREE.MathUtils.smoothstep(facing, 0.45, 0.9));
  }
  const baseFov = THREE.MathUtils.lerp(CAMERA_OPEN_FOV, CAMERA_FOV, focus);
  // Preserve enough horizontal room for a card on portrait screens.
  const target = THREE.MathUtils.radToDeg(2 * Math.atan(
    Math.tan(THREE.MathUtils.degToRad(baseFov / 2)) * Math.max(1, 1.3 / camera.aspect)
  ));
  camera.fov = THREE.MathUtils.damp(camera.fov, target, CAMERA_FOV_TRANSITION_SPEED, delta);
  camera.updateProjectionMatrix();
}

// ======================================================
// RESIZE
// ======================================================

function resize(width, height) {
  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();
  if (ownsRenderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
  }
  resizeGlassTarget();
  portal.resize();
}

// Case study copy comes straight from the shared project data.
const CASE_STUDIES = projects.map((project, index) => ({
  title: project.name,
  client: project.client,
  category: project.category,
  discipline: project.discipline.join(' · '),
  year: project.year,
  intro: project.headline,
  overview: project.summary,
  challenge: project.problem,
  approach: project.solution,
  outcome: project.outcome.join(' '),
  caption: PROJECT_COVERS[index].caption
}));
const caseStudy = document.createElement('dialog');
caseStudy.className = 'work-case-study';
caseStudy.setAttribute('data-lenis-prevent', '');
caseStudy.setAttribute('aria-labelledby', 'case-title');
caseStudy.innerHTML = `<button class="case-close" aria-label="Close case study">← Back to projects <span>ESC</span></button>
  <article class="case-content">
    <div class="case-stage"><header class="case-header"><p class="case-eyebrow">Selected work / <span data-case="year"></span> · <span data-case="category"></span></p>
    <h1 id="case-title" data-case="title"></h1><p data-case="discipline"></p><p class="case-hint">Scroll up to return to projects</p></header>
    <div class="case-hero"><img alt="" decoding="async"><span class="case-caption" data-case="caption"></span></div></div>
    <div class="case-details"><section class="case-overview"><div><p class="case-eyebrow">The project</p><h2 data-case="intro"></h2></div><div><p data-case="overview"></p><dl><dt>Client</dt><dd data-case="client"></dd><dt>Scope</dt><dd data-case="discipline"></dd></dl></div></section>
    <section class="case-chapters"><div><span>01 / Challenge</span><h2>Clarity through discovery.</h2><p data-case="challenge"></p></div><div><span>02 / Approach</span><h2>Built to be explored.</h2><p data-case="approach"></p></div><div><span>03 / Outcome</span><h2>A connected experience.</h2><p data-case="outcome"></p></div></section>
    <footer class="case-footer"><p>Every detail is part of the story.</p><button class="case-return">Return to the collection ↗</button></footer></div>
  </article>`;
document.body.appendChild(caseStudy);
const caseHero = caseStudy.querySelector('.case-hero');
const caseImage = caseStudy.querySelector('.case-hero img');
let caseBusy = false;
let savedFocus = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const flight = { progress: 0 };
let flightTween = null;
let releaseFlightScroll = null;
let flightItem = null;
const flightFrom = new THREE.Vector3();
const flightTo = new THREE.Vector3();
const flightRotationFrom = new THREE.Quaternion();
let flightFov = CAMERA_FOV;
let flightDistance = 2.05;
let closeRequested = false;

function aimFlight(item) {
  scene.updateMatrixWorld(true);
  flightFrom.copy(camera.position);
  flightRotationFrom.copy(camera.quaternion);
  flightFov = camera.fov;
  const center = item.card.getWorldPosition(new THREE.Vector3());
  // Translate in the current camera frame. Keep its heading and roll:
  // moving to the card's normal would flatten the angled view of the slab.
  const backward = new THREE.Vector3(0, 0, 1).applyQuaternion(flightRotationFrom);
  const depth = center.clone().sub(flightFrom).dot(backward) * -1;
  // The reference enlarges the card roughly 1.7x while shifting it into
  // view. Retain more distance on narrow screens to keep it readable.
  const portraitDistance = CARD_WIDTH / (2 * Math.tan(THREE.MathUtils.degToRad(flightFov / 2)) * camera.aspect * 1.15);
  flightDistance = Math.min(depth, Math.max(depth * .58, portraitDistance));
  flightTo.copy(center).addScaledVector(backward, flightDistance);
}
function updateFlightCamera() {
  const approach = THREE.MathUtils.smoothstep(flight.progress, 0, .7);
  // Interpolating distance exponentially gives a steady perceived approach.
  const distance = flightFrom.distanceTo(flightTo);
  const ratio = flightDistance / (distance + flightDistance);
  const dolly = (1 - Math.pow(ratio, approach)) / Math.max(1 - ratio, .001);
  camera.position.lerpVectors(flightFrom, flightTo, dolly);
  camera.quaternion.copy(flightRotationFrom);
  camera.fov = flightFov;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
}
function syncCaseReveal() {
  const reveal = THREE.MathUtils.smoothstep(flight.progress, .88, 1);
  caseStudy.style.setProperty('--case-reveal', String(reveal));
  caseStudy.dataset.transitioning = String(caseBusy);
}
function playFlight(forward, complete) {
  flightTween?.kill();
  flightTween = gsap.to(flight, {
    progress: forward ? 1 : 0,
    duration: reducedMotion.matches ? 0 : forward ? .75 : .75,
    ease: 'none',
    onUpdate: syncCaseReveal,
    onComplete: () => {
      if (disposed) return;
      complete();
      syncCaseReveal();
      portal.release();
    },
  });
}
function openCaseStudy(item) {
  if (caseBusy || caseStudy.open || !item || item !== activeCard) return;
  caseBusy = true;
  closeRequested = false;
  flightItem = item;
  aimFlight(item);
  flight.progress = 0;
  savedFocus = document.activeElement;
  releaseFlightScroll = lockScroll({ allowWithin: caseStudy });
  const data = CASE_STUDIES[item.index];
  caseStudy.querySelectorAll('[data-case]').forEach(el => { el.textContent = data[el.dataset.case]; });
  caseImage.src = PROJECT_COVERS[item.index].src;
  caseImage.alt = `${data.title} — ${data.caption}`;
  syncCaseReveal();
  caseStudy.showModal();
  caseStudy.scrollTop = 0;
  renderer.domElement.style.cursor = '';
  playFlight(true, () => {
    caseBusy = false;
    caseStudy.querySelector('.case-close').focus({ preventScroll: true });
    if (closeRequested) closeCaseStudy();
  });
}
function closeCaseStudy() {
  if (!caseStudy.open) return;
  if (caseBusy) { closeRequested = true; return; }
  caseBusy = true;
  caseStudy.scrollTo({ top: 0, behavior: 'instant' });
  syncCaseReveal();
  playFlight(false, () => {
    camera.position.copy(flightFrom);
    camera.quaternion.copy(flightRotationFrom);
    camera.fov = flightFov;
    camera.updateProjectionMatrix();
    caseStudy.close();
    caseImage.removeAttribute('src');
    releaseFlightScroll?.();
    releaseFlightScroll = null;
    savedFocus?.focus({ preventScroll: true });
    flightItem = null;
    caseBusy = false;
  });
}
listen(caseStudy.querySelector('.case-close'), 'click', closeCaseStudy);
listen(caseStudy.querySelector('.case-return'), 'click', closeCaseStudy);
listen(caseStudy, 'cancel', event => { event.preventDefault(); closeCaseStudy(); });
listen(caseStudy, 'wheel', event => {
  if (!caseBusy && caseStudy.scrollTop <= 1 && event.deltaY < -18) closeCaseStudy();
}, { passive: true });
renderer.domElement.tabIndex = 0;
renderer.domElement.setAttribute('role', 'button');
renderer.domElement.setAttribute('aria-label', 'Open current project case study');
let pointerStart = null;
listen(renderer.domElement, 'pointerdown', event => { pointerStart = new THREE.Vector2(event.clientX, event.clientY); });
listen(renderer.domElement, 'click', event => {
  if (suspended) return;
  if (pointerStart && pointerStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 8) return;
  const rect = canvas.getBoundingClientRect();
  hoverPointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
  updateHover();
  if (hoveredCard && hoveredCard === activeCard) openCaseStudy(activeCard);
});
listen(renderer.domElement, 'keydown', event => {
  if (suspended) return;
  if ((event.key === 'Enter' || event.key === ' ') && activeCard) { event.preventDefault(); openCaseStudy(activeCard); }
});

// Raycast the actual slabs so gaps and rounded corners keep the normal cursor.
const hoverRay = new THREE.Raycaster();
const hoverPointer = new THREE.Vector2(2, 2);
const hoverUv = new THREE.Vector2(0.5, 0.5);
let hoveredCard = null;
function updateHover() {
  if (suspended || caseStudy.open) { hoveredCard = null; renderer.domElement.style.cursor = ''; return; }
  hoverRay.setFromCamera(hoverPointer, camera);
  const hit = hoverRay.intersectObjects(cardPivots.map(item => item.card), false)[0];
  hoveredCard = hit ? cardPivots.find(item => item.card === hit.object) : null;
  if (hit?.uv) hoverUv.copy(hit.uv);
  renderer.domElement.style.cursor = hoveredCard && hoveredCard === activeCard ? 'pointer' : '';
}
listen(renderer.domElement, 'pointermove', event => {
  const rect = canvas.getBoundingClientRect();
  hoverPointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
});
listen(renderer.domElement, 'pointerleave', () => hoverPointer.set(2, 2));

// ======================================================
// INITIAL
// ======================================================

targetScroll = 0;

smoothScroll =
  targetScroll;

updateCamera();


// ======================================================
// ANIMATE
// ======================================================

function animate() {

  if (disposed || suspended) return;


  const elapsed =
    clock.getElapsedTime();


  if (caseStudy.open) {
    updateFlightCamera();
    // Freeze the orbit/slabs during the flight; only the camera advances.
    previousCardTime = elapsed;
    previousFovTime = elapsed;
  } else {
    updateCamera();
    updateCards(elapsed);
    updateActiveCard();
    updateCameraFov(elapsed);
  }


  updateSurroundings(elapsed);
  updateHover();

  const toneMapping = renderer.toneMapping;
  const toneMappingExposure = renderer.toneMappingExposure;
  const autoClear = renderer.autoClear;
  const shadows = renderer.shadowMap.enabled;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.autoClear = true;

  cardsGroup.visible = false;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setRenderTarget(glassSceneTarget);
  renderer.clear();
  renderer.render(scene, camera);
  renderer.setRenderTarget(caseStudy.open && caseBusy ? portal.captureTarget() : null);
  renderer.toneMapping = caseStudy.open && caseBusy ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  cardsGroup.visible = !caseStudy.open || caseBusy;

  renderer.clear();
  renderer.render(scene, camera);

  if (caseStudy.open && caseBusy && flightItem) {
    // Capture the destination backdrop separately from the bending
    // collection. The player is composited behind that foreground.
    cardsGroup.visible = false;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setRenderTarget(portal.behindTarget());
    renderer.clear();
    renderer.render(scene, camera);
    cardsGroup.visible = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setRenderTarget(null);
    renderer.clear();
    portal.render(flight.progress, flightItem.texture, flightItem.media, caseHero.getBoundingClientRect(), canvas.getBoundingClientRect());
  }
  cardsGroup.visible = true;

  renderer.toneMapping = toneMapping;
  renderer.toneMappingExposure = toneMappingExposure;
  renderer.shadowMap.enabled = shadows;
  renderer.autoClear = autoClear;
}


return {
  frame: animate,
  resize,
  setProgress(progress) { targetScroll = THREE.MathUtils.clamp(progress, 0, 1); },
  setVisible(visible, interactive = visible) {
    suspended = !visible;
    renderer.domElement.tabIndex = interactive ? 0 : -1;
    renderer.domElement.style.pointerEvents = interactive ? 'auto' : 'none';
    if (interactive) {
      renderer.domElement.setAttribute('role', 'button');
      renderer.domElement.setAttribute('aria-label', 'Open current project case study');
    } else {
      renderer.domElement.removeAttribute('role');
      renderer.domElement.removeAttribute('aria-label');
    }
  },
  dispose() {
    disposed = true;
    events.abort();
    flightTween?.kill();
    releaseFlightScroll?.();
    portal.dispose();
    caseHero.getAnimations().forEach(animation => animation.cancel());
    caseStudy.close();
    caseStudy.remove();
    canvas.classList.remove('work-case-open');
    if (ownsRenderer) canvas.classList.remove('webgl');
    canvas.style.cursor = '';
    caseImage.removeAttribute('src');
    const resources = new Set();
    scene.traverse(object => {
      if (object.isInstancedMesh) resources.add(object);
      if (object.geometry) resources.add(object.geometry);
      const materials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
      for (const material of materials) {
        resources.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
        for (const uniform of Object.values(material.uniforms || {})) if (uniform.value?.isTexture) resources.add(uniform.value);
      }
    });
    resources.forEach(resource => resource.dispose());
    backgroundTexture.dispose();
    studioEnvironment.dispose();
    glassSceneTarget.dispose();
    if (ownsRenderer) renderer.dispose();
  }
};

function listen(target, type, listener, options = {}) {
  target.addEventListener(type, listener, { ...options, signal: events.signal });
}
}
