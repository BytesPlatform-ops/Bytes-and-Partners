/**
 * The fluid mask.
 *
 * This sits ABOVE the hero content and paints a cover in the page's own
 * colour, which the shader punches away wherever the fluid has reached — so
 * what appears inside the shape is the real composition underneath, not a
 * picture of it. It is pointer-transparent, so the text below stays
 * selectable and every control stays clickable straight through it.
 */
export default function HeroField() {
  return (
    <canvas
      data-field
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
    />
  );
}
