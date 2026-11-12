# Dynamic Island Nav

A floating, spring animated navigation bar for React. A highlight pill glides between items, labels unfold on hover or focus, the bar shrinks to the current item while you scroll down, a scroll spy tracks one page sites, and below a breakpoint it turns into a menu with staggered rows.

This package is a standalone port of the Framer code component "Dynamic Island Nav" (by Matthias Olschlegel), extracted from the published site in `dynamic-island-nav_framer_website.har`. It has no Framer dependency: only React 18 or newer. The original files are kept untouched in [`original/`](original/README.md).

```
dynamic-island-nav/
  src/            component source (TypeScript)
  dist/           built ESM, CJS and type declarations
  demo/           demo source; demo/dist/index.html opens directly in a browser, no server
  docs/           API.md, ARCHITECTURE.md
  original/       the extraction as is: SSR page, original minified and pretty printed component, runtime chunks, fonts
  tests/parity/   proves the port behaves like the original (see below)
```

## Quick start

```bash
npm install            # dev dependencies only (react, esbuild, typescript, jsdom)
npm run build          # dist/index.js, dist/index.cjs, dist/types
npm run demo           # builds demo/dist, then open demo/dist/index.html
npm test               # build + parity tests against the original code
```

Use it in a project by copying `src/` into it, or by installing the folder (`npm i ./dynamic-island-nav`):

```tsx
import { DynamicIslandNav } from "dynamic-island-nav";

export function Header() {
  return (
    <DynamicIslandNav
      fixed
      items={[
        { label: "Home", icon: "home", section: "home" },
        { label: "Work", icon: "grid", section: "work" },
        { label: "Contact", icon: "mail", link: "/contact" },
      ]}
      theme="Auto"
    />
  );
}
```

* One page site: give each item a `section` equal to the `id` of the element it represents. Clicking scrolls smoothly, and the item becomes active while that section fills the screen.
* Multi page site: give items a `link` (or `section` left empty) and set `active` on each page. A link that points at the current URL is detected automatically.
* Without `fixed` the nav sits in normal flow. Wrap it in your own `position: fixed` container if you need other placement. The root ignores pointer events, only the island is clickable.

Full prop list: [`docs/API.md`](docs/API.md). Internals: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Requirements

* React 18 or 19, react-dom the same.
* Browsers with CSS container queries (Chrome 105, Safari 16, Firefox 110) and `inert`. `theme="Custom"` also uses `color-mix()`.
* Load your own font (the default stack starts with Inter and falls back to system fonts). Label widths are re-measured when `document.fonts.ready` resolves.

## How it was verified

The sandbox used to build this has no real browser, so verification is by differential testing against the original code, run in Node:

| Test | What it compares | Result |
| --- | --- | --- |
| `ssr-parity` | Server rendered HTML of the original component and the port for 46 prop sets (themes, logo variants, layouts, items, sizes, clamps, static canvas states) | identical, byte for byte |
| `engine-parity` | The original animation class and the port, fed the same inputs, every frame of 14 scenarios (hover moves, press, compact swap, mobile menu in 3 alignments, reduced motion, variable frame times, off screen pause, item count change); every inline style on every element | 2,730 frames identical |
| `dom-parity` | Full component in jsdom (scroll spy, compact on scroll, more button, click to scroll, mobile layout, menu, Escape) with mocked layout | 10 of 10 snapshots identical |

Each test fails when the port is altered (checked by mutating a spring constant). The original code under test is `tests/parity/original.factory.cjs`, generated from `original/component/component.original.pretty.mjs`.

Not covered: real pixel rendering, real font metrics, touch gestures and browser quirks. Open `demo/dist/index.html` and click through it before shipping.

## What differs from the original

Behaviour, markup, CSS and animation maths are the same. Intentional differences:

* No Framer runtime, no property controls panel. Props are plain React props, documented in `docs/API.md`.
* `canvas` mode (rendered only inside Framer's editor) is exposed as `staticPreview` plus `canvas`.
* Added: `fixed`, `className`; `image` and `logoImage` may be a plain URL string.
* Default `font` is `Inter, ui-sans-serif, system-ui, ...` instead of Framer's `Inter, "Inter Placeholder"` pair (that placeholder face only exists in Framer exports).
* The original attached an empty `onKeyDown` handler to the island; it was dropped.
* Framer internal placeholder links (`data:framer/...`) are still ignored, and `section` still falls back to `data-framer-name`, so it keeps working on exported Framer pages.

## Provenance and licence

The code was extracted from a public Framer site, so its authorship belongs to Matthias Olschlegel (credited in the component's own property panel). No licence text came with it; `package.json` therefore says `UNLICENSED`. Confirm the terms of the template or component with its author or seller before using it commercially or redistributing it.
