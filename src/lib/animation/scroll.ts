import gsap from "gsap";

/**
 * A single shared scroll signal.
 *
 * Everything that reacts to scroll (typography parallax, the thread, the
 * shader field) reads these numbers off one mutable object inside the one
 * GSAP ticker — no React state, no per-system listener, no extra rAF.
 */
export const scrollState = {
  /** raw pixels */
  y: 0,
  /** 0..1 over the scrollable document */
  progress: 0,
  /** smoothed px/frame, signed */
  velocity: 0,
  /** 0..1 eased magnitude of velocity, what visuals actually consume */
  energy: 0,
};

type Teardown = () => void;

type LenisLike = {
  raf(t: number): void;
  destroy(): void;
  stop(): void;
  start(): void;
  on(e: string, cb: (a: { scroll: number; progress: number; velocity: number }) => void): void;
  scrollTo(target: string | number | HTMLElement, opts?: Record<string, unknown>): void;
};

let mounted = 0;
let teardown: Teardown | null = null;
/** the live Lenis instance, if smooth scrolling is on — for lockScroll */
let activeLenis: LenisLike | null = null;

function readWindow() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  scrollState.y = window.scrollY;
  scrollState.progress = Math.min(1, Math.max(0, window.scrollY / max));
}

/**
 * Starts the scroll signal. Lenis is loaded lazily and only for fine
 * pointers with motion enabled; touch keeps native inertia, which is both
 * faster and what the platform expects.
 */
export function mountScroll(opts: { smooth: boolean }): Teardown {
  mounted += 1;
  if (teardown) return release;

  let prevY = window.scrollY;
  let lenis: LenisLike | null = null;
  let cancelled = false;

  readWindow();

  const onScroll = () => readWindow();

  const tick = (_t: number, _dt: number) => {
    if (lenis) lenis.raf(performance.now());
    else readWindow();

    const dy = scrollState.y - prevY;
    prevY = scrollState.y;

    // critically damped-ish smoothing, no allocations
    scrollState.velocity += (dy - scrollState.velocity) * 0.18;
    const mag = Math.min(1, Math.abs(scrollState.velocity) / 42);
    scrollState.energy += (mag - scrollState.energy) * (mag > scrollState.energy ? 0.16 : 0.055);
  };

  gsap.ticker.add(tick);

  if (opts.smooth) {
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const instance = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        lerp: 0.095,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      });
      instance.on("scroll", ({ scroll, progress }) => {
        scrollState.y = scroll;
        scrollState.progress = progress;
      });
      lenis = instance as unknown as LenisLike;
      activeLenis = lenis;
    });
  } else {
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  window.addEventListener("resize", readWindow, { passive: true });

  /**
   * Same-page anchors have to go through Lenis. A native jump leaves Lenis
   * holding a stale internal target and it drags the page back, which strands
   * anything driven by scroll position part-way through its range.
   */
  const onAnchorClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const link = (e.target as HTMLElement | null)?.closest?.("a[href^='#']") as
      | HTMLAnchorElement
      | null;
    if (!link) return;
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector<HTMLElement>(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else target.scrollIntoView({ behavior: "smooth" });
  };
  document.addEventListener("click", onAnchorClick);

  teardown = () => {
    cancelled = true;
    gsap.ticker.remove(tick);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", readWindow);
    document.removeEventListener("click", onAnchorClick);
    lenis?.destroy();
    lenis = null;
    activeLenis = null;
  };

  return release;
}

function release() {
  mounted -= 1;
  if (mounted <= 0 && teardown) {
    teardown();
    teardown = null;
    mounted = 0;
  }
}

const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

/**
 * Freezes the page where it is — for a pinned scene that must play out
 * without the page moving underneath it. Stops Lenis (which also kills its
 * momentum), blocks wheel / touch / scroll keys, and holds the native scroll
 * position against inertia already in flight. Returns the release.
 *
 * Deliberately NOT overflow: hidden — hiding the scrollbar would reflow the
 * page by its width and visibly jump the layout.
 */
export function lockScroll(): () => void {
  const y = window.scrollY;
  activeLenis?.stop();
  const block = (e: Event) => {
    if (e.cancelable) e.preventDefault();
  };
  const blockKeys = (e: KeyboardEvent) => {
    if (SCROLL_KEYS.has(e.key)) e.preventDefault();
  };
  const hold = () => {
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
  };
  window.addEventListener("wheel", block, { passive: false, capture: true });
  window.addEventListener("touchmove", block, { passive: false, capture: true });
  window.addEventListener("keydown", blockKeys, { capture: true });
  window.addEventListener("scroll", hold, { passive: true });
  let released = false;
  return () => {
    if (released) return;
    released = true;
    window.removeEventListener("wheel", block, { capture: true });
    window.removeEventListener("touchmove", block, { capture: true });
    window.removeEventListener("keydown", blockKeys, { capture: true });
    window.removeEventListener("scroll", hold);
    activeLenis?.start();
  };
}

/** jumps the page to y at once, keeping Lenis in step */
export function jumpTo(y: number) {
  if (activeLenis) activeLenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}
