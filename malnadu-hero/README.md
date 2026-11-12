# Malnadu hero component

Rebuild of the Caspia (Framer) hero as a standalone component with pinned scroll interactions, horizontal spring drift, and dual-state text crossfades. Zero dependencies, no Framer runtime.

## Files
- `src/hero.js` : `createHero(element, options)` returns `{ destroy(), update(opts) }`
- `src/hero.css` : styles, themed with CSS variables (light cream & dark palettes)
- `react/MalnaduHero.jsx` : thin wrapper for React or Next.js (client component)
- `demo/index.html` : working example with light cream theme, pinned scroll track, and floating menu card clearance.
- `demo/fonts` : bundled `Lastik` and `Gabarito` webfonts matching the Malnadu Kitchen site.
- `demo/img` : test dish photos for demo.

## Features (matching Caspia Framer + Malnadu Kitchen)
- **Pinned scroll track**: Hero stays pinned while user scrolls through track (e.g. `280vh`–`300vh`), driving horizontal drift.
- **Damped spring physics**: Speed up and glide on page scroll and trackpad wheel with spring easing (`stiffness: 55, damping: 24`).
- **Dual-state text transitions**: Initial headline ("Taste of Telangana") smoothly rises & crossfades on scroll into the secondary philosophy statement ("Authentic Telangana dishes...").
- **Bottom clearance**: Configurable `bottomPad` (default `120px`) leaves generous breathing space for Malnadu Kitchen's floating menu card.
- **Card interactions**: Hover expands frame, uncovers more of the photo, dims sibling cards, reveals dish name & category.
- **Fit-width typography**: Line-by-line letter rise and color cycling through Telangana spice and cocoa shades.
- **Full responsiveness**: Breakpoint card sizing (desktop: 180px, tablet: 148px, phone: 96px).

## Usage
```html
<link rel="stylesheet" href="/hero/hero.css">
<section id="hero"></section>

<script type="module">
  import { createHero } from '/hero/hero.js';

  createHero(document.getElementById('hero'), {
    theme: 'light', // 'light' (default) | 'dark'
    pin: true,
    trackHeight: '280vh',
    bottomPad: 120, // space for floating menu card
    
    // State 1: Top of page
    eyebrow: 'Malnadu Kitchen · Kompally, Hyderabad',
    title: 'Taste of\nTelangana',
    subtitle: 'Authentic Telangana dishes prepared with regional spices, tradition, and passion in Kompally, Hyderabad.',
    proof: '4.5 on Google Maps (8,943 reviews)',
    
    // State 2: Appears gracefully on scroll
    eyebrow2: 'Our Culinary Heritage',
    title2: 'Authentic Telangana dishes\nprepared with regional spices,\ntradition, and passion.',
    subtitle2: 'Slow-cooked in claypots, hand-ground masalas, and recipes passed down generations in Kompally, Hyderabad.',
    proof2: 'Claypot Biryanis · Naatu Kodi Pulusu · Jowar Rotis',

    colors: ['#231916', '#762326', '#b4562f', '#8c282b'],
    items: [
      { src: '/img/dish.webp', alt: 'Dish name', title: 'Dish name', meta: 'Category', href: '#menu' }
    ],
    footer: {
      left: 'Claypot Biryanis',
      center: '',
      right: { label: 'Reserve a table', href: '#reserve' }
    },
  });
</script>
```

### Theming Variables
- `--mh-bg`: Background color (`#FAF6F0` in light theme, `#17100d` in dark)
- `--mh-text`: Primary text color (`#231916` in light theme)
- `--mh-muted`: Subtitle & meta color (`#67554C` in light theme)
- `--mh-eyebrow`: Eyebrow & accent color (`#762326`)
- `--mh-font-display`: Serif font family (e.g. `'Lastik', Georgia, serif`)
- `--mh-font-body`: Body font family (e.g. `'Gabarito', sans-serif`)
- `--mh-offset`: Fixed navbar height offset (e.g. `65px`)
- `--mh-bottom-pad`: Vertical clearance at the bottom of the hero stage (default `120px`)
