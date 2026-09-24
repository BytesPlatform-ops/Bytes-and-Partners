/**
 * Featured Work — the root and the card spiral, as designed (standalone
 * prototype, brought in as-is). Three.js only; the component feeds it a
 * 0..1 scroll progress and a size.
 *
 * Differences from the prototype are only what embedding requires: it
 * renders into a given canvas instead of document.body, progress comes from
 * outside instead of window scroll, it sizes to its section instead of the
 * window, and it can be disposed.
 */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// ======================================================
// GLOBAL CONFIG
// ======================================================

const CAMERA_FOV = 55;

const CAMERA_START_Y = 8.9;
const CAMERA_END_Y = -7.2;

const CAMERA_START_ANGLE = 0.25;
const CAMERA_END_ANGLE = Math.PI * 3.6;

const CAMERA_BASE_RADIUS = 12;

// ======================================================
// CARD CONFIG
// ======================================================

const CARD_COUNT = 12;

// radial distance from root
const CARD_DISTANCE = 8.0;

// vertical gap
const CARD_Y_GAP = 0.9;

// first card Y
const FIRST_CARD_Y = 8.8;

// whole stack starting angle
const CARD_BASE_ANGLE = THREE.MathUtils.degToRad(18);

// angle difference between cards
const CARD_ANGLE_DIFFERENCE = THREE.MathUtils.degToRad(34);

// shared card transforms
const CARD_TILT_X = THREE.MathUtils.degToRad(0);
const CARD_TILT_Z = THREE.MathUtils.degToRad(0);
const CARD_YAW = THREE.MathUtils.degToRad(0);
const CARD_SCALE = 1;

// ======================================================
// TEXT LAYER CONFIG
// ======================================================

// card depth = 0.16; front surface is roughly +0.08; text sits slightly
// farther forward
const CARD_TEXT_Z = 0.5;

// overall text layer scale
const CARD_TEXT_SCALE = 1;

// canvas font size
const CARD_TEXT_FONT_SIZE = 84;

// text color
const CARD_TEXT_COLOR = "#ffffff";

// optional smaller eyebrow text
const CARD_TEXT_LABEL_COLOR = "rgba(255, 255, 255, 0.55)";

// ======================================================
// CARD TEXT CONTENT
// ======================================================

const CARD_TITLES = [
  "DIGITAL\nEXPERIENCES",
  "CREATIVE\nTECHNOLOGY",
  "INTERACTIVE\nDESIGN",
  "WEBGL\nEXPERIMENTS",
  "IMMERSIVE\nWORLDS",
  "MOTION\nSYSTEMS",
  "AI\nEXPERIENCES",
  "DIGITAL\nPRODUCTS",
  "BRAND\nSYSTEMS",
  "3D\nENVIRONMENTS",
  "GENERATIVE\nDESIGN",
  "FUTURE\nINTERFACES",
];

export type RootCardsScene = {
  /** scroll progress through the section, 0..1 */
  setProgress(progress: number): void;
  resize(width: number, height: number): void;
  /** advance and draw one frame */
  frame(): void;
  dispose(): void;
};

