/**
 * Placeholder for the section that follows. It exists now only so the hero's
 * exit can be built and tested against something real — the blue accent
 * travels down into it rather than the hero fading out into nothing.
 */
export default function NextScene() {
  return (
    <section
      data-next-scene
      id="work"
      className="relative flex min-h-[70svh] flex-col justify-between px-[var(--bp-gut)] py-[var(--bp-gut)]"
    >
      <div className="flex items-baseline justify-between">
        <span className="hero-meta">
          <span data-next-dot className="hero-dot mr-2.5 align-middle" aria-hidden />
          Selected work
        </span>
        <span className="hero-meta">2026</span>
      </div>

      <p className="hero-lede max-w-[28ch]">
        AI products, platforms and the systems that run beneath them — built
        in-house.
      </p>
    </section>
  );
}
