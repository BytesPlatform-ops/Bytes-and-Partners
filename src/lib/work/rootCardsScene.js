
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * Embedded version of shader-learning; the section owns scrolling and frames.
 * @param {HTMLCanvasElement} canvas
 */
export function createRootCardsScene(canvas) {
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
const CAMERA_END_Y = -7.2;

const CAMERA_START_ANGLE = 0.25;
const CAMERA_END_ANGLE = Math.PI * 3.6;

const CAMERA_BASE_RADIUS = 12;


// ======================================================
// CARD CONFIG
// ======================================================

const CARD_COUNT = 12;

const CARD_DISTANCE = 8.0;
const CARD_HOVER_LIFT = 0.24;
const CARD_HOVER_TILT = 0.035;

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
const VIDEO_TRANSITION_SECONDS = 0.55;
const GLASS_BLUR = 3.5; // Screen pixels at full drawing-buffer resolution.
const GLASS_LIQUID = 0.024;
const GLASS_FLOW_SPEED = 0.22;
const GLASS_RIM_WIDTH = 0.09; // Apparent bevel thickness in card units.
const CARD_SKEW = -0.04; // Local Y shear; card centers and orbit stay fixed.


// ======================================================
// VIDEO CONFIG
// ======================================================

const VIDEO_OPACITY = 0.72; // Video contribution over the glass, from 0 to 1.

const VIDEO_SOURCES = [
  '/videos/project-01.mp4', // Card 01
  '/videos/project-01.mp4', // Card 02
  '/videos/project-01.mp4', // Card 03
  '/videos/project-01.mp4', // Card 04
  '/videos/project-01.mp4', // Card 05
  '/videos/project-01.mp4', // Card 06
  '/videos/project-01.mp4', // Card 07
  '/videos/project-01.mp4', // Card 08
  '/videos/project-01.mp4', // Card 09
  '/videos/project-01.mp4', // Card 10
  '/videos/project-01.mp4', // Card 11
  '/videos/project-01.mp4', // Card 12
];


// ======================================================
// TEXT CONFIG
// ======================================================

// text floats slightly IN FRONT
// of the single glass sheet
const CARD_TEXT_Z = 0.4;

const CARD_TEXT_SCALE = 1;

const CARD_TEXT_FONT_SIZE = 84;

const CARD_TEXT_COLOR = '#ffffff'; // Heading color, including the text shader.
const CARD_TEXT_OPACITY = 0.84;
const CARD_TEXT_FLOW = 0.0025;
const CARD_TEXT_FONT = 'Rajdhani';
const ORBIT_RING_COUNT = 22;
const ORBIT_RING_RADIUS = 6.2;
const ORBIT_BEADS_PER_RING = 42;

const CARD_TITLES = [
  'DIGITAL\nEXPERIENCES',
  'CREATIVE\nTECHNOLOGY',
  'INTERACTIVE\nDESIGN',
  'WEBGL\nEXPERIMENTS',
  'IMMERSIVE\nWORLDS',
  'MOTION\nSYSTEMS',
  'AI\nEXPERIENCES',
  'DIGITAL\nPRODUCTS',
  'BRAND\nSYSTEMS',
  '3D\nENVIRONMENTS',
  'GENERATIVE\nDESIGN',
  'FUTURE\nINTERFACES'
];


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
backgroundContext.fillStyle = '#f4f1eb';
backgroundContext.fillRect(0, 0, 1024, 1024);
for (const [x, y, radius, color] of [
  [180, 300, 740, 'rgba(192, 213, 234, 0.35)'],
  [850, 660, 740, 'rgba(228, 211, 183, 0.3)'],
  [540, 100, 600, 'rgba(255, 255, 255, 0.72)']
]) {
  const gradient = backgroundContext.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(244, 241, 235, 0)');
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

const renderer =
  new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

renderer.setSize(
  window.innerWidth,
  window.innerHeight,
  false
);

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.shadowMap.enabled =
  true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;


// better highlights / glass
renderer.toneMapping =
  THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
  1.05;


renderer.domElement.classList.add(
  'webgl'
);




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
// VIDEO CREATOR
// ======================================================

function createVideoTexture(
  source
) {

  const video =
    document.createElement(
      'video'
    );


  video.src =
    source;


  video.loop =
    true;


  video.muted =
    true;


  video.playsInline =
    true;


  video.autoplay =
    false; // Playback is owned by the current-card controller.


  video.preload =
    'auto';


  video.crossOrigin =
    'anonymous';


  video.setAttribute(
    'webkit-playsinline',
    ''
  );


  const texture =
    new THREE.VideoTexture(
      video
    );


  texture.colorSpace =
    THREE.SRGBColorSpace;


  texture.minFilter =
    THREE.LinearFilter;


  texture.magFilter =
    THREE.LinearFilter;


  texture.generateMipmaps =
    false;


  // cover-type cropping
  texture.wrapS =
    THREE.ClampToEdgeWrapping;

  texture.wrapT =
    THREE.ClampToEdgeWrapping;


  const tryPlay = () => {
    if (disposed || suspended || video.dataset.active !== 'true' || video.error) return;
    const promise =
      video.play();

    if (promise) {
      promise.catch(() => {});
    }
  };


  listen(video, 
    'canplay',
    tryPlay,
    {
      once: true
    }
  );


  // browser interaction fallback
  listen(window, 
    'pointerdown',
    tryPlay,
    {
      once: true
    }
  );


  return {
    video,
    texture
  };
}


// ======================================================
// SINGLE GLASS + VIDEO MATERIAL
// ======================================================

function createGlassVideoMaterial(
  videoTexture
) {

  return new THREE.ShaderMaterial({
    uniforms: {
      uVideo: { value: videoTexture },
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
      uVideoReady: { value: 0 },
      uVideoBlend: { value: 0 },
      uVideoOpacity: { value: VIDEO_OPACITY },
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
      uniform sampler2D uVideo;
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
      uniform float uVideoReady;
      uniform float uVideoBlend;
      uniform float uVideoOpacity;
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
        vec2 videoUv = vUv + warp * uDistortionStrength;
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
        // Back-facing glass never samples video, including during a handoff.
        float videoBlend = vCardFace > 0.999 ? smoothstep(0.0, 1.0, uVideoBlend) * clamp(uVideoOpacity, 0.0, 1.0) : 0.0;
        if (uVideoReady > 0.5 && videoBlend > 0.001) {
          vec3 videoColor = vec3(
            texture2D(uVideo, clamp(videoUv + chromaticOffset, 0.0, 1.0)).r,
            texture2D(uVideo, clamp(videoUv, 0.0, 1.0)).g,
            texture2D(uVideo, clamp(videoUv - chromaticOffset, 0.0, 1.0)).b
          );
          // VideoTexture sRGB samples need explicit decoding in ShaderMaterial.
          color = mix(color, sRGBTransferEOTF(vec4(videoColor, 1.0)).rgb, videoBlend);
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
        color = mix(color, behindGlass, mix(uInactiveSceneMix, uSceneMix, videoBlend));

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
        float cursorLight = exp(-length((vUv - uPointer) * uResolution) * 2.0);
        color += vec3(0.055, 0.09, 0.12) * cursorLight * uHover;
        gl_FragColor = vec4(max(color, 0.0), clamp(uAlpha, 0.0, 1.0) * mask);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    // The closed slab has outward-facing rear/side geometry. No mirrored video.
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
        // Visibility belongs to each title, not to the active video selection.
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

      video:
        VIDEO_SOURCES[
          index %
          VIDEO_SOURCES.length
        ]

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
    // VIDEO
    // ==================================================

    const {
      video,
      texture
    } =
      createVideoTexture(
        data.video
      );


    // ==================================================
    // SINGLE GLASS SHEET
    // ==================================================

    const material =
      createGlassVideoMaterial(
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

      video,

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
      hoverUniform.value = THREE.MathUtils.damp(hoverUniform.value, hover, 7, delta);
      item.card.position.z = CARD_DISTANCE + CARD_HOVER_LIFT * hoverUniform.value;
      item.material.uniforms.uPointer.value.lerp(hoverUv, 1 - Math.exp(-9 * delta));
      item.card.rotation.x = CARD_TILT_X + (hoverUv.y - 0.5) * CARD_HOVER_TILT * hoverUniform.value;
      item.card.rotation.y = CARD_YAW - (hoverUv.x - 0.5) * CARD_HOVER_TILT * hoverUniform.value;
      item.material.uniforms.uTime.value = elapsed;
      item.textLayer.material.uniforms.uTime.value = elapsed;
      item.material.uniforms.uVideoReady.value =
        !item.video.error && item.video.readyState >= 2 ? 1 : 0;
      const target = item === activeCard && item.material.uniforms.uVideoReady.value ? 1 : 0;
      item.material.uniforms.uVideoBlend.value = THREE.MathUtils.clamp(
        item.material.uniforms.uVideoBlend.value + (target ? 1 : -1) * delta / VIDEO_TRANSITION_SECONDS,
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
  if (caseStudy.open) return;
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
  if (nextCard === activeCard) return;
  if (activeCard) {
    activeCard.video.dataset.active = 'false';
    activeCard.video.pause();
    // Keep its last decoded frame while the outgoing shader fades to glass.
  }
  activeCard = nextCard;
  if (activeCard) {
    activeCard.video.dataset.active = 'true';
    if (!activeCard.video.error) activeCard.video.play().catch(() => {});
  }
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  resizeGlassTarget();
}

// Mock content stays separate from rendering so real case studies can replace it.
const CASE_STUDIES = CARD_TITLES.map((title, index) => ({
  title: title.replace('\n', ' '),
  client: ['Forma Studio', 'Northstar Labs', 'Fieldwork Collective'][index % 3],
  discipline: ['Digital experience · Creative development', 'Interactive storytelling · WebGL', 'Art direction · Motion design'][index % 3],
  year: '2026',
  intro: 'A new perspective on the everyday.',
  overview: 'An exploratory digital experience that turns a familiar story into a world worth spending time in. Moving image, responsive materials, and considered typography create a continuous journey from curiosity to discovery.',
  challenge: 'Make a complex story feel immediate. We needed a way to invite exploration while keeping the essential information clear, accessible, and easy to navigate.',
  approach: 'We built the experience around a simple rhythm: discover, explore, and understand. A spatial interface provides the first invitation, then gives way to a focused editorial story with room for the work to speak.',
  outcome: 'The concept brings film, interaction, and storytelling into one coherent experience. This prototype demonstrates the journey; launch outcomes will be added with the final case study.'
}));
const caseStudy = document.createElement('dialog');
caseStudy.className = 'work-case-study';
caseStudy.setAttribute('data-lenis-prevent', '');
caseStudy.setAttribute('aria-labelledby', 'case-title');
caseStudy.innerHTML = `<button class="case-close" aria-label="Close case study">← Back to projects <span>ESC</span></button>
  <article class="case-content">
    <header class="case-header"><p class="case-eyebrow">Selected work / <span data-case="year"></span> · Concept study</p>
    <h1 id="case-title" data-case="title"></h1><p data-case="discipline"></p></header>
    <div class="case-hero"><video muted loop playsinline controls preload="metadata"></video><span class="case-caption">An exploration in motion</span></div>
    <section class="case-overview"><div><p class="case-eyebrow">The project</p><h2 data-case="intro"></h2></div><div><p data-case="overview"></p><dl><dt>Client</dt><dd data-case="client"></dd><dt>Scope</dt><dd data-case="discipline"></dd></dl></div></section>
    <section class="case-chapters"><div><span>01 / Challenge</span><h2>Clarity through discovery.</h2><p data-case="challenge"></p></div><div><span>02 / Approach</span><h2>Built to be explored.</h2><p data-case="approach"></p></div><div><span>03 / Outcome</span><h2>A connected experience.</h2><p data-case="outcome"></p></div></section>
    <footer class="case-footer"><p>Every detail is part of the story.</p><button class="case-return">Return to the collection ↗</button></footer>
  </article>`;
document.body.appendChild(caseStudy);
const caseHero = caseStudy.querySelector('.case-hero');
const caseVideo = caseStudy.querySelector('video');
let caseBusy = false;
let caseOrigin = null;
let savedBodyOverflow = '';
let savedFocus = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function cardScreenRect(item) {
  const points = [];
  for (const x of [-CARD_WIDTH / 2, CARD_WIDTH / 2]) for (const y of [-CARD_HEIGHT / 2, CARD_HEIGHT / 2]) {
    const p = item.card.localToWorld(new THREE.Vector3(x, y + x * CARD_SKEW, 0)).project(camera);
    const rect = canvas.getBoundingClientRect();
    points.push({ x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2 });
  }
  const left = Math.min(...points.map(p => p.x)), top = Math.min(...points.map(p => p.y));
  return { left, top, width: Math.max(...points.map(p => p.x)) - left, height: Math.max(...points.map(p => p.y)) - top };
}
function heroOriginTransform() {
  const rect = caseHero.getBoundingClientRect();
  return `translate(${caseOrigin.left - rect.left}px, ${caseOrigin.top - rect.top}px) scale(${caseOrigin.width / rect.width}, ${caseOrigin.height / rect.height})`;
}
async function openCaseStudy(item) {
  if (caseBusy || caseStudy.open || item !== activeCard) return;
  caseBusy = true;
  caseOrigin = cardScreenRect(item);
  savedFocus = document.activeElement;
  savedBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const data = CASE_STUDIES[item.index];
  caseStudy.querySelectorAll('[data-case]').forEach(el => { el.textContent = data[el.dataset.case]; });
  caseVideo.src = VIDEO_SOURCES[item.index];
  listen(caseVideo, 'loadedmetadata', () => { caseVideo.currentTime = item.video.currentTime; }, { once: true });
  item.video.pause();
  caseStudy.showModal();
  caseStudy.scrollTop = 0;
  renderer.domElement.style.cursor = '';
  canvas.classList.add('work-case-open');
caseStudy.classList.add('work-case-open');
  caseVideo.play().catch(() => {});
  const duration = reducedMotion.matches ? 0 : 850;
  await caseHero.animate([
    { transform: heroOriginTransform(), filter: 'blur(5px)', opacity: 0.65 },
    { transform: 'none', filter: 'blur(0)', opacity: 1 }
  ], { duration, easing: 'cubic-bezier(.18,.75,.2,1)' }).finished.catch(() => {});
  if (disposed) return;
  caseBusy = false;
  caseStudy.querySelector('.case-close').focus();
}
async function closeCaseStudy() {
  if (caseBusy || !caseStudy.open) return;
  caseBusy = true;
  caseStudy.scrollTo({ top: 0, behavior: 'instant' });
  canvas.classList.remove('work-case-open');
caseStudy.classList.remove('work-case-open');
  await caseHero.animate([{ transform: 'none', opacity: 1 },
    { transform: heroOriginTransform(), opacity: 0, filter: 'blur(5px)' }
  ], { duration: reducedMotion.matches ? 0 : 550, easing: 'cubic-bezier(.4,0,.3,1)', fill: 'forwards' }).finished.catch(() => {});
  if (disposed) return;
  caseStudy.close();
  caseHero.getAnimations().forEach(animation => animation.cancel());
  caseVideo.pause();
  caseVideo.removeAttribute('src');
  caseVideo.load();
  document.body.style.overflow = savedBodyOverflow;
  if (activeCard) activeCard.video.play().catch(() => {});
  savedFocus?.focus({ preventScroll: true });
  caseBusy = false;
}
listen(caseStudy.querySelector('.case-close'), 'click', closeCaseStudy);
listen(caseStudy.querySelector('.case-return'), 'click', closeCaseStudy);
listen(caseStudy, 'cancel', event => { event.preventDefault(); closeCaseStudy(); });
renderer.domElement.tabIndex = 0;
renderer.domElement.setAttribute('role', 'button');
renderer.domElement.setAttribute('aria-label', 'Open current project case study');
let pointerStart = null;
listen(renderer.domElement, 'pointerdown', event => { pointerStart = new THREE.Vector2(event.clientX, event.clientY); });
listen(renderer.domElement, 'click', event => {
  if (pointerStart && pointerStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 8) return;
  const rect = canvas.getBoundingClientRect();
  hoverPointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
  updateHover();
  if (hoveredCard === activeCard && activeCard) openCaseStudy(activeCard);
});
listen(renderer.domElement, 'keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && activeCard) { event.preventDefault(); openCaseStudy(activeCard); }
});

// Raycast the actual slabs so gaps and rounded corners keep the normal cursor.
const hoverRay = new THREE.Raycaster();
const hoverPointer = new THREE.Vector2(2, 2);
const hoverUv = new THREE.Vector2(0.5, 0.5);
let hoveredCard = null;
function updateHover() {
  if (caseStudy.open) { hoveredCard = null; return; }
  hoverRay.setFromCamera(hoverPointer, camera);
  const hit = hoverRay.intersectObjects(cardPivots.map(item => item.card), false)[0];
  hoveredCard = hit ? cardPivots.find(item => item.card === hit.object) : null;
  if (hit?.uv) hoverUv.copy(hit.uv);
  renderer.domElement.style.cursor = hoveredCard ? 'pointer' : '';
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


  updateCamera();

  updateCards(
    elapsed
  );


  updateSurroundings(elapsed);
  updateActiveCard();
  updateCameraFov(elapsed);
  updateHover();

  cardsGroup.visible = false;
  const toneMapping = renderer.toneMapping;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setRenderTarget(glassSceneTarget);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.toneMapping = toneMapping;
  cardsGroup.visible = true;

  renderer.render(
    scene,
    camera
  );
}


return {
  frame: animate,
  resize,
  setProgress(progress) { targetScroll = THREE.MathUtils.clamp(progress, 0, 1); },
  setVisible(visible) {
    suspended = !visible;
    if (!visible) cardPivots.forEach(item => item.video.pause());
    else if (activeCard && !caseStudy.open) activeCard.video.play().catch(() => {});
  },
  dispose() {
    disposed = true;
    events.abort();
    if (caseStudy.open) document.body.style.overflow = savedBodyOverflow;
    caseHero.getAnimations().forEach(animation => animation.cancel());
    caseStudy.close();
    caseStudy.remove();
    canvas.classList.remove('webgl', 'work-case-open');
    canvas.style.cursor = '';
    for (const video of [...cardPivots.map(item => item.video), caseVideo]) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
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
    renderer.dispose();
  }
};

function listen(target, type, listener, options = {}) {
  target.addEventListener(type, listener, { ...options, signal: events.signal });
}
}
