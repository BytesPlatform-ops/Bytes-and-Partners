# BytesPlatform

A single-page studio site built with Next.js App Router, React, Three.js, GSAP,
Lenis, and Tailwind CSS. The page contains an interactive hero, showreel,
rotating project cards, services, and contact footer.

## Development

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Before shipping changes:

```sh
npm run typecheck
npm run build
```

`npm start` serves the production build. This project does not currently have an
ESLint configuration; Next.js 16 no longer provides the `next lint` command.

## Where to edit

- `src/app/page.tsx` renders `IntroExperience`, which coordinates the shared
  WebGL canvas and scroll scenes.
- `src/components/hero/` contains the hero, persistent navigation, and menu.
- `src/components/sections/` contains the reel/player, featured work, services,
  and footer. Shared controls live in `src/components/ui/`.
- `src/lib/hero/`, `intro/`, `fluid/`, `services/`, and `work/` implement the
  visuals and transitions. `src/lib/animation/` handles scroll and device preferences.
- `src/data/site.ts` is the shared BytesPlatform brand, contact, and link configuration,
  sourced from https://bytesplatform.com/.
- `src/data/projects.ts` contains project names, URLs, images, case-study copy,
  and palettes. Keep media paths synchronized with `public/projects/`.
- `public/showreel/` contains the preview and full player videos, their format
  fallbacks, and posters. `public/fonts/` includes the local font and its license.
- `src/app/globals.css` defines shared typography, colors, and base behavior.

## Project cards and case studies

`CASE_STUDIES_ENABLED` near the top of `src/lib/work/rootCardsScene.js` is
currently `false`. Active cards open their configured `link.href` in a new tab.
Projects without a URL remain unavailable. The shader cursor follows mouse
movement over the active card; touch interaction does not show this cursor.

Set the toggle to `true` to restore the camera/portal transition and horizontal
case studies. Their gallery, next-project navigation, and palette editor are
retained. The palette editor previews colors and copies a `caseTheme` object to
paste into `projects.ts`; drafts are not persisted across reloads.

`ENABLE_LINE_DRAWING_TOOL` in `src/lib/intro/lineData.ts` enables the retained
line-layout authoring tool. It is disabled by default. `ideas/` holds design
references, not runtime assets.

## Routes and checks

The homepage is the only content route. The app also supplies a 404 page,
icon, Open Graph image, sitemap, and robots file. The previous multi-section
site and refund-policy route are absent from this redesign branch.

After animation changes, check desktop and touch layouts, reduced motion,
menu/contact navigation, reel playback and closing, card hover/click behavior,
and returning to the top on refresh. If changing case-study code, also verify
it with its toggle enabled, then restore the intended toggle value.
