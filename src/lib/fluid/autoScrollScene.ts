import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { jumpTo, lockScroll } from "@/lib/animation/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * How far the page moves with the video, as a fraction of the viewport; set per
 * breakpoint on the section (--fluid-travel) next to the layout it frames.
 */
export const travelFraction = (section: HTMLElement) =>
  parseFloat(getComputedStyle(section).getPropertyValue("--fluid-travel")) || 0.32;

/** A triggered transition that advances the document with the video, without pinning. */
export function createAutoScrollScene(section: HTMLElement, timeline: gsap.core.Timeline) {
  let release: (() => void) | null = null;
  let lastInput = -Infinity;
  let refreshing = false;
  // Another scene moving the page (the dive) must not replay the morph.
  let suspended = false;
  const travel = { progress: 0 };
  timeline.to(travel, { progress: 1, duration: timeline.duration(), ease: "sine.inOut" }, 0);
  const unlock = () => { release?.(); release = null; };
  const intended = () => !refreshing && performance.now() - lastInput < 1200;
  function play(forward: boolean) {
    if (suspended || !intended() || release || timeline.isActive()) return;
    if (forward ? timeline.progress() >= 1 : timeline.progress() <= 0) return;
    release = lockScroll({ allowProgrammatic: true });
    if (forward) timeline.play(); else timeline.reverse();
  }
  const onInput = () => { lastInput = performance.now(); };
  const inputs = ["wheel", "touchmove", "keydown", "pointerdown"] as const;
  inputs.forEach(event => window.addEventListener(event, onInput, { passive: true }));
  // Explicit navigation must not be intercepted by the cinematic transition.
  const onAnchor = (event: MouseEvent) => {
    if ((event.target as Element | null)?.closest("a[href]")) lastInput = -Infinity;
  };
  document.addEventListener("click", onAnchor, true);
  const refreshStart = () => { refreshing = true; };
  const refreshEnd = () => { refreshing = false; };
  ScrollTrigger.addEventListener("refreshInit", refreshStart);
  ScrollTrigger.addEventListener("refresh", refreshEnd);
  const trigger = ScrollTrigger.create({
    trigger: section, start: "top top", end: () => `+=${window.innerHeight * travelFraction(section)}`,
    onEnter: () => play(true),
    onEnterBack: () => play(false),
    onLeave: () => play(true),
    onLeaveBack: () => play(false),
    onUpdate: self => {
      if (self.direction > 0 && self.progress > 0) play(true);
      else if (self.direction < 0 && self.progress < .98) play(false);
    },
  });
  timeline.eventCallback("onUpdate", () => {
    if (release) jumpTo(trigger.start + (trigger.end - trigger.start) * travel.progress);
  });
  timeline.eventCallback("onComplete", unlock);
  timeline.eventCallback("onReverseComplete", unlock);
  if (window.scrollY > trigger.start) timeline.progress(1, true);
  return {
    trigger,
    suspend(value: boolean) { suspended = value; },
    kill() {
      inputs.forEach(event => window.removeEventListener(event, onInput));
      document.removeEventListener("click", onAnchor, true);
      ScrollTrigger.removeEventListener("refreshInit", refreshStart);
      ScrollTrigger.removeEventListener("refresh", refreshEnd);
      timeline.eventCallback("onUpdate", null);
      timeline.eventCallback("onComplete", null);
      timeline.eventCallback("onReverseComplete", null);
      unlock(); trigger.kill();
    },
  };
}
