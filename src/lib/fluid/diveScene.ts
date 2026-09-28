import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { jumpTo, lockScroll } from "@/lib/animation/scroll";

gsap.registerPlugin(ScrollTrigger);

type DiveOptions = {
  /** section 2; the dive starts once the page scrolls on past the morph */
  section: HTMLElement;
  /** everything that dives together, each rotated/scaled about the pill */
  layers: HTMLElement[];
  /** the play pill: the point the camera flies into */
  pill: HTMLElement;
  /** fixed full-screen layer in the pill's blue, bridging the two sections */
  overlay: HTMLElement;
  /** the section revealed on the other side */
  next: HTMLElement;
  /** settles out of the dive's momentum as the next section appears */
  nextContent: () => HTMLElement | null;
  /** page offset into `section` where the finished morph leaves the page */
  startOffset: () => number;
  /** the morph has finished, so the next scroll belongs to the dive */
  ready: () => boolean;
  /** freeze/thaw measurements that transforms would corrupt */
  freeze: () => void;
  thaw: () => void;
  /** keep the morph scene from reacting to the dive's page jumps */
  suspendOthers: (value: boolean) => void;
};

/** Turn over the dive, in degrees. */
const ROTATION = 32;
const DIVE = 1.25;
const REVEAL = 1.05;

/**
 * A triggered (not scrubbed) transition from section 2 into the next one: the
 * section rotates and zooms into the play pill until its blue fills the
 * screen, the page jumps to the next section behind that blue, and the blue
 * slides away. Scrolling back up from the next section plays it in reverse.
 */
export function createDiveScene(opts: DiveOptions) {
  let release: (() => void) | null = null;
  let active: gsap.core.Timeline | null = null;
  let lastInput = -Infinity;
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
    opts.layers.forEach(layer => { layer.style.transform = ""; layer.style.transformOrigin = ""; });
    opts.pill.classList.remove("is-diving", "is-diving-instant");
    const icon = opts.pill.querySelector("svg");
    if (icon) gsap.set(icon, { clearProps: "opacity" });
  };
  const nextTop = () => opts.next.getBoundingClientRect().top + window.scrollY;
  const startTop = () => opts.section.getBoundingClientRect().top + window.scrollY + opts.startOffset();

  const finish = () => {
    reset();
    opts.thaw();
    const content = opts.nextContent();
    if (content) gsap.set(content, { clearProps: "transform" });
    gsap.set(opts.overlay, { autoAlpha: 0, yPercent: 0 });
    opts.suspendOthers(false);
    active = null;
    release?.();
    release = null;
  };

  function play(forward: boolean) {
    if (active || !intended()) return;
    if (forward && !opts.ready()) return;
    release = lockScroll({ allowProgrammatic: true });
    opts.suspendOthers(true);
    const content = opts.nextContent();
    const icon = () => opts.pill.querySelector("svg");
    const tl = gsap.timeline({ onComplete: finish });
    active = tl;

    if (forward) {
      aim();
      opts.freeze();
      opts.pill.classList.add("is-diving");
      zoom.v = 0;
      tl.to(zoom, { v: 1, duration: DIVE, ease: "power2.in", onUpdate: apply })
        .to(icon(), { opacity: 0, duration: DIVE * 0.3, ease: "power1.in" }, DIVE * 0.5)
        .set(opts.overlay, { autoAlpha: 1, yPercent: 0 })
        .call(() => { reset(); opts.thaw(); jumpTo(nextTop()); })
        .addLabel("reveal")
        .to(opts.overlay, { yPercent: -100, duration: REVEAL, ease: "power3.inOut" }, "reveal");
      if (content) tl.fromTo(content, { scale: 1.18, rotation: -ROTATION / 5 }, { scale: 1, rotation: 0, duration: REVEAL * 1.25, ease: "expo.out" }, "reveal+=0.1");
      return;
    }

    // Back up: the blue drops over the next section, the page returns to the
    // end of the morph already zoomed into the pill, and the section flies out.
    tl.fromTo(opts.overlay, { autoAlpha: 1, yPercent: -100 }, { yPercent: 0, duration: REVEAL * 0.8, ease: "power3.inOut" });
    if (content) tl.to(content, { scale: 1.18, rotation: -ROTATION / 5, duration: REVEAL * 0.8, ease: "expo.in" }, 0);
    tl.call(() => {
      jumpTo(startTop());
      aim();
      opts.freeze();
      opts.pill.classList.add("is-diving", "is-diving-instant");
      const svg = icon();
      if (svg) gsap.set(svg, { opacity: 0 });
      zoom.v = 1;
      apply();
      if (content) gsap.set(content, { clearProps: "transform" });
    })
      .set(opts.overlay, { autoAlpha: 0 })
      .to(zoom, { v: 0, duration: DIVE, ease: "power2.out", onUpdate: apply, onStart: () => opts.pill.classList.remove("is-diving-instant") })
      .call(() => { const svg = icon(); if (svg) gsap.to(svg, { opacity: 1, duration: DIVE * 0.3 }); }, [], `-=${DIVE * 0.45}`);
  }

  // Past the end of the morph, going down: dive in.
  const into = ScrollTrigger.create({
    trigger: opts.section,
    start: () => `top+=${opts.startOffset()} top`,
    end: "bottom top",
    onUpdate: self => { if (self.direction > 0 && self.progress > 0) play(true); },
    onLeave: () => play(true),
  });
  // Scrolling up into the band above the next section: fly out again. (The
  // dive lands on the band's lower edge, so any upward scroll from there counts.)
  const back = ScrollTrigger.create({
    trigger: opts.next,
    start: "top bottom",
    end: "top top",
    onEnterBack: () => play(false),
    onUpdate: self => { if (self.direction < 0 && self.progress < 1) play(false); },
  });

  return {
    kill() {
      inputs.forEach(event => window.removeEventListener(event, onInput));
      active?.kill();
      finish();
      into.kill();
      back.kill();
    },
  };
}
