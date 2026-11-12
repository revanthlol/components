import type { SpringParams } from "./types";
import { clamp, clamp01, px, smoothstep } from "./utils";

/* -------------------------------------------------------------------------- */
/* Spring primitives                                                          */
/* -------------------------------------------------------------------------- */

/** A scalar spring: current value x, velocity v, target t. */
export class SpringValue {
  x: number;
  v = 0;
  t: number;
  constructor(initial = 0) {
    this.x = initial;
    this.t = initial;
  }
  /** Jump to the target without animating. */
  snap(): void {
    this.x = this.t;
    this.v = 0;
  }
}

/** One semi-implicit Euler step of a damped spring. */
export function stepSpring(s: SpringValue, p: SpringParams, dt: number): void {
  const accel = -p.k * (s.x - s.t) - p.c * s.v;
  s.v += (accel / p.m) * dt;
  s.x += s.v * dt;
}

/** True when the spring is close enough to its target (and slow enough) to be considered at rest. */
export function isAtRest(s: SpringValue, eps: number): boolean {
  return Math.abs(s.x - s.t) < eps && Math.abs(s.v) < eps * 20;
}

/* -------------------------------------------------------------------------- */
/* Engine inputs                                                              */
/* -------------------------------------------------------------------------- */

/** DOM nodes the engine writes to. Arrays are index-aligned with the items. */
export interface EngineElements {
  island: HTMLElement | null;
  shell: HTMLElement | null;
  pill: HTMLElement | null;
  div: HTMLElement | null;
  more: HTMLElement | null;
  panel: HTMLElement | null;
  /** <li> wrappers */
  lis: (HTMLElement | null)[];
  /** <a> / <span> item roots */
  items: (HTMLElement | null)[];
  labs: (HTMLElement | null)[];
  glyphs: (HTMLElement | null)[];
  boxes: (HTMLElement | null)[];
}

/** Geometry and behaviour model, supplied on every update. */
export interface EngineModel {
  n: number;
  item: number;
  pad: number[];
  gap: number;
  dg: number;
  logo: boolean;
  logoW: number;
  div: boolean;
  /** Extra width of each label (label width + padding - offset) */
  extras: number[];
  mobile: boolean;
  panelW: number;
  panelH: number;
  align: "Left" | "Center" | "Right";
  barH: number;
  radius: number;
  spring: SpringParams;
  elastic: number;
  reduced: boolean;
}

/** Target values the springs move toward. */
export interface EngineTargets {
  /** label expansion per item (0 or 1) */
  p: number[];
  /** item visibility per item (0 or 1) */
  c: number[];
  /** "more" button visibility (compact desktop) */
  m: number;
  /** mobile menu open amount */
  o: number;
  /** index of the item the highlight pill sits on, -1 for none */
  pill: number;
  /** 1 while the pill item is pressed */
  press: number;
  /** index used as the origin of staggered reveals */
  pivot: number;
}

interface Layout {
  xs: number[];
  ws: number[];
  leads: number[];
  moreLead: number;
  moreW: number;
  W: number;
  H: number;
}

/* -------------------------------------------------------------------------- */
/* Style writer with per-element cache                                        */
/* -------------------------------------------------------------------------- */

const styleCache = new WeakMap<HTMLElement, Record<string, string>>();

/** Writes an inline style property only when its value actually changed. */
function setStyle(el: HTMLElement, prop: string, value: string): void {
  let cache = styleCache.get(el);
  if (!cache) {
    cache = {};
    styleCache.set(el, cache);
  }
  if (cache[prop] !== value) {
    cache[prop] = value;
    (el.style as unknown as Record<string, string>)[prop] = value;
  }
}

/* -------------------------------------------------------------------------- */
/* Engine                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Imperative animation engine. React renders the structure once; this class drives every
 * animated property (island size, item widths and visibility, label reveal, pill position,
 * menu panel) with springs and writes them straight to the DOM on each frame, bypassing React.
 */
