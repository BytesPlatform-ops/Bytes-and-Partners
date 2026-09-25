/** The masked card animation sits behind the typography without color blending. */
export default function HeroInk() {
  return (
    <canvas
      data-ink
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      style={{ visibility: "hidden" }}
    />
  );
}
