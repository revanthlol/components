# How the component was extracted from the HAR

1. **Inventory.** The HAR has 27 entries. Entry 0 is the server rendered HTML, entries 2 to 8 and 13 are Framer's runtime chunks, entry 6 is the page module (`8yp822c...mjs`, 72 KB). Entries 12 to 26 are Framer editor bar traffic.
2. **Find the component.** The SSR markup uses the `lis-` class prefix. Searching the chunks for that prefix finds it only in entry 6, which holds the complete code component (controller, engine, stylesheet, icons, themes, property controls) and the page that instantiates it.
3. **Beautify.** `prettier --parser babel` on that file gives `original/component/component.original.pretty.mjs` (3,316 lines). Identifiers stay minified.
4. **Identify imports.** The module imports minified aliases from Framer's React chunk. They map to plain React: `useState`, `useRef`, `useEffect`, `useLayoutEffect`, `useMemo`, `useId`, `Fragment`, `jsx`, `jsxs`, and `window`. Only `ce()` (is the canvas editor active) and `le()` (register property controls) are Framer specific.
5. **Make the original runnable.** `tools/make-original-factory.cjs` cuts lines 45 to 2498 of the pretty file (everything except the Framer page wrapper) into a factory function `makeOriginal(React, window, capture)` that supplies those aliases and returns the original `be`, `Ae`, `R`, `z`, `Ie`, `Y` and the constants. Output: `tests/parity/original.factory.cjs`. This is the code the parity tests treat as ground truth.
6. **Generate constants.** `tools/gen-constants.cjs` reads the icon markup, theme tokens and stylesheet out of the running original and writes `src/icons.ts`, `src/themes.ts`, `src/styles.ts`, so none of that data was retyped.
7. **Port the logic.** `be`, `Ae`, `De`, `Ie`, `Y` were rewritten with readable names into `normalize.ts`, `DynamicIslandNav.tsx`, `NavView.tsx`, `engine.ts`, keeping every formula, timing constant and ordering of effects.
8. **Prove equivalence.** `npm test` runs the SSR, engine and DOM parity suites described in the README.

Regenerate after replacing the pretty file:

```bash
node tools/make-original-factory.cjs   # needs the line range in step 5 to still match
node tools/gen-constants.cjs
npm test
```

If a future export shifts the line range, find it with `grep -n "^function O(e, t, n)"` (start) and the line before the page level `e(() => {` (end).