export class IslandEngine {
  els: EngineElements | null = null;
  model: EngineModel | null = null;

  /** label expansion springs, one per item */
  labelSprings: SpringValue[] = [];
  /** item visibility springs, one per item */
  itemSprings: SpringValue[] = [];
  more = new SpringValue();
  open = new SpringValue();
  pillL = new SpringValue();
  pillR = new SpringValue();
  pillAlpha = new SpringValue();
  press = new SpringValue();

  /** last requested visibility goal per item */
  goal: (number | undefined)[] = [];
  /** remaining stagger delay per item */
  wait: number[] = [];
  pill = -1;

  raf = 0;
  last = 0;
  prevWidth = -1;
  widthVel = 0;
  dead = false;
  visible = true;
  pending = false;

  /** "ghost" items are positioned absolutely while cross-fading out during a swap */
  ghost: boolean[] = [];
  ghostX: number[] = [];
  ghostW: number[] = [];
  /** previous width of the item that is swapping in */
  swapFrom: (number | undefined)[] = [];
  swapDir: number[] = [];

  clearSwap(): void {
    this.ghost.fill(false);
    this.swapFrom.fill(undefined);
  }

  /**
   * Applies new model + targets. `snap` skips the animation (first paint, layout switch).
   */
  update(els: EngineElements, model: EngineModel, targets: EngineTargets, snap: boolean): void {
    this.els = els;
    const prev = this.model;
    const structural = !prev || prev.n !== model.n || prev.mobile !== model.mobile;
    this.model = model;

    while (this.labelSprings.length < model.n)
      this.labelSprings.push(new SpringValue(targets.p[this.labelSprings.length] ?? 0));
    while (this.itemSprings.length < model.n)
      this.itemSprings.push(new SpringValue(targets.c[this.itemSprings.length] ?? 1));
    this.labelSprings.length = model.n;
    this.itemSprings.length = model.n;
    this.goal.length = model.n;
    this.wait.length = model.n;

    const pivot = targets.pivot >= 0 && targets.pivot < model.n ? targets.pivot : (model.n - 1) / 2;
    let maxDist = 0;
    for (let i = 0; i < model.n; i++) maxDist = Math.max(maxDist, Math.abs(i - pivot));

    // Detect "one item appears, one disappears" (the swap animation)
    let appearing = 0;
    let disappearing = 0;
    let appearIdx = -1;
    let disappearIdx = -1;
    for (let i = 0; i < model.n; i++) {
      const g = this.goal[i];
      if (g === undefined || targets.c[i] === g) continue;
      if (targets.c[i] > g) {
        appearing++;
        appearIdx = i;
      } else {
        disappearing++;
        disappearIdx = i;
      }
    }
    const simple = appearing <= 1 && disappearing <= 1;

    this.ghost.length = model.n;
    this.ghostX.length = model.n;
    this.ghostW.length = model.n;
    this.swapFrom.length = model.n;
    this.swapDir.length = model.n;

    const swap =
      !!prev &&
      !structural &&
      (model.mobile
        ? this.open.t === 0 && this.open.x < 0.02 && targets.o === 0
        : this.more.t === 1 && this.more.x > 0.98 && targets.m === 1) &&
      !snap &&
      !model.reduced &&
      appearing === 1 &&
      disappearing === 1;

    if (swap) {
      const lay = this.layout(false);
      this.ghost[disappearIdx] = true;
      this.ghostX[disappearIdx] = lay.xs[disappearIdx] ?? 0;
      this.ghostW[disappearIdx] = lay.ws[disappearIdx] ?? 0;
      this.swapFrom[disappearIdx] = undefined;
      this.ghost[appearIdx] = false;
      this.swapFrom[appearIdx] = lay.ws[disappearIdx] ?? 0;
      const dir = appearIdx > disappearIdx ? 1 : -1;
      this.swapDir[disappearIdx] = dir;
      this.swapDir[appearIdx] = dir;
    } else if (appearing + disappearing > 0) {
      this.clearSwap();
    }

    for (let i = 0; i < model.n; i++) {
      this.labelSprings[i].t = targets.p[i];
      const next = targets.c[i];
      if (this.goal[i] === undefined) {
        this.goal[i] = next;
        this.wait[i] = 0;
        this.itemSprings[i].t = next;
      } else if (next !== this.goal[i]) {
        this.goal[i] = next;
        const dist = Math.abs(i - pivot);
        const delay =
          model.reduced || simple
            ? 0
            : next > this.itemSprings[i].t
              ? dist * 0.018
              : (maxDist - dist) * 0.012;
        this.wait[i] = delay;
        if (delay <= 0) this.itemSprings[i].t = next;
      }
    }

    if (swap) {
      this.labelSprings[appearIdx].x = this.labelSprings[appearIdx].t;
      this.labelSprings[appearIdx].v = 0;
    }

    this.more.t = targets.m;
    this.open.t = targets.o;
    this.press.t = targets.press;

    const pillWasHidden = this.pill < 0 || this.pillAlpha.x < 0.05;
    this.pill = targets.pill;
    this.pillAlpha.t = +(targets.pill >= 0);

    if (structural || snap || model.reduced) {
      this.snapAll();
      return;
    }

    if (targets.pill >= 0 && pillWasHidden) {
      const lay = this.layout(false);
      this.pillL.x = this.pillL.t = lay.xs[targets.pill] ?? 0;
      this.pillR.x = this.pillR.t = (lay.xs[targets.pill] ?? 0) + (lay.ws[targets.pill] ?? 0);
      this.pillL.v = this.pillR.v = 0;
    }
    this.kick();
  }

