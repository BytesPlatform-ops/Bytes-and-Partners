/**
 * The word. Real, live, selectable HTML text — always. Nothing here is ever
 * drawn by a shader.
 *
 * It arrives with a liquid morph (driven from Hero.tsx): every letter starts
 * as a heavily blurred blob, and `#hero-morph` — an alpha threshold on the
 * whole word — turns that blur into hard-edged liquid. Neighbouring blobs
 * merge while the tracking is tight, then pull apart and condense into the
 * letterforms. At the end the threshold relaxes to identity and the filter is
 * removed, so the word finishes as plain, crisp, antialiased text.
 *
 * Letters are INLINE spans, never inline-block: an inline span keeps the
 * font's kerning and reads as one word to assistive tech, so removing the
 * animation leaves nothing to reflow.
 *
 * The two `data-line` spans are one visual line on desktop and two below it,
 * switched in CSS alone.
 */

function Chars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((c, i) => (
        <span key={i} data-char className="hero-char">
          {c}
        </span>
      ))}
    </>
  );
}

export default function HeroTypography() {
  return (
    <>
      <h1 data-word data-morph="pending" className="hero-word">
        <span data-line className="hero-line">
          <Chars text="Bytes" />
        </span>
        <span data-line className="hero-line">
          <Chars text="Platform" />
          <span data-char data-period className="hero-char hero-period">.</span>
        </span>
      </h1>

      {/* the threshold that turns blur into liquid; its matrix is animated */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter
          id="hero-morph"
          x="-20%"
          y="-40%"
          width="140%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            data-morph-matrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
          />
        </filter>
      </svg>
    </>
  );
}
