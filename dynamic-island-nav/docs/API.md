# API reference

```tsx
import { DynamicIslandNav } from "dynamic-island-nav";
```

All props are optional. Values are validated and clamped at runtime, so a bad value falls back to its default instead of breaking the layout.

## Items

`items?: NavItem[]` (max 10, extra entries are ignored). Default: Home, Work, Lab, Journal, About, Contact with no links.

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | `""` | Visible label and accessible name. |
| `icon` | `IconName` | `"home"` | Built-in icon. Unknown names fall back to `home`. See [Icons](#icons). |
| `image` | `string \| { src, srcSet?, alt? }` | none | Custom icon. Drawn as a CSS mask, so it takes the text colour. Use a monochrome SVG or PNG. Overrides `icon`. |
| `link` | `string` | `""` | URL, route (`/work`) or hash (`#work`). A link to the current page makes the item active. |
| `newTab` | `boolean` | `false` | Adds `target="_blank" rel="noopener noreferrer"`. A new tab link never smooth scrolls. |
| `section` | `string` | `""` | One page sites. Id of the target element (a leading `#` is stripped). With an empty `link`, a click smooth scrolls there. The item turns active when that section fills `switchAt` of the screen. If no element has that id, an element with a matching `data-framer-name` (case insensitive) is used. |

An item with neither `link` nor `section` renders as a non-interactive `<span>`.

How the active item is chosen, highest priority first:

1. the item that was just clicked (until the URL changes or a section takes over),
2. the section currently in view (scroll spy),
3. an item whose `link` points at the current URL,
4. the `active` prop.

## Behaviour props

| Prop | Type | Default | Runtime limits | Description |
| --- | --- | --- | --- | --- |
| `active` | `number` | `1` | rounded | 1 based index of the highlighted item. `0` or out of range means none. |
| `switchAt` | `number` | `80` | 30 to 100 | Percent of the viewport (or of the section, if it is shorter) a section must cover to become active. |
| `labels` | `"Active" \| "All"` | `"Active"` | | `Active`: only the current item shows its label, others unfold on hover or focus. `All`: every label is visible (desktop only). |
| `layout` | `"Auto" \| "Desktop" \| "Mobile"` | `"Auto"` | | `Auto` switches to the mobile menu when the container is narrower than `breakpoint`, or when the items do not fit. |
| `breakpoint` | `number` | `640` | 0 to 4000 | Width in px (of the nav container) under which `Auto` uses the mobile menu. |
| `compact` | `boolean` | `true` | | Desktop: after scrolling down, the island shrinks to the current item plus a dots button. Scrolling up restores it. |
| `expand` | `"Hover" \| "Click"` | `"Hover"` | | How compact mode reopens. `Hover` reacts only to a moving pointer (not to content scrolling under a still cursor). `Click` uses the dots button. Keyboard focus always reopens it. |
| `scrollOffset` | `number` | `120` | >= 0 | Scroll distance in px before compact mode may start. |
| `elasticity` | `number` | `0.6` | 0 to 1 | Stretch of the pill and squash of the island while it changes width. `0` disables both. |
| `transition` | `TransitionConfig` | spring 400 / 32 / 1 | | See [Motion](#motion). |

## Logo

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `logoType` | `"None" \| "Image" \| "Text"` | `"None"` | A logo plus divider is placed before the items. |
| `logoImage` | `string \| { src, srcSet?, alt? }` | none | Image logo. Without a source nothing renders (the placeholder only shows in `staticPreview`). |
| `logoRound` | `boolean` | `false` | Crop the image to a circle (avatar). |
| `logoText` | `string` | `"Studio"` | Text logo. Blank text hides the logo. |
| `logoLink` | `string` | `""` | Makes the logo a link. |
| `logoNewTab` | `boolean` | `false` | Open the logo link in a new tab. |

## Appearance

| Prop | Type | Default | Runtime limits | Description |
| --- | --- | --- | --- | --- |
| `theme` | `"Dark" \| "Light" \| "Auto" \| "Custom"` | `"Dark"` | | `Auto` follows `prefers-color-scheme` (light theme by default, dark under `@media (prefers-color-scheme: dark)`). |
| `colors` | `CustomColors` | Dark values | | Used with `theme="Custom"`. Missing keys fall back to the Dark theme. See [Theming](#theming). |
| `blur` | `number` | `20` | 0 to 80 | Backdrop blur in px. |
| `font` | `CSSProperties` | Inter 14px / 500 / -0.01em / 1.2em | | Any CSS font properties for labels. The logo text uses the same font at +1px, weight 600. Menu rows are at least 17px. |
| `itemSize` | `number` | `40` | 24 to 72 | Height and minimum width of an item. |
| `iconSize` | `number` | `20` | 10 to `itemSize` | Icon size. |
| `radius` | `string \| number` | `"999px"` | capped at half the bar height | Island radius. Only the first value of a shorthand is used. |
| `padding` | `string \| number` | `"6px"` | >= 0 | Inner padding, CSS shorthand (1 to 4 values). |
| `gap` | `string \| number` | `"4px"` | >= 0 | One value sets both axes. Two values are `row column` like CSS `gap`: row is the space between menu rows, column the space between items. |
| `margin` | `string \| number` | `"16px"` | >= 0 | Space around the island, CSS shorthand. Top, left and right respect `env(safe-area-inset-*)`. |
| `align` | `"Left" \| "Center" \| "Right"` | `"Center"` | | Horizontal position of the island inside its container. |
| `className`, `style` | | | | Applied to the `<nav>` (`style` is merged under the component's own CSS variables). |

## Placement and preview

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `fixed` | `boolean` | `false` | Shortcut for `position: fixed; top: 0; left: 0; right: 0; z-index: 10` on the nav. Without it the nav sits in normal flow and you place it yourself. The nav root ignores pointer events, only the island itself is clickable, so a full width fixed wrapper does not block the page. |
| `staticPreview` | `boolean` | `false` | Renders the non-interactive markup only: no engine, no listeners. For screenshots, design tooling, tests. |
| `canvas` | `"Default" \| "Compact" \| "Menu"` | `"Default"` | State shown by `staticPreview`: normal, compact, or open mobile menu. Ignored otherwise. |

## Motion

`transition` accepts:

```ts
{ type: "spring", stiffness: 400, damping: 32, mass: 1 }   // default
{ type: "spring", duration: 0.5, bounce: 0.3 }             // duration based, bounce 0 to 0.9
{ type: "tween", duration: 0.4 }                           // critically damped spring approximating that duration
```

Stiffness is clamped to >= 10, damping to >= 1, mass to >= 0.1, duration to >= 0.08s. Derived springs use these as a base: the pill's leading edge is 1.6x stiffer than the base, the trailing edge softer by `elasticity`, the compact swap animation is half as stiff.

Honoured automatically:

* `prefers-reduced-motion: reduce` snaps every state change, removes blur and squash, and disables CSS transitions.
* `prefers-reduced-transparency: reduce` replaces the translucent glass with a solid fill.
* `prefers-contrast: more` raises icon, border and pill contrast.
* The animation loop pauses while the nav is off screen (IntersectionObserver).

## Theming

Themes are CSS custom properties on the nav root, so you can also override them from your own CSS (they are set inline, so use `style` or `!important`):

`--lis-fill`, `--lis-border`, `--lis-hl`, `--lis-shadow`, `--lis-pill`, `--lis-pill-hl`, `--lis-row-hover`, `--lis-icon`, `--lis-active`, `--lis-divider`, `--lis-focus`, `--lis-icon-hc`, `--lis-border-hc`, `--lis-pill-hc`, `--lis-fill-solid`.

```tsx
<DynamicIslandNav
  theme="Custom"
  colors={{
    fill: "rgba(250, 247, 240, 0.85)",
    border: "rgba(30, 25, 10, 0.08)",
    pill: "rgba(30, 25, 10, 0.07)",
    icon: "rgba(30, 25, 10, 0.55)",
    active: "#1e190a",
    divider: "rgba(30, 25, 10, 0.12)",
    focus: "#1e190a",
    shadow: "0 10px 30px -14px rgba(30, 25, 10, 0.35)", // "none" disables
  }}
/>
```

Custom themes derive the row hover and high contrast colours with `color-mix()` and need a browser that supports it (all current evergreen browsers).

## Icons

`home grid sparkle pen book user mail search bag briefcase layers compass chat bell heart star calendar code play camera music globe sliders folder image bolt moon sun plus arrow`

Exported as `ICON_NAMES`, `ICON_MARKUP` (24x24 stroke SVG inner markup; elements with class `f` get a soft fill on the current item) and `ICON_TITLES`.

## Accessibility

* `<nav aria-label="Main">`, items are real links, the current one gets `aria-current="page"` (or `"location"` when it comes from scroll spy).
* Labels are always in the accessibility tree (visually hidden copy), even when collapsed.
* Focus rings use `:focus-visible` only. Keyboard focus expands the island and reveals labels.
* Mobile menu button exposes `aria-expanded` and `aria-controls`; the closed panel is `inert`; `Escape` closes it and returns focus to the button; clicking outside or scrolling more than 64px closes it.
* Keyboard activation of a section link moves focus to the section (temporary `tabindex="-1"`).
* Ctrl, Cmd, Shift, Alt and middle clicks are never hijacked.

## Server rendering

The component renders complete, correct markup on the server. Before hydration a container query (`@container`, mirrors `breakpoint` and `margin`) already shows the mobile or desktop state, so there is no layout jump. Layout effects fall back to `useEffect` on the server. React 18 or newer is required (`useId` provides the per instance CSS scope).

## Types

`DynamicIslandNavProps`, `NavItem`, `ImageSource`, `CustomColors`, `TransitionConfig`, `ThemeName`, `IconName`, `ThemeTokens` are exported from the package root.