  /** Jumps every spring to its target and paints immediately. */
  snapAll(): void {
    this.clearSwap();
    for (let i = 0; i < this.itemSprings.length; i++) {
      if (this.goal[i] !== undefined) this.itemSprings[i].t = this.goal[i] as number;
      this.wait[i] = 0;
    }
    for (const s of this.labelSprings) s.snap();
    for (const s of this.itemSprings) s.snap();
    this.more.snap();
    this.open.snap();
    this.pillAlpha.snap();
    this.press.snap();
    const lay = this.layout(false);
    if (this.pill >= 0 && this.pill < (this.model?.n ?? 0)) {
      this.pillL.t = lay.xs[this.pill];
      this.pillR.t = lay.xs[this.pill] + lay.ws[this.pill];
    }
    this.pillL.snap();
    this.pillR.snap();
    this.prevWidth = lay.W;
    this.widthVel = 0;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.last = 0;
    this.paint(lay);
  }

  /** Starts the animation loop if it is not running. */
  kick(): void {
    if (this.raf || this.dead) return;
    if (!this.visible) {
      this.pending = true;
      return;
    }
    this.last = 0;
    this.raf = requestAnimationFrame(this.tick);
  }

  /** Pauses the loop while the nav is off screen and resyncs when it returns. */
  setVisible(visible: boolean): void {
    if (this.visible === visible || this.dead) return;
    this.visible = visible;
    if (visible) {
      if (this.pending) {
        this.pending = false;
        if (this.model && this.els) this.snapAll();
      }
    } else {
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
        this.pending = true;
      }
      this.last = 0;
    }
  }

  stop(): void {
    this.dead = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /**
   * Computes item positions and island size from either the current spring values (useTarget=false)
   * or their targets (true).
   */
  layout(useTarget: boolean): Layout {
    const M = this.model as EngineModel;
    const val = (s: SpringValue) => (useTarget ? s.t : s.x);
    let cursor = M.pad[3];
    if (M.logo) cursor += M.logoW + M.dg + (M.div ? 1 + M.dg : 0);
    const xs: number[] = [];
    const ws: number[] = [];
    const leads: number[] = [];
    let seen = 0;
    for (let i = 0; i < M.n; i++) {
      if (this.ghost[i]) {
        xs.push(this.ghostX[i]);
        ws.push(this.ghostW[i]);
        leads.push(0);
        continue;
      }
      const vis = clamp01(val(this.itemSprings[i]));
      const lab = Math.max(0, val(this.labelSprings[i]));
      const lead = M.gap * Math.min(vis, seen);
      cursor += lead;
      xs.push(cursor);
      leads.push(lead);
      const full = M.item + lab * (M.extras[i] ?? 0);
      const from = this.swapFrom[i];
      const w = from === undefined ? vis * full : from + (full - from) * vis;
      ws.push(w);
      cursor += w;
      seen = Math.max(seen, from === undefined ? vis : 1);
    }
    let moreLead = 0;
    let moreW = 0;
    let W: number;
    let H = M.barH;
    if (M.mobile) {
      const base = cursor + M.gap + M.item + M.pad[1];
      const open = Math.max(0, val(this.open));
      W = base + (Math.max(base, M.panelW) - base) * open;
      H = M.barH + M.panelH * open;
    } else {
      const m = clamp01(val(this.more));
      moreLead = M.gap * Math.min(m, seen);
      cursor += moreLead;
      moreW = m * M.item;
      cursor += moreW;
      W = cursor + M.pad[1];
    }
    return { xs, ws, leads, moreLead, moreW, W, H };
  }

  allResting(): boolean {
    for (const w of this.wait) if (w > 0) return false;
    for (const s of this.labelSprings) if (!isAtRest(s, 0.0015)) return false;
    for (const s of this.itemSprings) if (!isAtRest(s, 0.0015)) return false;
    return (
      isAtRest(this.more, 0.0015) &&
      isAtRest(this.open, 0.0015) &&
      isAtRest(this.pillAlpha, 0.003) &&
      isAtRest(this.press, 0.002) &&
      isAtRest(this.pillL, 0.08) &&
      isAtRest(this.pillR, 0.08)
    );
  }

  /** Writes the current spring state to the DOM. */
  paint(lay: Layout): void {
    const els = this.els;
    const M = this.model;
    if (!els || !M) return;

    if (els.island) {
      setStyle(els.island, "width", px(lay.W));
      setStyle(els.island, "height", px(lay.H));
    }

    const shift = M.item * 0.38;
    for (let i = 0; i < M.n; i++) {
      const li = els.lis[i];
      const item = els.items[i];
      if (!li || !item) continue;
      const vis = clamp01(this.itemSprings[i].x);
      const isGhost = !!this.ghost[i];
      const from = this.swapFrom[i];
      const glyph = els.glyphs[i];
      const box = els.boxes ? els.boxes[i] : null;
      let shiftY = 0;
      let blur = 0;

      if (isGhost) {
        setStyle(li, "position", "absolute");
        setStyle(li, "left", px(this.ghostX[i]));
        setStyle(li, "top", px(M.pad[0]));
        setStyle(li, "marginLeft", "0px");
        setStyle(item, "width", px(this.ghostW[i]));
        setStyle(li, "opacity", smoothstep(0.5, 1, vis).toFixed(3));
        setStyle(li, "visibility", vis < 0.002 ? "hidden" : "");
        if (glyph) setStyle(glyph, "transform", "");
        shiftY = -(this.swapDir[i] || 1) * shift * (1 - vis);
        blur = (1 - vis) * 3;
      } else {
        setStyle(li, "position", "");
        setStyle(li, "left", "");
        setStyle(li, "top", "");
        setStyle(item, "width", px(lay.ws[i]));
        setStyle(li, "marginLeft", px(lay.leads[i]));
        if (from === undefined) {
          setStyle(li, "opacity", vis < 0.999 ? vis.toFixed(3) : "");
          setStyle(li, "visibility", vis < 0.002 ? "hidden" : "");
          if (glyph)
            setStyle(glyph, "transform", vis < 0.999 ? `scale(${(0.55 + 0.45 * vis).toFixed(3)})` : "");
        } else {
          setStyle(li, "opacity", smoothstep(0.22, 0.85, vis).toFixed(3));
          setStyle(li, "visibility", "");
          if (glyph) setStyle(glyph, "transform", "");
          shiftY = (this.swapDir[i] || 1) * shift * (1 - vis);
          blur = (1 - vis) * 3;
        }
      }
      if (box) {
        setStyle(box, "transform", Math.abs(shiftY) > 0.01 ? `translateY(${shiftY.toFixed(2)}px)` : "");
        setStyle(box, "filter", !M.reduced && blur > 0.04 ? `blur(${blur.toFixed(2)}px)` : "");
      }

      const lab = els.labs[i];
      if (lab) {
        const reveal = isGhost ? 1 : clamp01(this.labelSprings[i].x);
        setStyle(lab, "opacity", smoothstep(0.3, 1, reveal).toFixed(3));
        setStyle(lab, "transform", reveal < 0.999 ? `translateX(${((1 - reveal) * -6).toFixed(2)}px)` : "");
        setStyle(
          lab,
          "filter",
          !M.reduced && reveal > 0.01 && reveal < 0.985 ? `blur(${((1 - reveal) * 3).toFixed(2)}px)` : "",
        );
      }
    }

    if (els.more) {
      const m = clamp01(this.more.x);
      setStyle(els.more, "width", px(lay.moreW));
      setStyle(els.more, "marginLeft", px(lay.moreLead));
      setStyle(els.more, "opacity", m < 0.999 ? m.toFixed(3) : "");
      setStyle(els.more, "visibility", m < 0.002 && !M.mobile ? "hidden" : "");
    }

    if (els.pill) {
      const left = this.pillL.x;
      const right = this.pillR.x;
      const width = Math.max(0, right - left);
      let alpha = clamp01(this.pillAlpha.x);
      if (this.pill >= 0 && this.pill < M.n && this.swapFrom[this.pill] === undefined)
        alpha *= clamp01(this.itemSprings[this.pill].x);
      if (M.mobile) alpha *= 1 - clamp01(this.open.x * 1.6);
      const targetW = Math.max(1, this.pillR.t - this.pillL.t);
      const stretch = Math.max(0, width / targetW - 1);
      const press = M.reduced ? 0 : clamp01(this.press.x);
      const sy = (1 - Math.min(0.16, stretch * 0.32 * M.elastic)) * (1 - 0.07 * press);
      const sx = 1 - 0.035 * press;
      setStyle(els.pill, "width", px(width));
      setStyle(
        els.pill,
        "transform",
        `translate3d(${left.toFixed(2)}px,0,0)` +
          (sy < 0.999 || sx < 0.999 ? ` scale(${sx.toFixed(3)},${sy.toFixed(3)})` : ""),
      );
      setStyle(els.pill, "opacity", alpha.toFixed(3));
    }

    if (els.shell) {
      const squash = M.reduced || M.mobile ? 0 : M.elastic * 0.05 * Math.tanh(Math.abs(this.widthVel) / 900);
      setStyle(
        els.shell,
        "transform",
        squash > 0.0015 ? `scale(${(1 + squash * 0.3).toFixed(4)},${(1 - squash).toFixed(4)})` : "",
      );
    }

    if (els.div) setStyle(els.div, "opacity", M.mobile ? (1 - clamp01(this.open.x * 1.6)).toFixed(3) : "");

    if (els.panel && M.mobile) {
      const offset =
        M.align === "Center" ? (lay.W - M.panelW) / 2 : M.align === "Right" ? lay.W - M.panelW : 0;
      setStyle(els.panel, "transform", `translate3d(${offset.toFixed(2)}px,0,0)`);
      setStyle(els.panel, "visibility", this.open.x > 0.002 || this.open.t > 0 ? "" : "hidden");
    }
  }

  /** One animation frame. Sub-steps at 240 Hz for stability on slow frames. */
  tick = (ts: number): void => {
    this.raf = 0;
    const M = this.model;
    if (!M || !this.els || this.dead) return;

    let dt = this.last ? (ts - this.last) / 1000 : 1 / 60;
    this.last = ts;
    dt = clamp(dt, 0.001, 1 / 20);
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / steps;

    const base = M.spring;
    const el = M.elastic;
    const fastK = base.k * 1.6;
    const fast: SpringParams = { k: fastK, c: 2 * 0.82 * Math.sqrt(fastK * base.m), m: base.m };
    const softK = fastK * (1 - 0.62 * el);
    const soft: SpringParams = { k: softK, c: 2 * 0.86 * Math.sqrt(softK * base.m), m: base.m };
    const alphaSpring: SpringParams = { k: 520, c: 2 * Math.sqrt(520), m: 1 };
    const pressSpring: SpringParams = { k: 900, c: 2 * 0.62 * 30, m: 1 };
    const swapK = base.k * 0.5;
    const swapSpring: SpringParams = { k: swapK, c: 2 * 0.9 * Math.sqrt(swapK * base.m), m: base.m };

    for (let i = 0; i < this.itemSprings.length; i++) {
      if (this.wait[i] > 0) {
        this.wait[i] -= dt;
        if (this.wait[i] <= 0) {
          this.wait[i] = 0;
          this.itemSprings[i].t = this.goal[i] as number;
        }
      }
    }

    let lay = this.layout(false);
    for (let s = 0; s < steps; s++) {
      for (const sp of this.labelSprings) stepSpring(sp, base, h);
      for (let i = 0; i < this.itemSprings.length; i++)
        stepSpring(this.itemSprings[i], this.ghost[i] || this.swapFrom[i] !== undefined ? swapSpring : base, h);
      stepSpring(this.more, base, h);
      stepSpring(this.open, base, h);
      stepSpring(this.pillAlpha, alphaSpring, h);
      stepSpring(this.press, pressSpring, h);
      lay = this.layout(false);
      if (this.pill >= 0 && this.pill < M.n) {
        this.pillL.t = lay.xs[this.pill];
        this.pillR.t = lay.xs[this.pill] + lay.ws[this.pill];
      }
      // The leading edge moves with the fast spring, the trailing edge with the soft one (stretch effect).
      const delta = (this.pillL.t + this.pillR.t) / 2 - (this.pillL.x + this.pillR.x) / 2;
      if (delta > 0.5) {
        stepSpring(this.pillR, fast, h);
        stepSpring(this.pillL, soft, h);
      } else if (delta < -0.5) {
        stepSpring(this.pillL, fast, h);
        stepSpring(this.pillR, soft, h);
      } else {
        stepSpring(this.pillL, fast, h);
        stepSpring(this.pillR, fast, h);
      }
    }

    let swapEnded = false;
    for (let i = 0; i < M.n; i++) {
      if (this.ghost[i] && this.itemSprings[i].t <= 0 && this.itemSprings[i].x < 0.002) {
        this.ghost[i] = false;
        swapEnded = true;
      }
      if (
        this.swapFrom[i] !== undefined &&
        this.itemSprings[i].t >= 1 &&
        isAtRest(this.itemSprings[i], 0.0015)
      ) {
        this.swapFrom[i] = undefined;
        swapEnded = true;
      }
    }
    if (swapEnded) lay = this.layout(false);

    if (this.prevWidth >= 0) {
      const velocity = (lay.W - this.prevWidth) / dt;
      this.widthVel += (velocity - this.widthVel) * 0.35;
    }
    this.prevWidth = lay.W;

    if (this.allResting() && Math.abs(this.widthVel) < 4) {
      this.widthVel = 0;
      for (const s of this.labelSprings) s.snap();
      for (const s of this.itemSprings) s.snap();
      this.more.snap();
      this.open.snap();
      this.pillAlpha.snap();
      this.press.snap();
      this.pillL.snap();
      this.pillR.snap();
      this.clearSwap();
      lay = this.layout(false);
      this.paint(lay);
      this.last = 0;
      return;
    }

    this.paint(lay);
    this.raf = requestAnimationFrame(this.tick);
  };
}
