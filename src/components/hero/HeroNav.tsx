/**
 * Deliberately not a navbar. An identity, one action, one control — thin
 * borders, no fills, no shadows, nothing that reads as a SaaS button bar.
 *
 * Fixed above the whole page, in its own layer: it never scrolls, fades or
 * takes part in any section's animation. The bar itself lets clicks through;
 * only its children catch them.
 */
export default function HeroNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-6 px-[var(--bp-gut)] pt-[var(--bp-gut)] [&>*]:pointer-events-auto">
      <a
        href="#top"
        aria-label="Bytes and Partners — home"
        className="hero-mark text-ink transition-opacity duration-500 hover:opacity-60"
      >
        Bytes &amp; Partners
      </a>

      <nav aria-label="Primary" className="flex items-center gap-2 sm:gap-3">
        <a
          href="#contact"
          className="hero-pill"
        >
          <span className="hero-dot" aria-hidden />
          Start a project
        </a>
        <button type="button" className="hero-pill" aria-expanded="false">
          Menu
          <span className="hero-bars" aria-hidden>
            <span />
            <span />
          </span>
        </button>
      </nav>
    </header>
  );
}
