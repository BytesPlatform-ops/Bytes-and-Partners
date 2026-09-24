/**
 * A pinned, cinematic scene inside the page — scroll TRIGGERS it, it never
 * scrubs it.
 *
 *   scroll down reaches the section's top
 *     → the section is pinned, input is locked where it is
 *     → the GSAP timeline plays to the end on its own
 *     → input is released; the section stays pinned for the rest of `hold`,
 *       then scrolls away normally
 *
 *   scroll back up into the pinned range, past `reverseAt`
 *     → locked again, the timeline reverses to the start on its own
 *     → released; the section unpins at its top and the page continues up
 *
 * Both triggers fire INSIDE the pinned range, so neither moves the section:
 * no jump, no sliding away mid-scene. The pin's spacer keeps the document
 * height honest, so nothing below shifts either.
 *
 * ScrollTrigger progress is only ever compared against thresholds — it is
 * never fed into the animation.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { jumpTo, lockScroll } from "@/lib/animation/scroll";

gsap.registerPlugin(ScrollTrigger);

export type PinnedSceneOptions = {
  /** how much scroll the pin lasts, as a ScrollTrigger end, e.g. "+=50%" */
  hold: string;
  /** scrolling UP below this fraction of the hold reverses the scene */
  reverseAt: number;
};

export function createPinnedScene(
  section: HTMLElement,
  tl: gsap.core.Timeline,
  { hold, reverseAt }: PinnedSceneOptions,
) {
  let release: (() => void) | null = null;
  const unlock = () => {
    release?.();
    release = null;
  };
  tl.eventCallback("onComplete", unlock);
  tl.eventCallback("onReverseComplete", unlock);

  const playingForward = () => tl.isActive() && !tl.reversed();
  const playingBack = () => tl.isActive() && tl.reversed();

  /**
   * Lock where the scene is. A fast flick can carry the scroll a few pixels
   * past the pinned range in the frame the trigger fires; step back inside
   * first, so the section is pinned for the whole scene, not sliding.
   */
  function lockInside(self: ScrollTrigger) {
    const y = self.scroll();
    if (y < self.start) jumpTo(self.start);
    else if (y > self.end) jumpTo(self.end);
    release = lockScroll();
  }

  // While a scene is playing the page is locked, and nothing may redirect it
  // — not even the lock's own correction of stray native inertia, which
  // ScrollTrigger would otherwise read as the user scrolling back.
  function forward(self: ScrollTrigger) {
    if (!intended() || release || tl.progress() >= 1 || playingForward()) return;
    lockInside(self);
    tl.play();
  }

  function reverse(self: ScrollTrigger) {
    if (!intended() || release || tl.progress() <= 0 || playingBack()) return;
    lockInside(self);
    tl.reverse();
  }

  // Only scrolling the USER caused may play or reverse the scene. A resize
  // or layout refresh re-measures the pin and nudges the scroll position
  // too, and that must never replay anything. Input is wheel, touch, keys or
  // a press (which is how a scrollbar drag begins);
  // the window covers smooth-scroll momentum after the last event.
  const INTENT_MS = 1200;
  let lastInput = -Infinity;
  const onInput = () => {
    lastInput = performance.now();
  };
  const inputs = ["wheel", "touchmove", "keydown", "pointerdown"] as const;
  for (const e of inputs) window.addEventListener(e, onInput, { passive: true });
  let refreshing = false;
  const onRefreshInit = () => {
    refreshing = true;
  };
  const onRefreshed = () => {
    refreshing = false;
  };
  ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
  ScrollTrigger.addEventListener("refresh", onRefreshed);
  const intended = () => !refreshing && performance.now() - lastInput <= INTENT_MS;

  const trigger = ScrollTrigger.create({
    trigger: section,
    pin: true,
    start: "top top",
    end: hold,
    onEnter: forward,
    onUpdate: (self) => {
      if (self.direction > 0 && self.progress > 0) forward(self);
      else if (self.direction < 0 && self.progress < reverseAt) reverse(self);
    },
    // safety nets for a flick that clears the pinned range in one frame
    onLeaveBack: reverse,
    onLeave: forward,
  });

  // loaded (or restored) already past the trigger: arrive finished, unlocked
  if (trigger.progress > 0 || window.scrollY > trigger.end) tl.progress(1);

  return {
    trigger,
    kill() {
      for (const e of inputs) window.removeEventListener(e, onInput);
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      ScrollTrigger.removeEventListener("refresh", onRefreshed);
      unlock();
      trigger.kill();
    },
  };
}
