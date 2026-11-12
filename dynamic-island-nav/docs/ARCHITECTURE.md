# Architecture

Three layers, mirroring the original component.

```
resolveConfig(props)        normalize.ts   validate, clamp, default -> ResolvedConfig
        |
LiveNav (controller)        DynamicIslandNav.tsx   React state, observers, events -> ViewState + bindings
        |                          |
NavView (markup)            NavView.tsx            pure render of ViewState; hands refs to the controller
                                   |
IslandEngine (animation)    engine.ts              springs, layout, paints inline styles straight to the DOM
```

## Render model

React renders structure and discrete state: which item is current, hovered, focused, whether the menu is open, whether the bar is compact. It never renders sizes or positions during an animation. After every commit a layout effect measures what it needs, builds an `EngineModel` (geometry) and `EngineTargets` (where each spring should go) and calls `engine.update`. The engine then runs its own `requestAnimationFrame` loop and writes inline styles (width, height, opacity, transform, filter, margin, visibility) directly to the elements. Writes are cached per element and property, so unchanged values cost nothing.

Until the first measurement, `data-live` is absent and plain CSS shows a sensible static layout (server output). Once the engine takes over, `data-live` switches the stylesheet to absolutely positioned content that the engine sizes.

## Measuring

* `.lis-measure` is a hidden row with one span per label, used to read label widths without disturbing the visible bar. Widths are rounded up to 0.25px.
* Root width, slot width and logo width come from `getBoundingClientRect` and a `ResizeObserver`; `document.fonts.ready` triggers a re-measure.
* The layout (desktop or mobile) is decided in JS (`rootWidth < breakpoint` or the full bar does not fit in the slot). A mirrored `@container` rule in the instance CSS makes server output and first paint match.

## Engine

State is a set of scalar springs (`SpringValue`: x, v, t):

| Spring | Meaning |
| --- | --- |
| `itemSprings[i]` | item visibility, 1 shown, 0 collapsed (compact mode and mobile) |
| `labelSprings[i]` | label reveal for item i |
| `more` | the dots button (compact desktop) |
| `open` | mobile menu open amount |
| `pillL`, `pillR` | left and right edge of the highlight pill |
| `pillAlpha`, `press` | pill opacity, pressed squash |

`layout()` converts spring values to pixel positions, widths and the island's size. `tick()` steps all springs with up to 240 Hz sub steps (semi implicit Euler), recomputes the layout, derives island stretch from width velocity, paints, and stops when everything is at rest. The pill's two edges use a fast and a soft spring depending on direction, which creates the stretch. When exactly one item appears while another disappears (compact mode with a new current item) a "swap" animates the two with a ghost item that fades and blurs out.

Reveal staggering: items appearing or disappearing at the same time wait `distance from pivot * 18ms` (appear) or `(max - distance) * 12ms` (disappear), except for simple one in one out changes.

## Interaction details worth knowing

* Hover is only trusted after a real pointer move (`pointermove` is tracked in the capture phase). When the island morphs under a still cursor, hover and click are suppressed until the pointer moves 4px. This prevents the classic "bar resizes and the click lands on another item" bug.
* Label reveal on hover is delayed 140ms, island reopen on hover 180ms, close 260ms.
* Compact mode starts after `scrollOffset` and more than 10px of continuous downward scroll, and ends after more than 10px upward. When reopened with the dots button it closes again after 48px of downward scroll.
* Scroll spy: coverage of each section is measured on scroll, resize and at 300ms and 1200ms after mount. A candidate must hold for 140ms before it is committed, the current one is kept while it still qualifies (hysteresis), and at the very bottom of the page the lowest mostly visible section wins. A click pins its target for up to 3s so the pill does not flicker through intermediate sections during smooth scroll; user input cancels the pin.

## Files

| File | Responsibility |
| --- | --- |
| `types.ts` | public types |
| `defaults.ts` | default items, limits |
| `icons.ts`, `themes.ts`, `styles.ts` | constants generated from the original code |
| `utils.ts` | clamp, smoothstep, box parsing, colour helpers |
| `normalize.ts` | `resolveConfig`, theme variables, transition to spring |
| `engine.ts` | `SpringValue`, `IslandEngine` |
| `NavView.tsx` | markup, instance CSS, CSS variable mapping |
| `DynamicIslandNav.tsx` | controller hooks, static preview, public component |

## Updating from a newer Framer export

Re-run the extraction in `tests/parity` terms: replace `original/component/component.original.pretty.mjs`, regenerate the factory (the slicing script is documented in `docs/EXTRACTION.md`), and run `npm test`. A difference in any parity test shows exactly which part of the original changed.
