# Bytes and Partners

Marketing and portfolio site for **Bytes and Partners** — the parent technology
company. Client work is delivered through **BytesPlatform**, its technology platform
and subsidiary; the platform is referenced as a subsidiary throughout the site and is
never presented as the company itself.

Built as a single cinematic experience: a scroll-driven portfolio where each project
is presented as a product launch rather than a card in a grid.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Animation | Motion (`motion/react`) + a custom canvas particle field |
| Smooth scroll | Lenis (desktop + fine-pointer only) |
| Language | TypeScript (strict) |

No 3D library is used. The hero's depth comes from a hand-written 2D canvas
particle network plus GPU-composited CSS aurora layers — this keeps the field at
60fps and the bundle small, which a Three.js scene would not.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Structure

```
src/
  app/
    layout.tsx             root shell, fonts, metadata, JSON-LD
    page.tsx               home — hero → services → work → AI → process → about → contact
    work/[slug]/page.tsx   statically generated case studies
    opengraph-image.tsx    generated social card
    globals.css            design tokens + glass/typography system
  components/
    hero/                  Hero, ParticleField
    sections/              Services, Work, IntelligenceLayer, Process, About, Contact, Marquee
    work/                  ProjectShowcase (scroll-driven track), Frames (device/browser/scrolling-site)
    site/                  Header, Footer, Logo, SmoothScroll
    ui/                    Reveal, MagneticButton, TiltCard, SectionHeading
  data/projects.ts         single source of truth for every case study
public/projects/<slug>/    optimised screenshots (progressive JPEG, served as AVIF/WebP)
```

## Adding a project

Everything about a case study lives in `src/data/projects.ts`. Add an entry, drop
optimised images under `public/projects/<slug>/`, and both the home showcase and the
`/work/<slug>` page generate themselves — including sitemap and metadata.

`media: "device"` renders phone frames; `media: "browser"` renders browser chrome.
An optional `full` (tall full-page capture) renders the hover-to-scroll site preview.

## Design system

Tokens live in `globals.css` under `@theme`. Semantic classes (`.glass`,
`.glass-edge`, `.display`, `.eyebrow`, `.text-gradient`) sit in `@layer components`
so Tailwind utilities always win over them — putting them in `@layer utilities`
silently breaks `absolute` on any `.glass-edge` element.

## Performance & accessibility notes

- Initial document + assets ≈ 265 KB; CLS 0.
- The scroll-pinned showcase is disabled below `lg` and under
  `prefers-reduced-motion`, falling back to a native snap carousel.
- The particle canvas pauses when off-screen or when the tab is hidden, and renders
  one static frame under reduced motion.
- All body/meta text meets WCAG AA contrast against the `#05060a` ground.
- Skip link, focus-visible rings, labelled landmarks and `aria-*` on all controls.

## Content policy

Bytes and Partners is the primary brand everywhere; BytesPlatform appears only
as the subsidiary platform (About hierarchy block, footer note, JSON-LD
`subOrganization` / `brand`).

Every metric on this site traces to a public source — an App Store listing, a Google
Search Console property, or the running application. `note` fields on a project state
the provenance where relevant. Nothing is estimated.
