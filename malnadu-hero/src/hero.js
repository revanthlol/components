/*
 * Malnadu hero: arc gallery + scroll-driven horizontal drift + dual-state text transitions.
 * Pure standalone component. No Framer runtime, zero dependencies.
 * createHero(element, options) -> { destroy(), update(options) }
 */

const THEMES = {
  dark: ['#f4ead7', '#e2a93b', '#d4573a', '#e8c56e'],
  light: ['#231916', '#762326', '#b4562f', '#8c282b'],
};

const DEFAULTS = {
  theme: 'light',
  pin: true,
  trackHeight: '260vh',
  bottomPad: 120, // space at bottom for floating menu card to breathe
  eyebrow: 'Malnadu Kitchen · Kompally, Hyderabad',
  title: 'Taste of\nTelangana',
  subtitle: '★ 4.5 on Google Maps (8,943 reviews)',
  proof: '',
  eyebrow2: 'Our Culinary Heritage',
  title2: 'Authentic Telangana dishes\nprepared with regional spices,\ntradition, and passion.',
  subtitle2: 'Slow-cooked in seasoned claypots with hand-ground masalas in Kompally, Hyderabad.',
  proof2: 'Claypot Biryanis · Naatu Kodi Pulusu · Jowar Rotis',
  titleTag: 'h1',
  maxTitleSize: 260,
  items: [], // { src, srcset?, sizes?, alt, title?, meta?, href? }
  footer: null,
  colors: null,
  hold: 2.2,
  colorDuration: 0.8,
  cardWidth: { desktop: 180, tablet: 148, phone: 96 },
  cardRadius: 4,
  speed: 24, // drift speed in px/s
  scrollBoost: 0.9, // drift boost per px scrolled
  direction: 'right', // 'right' | 'left'
  arcHeight: 65, // arc peak % of half-height
  centreZoom: 0.22,
  hoverLift: 0.14,
  reveal: 0.65,
  dimOpacity: 0.55,
  tilt: 0,
  introDelay: 0.2,
  noise: true,
};

const rand = (n) => { const t = Math.sin(n * 127.1 + 311.7) * 43758.5453; return t - Math.floor(t); };
const mod = (a, b) => (b <= 0 ? 0 : ((a % b) + b) % b);
const bell = (t) => 0.5 * (1 + Math.cos(Math.PI * Math.min(Math.abs(t), 1)));
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

function chars(text, startIndex, stepSec, baseDelay) {
  const frag = document.createDocumentFragment();
  let i = startIndex;
  text.split(/(\s+)/).forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) { frag.append(' '); return; }
    const w = el('span', 'mh-word');
    for (const c of Array.from(part)) {
      const outer = el('span', 'mh-ch');
      const inner = el('span', null, c);
      inner.style.setProperty('--d', `${(baseDelay + i++ * stepSec).toFixed(3)}s`);
      outer.append(inner);
      w.append(outer);
    }
    frag.append(w);
  });
  return { frag, next: i };
}

function words(cls, text, base) {
  const p = el('p', cls);
  let i = 0;
  text.split(/\s+/).filter(Boolean).forEach((w) => {
    const s = el('span', 'mh-w', w);
    s.style.setProperty('--d', `${(base + i++ * 0.03).toFixed(2)}s`);
    p.append(s, ' ');
  });
  return p;
}

