/**
 * The word. Real, live, selectable HTML text — always. Nothing here is ever
 * drawn by a shader.
 *
 * It is present from the first paint, set in a pale tone, and "develops" to
 * full ink as the trail sweeps past behind it: `--dev` moves a hard stop
 * through a background gradient that is clipped to the glyphs. The text stays
 * crisp and selectable the whole way, and ends as flat ink.
 *
 * The two `data-line` spans are one visual line on desktop and two below it,
 * switched in CSS alone. `data-baseline` is an empty inline-block strut whose
 * bottom edge is exactly the text baseline — that is how the occluder mask
 * aligns to the glyphs without guessing at font metrics.
 */
export default function HeroTypography() {
  return (
    <h1 data-word className="hero-word">
      <span data-line className="hero-line">
        Bytes
        <span data-baseline aria-hidden className="hero-strut" />
      </span>
      <span data-line className="hero-line">
        Platform
        <span data-period className="hero-period">.</span>
        <span data-baseline aria-hidden className="hero-strut" />
      </span>
    </h1>
  );
}
