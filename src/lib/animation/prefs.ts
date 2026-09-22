/**
 * Environment probes. Read once at mount — never during render, so the
 * server and the first client pass always agree.
 */

export type Tier = "full" | "lite" | "static";

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * `full`   — desktop-class: shader field + live thread + cursor
 * `lite`   — touch / small / low-core: thread only, no shader
 * `static` — reduced motion: one painted frame, no loop
 */
export function deviceTier(): Tier {
  if (typeof window === "undefined") return "lite";
  if (prefersReducedMotion()) return "static";

  const coarse = isCoarsePointer();
  const narrow = window.innerWidth < 880;
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  if (coarse || narrow || cores <= 4 || mem <= 4) return "lite";
  return "full";
}

export function dprCap(tier: Tier) {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, tier === "full" ? 2 : 1.5);
}

/** Resolves when webfonts are ready, or after `timeout` — whichever is first. */
export function fontsReady(timeout = 1200): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) {
    return Promise.resolve();
  }
  return Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<void>((r) => setTimeout(r, timeout)),
  ]);
}