export function createHero(root, userOptions = {}) {
  let o, stage, cards = [], raf = 0, visible = true, hovered = null, destroyed = false;
  let W = 0, H = 0, cw = 180, ch = 135, loop = 1;
  let raw = 0, pos = 0, vel = 0, last = 0, lastScroll = 0;
  let smoothProgress = 0, trackProgress = 0;
  let colorTimer = 0, colorIdx = 0;
  let wheelDelta = 0;
  let state1El = null, state2El = null, title1El = null, title2El = null;

  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];

  function build() {
    root.replaceChildren();
    root.classList.remove('mh-ready', 'mh-hero', 'mh-track');

    if (o.pin) {
      root.classList.add('mh-track');
      root.style.height = typeof o.trackHeight === 'number' ? `${o.trackHeight}px` : o.trackHeight;
      stage = el('div', 'mh-hero mh-sticky');
      root.append(stage);
    } else {
      root.classList.add('mh-hero');
      root.style.height = '';
      stage = root;
    }

    stage.dataset.theme = o.theme;
    if (o.noise) stage.append(el('div', 'mh-noise'));

    // Gallery
    const gallery = el('div', 'mh-gallery');
    gallery.setAttribute('role', 'list');
    cards = o.items.map((it, i) => {
      const card = el(it.href ? 'a' : 'div', 'mh-card');
      card.setAttribute('role', 'listitem');
      if (it.href) {
        card.href = it.href;
        card.setAttribute('aria-label', it.alt || it.title || '');
      }
      const frame = el('div', 'mh-frame');
      frame.style.borderRadius = `${o.cardRadius}px`;
      const img = el('img');
      img.src = it.src;
      img.alt = it.alt || it.title || '';
      if (it.srcset) img.srcset = it.srcset;
      if (it.sizes) img.sizes = it.sizes;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      frame.append(img);

      const label = el('div', 'mh-label');
      label.append(el('span', null, it.title || ''), el('span', null, it.meta || ''));
      card.append(frame, label);

      const c = {
        it,
        card,
        frame,
        img,
        label,
        h: 0,
        dim: 1,
        base: 0,
        sign: i % 2 ? 1 : -1,
        swing: 0.8 + rand(i * 2.17) * 0.35,
        tilt: (rand(i * 9.71) * 2 - 1) * o.tilt,
      };

      card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = i; });
      card.addEventListener('pointerleave', () => { if (hovered === i) hovered = null; });
      card.addEventListener('focus', () => { hovered = i; });
      card.addEventListener('blur', () => { if (hovered === i) hovered = null; });
      gallery.append(card);
      return c;
    });
    stage.append(gallery);

    // Center Copy Container
    const copy = el('div', 'mh-copy');
    if (o.bottomPad) {
      copy.style.transform = `translateY(${(-o.bottomPad / 2).toFixed(1)}px)`;
    }

    // State 1: Primary Initial Headline (Taste of Telangana)
    state1El = el('div', 'mh-state mh-state-1');
    if (o.eyebrow) state1El.append(el('p', 'mh-eyebrow', o.eyebrow));
    title1El = el(o.titleTag, 'mh-title mh-title-1');
    title1El.setAttribute('aria-label', o.title.replace(/\n/g, ' '));
    const inner1 = el('span');
    inner1.setAttribute('aria-hidden', 'true');
    let idx1 = 0;
    o.title.split('\n').forEach((line) => {
      const l = el('span', 'mh-line');
      const r = chars(line, idx1, 0.05, o.introDelay);
      idx1 = r.next;
      l.append(r.frag);
      inner1.append(l);
    });
    title1El.append(inner1);
    state1El.append(title1El);
    if (o.subtitle) state1El.append(words('mh-sub', o.subtitle, o.introDelay + 0.5));
    if (o.proof) state1El.append(words('mh-proof', o.proof, o.introDelay + 0.8));
    copy.append(state1El);

    // State 2: Scrolled Philosophy Statement (Authentic Telangana dishes...)
    if (o.title2) {
      state2El = el('div', 'mh-state mh-state-2');
      if (o.eyebrow2 || o.eyebrow) state2El.append(el('p', 'mh-eyebrow', o.eyebrow2 || o.eyebrow));
      title2El = el('h2', 'mh-title mh-title-2');
      title2El.setAttribute('aria-label', o.title2.replace(/\n/g, ' '));
      if (o.title2.includes('\n')) {
        title2El.innerHTML = o.title2.split('\n').map((l) => `<span class="mh-line-wrap">${l}</span>`).join('');
      } else {
        title2El.textContent = o.title2;
      }
      state2El.append(title2El);
      if (o.subtitle2) state2El.append(words('mh-sub', o.subtitle2, 0.2));
      if (o.proof2) state2El.append(words('mh-proof', o.proof2, 0.4));
      copy.append(state2El);
    }
    stage.append(copy);

    // Footer Bar
    const f = o.footer || {};
    if (f.left || f.center || f.right) {
      const bar = el('footer', 'mh-bar');
      bar.append(el('span', null, f.left || ''));
      if (f.center) bar.append(el('span', null, f.center));
      const right = el('span');
      if (f.right && typeof f.right === 'object') {
        const a = el('a', null, f.right.label);
        a.href = f.right.href;
        right.append(a);
      } else if (f.right) {
        right.textContent = f.right;
      }
      bar.append(right);
      stage.append(bar);
    }

    stage.style.setProperty('--mh-color-dur', `${o.colorDuration}s`);
    stage.__title1 = title1El;
    stage.__copy = copy;

    // Passive wheel event listener
    const onWheel = (e) => {
      wheelDelta += e.deltaY;
    };
    stage.addEventListener('wheel', onWheel, { passive: true });
    cleanups.push(() => stage.removeEventListener('wheel', onWheel));
  }

  function cardWidthNow() {
    const w = stage.clientWidth;
    const c = o.cardWidth;
    return typeof c === 'number' ? c : w >= 1200 ? c.desktop : w >= 810 ? c.tablet : c.phone;
  }

  function measure() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    cw = cardWidthNow();
    ch = cw * 0.75;
    loop = W + cw * 2;
    const a = loop / Math.max(cards.length, 1);
    cards.forEach((c, i) => {
      c.base = i * a + rand(i * 5.3) * a * 0.35;
      c.card.style.width = `${cw}px`;
      c.card.style.height = `${ch}px`;
    });
    fitTitles();
  }

  function fitTitles() {
    const copy = stage.__copy;
    if (!copy || copy.clientWidth <= 0) return;
    const availableWidth = copy.clientWidth;

    // Title 1 fit width
    if (title1El) {
      title1El.style.fontSize = '100px';
      let widest1 = 0;
      title1El.querySelectorAll('.mh-line').forEach((l) => {
        widest1 = Math.max(widest1, l.getBoundingClientRect().width);
      });
      if (widest1 > 0) {
        title1El.style.fontSize = `${Math.min(o.maxTitleSize, (100 * availableWidth) / widest1).toFixed(2)}px`;
      }
    }
  }

  function updateTextTransition() {
    if (!state2El) return;

    // Transition window: starts right as user scrolls (0.02) and completes by 0.22
    const startFade = 0.02;
    const endFade = 0.22;
    const t = Math.max(0, Math.min(1, (smoothProgress - startFade) / (endFade - startFade)));

    // State 1 gracefully lifts and fades out
    state1El.style.opacity = (1 - t).toFixed(3);
    state1El.style.transform = `translateY(${(-t * 36).toFixed(1)}px)`;
    state1El.style.pointerEvents = t > 0.5 ? 'none' : 'auto';

    // State 2 smoothly rises from below
    state2El.style.opacity = t.toFixed(3);
    state2El.style.transform = `translateY(${((1 - t) * 36).toFixed(1)}px)`;
    state2El.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
  }

  function render(dt) {
    const k = Math.min(1, dt * 11);
    const N = (1 + o.hoverLift) / (1 + o.hoverLift * (1 - o.reveal));
    const pad = o.bottomPad || 0;
    const centerY = (H - pad) / 2;

    cards.forEach((c, i) => {
      const x = mod(c.base + pos, loop) - cw;
      const prox = bell((x + cw / 2 - W / 2) / Math.max(W / 2, 1));
      const y = centerY + c.sign * prox * (o.arcHeight / 100) * centerY * c.swing - ch / 2;

      c.h += ((hovered === i ? 1 : 0) - c.h) * k;
      c.dim += ((hovered !== null && hovered !== i ? o.dimOpacity : 1) - c.dim) * k;
      const s = (1 + prox * o.centreZoom) * (1 + c.h * o.hoverLift);

      c.card.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${c.tilt.toFixed(2)}deg)`;
      c.card.style.opacity = c.dim.toFixed(3);
      c.card.style.zIndex = String(Math.round(prox * 100) + (c.h > 0.01 ? 200 : 0));
      c.frame.style.transform = `scale(${s.toFixed(4)})`;
      c.img.style.transform = `scale(${(N + c.h * (1 - N)).toFixed(4)})`;

      if (c.h > 0.002) {
        c.label.style.opacity = c.h.toFixed(3);
        c.label.style.left = `${(cw * (1 - s)) / 2}px`;
        c.label.style.width = `${cw * s}px`;
        c.label.style.top = `${(ch * (1 + s)) / 2 + 10}px`;
        c.label.style.transform = `translateY(${(1 - c.h) * 6}px)`;
      } else {
        c.label.style.opacity = '0';
      }
    });

    updateTextTransition();
  }

  function tick(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;

    // Track scroll position
    const sy = window.scrollY;
    let ds = sy - lastScroll;
    lastScroll = sy;

    // Calculate scroll progress within track
    if (o.pin && root.classList.contains('mh-track')) {
      const rect = root.getBoundingClientRect();
      const totalScroll = rect.height - window.innerHeight;
      if (totalScroll > 0) {
        // -rect.top is the scrolled distance through this track
        const scrolled = Math.max(0, -rect.top);
        trackProgress = Math.min(1, scrolled / totalScroll);
      }
    } else {
      // Standalone hero progress
      trackProgress = Math.max(0, Math.min(1, sy / Math.max(window.innerHeight * 0.7, 1)));
    }

    // Smooth progress interpolation for graceful text crossfade
    smoothProgress += (trackProgress - smoothProgress) * Math.min(1, dt * 14);

    // If native page scroll didn't move window.scrollY (e.g. pinned edge or wheeling in place), use wheelDelta
    if (Math.abs(ds) < 0.2 && Math.abs(wheelDelta) > 0.1) {
      ds += wheelDelta * 0.55;
    }
    wheelDelta *= 0.8; // rapid friction damping

    const dir = o.direction === 'left' ? -1 : 1;
    if (!mqReduce.matches) {
      raw += (o.speed * dt + o.scrollBoost * ds) * dir;
    }

    // Damped spring simulation matching Framer Motion (stiffness: 55, damping: 24)
    vel += ((raw - pos) * 55 - vel * 24) * dt;
    pos += vel * dt;

    render(dt);
    raf = visible ? requestAnimationFrame(tick) : 0;
  }

  function start() {
    if (raf || destroyed) return;
    last = performance.now();
    lastScroll = window.scrollY;
    raf = requestAnimationFrame(tick);
  }

  function cycleColors() {
    clearTimeout(colorTimer);
    const colors = o.colors || THEMES[o.theme] || THEMES.light;
    const title = stage.__title1;
    if (!title) return;
    title.style.color = colors[colorIdx % colors.length];
    if (colors.length < 2 || mqReduce.matches) return;

    colorTimer = setTimeout(function step() {
      if (destroyed) return;
      if (visible && !document.hidden) {
        colorIdx = (colorIdx + 1) % colors.length;
        title.style.color = colors[colorIdx];
      }
      colorTimer = setTimeout(step, (o.hold + o.colorDuration) * 1000);
    }, o.hold * 1000);
  }

  function init(opts) {
    o = { ...DEFAULTS, ...opts, footer: { ...DEFAULTS.footer, ...(opts.footer || {}) } };
    build();
    measure();
    render(0.016);
    cycleColors();
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('mh-ready')));
  }

  init(userOptions);

  const ro = new ResizeObserver(() => {
    measure();
    render(0.016);
  });
  ro.observe(stage);
  cleanups.push(() => ro.disconnect());

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) start();
  }, { threshold: 0 });
  io.observe(stage);
  cleanups.push(() => io.disconnect());

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (!destroyed) fitTitles(); });
  }

  start();

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(colorTimer);
      cleanups.forEach((fn) => fn());
      root.replaceChildren();
      root.classList.remove('mh-hero', 'mh-ready', 'mh-track');
    },
    update(next) {
      init({ ...o, ...next });
      measure();
    },
  };
}
