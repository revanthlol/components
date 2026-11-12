# Testimonials carousel

Rebuilt from the Framer export (HAR + SSR HTML). Both versions share one stylesheet and behave the same:
line-by-line blur reveal, spring avatar, 6s autoplay with progress bars, arrows, click-to-jump.
No dependencies (the React one needs React 17+).

```
testimonials/
  testimonials.css      shared styles + CSS variables
  testimonials.js       vanilla version (plain <script>, also CommonJS)
  Testimonials.tsx      React / Next.js version
  demo.html             working vanilla example
  assets/avatars/       the 4 portraits pulled from the HAR (AVIF)
  assets/fonts/         Inter 400 + 400 italic (latin), pulled from the HAR
```

## Vanilla

```html
<link rel="stylesheet" href="testimonials.css">
<div id="testimonials"></div>

<script src="testimonials.js"></script>
<script>
  const t = new Testimonials("#testimonials", {
    items: [
      { quote: "...", name: "Name", byline: "Role, Company", image: "assets/avatars/olivia-bennett.avif" },
    ],
  });
  // t.next(); t.prev(); t.goTo(2); t.destroy();
</script>
```

## React / Next.js

```tsx
import Testimonials from "@/components/testimonials/Testimonials";

<Testimonials
  testimonials={[
    { quote: "...", name: "Name", byline: "Role, Company", image: "/avatars/name.avif" },
  ]}
/>
```

It already has `"use client"` and imports `testimonials.css`. Keep `assets/fonts` next to the CSS, or fix the two
`url()` paths at the top of the CSS. In Next, put avatars in `public/`.

## Options (same names in both)

| option | default | |
| --- | --- | --- |
| `autoplay` | `true` | |
| `duration` | `6` | seconds per slide |
| `pauseOnHover` | `false` | matches the Framer instance |
| `respectReducedMotion` | `true` | disables autoplay and animation |
| `showArrows`, `showProgress` | `true` | |
| `ariaLabel`, `labels` | English | screen reader strings |
| `lineDuration`, `lineStagger`, `lineOffset`, `blurAmount`, `authorDelay` | `.7`, `.1`, `20`, `8`, `.2` | reveal tuning |

Item fields: `quote`, `name`, `byline`, `image` (string or `{ src, srcSet }`), `alt`, `imageZoom` (1 to 3),
`focalX`, `focalY` (0 to 100), `imageFit` (`cover` | `contain`). Without an image you get initials.

## Styling

Everything is a CSS variable on `.tc`. Set them on the container or via `style` / `className`:

```css
.my-testimonials {
  --tc-accent: #ed4024;        /* progress fill, focus ring */
  --tc-quote-color: #f9f6f4;
  --tc-name-color: #b7a095;
  --tc-quote-size: 40px;
  --tc-avatar: 80px;
  --tc-quote-author-gap: 80px;
}
```

Full list is at the top of `testimonials.css`. The component is transparent and fills its parent, so size it
with a wrapper (the Framer page used `width: 66%`).

## Notes

- The quotes and people in the demo are the Framer template's placeholder text. Replace them with real ones.
- Below 720px the type scales down (quote 26px, avatar 56px). Desktop values are the Framer originals.
- Line spacing is 1.12em, same as the original. It comes from collapsing margins on the reveal lines. For exact
  `line-height`, add `.tc__overlay { display: flex; flex-direction: column; }` and expect the quote to look tighter.
- The Framer file's accessibility labels were German; the defaults here are English. Pass `labels` to change them.
- Autoplay pauses on keyboard focus, off-screen and hidden tabs. A mouse click on an arrow does not pause it.
- Needs Web Animations API + `ResizeObserver` (all current browsers).