export function createRootCardsScene(canvas: HTMLCanvasElement): RootCardsScene {
  // ======================================================
  // SCENE
  // ======================================================

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf7f3f5);

  // ======================================================
  // CAMERA
  // ======================================================

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  scene.add(camera);

  // ======================================================
  // RENDERER
  // ======================================================

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ======================================================
  // LIGHTING
  // ======================================================

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.7);
  scene.add(ambientLight);

  const purpleLight = new THREE.DirectionalLight(0xb49cff, 3.5);
  purpleLight.position.set(4, 6, 5);
  scene.add(purpleLight);

  const blueLight = new THREE.DirectionalLight(0x8095ff, 2.6);
  blueLight.position.set(-5, 1, -4);
  scene.add(blueLight);

  const pinkLight = new THREE.PointLight(0xffd5e8, 2.4, 20);
  pinkLight.position.set(3, 2, 4);
  scene.add(pinkLight);

  // ======================================================
  // ROOT GROUP
  // ======================================================

  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // ======================================================
  // ROOT MATERIAL
  // ======================================================

  const rootMaterial = new THREE.MeshStandardMaterial({
    color: 0x755cff,
    roughness: 0.55,
    metalness: 0.02,
  });

  // ======================================================
  // ROOT HELPER
  // ======================================================

  function createCurveTube(points: THREE.Vector3[], radius = 0.1, radialSegments = 10, tubularSegments = 40) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
    const mesh = new THREE.Mesh(geometry, rootMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rootGroup.add(mesh);
    return { mesh, curve };
  }

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ======================================================
  // MAIN ROOT 1
  // ======================================================

  createCurveTube(
    [
      V(-0.3, 15, 0.2),
      V(0.1, 12, -0.15),
      V(-0.15, 9, 0.2),
      V(0.25, 6, -0.1),
      V(-0.2, 3, 0.15),
      V(0.15, 0, -0.15),
      V(-0.15, -3, 0.2),
      V(0.2, -6, -0.1),
      V(-0.1, -9, 0.15),
      V(0.1, -12, 0),
      V(-0.2, -15, 0.1),
    ],
    0.33,
    14,
    100,
  );

  // ======================================================
  // MAIN ROOT 2
  // ======================================================

  createCurveTube(
    [
      V(0.45, 15, -0.15),
      V(0.25, 12, 0.22),
      V(0.5, 9, -0.05),
      V(0.2, 6, 0.28),
      V(0.45, 3, -0.15),
      V(0.25, 0, 0.18),
      V(0.5, -3, -0.15),
      V(0.25, -6, 0.2),
      V(0.45, -9, -0.1),
      V(0.2, -12, 0.15),
      V(0.4, -15, -0.05),
    ],
    0.25,
    12,
    100,
  );

  // ======================================================
  // MAIN ROOT 3
  // ======================================================

  createCurveTube(
    [
      V(-0.5, 15, -0.1),
      V(-0.25, 12, 0.15),
      V(-0.55, 9, -0.2),
      V(-0.25, 6, 0.1),
      V(-0.45, 3, -0.18),
      V(-0.3, 0, 0.15),
      V(-0.5, -3, -0.15),
      V(-0.25, -6, 0.15),
      V(-0.45, -9, -0.12),
      V(-0.3, -12, 0.1),
      V(-0.5, -15, -0.15),
    ],
    0.22,
    12,
    100,
  );

  // ======================================================
  // SIDE ROOT GENERATOR
  // ======================================================

  function createSideRoot(y: number, angle: number, length: number, radius: number, bend = 0.6, verticalDirection = 0) {
    const startRadius = 0.25 + Math.random() * 0.15;
    const start = V(Math.cos(angle) * startRadius, y, Math.sin(angle) * startRadius);
    const direction = V(Math.cos(angle), verticalDirection, Math.sin(angle)).normalize();
    const perpendicular = V(-Math.sin(angle), 0, Math.cos(angle));

    const p1 = start.clone();
    const p2 = start
      .clone()
      .add(direction.clone().multiplyScalar(length * 0.3))
      .add(perpendicular.clone().multiplyScalar(bend));
    const p3 = start
      .clone()
      .add(direction.clone().multiplyScalar(length * 0.65))
      .add(perpendicular.clone().multiplyScalar(-bend * 0.35));
    const p4 = start.clone().add(direction.clone().multiplyScalar(length));

    return createCurveTube([p1, p2, p3, p4], radius, 8, 30);
  }

  // ======================================================
  // LARGE ROOTS
  // ======================================================

  const largeRoots = [
    { y: 11.5, angle: 0.1, length: 3.2, bend: 0.7 },
    { y: 10.2, angle: 2.2, length: 2.7, bend: 0.65 },
    { y: 8.5, angle: 4.1, length: 3.1, bend: 0.75 },
    { y: 6.8, angle: 1.2, length: 2.4, bend: 0.5 },
    { y: 5, angle: 3, length: 3.2, bend: 0.7 },
    { y: 3.2, angle: 5.2, length: 2.8, bend: 0.5 },
    { y: 1, angle: 0.4, length: 3.5, bend: 0.7 },
    { y: -0.7, angle: 2.8, length: 2.6, bend: 0.5 },
    { y: -2.4, angle: 4.3, length: 3.3, bend: 0.75 },
    { y: -4.5, angle: 1.5, length: 3, bend: 0.6 },
    { y: -6.3, angle: 3.5, length: 2.7, bend: 0.55 },
    { y: -8, angle: 5.5, length: 3.4, bend: 0.7 },
    { y: -10.5, angle: 0.8, length: 2.8, bend: 0.6 },
  ];

  largeRoots.forEach(({ y, angle, length, bend }) => {
    createSideRoot(y, angle, length, 0.09, bend, -0.05 + Math.random() * 0.1);
  });

  // ======================================================
  // THINNER ROOTS
  // ======================================================

  for (let i = 0; i < 32; i++) {
    const y = THREE.MathUtils.lerp(13, -13, i / 31);
    const angle = i * 2.2 + Math.sin(i) * 0.8;
    const length = 0.8 + Math.random() * 1.5;
    createSideRoot(
      y,
      angle,
      length,
      0.035 + Math.random() * 0.025,
      0.18 + Math.random() * 0.4,
      -0.3 + Math.random() * 0.6,
    );
  }

  // ======================================================
  // SPIKES
  // ======================================================

  function createSpike(y: number, angle: number, length: number) {
    const start = V(Math.cos(angle) * 0.25, y, Math.sin(angle) * 0.25);
    const middle = V(
      Math.cos(angle) * length * 0.45,
      y + (Math.random() - 0.5) * 0.7,
      Math.sin(angle) * length * 0.45,
    );
    const end = V(Math.cos(angle) * length, y + (Math.random() - 0.5) * 1.3, Math.sin(angle) * length);
    createCurveTube([start, middle, end], 0.025 + Math.random() * 0.02, 7, 20);
  }

  for (let i = 0; i < 20; i++) {
    createSpike(THREE.MathUtils.lerp(12, -12, i / 19), i * 1.9, 1.5 + Math.random() * 2.1);
  }

  // ======================================================
  // ROOT POSITION
  // ======================================================

  rootGroup.position.set(0, 0, 0);
  rootGroup.rotation.z = THREE.MathUtils.degToRad(-2);

  // ======================================================
  // CARD GROUP
  // ======================================================

  const cardsGroup = new THREE.Group();
  scene.add(cardsGroup);

  // ======================================================
  // CARD GEOMETRY
  // ======================================================

  const cardGeometry = new RoundedBoxGeometry(4.1, 2.35, 0.16, 6, 0.16);

  // ======================================================
  // CARD MATERIALS
  // ======================================================

  function createCardMaterial(color: number, emissive: number) {
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.52,
      metalness: 0.06,
      emissive,
      emissiveIntensity: 0.08,
      clearcoat: 0.55,
      clearcoatRoughness: 0.35,
      transparent: false,
      opacity: 1,
      transmission: 0,
    });
  }

  const cardMaterials = [
    createCardMaterial(0x303250, 0x28294d),
    createCardMaterial(0x463437, 0x4c292f),
    createCardMaterial(0x243b49, 0x1d3c53),
    createCardMaterial(0x3d304e, 0x422653),
  ];

  // ======================================================
  // TEXT TEXTURE CREATOR
  // ======================================================

  function createTextTexture(title: string, index: number) {
    const textCanvas = document.createElement("canvas");
    textCanvas.width = 1024;
    textCanvas.height = 576;
    const context = textCanvas.getContext("2d")!;
    context.clearRect(0, 0, textCanvas.width, textCanvas.height);

    // label
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = CARD_TEXT_LABEL_COLOR;
    context.font = "500 26px Arial";
    context.letterSpacing = "6px";
    context.fillText(`PROJECT ${String(index + 1).padStart(2, "0")}`, textCanvas.width / 2, 185);

    // main title
    context.fillStyle = CARD_TEXT_COLOR;
    context.font = `500 ${CARD_TEXT_FONT_SIZE}px Arial`;
    const lines = title.split("\n");
    const lineHeight = CARD_TEXT_FONT_SIZE * 0.92;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = textCanvas.height / 2 - totalHeight / 2 + 25;
    lines.forEach((line, lineIndex) => {
      context.fillText(line, textCanvas.width / 2, startY + lineIndex * lineHeight);
    });

    const texture = new THREE.CanvasTexture(textCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  // ======================================================
  // CREATE TEXT PLANE
  // ======================================================

  function createCardText(title: string, index: number) {
    const texture = createTextTexture(title, index);
    const geometry = new THREE.PlaneGeometry(3.75, 2.1);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.position.set(0, 0, CARD_TEXT_Z);
    textMesh.scale.setScalar(CARD_TEXT_SCALE);
    textMesh.renderOrder = 5;
    return textMesh;
  }

  // ======================================================
  // CARD DATA
  // ======================================================

  const cardData = Array.from({ length: CARD_COUNT }, (_, index) => ({
    y: FIRST_CARD_Y - CARD_Y_GAP * index,
    title: CARD_TITLES[index % CARD_TITLES.length],
  }));

  // ======================================================
  // CREATE CARDS
  // ======================================================

  const backGeometries: THREE.BufferGeometry[] = [];
  const backMaterials: THREE.Material[] = [];

  const cardPivots = cardData.map((data, index) => {
    // angle
    const orbitAngle = CARD_BASE_ANGLE + index * CARD_ANGLE_DIFFERENCE;

    // pivot
    const pivot = new THREE.Group();
    pivot.position.set(0, data.y, 0);
    pivot.rotation.y = orbitAngle;
    cardsGroup.add(pivot);

    // card
    const card = new THREE.Mesh(cardGeometry, cardMaterials[index % cardMaterials.length]);
    card.position.set(0, 0, CARD_DISTANCE);
    card.rotation.x = CARD_TILT_X;
    card.rotation.y = CARD_YAW;
    card.rotation.z = CARD_TILT_Z;
    card.scale.setScalar(CARD_SCALE);
    card.castShadow = true;
    card.receiveShadow = true;
    pivot.add(card);

    // back panel
    const backGeometry = new RoundedBoxGeometry(4.14, 2.39, 0.055, 5, 0.16);
    const backMaterial = new THREE.MeshStandardMaterial({
      color: 0x15151f,
      roughness: 0.7,
      metalness: 0.12,
    });
    backGeometries.push(backGeometry);
    backMaterials.push(backMaterial);
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.z = -0.105;
    card.add(back);

    // text second layer
    const textLayer = createCardText(data.title, index);
    card.add(textLayer);

    return { pivot, card, textLayer, baseOrbit: orbitAngle, index };
  });

  // ======================================================
  // SCROLL VALUES
  // ======================================================

  let targetScroll = 0;
  let smoothScroll = 0;
  let primed = false;

  // ======================================================
  // CAMERA PATH
  // ======================================================

  function updateCamera() {
    smoothScroll += (targetScroll - smoothScroll) * 0.055;

    const angle = THREE.MathUtils.lerp(CAMERA_START_ANGLE, CAMERA_END_ANGLE, smoothScroll);
    const radius = CAMERA_BASE_RADIUS + Math.sin(smoothScroll * Math.PI * 2) * 0.22;
    const cameraY = THREE.MathUtils.lerp(CAMERA_START_Y, CAMERA_END_Y, smoothScroll);

    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = cameraY;

    camera.lookAt(0, cameraY - 0.1, 0);
  }

  // ======================================================
  // CARD MOTION
  // ======================================================

  // elapsed seconds (THREE.Clock is deprecated in this Three.js version)
  const start = performance.now();

  function updateCards(elapsed: number) {
    cardPivots.forEach((item, index) => {
      item.card.position.y = Math.sin(elapsed * 0.42 + index * 1.2) * 0.03;
      item.pivot.rotation.y = item.baseOrbit + Math.sin(elapsed * 0.12 + index * 0.8) * 0.01;
    });
  }

  return {
    setProgress(progress) {
      targetScroll = THREE.MathUtils.clamp(progress, 0, 1);
      // initial position: start exactly where the page is, no glide in
      if (!primed) {
        primed = true;
        smoothScroll = targetScroll;
      }
    },

    resize(width, height) {
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
    },

    frame() {
      const elapsed = (performance.now() - start) / 1000;
      updateCamera();
      updateCards(elapsed);
      renderer.render(scene, camera);
    },

    dispose() {
      rootGroup.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      rootMaterial.dispose();
      cardGeometry.dispose();
      for (const m of cardMaterials) m.dispose();
      for (const g of backGeometries) g.dispose();
      for (const m of backMaterials) m.dispose();
      for (const { textLayer } of cardPivots) {
        textLayer.geometry.dispose();
        const mat = textLayer.material as THREE.MeshBasicMaterial;
        mat.map?.dispose();
        mat.dispose();
      }
      renderer.dispose();
    },
  };
}
