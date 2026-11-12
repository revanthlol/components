# Original extraction (as is)

Everything in this folder was taken unchanged from `dynamic-island-nav_framer_website.har`
(source site: https://dynamic-island-nav.framer.website/, published Oct 19, 2026).

| Path | What it is |
| --- | --- |
| `ssr/index.html` | The server rendered page exactly as the site delivered it (HAR entry 0). It loads Framer's runtime from `framerusercontent.com`, so it hydrates when it can reach that CDN. |
| `component/component.original.min.mjs` | The page module (HAR entry 6). Contains the complete "Dynamic Island Nav" code component, its property controls, and the page that wraps it. Minified, untouched. |
| `component/component.original.pretty.mjs` | The same file run through Prettier. Identifiers are still minified (`Ae`, `De`, `Ie` ...) and nothing else is changed. Line numbers in the docs refer to this file. |
| `runtime/` | Framer runtime chunks the page imports (react, framer, motion, shared metadata, bootstrap, badge). Needed only to run the original page, not the standalone component. |
| `fonts/` | The two Inter woff2 subsets that were captured in the HAR. |
| `har-requests.json` | Index of every request in the HAR (url, status, type, size). Entries 12 to 26 are Framer editor bar traffic and are not part of the site. |

Map of the original component code (pretty file):

| Original symbol | Lines | Role | Standalone file |
| --- | --- | --- | --- |
| `be` | 129-236 | prop validation and defaults | `src/normalize.ts` (`resolveConfig`) |
| `ge` | 83-102 | transition to spring parameters | `src/normalize.ts` (`springFromTransition`) |
| `xe`, `N`, `Se`, `P`, `Ce` | 237-298 | CSS variables and scoped CSS | `src/NavView.tsx`, `src/normalize.ts` |
| `F`, `we`, `Te`, `Ee`, `De` | 299-666 | glyph, section lookup, links, markup | `src/NavView.tsx`, `findSection` in `src/DynamicIslandNav.tsx` |
| `I`, `L` | 667-673 | spring step, rest test | `src/engine.ts` |
| `Oe`, `ke` | 674-683 | instance scope id, width compare | `src/DynamicIslandNav.tsx`, `src/utils.ts` |
| `Ae` | 684-1498 | live controller (state, observers, scroll spy, events) | `src/DynamicIslandNav.tsx` (`LiveNav`) |
| `R` | 1499-1524 | static canvas variant | `StaticNav` in `src/DynamicIslandNav.tsx` |
| `z` | 1525-1529 | public component | `DynamicIslandNav` |
| `B`, `W`, `Fe` | 1552, 1590, 1643 | icons, themes, stylesheet | `src/icons.ts`, `src/themes.ts`, `src/styles.ts` (generated from the original by script) |
| `Y`, `Ie` | 1729-2199 | spring value and animation engine | `src/engine.ts` |
| `le(z, {...})` | 2201-2498 | Framer property controls | `docs/API.md` |
| rest of file | 2510-3316 | the demo page (six 100vh sections) | `demo/` |

Authorship: the component's property panel credits Matthias Olschlegel. The extracted code is
his work as published; check the licence terms of the Framer component before redistributing it.
