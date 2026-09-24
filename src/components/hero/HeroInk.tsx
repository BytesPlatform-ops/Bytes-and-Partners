/**
 * The trail layers. Both sit ABOVE the typography (z-10) and below the nav
 * (z-20); see lib/hero/metaballTrail.ts for how they combine:
 *
 *   z-[16] photo  — the photograph inside the blob, blended with `lighten`
 *   z-[15] invert — white inside the blob, blended with `difference`
 *
 * Inside the blob that reads as the photo with the type knocked out in white.
 * Outside it both canvases are transparent, so the page is untouched. Neither
 * is shown until the trail has drawn its first frame.
 */
export default function HeroInk() {
  return (
    <>
      <canvas
        data-ink-invert
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[15] h-full w-full mix-blend-difference"
        style={{ visibility: "hidden" }}
      />
      <canvas
        data-ink
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[16] h-full w-full mix-blend-lighten"
        style={{ visibility: "hidden" }}
      />
    </>
  );
}
