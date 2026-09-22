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
drawn, animated or touched by the shader. It has no reveal animation of its
own at all.

`lib/hero/fluid.ts` is a **reveal mask**, not a layer of ink. The hero content
sits in the DOM beneath an opaque cover the exact colour of the page; the
shader paints that cover and punches it away wherever the fluid has reached.
What appears inside the shape is the real composition showing through.

```
cover alpha = (1 - revealed) * (1 - open)
```

Getting this backwards is what made two earlier attempts read as "a grey blob
moving above the text": they painted the fluid *on top of* the page as its own
visible layer, so it could only ever be a shape sitting over the composition
rather than the thing uncovering it.

Driving it is a genuine feedback simulation. Two RGBA framebuffers are
ping-ponged; each frame the previous field is resampled along a velocity field
(advection), faded (decay), and fresh fluid is injected along the segment the
head travelled that frame (splat):

```
field(n) = advect(field(n-1), velocity) * decay + splat(head)
```

The channels carry `R` live density, `G` freshness (the working front, which
decays fastest and colours the edge) and `B` revealed ground — which does not
decay, so the composition stays open behind the fluid instead of closing up.

Three things are load-bearing:

- **The splat is a capsule, not a point.** Injecting at the head position alone
  lays a string of beads at speed; injecting along the segment covered that
  frame lays a continuous front.
- **The mask lookup is heavily domain-warped** — two drifting fbm octaves at a
  scale large enough to deform the whole silhouette. That is where the
  ink-spreading edge comes from; without it the opening is a soft circle.
- **`open` forces the cover fully away at the end**, so the final frame is
  guaranteed clean no matter what the simulation is doing.

## Scroll

Scrolling runs the same system backwards rather than fading it out. A
`reclaim` uniform decays the revealed channel, so the cover closes back over
the hero with the same organic edge while the head is driven downward ahead of
it, and the next scene arrives behind it.

At rest the hero is fully open and there is nothing to composite, so the canvas
is taken out of the page entirely and the GPU does no work at all until you
scroll.

## Structure## Structure## Structure

```
src/
  app/
    layout.tsx        root shell, font, metadata, JSON-LD
    page.tsx          renders <Hero />
    globals.css       tokens, the hero type scale, fallbacks
  components/hero/
    Hero.tsx          orchestrator: timeline, one ticker, exit, teardown
    HeroField.tsx     the canvas — the cover above the content, never draws type
    HeroNav.tsx       identity, one action, one control
    HeroTypography.tsx the word — real HTML, two lines in markup
    NextScene.tsx     placeholder, so the exit has a destination
  lib/
    hero/fluid.ts         the ping-pong simulation and the cover shader
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

- One `requestAnimationFrame` for the page: GSAP's ticker drives the timeline,
  Lenis and the shader.
- No React state in any animation path; the orchestrator is one effect.
- The simulation runs at 60% of layout resolution (40% on touch) with DPR
  capped at 1.5 — independent of device DPR, and two passes per frame. The
  canvas always *covers* the hero; only the buffers are scaled. Setting the CSS
  size from the buffer size pins a low-res field to the top-left corner at a
  fraction of the layout size.
- Rendering is skipped when the hero is off screen (`IntersectionObserver`) or
  the tab is hidden.
- Ink is only injected while something is actually moving, so a resting pointer
  lets the field decay to nothing and the hero returns to clean cream.
- Pointer input is lerped; the field bends toward the cursor and never chases it.
- `reveal.destroy()` releases the texture, buffer, program and context.

Measured in Chrome at 1440×900: **16.7 ms median and p95** idle, on pointer
move, and while scrolling.

## Fallbacks

Reduced motion, no WebGL and no JavaScript all resolve to the same place: the
composition, with the type fully inked and crisp and no canvas at all. In every
one of those states the word is still a real `<h1>` reading
`BytesPlatform.` — the field is the only thing that is ever missing.

## Design tokens

`--bp-bg`, `--bp-text`, `--bp-accent`, `--bp-gut`, `--bp-radius`,
`--bp-hairline` on `:root`. Warm paper `#F5F2EA`, ink `#111111`, electric blue
`#2457FF` — used once, on the period, and as small indicator dots.
