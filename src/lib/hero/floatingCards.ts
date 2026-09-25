/** A camera-facing card carousel, used as the live texture inside the hero trail. */
// Four equally spaced points on a vertical ring. Spin the ring in depth,
// then rotate its plane around the viewing axis; the cards remain billboards.
const ORBIT_SPEED = 0.6;
const ROLL_SPEED = 0.29;
const BACKGROUND = "#e9eef1";
const EASING_STRENGTH = 0.55;
const CARDS = [
  ["/projects/quantiva/app-01.jpg", "/projects/quantiva/app-03.jpg", "/projects/quantiva/app-09.jpg"],
  ["/projects/benavente/shot-01.jpg"],
  ["/projects/intellimaint/shot-01.jpg"],
  ["/projects/nonnis/shot-01.jpg"],
];

export type FloatingCards = {
  canvas: HTMLCanvasElement;
  resize(width: number, height: number): void;
  render(dt: number, mouseX: number, mouseY: number): void;
  destroy(): void;
};

export async function createFloatingCards(signal: AbortSignal): Promise<FloatingCards | null> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return null;

  const loaded = await Promise.all(CARDS.map(async sources => {
    const images = await Promise.all(sources.map(async src => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      try { await image.decode(); return image; } catch { return null; }
    }));
    return images.filter((image): image is HTMLImageElement => image !== null);
  }));
  if (signal.aborted) return null;

  // Bake the black mounts and soft-focus variants once, not every frame.
  const cards = loaded.filter(images => images.length).map(images => {
    const sharp = document.createElement("canvas");
    sharp.width = 720;
    sharp.height = 540;
    const c = sharp.getContext("2d")!;
    c.fillStyle = "#08090b";
    c.fillRect(0, 0, 720, 540);
    const gap = 18;
    const slotWidth = (600 - gap * (images.length - 1)) / images.length;
    images.forEach((image, index) => {
      const scale = Math.min(slotWidth / image.naturalWidth, 410 / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      c.drawImage(image, 60 + index * (slotWidth + gap) + (slotWidth - w) / 2, (540 - h) / 2, w, h);
    });
    // Precompute a depth-of-field pyramid. Mix adjacent levels at runtime.
    const levels = [0, 4, 10, 20, 34].map(blur => {
      const surface = document.createElement("canvas");
      surface.width = 960;
      surface.height = 780;
      const b = surface.getContext("2d")!;
      b.filter = blur ? `blur(${blur}px)` : "none";
      b.drawImage(sharp, 120, 120);
      return surface;
    });
    sharp.width = sharp.height = 1;
    return { levels };
  });
  if (!cards.length) return null;

  const blend = document.createElement("canvas");
  blend.width = 960;
  blend.height = 780;
  const blendCtx = blend.getContext("2d")!;
  let time = 0;
  let pointerX = 0;
  let pointerY = 0;
  let disposed = false;

  return {
    canvas,
    resize(width, height) {
      // The mask renders at device resolution; the moving imagery needs less.
      const scale = Math.min(1, 1440 / Math.max(width, height));
      canvas.width = Math.max(2, Math.round(width * scale));
      canvas.height = Math.max(2, Math.round(height * scale));
    },
    render(dt, mouseX, mouseY) {
      if (disposed) return;
      time += dt;
      const ease = 1 - Math.exp(-3 * dt);
      pointerX += (Math.max(-0.5, Math.min(0.5, mouseX - 0.5)) - pointerX) * ease;
      pointerY += (Math.max(-0.5, Math.min(0.5, 0.5 - mouseY)) - pointerY) * ease;
      const { width, height } = canvas;
      ctx.fillStyle = BACKGROUND;
      ctx.fillRect(0, 0, width, height);
      const baseWidth = Math.min(width * (width < height ? 0.76 : 0.38), height * 0.6);
      const radius = 1.65;
      const cameraDistance = 4;
      const focalLength = Math.min(width * 0.8, height * 0.88);
      const phase = time * ORBIT_SPEED;
      // Ease through each quarter-turn: linger near the front, accelerate
      // between cards, and keep velocity continuous without stopping.
      const travel = phase - EASING_STRENGTH * Math.sin(4 * phase) / 4;
      const roll = travel * ROLL_SPEED / ORBIT_SPEED;
      const orbit = cards.map((card, index) => {
        const angle = index * Math.PI / 2 - travel;
        const ringY = -Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        // Rotate around Z after rotating around X. Only positions rotate.
        const x = -ringY * Math.sin(roll);
        const y = ringY * Math.cos(roll);
        return { card, x, y, z };
      }).sort((a, b) => a.z - b.z);

      for (const { card, x, y, z } of orbit) {
        const perspective = 1 / (cameraDistance - z);
        const scale = (cameraDistance - radius) * perspective;
        const w = baseWidth * scale;
        const h = w * 0.75;
        const centerX = width * 0.5 + x * focalLength * perspective
          + pointerX * width * 0.025 * scale;
        const centerY = height * 0.49 + y * focalLength * perspective
          + pointerY * height * 0.025 * scale;
        const depth = (z / radius + 1) / 2;
        const blurLevel = (1 - depth) * (card.levels.length - 1);
        const lower = Math.floor(blurLevel);
        const upper = Math.min(lower + 1, card.levels.length - 1);
        const mix = blurLevel - lower;
        const pad = w * 120 / 720;
        // Add the premultiplied variants in an isolated surface so opacity
        // stays solid during blur transitions, including overlapping cards.
        blendCtx.clearRect(0, 0, 960, 780);
        blendCtx.globalCompositeOperation = "source-over";
        blendCtx.globalAlpha = 1 - mix;
        blendCtx.drawImage(card.levels[lower], 0, 0);
        blendCtx.globalCompositeOperation = "lighter";
        blendCtx.globalAlpha = mix;
        blendCtx.drawImage(card.levels[upper], 0, 0);
        ctx.drawImage(blend, centerX - w / 2 - pad, centerY - h / 2 - pad, w + pad * 2, h + pad * 2);
      }
      ctx.globalAlpha = 1;
    },
    destroy() {
      disposed = true;
      for (const card of cards) {
        for (const level of card.levels) level.width = level.height = 1;
      }
      blend.width = blend.height = 1;
      canvas.width = canvas.height = 1;
    },
  };
}
