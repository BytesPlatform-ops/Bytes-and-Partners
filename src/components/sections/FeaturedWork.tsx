import "./FeaturedWork.css";

/**
 * FEATURED WORK — the root and card spiral (lib/work/rootCardsScene).
 *
 * The section pins while the page scrolls through SCROLL_LENGTH; that scroll,
 * as 0..1, is the scene's scroll progress (the prototype used the whole
 * document's scroll — here it is this section's). The scene smooths toward
 * it and orbits the camera down the root.
 */

export default function FeaturedWork() {
  return (
    <section
      id="work"
      data-featured-work
      aria-label="Featured work"
      className="relative h-[100svh] overflow-hidden rounded-b-[clamp(1.75rem,4vw,4rem)]"
    />
  );
}
