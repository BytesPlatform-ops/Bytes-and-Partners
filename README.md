# Bytes and Partners

Front end for **Bytes and Partners**. Currently implemented: the hero and a
placeholder next scene so the exit transition can be built against something
real. Everything below that is still to come.

> **Brand note.** The hero word is `BytesPlatform.` under a `BYTES & PARTNERS`
> header, at the client's direction. This inverts the hierarchy recorded in the
> JSON-LD (`subOrganization` / `brand`), where BytesPlatform is the subsidiary
> platform and never the company. The structured data was left as-is; if the
> positioning has genuinely changed, that needs updating to match.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Choreography | GSAP 3 (one timeline, one shared `gsap.ticker`) |
| Field | Hand-written WebGL — one quad, one fragment shader |
| Smooth scroll | Lenis (fine pointer + motion enabled only) |
| Type | Inter, one family, weights 500–800 |

No 3D library. The reveal is a single textured quad; a scene graph would cost
~135 KB gzip to draw two triangles.

## The composition

```
BYTES & PARTNERS                        • Start a project    Menu ≡




          BytesPlatform.

TECHNOLOGY STUDIO / NEW YORK                            SCROLL │
```

One grotesk, one accent, a great deal of nothing. The word is lower-middle and
left-anchored rather than centred, and fills 88–95% of the measure at every
viewport from 320 to 1920.

## The field

`BytesPlatform.` is a real `<h1>` — live, selectable, crisp — and it is never
drawn, animated or touched by the shader. It has no reveal animation at all:
the composition is simply there on first paint.

`lib/hero/metaballTrail.ts` is one canvas **above** the word. A chain of 20
points chases the pointer — the head eases toward it, every point after that
eases toward the one in front — and the shader draws a tapered capsule between
each pair of neighbours, melted together with a smooth minimum, so the chain is
one continuous liquid body at any speed.

Inside the body it paints the photograph, with the headline redrawn over it in
white: the real letters are rasterised at the exact positions the browser laid
them out, and the shader reads the word's box every frame so the white copy
follows the scroll parallax. Outside the body the canvas is transparent. It is
all ordinary alpha compositing, so the antialiased edge blends cleanly.

The body only exists while the pointer moves: an energy value follows the
averaged pointer speed, and as it drains the body breaks into droplets and is
gone within about a second. The chain is then gathered back at the pointer so
the next movement forms it in place.

## Scroll

Scrolling carries the word up and lifts the footer away, driven off one GSAP
ticker. The header is fixed and never moves. The trail pauses while the hero is off screen.

## Structure

```
src/
  app/
    layout.tsx        root shell, font, metadata, JSON-LD
    page.tsx          renders <Hero />
    globals.css       tokens, the hero type scale, fallbacks
  components/hero/
    Hero.tsx          orchestrator: pointer, trail, scroll, teardown
    HeroInk.tsx       the trail canvas
    HeroNav.tsx       identity, one action, one control
    HeroTypography.tsx the word — real HTML, two lines in markup
  components/sections/
    FluidVideoTransition.tsx  the reel: ScrollTrigger plays/reverses a GSAP timeline
  lib/
    hero/metaballTrail.ts the metaball trail shader
    fluid/                the reel's sheet geometry and Three.js renderer
    shaders/              the reel's GLSL
    animation/            device probes, scroll + anchor routing
```

## Responsive

Three deliberate tiers, not one shrinking layout:

| Range | Word |
| --- | --- |
| ≥ 1024px | one line, near full-bleed |
| 640–1023px | two lines, sized to the wider measure |
| < 640px | two lines, as large as the gutter allows |

Each line is its own `nowrap` run, so the only place the word may break is
*between* them — never mid-word, and never at a size that happens to land one
pixel over the container. Verified at ten widths from 320 to 1920: no
horizontal scroll anywhere, and the word never collides with the footer.

## Performance

- One `requestAnimationFrame` for the page: GSAP's ticker drives Lenis, the
  scroll parallax and the shader.
- No React state in any animation path; the orchestrator is one effect.
- The trail is a single full-screen pass on one canvas with no framebuffers —
  the chain of points is its memory. DPR is capped at 2 (1.5 on touch).
- Rendering is skipped when the hero is off screen (`IntersectionObserver`) or
  the tab is hidden.
- The chain's easing is frame-rate independent, so it follows at the same pace
  on 60 Hz and 120 Hz displays.
- `trail.destroy()` releases the buffer, vertex array and program.

Measured in Chrome at 1280×800 on an Apple M4: a steady **60 fps** while the
trail is moving.

## Fallbacks

Reduced motion, no WebGL and no JavaScript all resolve to the same place: the
composition, with the type fully inked and crisp and no canvas at all. In every
one of those states the word is still a real `<h1>` reading
`BytesPlatform.` — the field is the only thing that is ever missing.

## Design tokens

`--bp-bg`, `--bp-text`, `--bp-accent`, `--bp-gut`, `--bp-radius`,
`--bp-hairline` on `:root`. Warm paper `#F5F2EA`, ink `#111111`, electric blue
`#2457FF` — used once, on the period, and as small indicator dots.
