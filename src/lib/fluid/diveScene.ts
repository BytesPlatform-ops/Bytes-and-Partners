import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { jumpTo, lockScroll } from "@/lib/animation/scroll";

gsap.registerPlugin(ScrollTrigger);

type DiveOptions = {
  /** section the dive leaves */
  section: HTMLElement;
  /** everything that dives together, each rotated/scaled about the pill */
  layers: HTMLElement[];
  /** the pill that acts as the point the camera flies into */
  pill: HTMLElement;
  /** fixed full-screen layer in the pill's blue, bridging the two sections */
  overlay: HTMLElement;
  /** the section revealed on the other side */
  next: HTMLElement;
  /** settles out of the dive's momentum as the next section appears */
  nextContent: () => HTMLElement | null;
  /** page offset into `section` where the dive starts */
  startOffset: () => number;
  /** whether the source section is ready to leave */
  ready: () => boolean;
  /** freeze/thaw measurements that transforms would corrupt */
  freeze: () => void;
  thaw: () => void;
  /** keep other scroll scenes from reacting to the dive's page jumps */
  suspendOthers: (value: boolean) => void;
  /** state of the shared-canvas loader and the direction of its handoff */
  setLoaderState?: (progress: number, active: boolean, direction: "forward" | "backward", holdWork: boolean) => void;
};

/** The reference makes a restrained turn before the pill fills the frame. */
const ROTATION = 8;
const DIVE = 1.05;
const BLUE_HOLD = 0.2;
const REVEAL = 0.82;

/**
 * A triggered transition from one section into the next: the
 * section rotates and zooms into the play pill until its blue fills the
 * screen, the page jumps to the next section behind that blue, and the blue
 * slides away. Scrolling back up from the next section plays it in reverse.
 */
export function createDiveScene(opts: DiveOptions) {
  let release: (() => void) | null = null;
  let active: gsap.core.Timeline | null = null;
  let lastInput = -Infinity;
  const originalNextVisibility = opts.next.style.visibility;
  const originalNextPointerEvents = opts.next.style.pointerEvents;
  const setNextVisible = (visible: boolean) => {
    opts.next.style.visibility = visible ? "visible" : "hidden";
    opts.next.style.pointerEvents = visible ? originalNextPointerEvents : "none";
  };
  const onInput = () => { lastInput = performance.now(); };
  const inputs = ["wheel", "touchmove", "keydown", "pointerdown"] as const;
  inputs.forEach(event => window.addEventListener(event, onInput, { passive: true }));
  const intended = () => performance.now() - lastInput < 1200;

  // Zoom is exponential so the flight reads as constant speed, not a lurch.
  const zoom = { v: 0, scale: 1, origins: [] as [number, number][] };
  const apply = () => {
    const scale = Math.pow(zoom.scale, zoom.v);
    const turn = ROTATION * zoom.v;
    opts.layers.forEach((layer, i) => {
      const [x, y] = zoom.origins[i];
      layer.style.transformOrigin = `${x}px ${y}px`;
      layer.style.transform = `rotate(${turn}deg) scale(${scale})`;
      // Keep the expanding pill crisp while its canvas world falls softly
      // out of focus, as in the reference takeover.
      layer.style.filter = layer.contains(opts.pill) ? "" : `blur(${zoom.v * 7}px)`;
    });
  };
  /** Aim every layer at the pill and size the zoom so its blue covers the screen. */
  const aim = () => {
    const pill = opts.pill.getBoundingClientRect();
    const cx = pill.left + pill.width / 2;
    const cy = pill.top + pill.height / 2;
    zoom.origins = opts.layers.map(layer => {
      const r = layer.getBoundingClientRect();
      return [cx - r.left, cy - r.top];
    });
    const reach = Math.max(
      Math.hypot(cx, cy), Math.hypot(window.innerWidth - cx, cy),
      Math.hypot(cx, window.innerHeight - cy), Math.hypot(window.innerWidth - cx, window.innerHeight - cy),
    );
    zoom.scale = Math.max(4, (reach * 1.15) / Math.max(1, pill.height / 2));
  };
  const reset = () => {
    opts.layers.forEach(layer => {
      layer.style.transform = "";
      layer.style.transformOrigin = "";
      layer.style.filter = "";
    });
    opts.pill.classList.remove("is-diving", "is-diving-instant");
    const label = opts.pill.querySelector<HTMLElement>(".action-pill__label");
    const icon = opts.pill.querySelector<HTMLElement>(".action-pill__icon");
    if (label) gsap.set(label, { clearProps: "opacity,transform" });
    if (icon) gsap.set(icon, { clearProps: "opacity,transform" });
  };
  const nextTop = () => opts.next.getBoundingClientRect().top + window.scrollY;
  const startTop = () => opts.section.getBoundingClientRect().top + window.scrollY + opts.startOffset();
  // The next canvas must not peek through beneath the sticky source scene if
  // momentum briefly carries the page past the handoff before the dive locks.
  setNextVisible(window.scrollY >= nextTop() - 2);
  // Once the dive has landed on the next section, the forward trigger stays
  // spent until the page goes back above it. Landing can round to a pixel
  // short of the trigger's end, so the next scroll down would otherwise read
  // as entering the dive band again and replay the whole transition.
  let landed = window.scrollY >= nextTop() - 2;

  const finish = () => {
    reset();
    opts.thaw();
    const content = opts.nextContent();
    const titleWords = opts.overlay.querySelectorAll<HTMLElement>("[data-dive-title-word]");
    if (content) gsap.set(content, { clearProps: "transform" });
    gsap.set(titleWords, { opacity: 0, yPercent: 115 });
    gsap.set(opts.overlay, { autoAlpha: 0, clipPath: "inset(0% 0% 0% 0%)" });
    opts.setLoaderState?.(0, false, "forward", false);
    opts.suspendOthers(false);
    // Do not let wheel/touch input accumulated while scrolling was locked
    // count as a fresh request after the programmatic handoff. Without this,
    // the destination trigger can immediately send us back to Services and
    // then replay the Featured Work transition a second time.
    lastInput = -Infinity;
    active = null;
    release?.();
    release = null;
  };

  function play(forward: boolean) {
    if (active || !intended()) return;
    if (forward && (landed || !opts.ready())) return;
    release = lockScroll({ allowProgrammatic: true });
    opts.suspendOthers(true);
    const content = opts.nextContent();
    const label = () => opts.pill.querySelector<HTMLElement>(".action-pill__label");
    const icon = () => opts.pill.querySelector<HTMLElement>(".action-pill__icon");
    const titleWords = opts.overlay.querySelectorAll<HTMLElement>("[data-dive-title-word]");
    gsap.set(titleWords, { opacity: 0, yPercent: 115 });
    const direction = forward ? "forward" : "backward";
    const loader = { progress: 0 };
    let holdWork = !forward;
    const syncLoader = () => opts.setLoaderState?.(loader.progress, true, direction, holdWork);
    const tl = gsap.timeline({ onComplete: finish });
    active = tl;
    syncLoader();

    if (forward) {
      aim();
      opts.freeze();
      opts.pill.classList.add("is-diving");
      zoom.v = 0;
      tl.to(label(), { opacity: 0, x: -10, duration: 0.28, ease: "power2.in" }, 0.12)
        .to(icon(), { x: () => opts.pill.offsetWidth, opacity: 0, duration: 0.48, ease: "power3.in" }, 0.06)
        .to(zoom, { v: 1, duration: DIVE, ease: "power2.in", onUpdate: apply }, 0.36)
        .set(opts.overlay, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" })
        .set(loader, { progress: 1 })
        .call(syncLoader)
        .call(() => { setNextVisible(true); reset(); opts.thaw(); landed = true; jumpTo(Math.ceil(nextTop())); })
        .to(titleWords, { opacity: 1, yPercent: 0, duration: 0.58, stagger: 0.08, ease: "power3.out" })
        .to({}, { duration: BLUE_HOLD })
        .addLabel("reveal")
        .to(titleWords, { opacity: 0, yPercent: -115, duration: 0.48, stagger: 0.06, ease: "power3.in" }, "reveal")
        .to(opts.overlay, { clipPath: "inset(0% 0% 100% 0%)", duration: REVEAL, ease: "power3.inOut" }, "reveal")
        .to(loader, { progress: 0, duration: REVEAL, ease: "power3.inOut", onUpdate: syncLoader }, "reveal");
      if (content) tl.fromTo(content, { scale: 1.18, rotation: -ROTATION / 5 }, { scale: 1, rotation: 0, duration: REVEAL * 1.25, ease: "expo.out" }, "reveal+=0.1");
      return;
    }

    // Back up: the blue drops over the next section, the page returns to the
    // source already zoomed into the pill, and the section flies out.
    tl.fromTo(opts.overlay,
      { autoAlpha: 1, clipPath: "inset(0% 0% 100% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: REVEAL, ease: "power3.inOut" })
      .to(loader, { progress: 1, duration: REVEAL, ease: "power3.inOut", onUpdate: syncLoader }, 0)
      .to(titleWords, { opacity: 1, yPercent: 0, duration: 0.58, stagger: 0.08, ease: "power3.out" })
      .to({}, { duration: BLUE_HOLD })
      .to(titleWords, { opacity: 0, yPercent: -115, duration: 0.48, stagger: 0.06, ease: "power3.in" });
    if (content) tl.to(content, { scale: 1.18, rotation: -ROTATION / 5, duration: REVEAL * 0.8, ease: "expo.in" }, 0);
    tl.call(() => {
      jumpTo(startTop());
      landed = false;
      setNextVisible(false);
      aim();
      opts.freeze();
      opts.pill.classList.add("is-diving", "is-diving-instant");
      const text = label();
      const circle = icon();
      if (text) gsap.set(text, { opacity: 0, x: -10 });
      if (circle) gsap.set(circle, { opacity: 0, x: opts.pill.offsetWidth });
      zoom.v = 1;
      apply();
      if (content) gsap.set(content, { clearProps: "transform" });
    })
      .call(() => { holdWork = false; loader.progress = 0; syncLoader(); })
      .set(opts.overlay, { autoAlpha: 0 })
      .to(zoom, { v: 0, duration: DIVE, ease: "power2.out", onUpdate: apply, onStart: () => opts.pill.classList.remove("is-diving-instant") })
      .to(label(), { opacity: 1, x: 0, duration: 0.32, ease: "power2.out" }, `-=${DIVE * 0.42}`)
      .to(icon(), { opacity: 1, x: 0, duration: 0.46, ease: "power3.out" }, "<");
  }

  // Past the source section's handoff point, going down: dive in.
  const into = ScrollTrigger.create({
    trigger: opts.section,
    start: () => `top+=${opts.startOffset()} top`,
    end: "bottom top",
    onUpdate: self => { if (self.direction > 0 && self.progress > 0) play(true); },
    onLeave: () => play(true),
    // Back above the band without the reverse dive (e.g. an anchor jump).
    onLeaveBack: () => { landed = false; },
  });
  // Scrolling up into the band above the next section: fly out again. (The
  // dive lands on the band's lower edge, so any upward scroll from there counts.)
  const back = ScrollTrigger.create({
    // Use an absolute scroll band rather than the pinned destination element.
    // Its DOM rect changes as Featured Work enters/leaves its own pin, which can
    // otherwise look like upward navigation and incorrectly replay the dive.
    start: () => nextTop() - window.innerHeight,
    end: () => nextTop(),
    onUpdate: self => { if (self.direction < 0 && self.progress < 1) play(false); },
  });

  return {
    kill() {
      inputs.forEach(event => window.removeEventListener(event, onInput));
      active?.kill();
      finish();
      into.kill();
      back.kill();
      opts.next.style.visibility = originalNextVisibility;
      opts.next.style.pointerEvents = originalNextPointerEvents;
    },
  };
}
