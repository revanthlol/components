import * as React from "react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { PANEL_MAX_WIDTH } from "./defaults";
import { IslandEngine, type EngineElements, type EngineModel, type EngineTargets } from "./engine";
import { resolveConfig, type ResolvedConfig } from "./normalize";
import { NavView, type ViewBindings, type ViewState } from "./NavView";
import type { DynamicIslandNavProps } from "./types";
import { sameWidths } from "./utils";

/** Layout effect on the client, plain effect on the server (avoids the SSR warning). */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const DEFAULT_FONT: React.CSSProperties = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: "14px",
  fontStyle: "normal",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  lineHeight: "1.2em",
};

/** Unique, CSS-safe class name per instance (needs React 18+, falls back to a shared name on React 17). */
function useScope(): string {
  const useId = (React as unknown as { useId?: () => string }).useId;
  return "lis-" + (useId ? useId() : "x").replace(/[^a-zA-Z0-9_-]/g, "");
}

const normPath = (p: string) => p.replace(/\/+$/, "") || "/";

/** Finds a section by element id, falling back to a case-insensitive data-framer-name match. */
function findSection(id: string): HTMLElement | null {
  if (!id || typeof document === "undefined") return null;
  const byId = document.getElementById(id);
  if (byId) return byId;
  try {
    const esc = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id.replace(/["\\]/g, "\\$&");
    return document.querySelector(`[data-framer-name="${esc}" i]`);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Live (interactive) nav                                                     */
/* -------------------------------------------------------------------------- */

function LiveNav({ cfg }: { cfg: ResolvedConfig }) {
  const scope = useScope();
  const count = cfg.items.length;

  /* ---- state ---- */
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [labIdxDelayed, setLabIdxDelayed] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [islandHover, setIslandHover] = useState(false);
  const [islandFocus, setIslandFocus] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rootW, setRootW] = useState(0);
  const [slotW, setSlotW] = useState(0);
  const [logoW, setLogoW] = useState(0);
  const [pressIdx, setPressIdx] = useState<number | null>(null);
  const [labelW, setLabelW] = useState<number[] | null>(null);
  const [panelH, setPanelH] = useState(0);
  const [clickIdx, setClickIdx] = useState<number | null>(null);
  const [routeIdx, setRouteIdx] = useState<number | null>(null);
  const [sectionIdx, setSectionIdx] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const [live, setLive] = useState(false);

  /* ---- refs: DOM ---- */
  const rootRef = useRef<HTMLElement | null>(null);
  const slotRef = useRef<HTMLElement | null>(null);
  const islandRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLElement | null>(null);
  const divRef = useRef<HTMLElement | null>(null);
  const moreRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLElement | null>(null);
  const liRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const labRefs = useRef<(HTMLElement | null)[]>([]);
  const glyphRefs = useRef<(HTMLElement | null)[]>([]);
  const boxRefs = useRef<(HTMLElement | null)[]>([]);

  /* ---- refs: engine, timers, mirrors ---- */
  const engineRef = useRef<IslandEngine | null>(null);
  if (!engineRef.current) engineRef.current = new IslandEngine();
  const hoverIdxRef = useRef<number | null>(null);
  const labTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreOpenRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number; t: number; ev: Event | null }>({
    x: -1,
    y: -1,
    t: -1e9,
    ev: null,
  });
  const armedRef = useRef({ armed: true, x: -1, y: -1 });
  const lastModeRef = useRef<string | null>(null);
  const modeChangedAtRef = useRef(0);
  const sectionIdsRef = useRef<string[]>([]);
  const pendingNavRef = useRef<{ i: number; until: number } | null>(null);
  const spyRefreshRef = useRef<(() => void) | null>(null);
  const lastPointerTypeRef = useRef("");
  const menuOpenRef = useRef(false);
  const menuScrollYRef = useRef(0);
  const scrolledDownRef = useRef(false);
  const prevMobileRef = useRef<boolean | null>(null);

  hoverIdxRef.current = hoverIdx;
  menuOpenRef.current = menuOpen;
  moreOpenRef.current = moreOpen;

  /* ---- derived values ---- */
  const baseActive = cfg.active >= 1 && cfg.active <= count ? cfg.active - 1 : -1;
  const spyIdx = sectionIdx !== null && sectionIdx < count ? sectionIdx : null;
  const activeIdx =
    clickIdx !== null && clickIdx < count
      ? clickIdx
      : spyIdx === null
        ? routeIdx !== null && routeIdx < count
          ? routeIdx
          : baseActive
        : spyIdx;
  const curKind: "page" | "location" = clickIdx === null && spyIdx !== null ? "location" : "page";

  const extras = (labelW || []).map((w) => w + cfg.lp - cfg.lo);
  const maxExtra = extras.length ? Math.max(...extras) : 0;
  const availW = slotW > 0 ? slotW : Math.max(0, rootW - cfg.margin[1] - cfg.margin[3]);
  const hasLogo =
    cfg.logo.type === "Text" ? cfg.logo.text.trim() !== "" : cfg.logo.type === "Image" && !!cfg.logo.image;
  const logoWidth = logoW > 0 ? logoW : cfg.item;
  const logoBlock = hasLogo ? logoWidth + cfg.dg + (count > 0 ? 1 + cfg.dg : 0) : 0;
  const labelsTotal = cfg.allLabels ? extras.reduce((a, b) => a + b, 0) : maxExtra;
  const fullWidth =
    cfg.pad[3] + logoBlock + count * cfg.item + Math.max(0, count - 1) * cfg.gap + labelsTotal + cfg.pad[1];
  const measured = labelW !== null && rootW > 0;
  /** true = mobile, false = desktop, null = unknown until measured */
  const mobileState: boolean | null =
    cfg.layout === "Mobile" ? true : cfg.layout === "Desktop" ? false : measured ? rootW < cfg.bp || fullWidth > availW + 0.5 : null;
  const isMobile = mobileState === true;
  const isCompact =
    !isMobile && cfg.compact && scrolledDown && !moreOpen && !islandFocus && !(cfg.expand === "Hover" && islandHover);
  const panelW = Math.min(PANEL_MAX_WIDTH, Math.max(0, availW));

  let pillIdx: number;
  let labIdx: number;
  if (isMobile) {
    pillIdx = menuOpen ? -1 : activeIdx;
    labIdx = menuOpen ? -1 : activeIdx;
  } else if (isCompact) {
    pillIdx = activeIdx;
    labIdx = activeIdx;
  } else {
    pillIdx = hoverIdx ?? focusIdx ?? activeIdx;
    labIdx = labIdxDelayed ?? focusIdx ?? activeIdx;
  }

  const viewState: ViewState = {
    mobile: mobileState,
    compact: isCompact,
    open: isMobile && menuOpen,
    activeIdx,
    labIdx,
    pillIdx,
    hoverIdx: hoverIdx ?? -1,
    live,
    panel: isMobile,
    allLabels: cfg.allLabels && !isMobile,
    panelW: isMobile && panelW > 0 ? panelW : undefined,
    curKind,
  };

  /* ---- measure + push state to the engine after every render ---- */
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;

    const rw = root.getBoundingClientRect().width;
    const sw = slotRef.current ? slotRef.current.getBoundingClientRect().width : 0;
    const lw = logoRef.current ? logoRef.current.getBoundingClientRect().width : 0;
    if (Math.abs(rw - rootW) > 0.5 || Math.abs(sw - slotW) > 0.5 || Math.abs(lw - logoW) > 0.25) {
      setRootW(rw);
      setSlotW(sw);
      setLogoW(lw);
      return;
    }

    const widths: number[] = [];
    const kids = measure.children;
    for (let i = 0; i < count; i++) {
      const kid = kids[i];
      widths.push(kid ? Math.ceil(kid.getBoundingClientRect().width * 4) / 4 : 0);
    }
    if (!sameWidths(labelW, widths)) {
      setLabelW(widths);
      return;
    }

    if (isMobile && panelRef.current) {
      const h = panelRef.current.offsetHeight;
      if (Math.abs(h - panelH) > 0.5) {
        setPanelH(h);
        return;
      }
    }

    if (mobileState === null) return;

    const engine = engineRef.current as IslandEngine;
    const model: EngineModel = {
      n: count,
      item: cfg.item,
      pad: cfg.pad,
      gap: cfg.gap,
      dg: cfg.dg,
      logo: hasLogo,
      logoW: hasLogo ? logoWidth : 0,
      div: hasLogo && count > 0 && !(isMobile && activeIdx < 0),
      extras,
      mobile: isMobile,
      panelW,
      panelH,
      align: cfg.align,
      barH: cfg.barH,
      radius: cfg.radius,
      spring: cfg.spring,
      elastic: cfg.elastic,
      reduced,
    };
    const targets: EngineTargets = {
      p: cfg.items.map((_, i) => (i === labIdx || (cfg.allLabels && !isMobile) ? 1 : 0)),
      c: cfg.items.map((_, i) => (isMobile ? +(i === activeIdx && !menuOpen) : isCompact ? +(i === activeIdx) : 1)),
      m: !isMobile && isCompact ? 1 : 0,
      o: isMobile && menuOpen ? 1 : 0,
      pill: pillIdx,
      press: +(pressIdx !== null && pressIdx === pillIdx && !isMobile),
      pivot: activeIdx,
    };
    const els: EngineElements = {
      island: islandRef.current,
      shell: shellRef.current,
      pill: pillRef.current,
      div: divRef.current,
      more: moreRef.current,
      panel: panelRef.current,
      lis: liRefs.current.slice(0, count),
      items: itemRefs.current.slice(0, count),
      labs: labRefs.current.slice(0, count),
      glyphs: glyphRefs.current.slice(0, count),
      boxes: boxRefs.current.slice(0, count),
    };
    const modeChanged = prevMobileRef.current !== isMobile;
    prevMobileRef.current = isMobile;
    engine.update(els, model, targets, !live || modeChanged);
    if (!live) setLive(true);
  });

  /* ---- observe sizes (root, slot, logo, label measurements, fonts) ---- */
  useEffect(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    let raf = 0;
    const readLabels = () => {
      const arr: number[] = [];
      if (measure)
        for (let i = 0; i < measure.children.length; i++)
          arr.push(Math.ceil(measure.children[i].getBoundingClientRect().width * 4) / 4);
      return arr;
    };
    const ro = new ResizeObserver(() => {
      raf ||= requestAnimationFrame(() => {
        raf = 0;
        const w = root.getBoundingClientRect().width;
        setRootW((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
        const slot = slotRef.current;
        if (slot) {
          const sw = slot.getBoundingClientRect().width;
          setSlotW((prev) => (Math.abs(prev - sw) > 0.5 ? sw : prev));
        }
        const logo = logoRef.current;
        const lw = logo ? logo.getBoundingClientRect().width : 0;
        setLogoW((prev) => (Math.abs(prev - lw) > 0.25 ? lw : prev));
        if (measure) {
          const arr = readLabels();
          setLabelW((prev) => (sameWidths(prev, arr) ? prev : arr));
        }
      });
    });
    ro.observe(root);
    if (measure) for (let i = 0; i < measure.children.length; i++) ro.observe(measure.children[i]);
    const logoEl = logoRef.current;
    if (logoEl) ro.observe(logoEl);
    const fonts = document.fonts;
    let alive = true;
    if (fonts && fonts.ready)
      fonts.ready.then(() => {
        if (!alive || !measure) return;
        const arr = readLabels();
        setLabelW((prev) => (sameWidths(prev, arr) ? prev : arr));
      });
    return () => {
      alive = false;
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count, cfg.logo.type, cfg.logo.image, cfg.logo.text]);

  /* ---- menu panel height ---- */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const h = panel.offsetHeight;
      setPanelH((prev) => (Math.abs(prev - h) > 0.5 ? h : prev));
    });
    ro.observe(panel);
    return () => ro.disconnect();
  }, [isMobile, count]);

  /* ---- closed menu panel must not be focusable ---- */
  useEffect(() => {
    const panel = panelRef.current;
    if (panel) panel.toggleAttribute("inert", !(isMobile && menuOpen));
  }, [isMobile, menuOpen]);

  /* ---- pause the animation loop while off screen ---- */
  useEffect(() => {
    const root = rootRef.current;
    const engine = engineRef.current;
    if (!root || !engine || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      if (last) engine.setVisible(last.isIntersecting);
    });
    io.observe(root);
    return () => {
      io.disconnect();
      engine.setVisible(true);
    };
  }, []);

  /* ---- prefers-reduced-motion ---- */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  /* ---- current route detection (links to the current page become active) ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastHref = window.location.href;
    const detect = () => {
      const loc = window.location;
      if (loc.href !== lastHref) {
        lastHref = loc.href;
        setClickIdx(null);
      }
      let found: number | null = null;
      for (let i = 0; i < cfg.items.length && found === null; i++) {
        const href = cfg.items[i].href;
        if (!href) continue;
        try {
          const u = new URL(href, loc.href);
          if (u.origin !== loc.origin || normPath(u.pathname) !== normPath(loc.pathname) || (u.hash && u.hash !== loc.hash))
            continue;
          found = i;
        } catch {
          /* ignore invalid URLs */
        }
      }
      setRouteIdx(found);
    };
    detect();
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    const delayed = () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      t1 = setTimeout(detect, 80);
      t2 = setTimeout(detect, 500);
    };
    window.addEventListener("popstate", detect);
    window.addEventListener("hashchange", detect);
    document.addEventListener("click", delayed, true);
    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      window.removeEventListener("popstate", detect);
      window.removeEventListener("hashchange", detect);
      document.removeEventListener("click", delayed, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.items.map((it) => it.href).join("\n")]);

  /* ---- scroll spy: which section fills the screen ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loc = window.location;
    const ids = cfg.items.map((it) => {
      if (it.section) return it.section;
      if (!it.href) return "";
      try {
        const u = new URL(it.href, loc.href);
        if (u.origin === loc.origin && normPath(u.pathname) === normPath(loc.pathname) && u.hash.length > 1)
          return decodeURIComponent(u.hash.slice(1));
      } catch {
        /* ignore */
      }
      return "";
    });
    sectionIdsRef.current = ids;
    if (!ids.some(Boolean)) {
      setSectionIdx(null);
      return;
    }

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    /** last committed index (undefined = nothing committed yet) */
    let committed: number | null | undefined;
    let candidate: number | null | undefined;
    let candidateSince = 0;

    const commit = (idx: number | null) => {
      committed = idx;
      candidate = undefined;
      setSectionIdx((prev) => (prev === idx ? prev : idx));
    };

    const measure = () => {
      raf = 0;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const sy = window.scrollY || 0;
      const atBottom = sy > 0 && Math.ceil(sy + vh) >= document.documentElement.scrollHeight - 2;
      const cover: number[] = [];
      const tops: number[] = [];
      for (let i = 0; i < ids.length; i++) {
        const el = findSection(ids[i]);
        const rect = el ? el.getBoundingClientRect() : null;
        if (!rect || rect.height <= 0) {
          cover.push(-1);
          tops.push(0);
          continue;
        }
        const overlap = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
        cover.push(overlap / Math.max(1, Math.min(vh, rect.height)));
        tops.push(rect.top);
      }

      // A click-initiated smooth scroll pins the target until it is reached (or 3s pass, or the user interacts)
      const pending = pendingNavRef.current;
      if (pending && (performance.now() > pending.until || !(cover[pending.i] >= 0))) {
        pendingNavRef.current = null;
      } else if (pending) {
        if (cover[pending.i] >= cfg.switchAt - 0.001) pendingNavRef.current = null;
        return commit(pending.i);
      }

      const current = committed === undefined ? null : committed;
      const qualified: number[] = [];
      for (let i = 0; i < cover.length; i++) if (cover[i] >= cfg.switchAt - 0.001) qualified.push(i);

      let best: number | null = null;
      if (atBottom) {
        // At the page end the last sections may never reach switchAt: take the lowest one that is mostly visible
        for (let i = 0; i < cover.length; i++)
          if (cover[i] >= 0.25 && (best === null || tops[i] > tops[best])) best = i;
        if (best === null) best = current;
      } else if (current !== null && qualified.indexOf(current) >= 0) {
        best = current; // hysteresis: keep the current one while it still qualifies
      } else if (qualified.length) {
        best = qualified[0];
        for (const i of qualified)
          if (cover[i] > cover[best] + 0.001 || (Math.abs(cover[i] - cover[best]) <= 0.001 && tops[i] < tops[best]))
            best = i;
      } else if (current !== null && cover[current] > 0) {
        best = current;
      } else if (current !== null) {
        for (let i = 0; i < cover.length; i++) if (cover[i] > 0 && (best === null || cover[i] > cover[best])) best = i;
      }

      if (committed === undefined) return commit(best);
      if (best === committed) {
        candidate = undefined;
        return;
      }
      const now = performance.now();
      if (candidate !== best) {
        candidate = best;
        candidateSince = now;
      }
      // Debounce: a new candidate must hold for 140ms before it is committed
      if (now - candidateSince >= 140) return commit(best);
      if (timer) clearTimeout(timer);
      timer = setTimeout(schedule, 150 - (now - candidateSince));
    };

    const schedule = () => {
      raf ||= requestAnimationFrame(measure);
    };

    measure();
    spyRefreshRef.current = schedule;
    const cancelPending = () => {
      pendingNavRef.current = null;
    };
    const cancelEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    cancelEvents.forEach((ev) => window.addEventListener(ev, cancelPending, { capture: true, passive: true }));
    const lateTimers = [300, 1200].map((ms) => setTimeout(schedule, ms));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      lateTimers.forEach(clearTimeout);
      if (timer) clearTimeout(timer);
      spyRefreshRef.current = null;
      cancelEvents.forEach((ev) => window.removeEventListener(ev, cancelPending, { capture: true }));
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.items.map((it) => it.section + "|" + it.href).join("\n"), cfg.switchAt]);

  /* ---- scroll direction: compact mode and menu auto-close ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastY = window.scrollY || 0;
    let down = 0;
    let up = 0;
    let moreAcc = 0;
    let raf = 0;
    const setScrolled = (v: boolean) => {
      if (scrolledDownRef.current !== v) {
        scrolledDownRef.current = v;
        setScrolledDown(v);
        if (v) setMoreOpen(false);
      }
    };
    const onFrame = () => {
      raf = 0;
      const y = window.scrollY || 0;
      const dy = y - lastY;
      lastY = y;
      if (menuOpenRef.current && Math.abs(y - menuScrollYRef.current) > 64) setMenuOpen(false);
      if (y <= cfg.offset) {
        down = 0;
        up = 0;
        setScrolled(false);
        return;
      }
      if (moreOpenRef.current && dy > 0) {
        moreAcc += dy;
        if (moreAcc > 48) {
          moreAcc = 0;
          moreOpenRef.current = false;
          setMoreOpen(false);
        }
      } else if (!moreOpenRef.current || dy < 0) {
        moreAcc = 0;
      }
      if (dy > 0) {
        down += dy;
        up = 0;
        if (down > 10) setScrolled(true);
      } else if (dy < 0) {
        up -= dy;
        down = 0;
        if (up > 10) setScrolled(false);
      }
    };
    const onScroll = () => {
      raf ||= requestAnimationFrame(onFrame);
    };
    onFrame();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cfg.offset]);

  /* ---- open mobile menu: outside click and Escape close it ---- */
  useEffect(() => {
    if (!menuOpen) return;
    menuScrollYRef.current = window.scrollY || 0;
    const onDown = (e: Event) => {
      const island = islandRef.current;
      if (island && e.target instanceof Node && !island.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const island = islandRef.current;
      const active = document.activeElement;
      const inside = !!(island && active && island.contains(active));
      setMenuOpen(false);
      if (inside || active === document.body) menuRef.current?.focus();
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /* ---- leaving mobile layout closes the menu ---- */
  useEffect(() => {
    if (!isMobile && menuOpen) setMenuOpen(false);
  }, [isMobile, menuOpen]);

  /* ---- track real pointer movement (distinguishes hover from "content scrolled under a still cursor") ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMove = (e: globalThis.PointerEvent) => {
      if (e.pointerType === "touch") return;
      const p = lastPointerRef.current;
      if (p.x < 0) {
        p.x = e.clientX;
        p.y = e.clientY;
        p.ev = null;
        return;
      }
      if (Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y) > 0.5) {
        p.x = e.clientX;
        p.y = e.clientY;
        p.t = performance.now();
        p.ev = e;
      } else {
        p.ev = null;
      }
    };
    window.addEventListener("pointermove", onMove, { capture: true, passive: true });
    return () => window.removeEventListener("pointermove", onMove, { capture: true });
  }, []);

  /* ---- when the island morphs between modes, ignore the pointer until it really moves ---- */
  const modeKey = (isCompact ? "c" : "e") + (menuOpen ? "o" : "");
  useEffect(() => {
    const prev = lastModeRef.current;
    lastModeRef.current = modeKey;
    if (prev === null || prev === modeKey) return;
    modeChangedAtRef.current = performance.now();
    armedRef.current = { armed: false, x: lastPointerRef.current.x, y: lastPointerRef.current.y };
    islandRef.current?.removeAttribute("data-pt");
    if (labTimerRef.current) clearTimeout(labTimerRef.current);
    labTimerRef.current = null;
    setHoverIdx(null);
    setLabIdxDelayed(null);
  }, [modeKey]);

  /* ---- unmount ---- */
  useEffect(
    () => () => {
      engineRef.current?.stop();
      if (labTimerRef.current) clearTimeout(labTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    },
    [],
  );

  /* ---- handlers ---- */
  const isMouseLike = (e: { pointerType: string }) => e.pointerType === "mouse" || e.pointerType === "pen";
  /** true when the React event wraps the last real (position changing) pointermove */
  const isRealMove = (e: { nativeEvent: Event }) => lastPointerRef.current.ev === e.nativeEvent;
  const clearLabTimer = () => {
    if (labTimerRef.current) clearTimeout(labTimerRef.current);
    labTimerRef.current = null;
  };
  /** After a mode change the pointer must move 4px before hover reacts again. */
  const pointerArmed = (e: { clientX: number; clientY: number }) => {
    const a = armedRef.current;
    if (a.armed) return true;
    if (a.x < 0) {
      a.x = e.clientX;
      a.y = e.clientY;
      return false;
    }
    if (Math.hypot(e.clientX - a.x, e.clientY - a.y) < 4) return false;
    a.armed = true;
    return true;
  };
  const sectionExists = (i: number) => !!findSection(sectionIdsRef.current[i]);

  /** Id of an on-page target this item should smooth-scroll to, or "" when the click should navigate normally. */
  const localTarget = (i: number): string => {
    const item = cfg.items[i];
    if (!item) return "";
    if (!item.href) return item.section;
    if (item.newTab) return "";
    try {
      const loc = window.location;
      const u = new URL(item.href, loc.href);
      if (u.origin !== loc.origin || normPath(u.pathname) !== normPath(loc.pathname) || (u.search && u.search !== loc.search))
        return "";
      const id = u.hash.length > 1 ? decodeURIComponent(u.hash.slice(1)) : item.section;
      return findSection(id) ? id : "";
    } catch {
      return "";
    }
  };

  /** Smooth-scrolls to the item's section. Returns true when the click was handled. */
  const scrollToItem = (i: number, e: MouseEvent<HTMLElement>): boolean => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    const id = localTarget(i);
    if (!id) return false;
    e.preventDefault();
    const target = findSection(id);
    if (!target) return true;
    setClickIdx(null);
    pendingNavRef.current = sectionIdsRef.current[i] === id ? { i, until: performance.now() + 3000 } : null;
    if (pendingNavRef.current) setTimeout(() => spyRefreshRef.current?.(), 3050);
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start", inline: "nearest" });
    if (e.detail === 0) {
      // keyboard activation: move focus to the section for screen readers / continued tabbing
      const needsTabindex = !target.hasAttribute("tabindex");
      const prevOutline = target.style.outline;
      const restore = () => {
        target.removeAttribute("tabindex");
        target.style.outline = prevOutline;
      };
      if (needsTabindex) {
        target.setAttribute("tabindex", "-1");
        target.style.outline = "none";
      }
      try {
        target.focus({ preventScroll: true });
      } catch {
        /* ignore */
      }
      if (needsTabindex) {
        if (document.activeElement === target) target.addEventListener("blur", restore, { once: true });
        else restore();
      }
    }
    if (document.getElementById(id) === target) {
      try {
        const url = new URL(window.location.href);
        url.hash = id;
        if (url.href !== window.location.href) {
          const state = window.history.state;
          const next = state && typeof state === "object" && "routeId" in state ? { ...state, hash: id } : state;
          window.history.replaceState(next, "", url.pathname + url.search + url.hash);
        }
      } catch {
        /* ignore */
      }
    }
    spyRefreshRef.current?.();
    return true;
  };

  const markPointerMode = () => {
    const island = islandRef.current;
    if (island && !island.hasAttribute("data-pt")) island.setAttribute("data-pt", "");
  };
  const scheduleHoverOpen = () => {
    if (cfg.expand !== "Hover" || islandHover || enterTimerRef.current) return;
    enterTimerRef.current = setTimeout(() => {
      enterTimerRef.current = null;
      setIslandHover(true);
    }, 180);
  };

  const bind: ViewBindings = {
    setRoot: (el) => {
      rootRef.current = el;
    },
    setSlot: (el) => {
      slotRef.current = el;
    },
    setIsland: (el) => {
      islandRef.current = el;
    },
    setShell: (el) => {
      shellRef.current = el;
    },
    setPill: (el) => {
      pillRef.current = el;
    },
    setDiv: (el) => {
      divRef.current = el;
    },
    setLi: (i, el) => {
      liRefs.current[i] = el;
    },
    setItem: (i, el) => {
      itemRefs.current[i] = el;
    },
    setLab: (i, el) => {
      labRefs.current[i] = el;
    },
    setGlyph: (i, el) => {
      glyphRefs.current[i] = el;
    },
    setBox: (i, el) => {
      boxRefs.current[i] = el;
    },
    setMore: (el) => {
      moreRef.current = el;
    },
    setMenu: (el) => {
      menuRef.current = el;
    },
    setPanel: (el) => {
      panelRef.current = el;
    },
    setMeasure: (el) => {
      measureRef.current = el;
    },
    setLogo: (el) => {
      logoRef.current = el;
    },
    onItemDown: (i, e: PointerEvent<HTMLElement>) => {
      lastPointerTypeRef.current = e.pointerType;
      if (isMouseLike(e) && !isMobile) setPressIdx(i);
    },
    onIslandUp: () => {
      setPressIdx(null);
    },
    onIslandEnter: (e) => {
      if (!isMouseLike(e)) return;
      if (performance.now() - lastPointerRef.current.t > 100) return;
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
      if (armedRef.current.x < 0) armedRef.current.armed = true;
      if (pointerArmed(e)) {
        markPointerMode();
        scheduleHoverOpen();
      }
    },
    onIslandLeave: (e) => {
      if (!isMouseLike(e)) return;
      setPressIdx(null);
      clearLabTimer();
      setHoverIdx(null);
      setLabIdxDelayed(null);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      islandRef.current?.removeAttribute("data-pt");
      leaveTimerRef.current = setTimeout(() => {
        leaveTimerRef.current = null;
        setIslandHover(false);
      }, 260);
    },
    onIslandMove: (e) => {
      if (!isMouseLike(e) || !isRealMove(e)) return;
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
      if (pointerArmed(e)) {
        markPointerMode();
        scheduleHoverOpen();
      }
    },
    onIslandFocus: (e: FocusEvent<HTMLElement>) => {
      let visible = false;
      try {
        visible = (e.target as Element).matches(":focus-visible");
      } catch {
        visible = false;
      }
      if (visible) setIslandFocus(true);
    },
    onIslandBlur: (e: FocusEvent<HTMLElement>) => {
      const island = islandRef.current;
      const next = e.relatedTarget as Node | null;
      if (island && next && island.contains(next)) return;
      setIslandFocus(false);
      setFocusIdx(null);
      if (menuOpenRef.current && next) setMenuOpen(false);
    },
    onItemMove: (i, e) => {
      if (!isMouseLike(e) || isMobile || !isRealMove(e) || !pointerArmed(e)) return;
      if (hoverIdxRef.current === i) return;
      hoverIdxRef.current = i;
      setHoverIdx(i);
      clearLabTimer();
      if (!cfg.allLabels) {
        labTimerRef.current = setTimeout(() => {
          labTimerRef.current = null;
          setLabIdxDelayed(i);
        }, 140);
      }
    },
    onItemFocus: (i, e) => {
      let visible = false;
      try {
        visible = e.currentTarget.matches(":focus-visible");
      } catch {
        visible = false;
      }
      if (visible) setFocusIdx(i);
    },
    onItemBlur: (i) => {
      setFocusIdx((prev) => (prev === i ? null : prev));
    },
    onItemClick: (i, e) => {
      const item = cfg.items[i];
      if (!item || (!item.href && !item.section)) return;
      // A click that merely ends a layout morph under a still cursor is swallowed
      const suppressed = !armedRef.current.armed && performance.now() - modeChangedAtRef.current < 500;
      if (e.detail > 0 && lastPointerTypeRef.current === "mouse" && suppressed) {
        e.preventDefault();
        return;
      }
      if (scrollToItem(i, e) || !item.href || sectionExists(i) || item.newTab) return;
      setClickIdx(i);
    },
    onPanelClick: (i, e) => {
      const item = cfg.items[i];
      if (!item || (!item.href && !item.section)) return;
      if (!scrollToItem(i, e) && item.href && !item.newTab && !sectionExists(i)) setClickIdx(i);
      setMenuOpen(false);
    },
    onMore: (e) => {
      moreOpenRef.current = true;
      setMoreOpen(true);
      if (e.detail === 0) {
        // keyboard: move focus to the next item that just appeared
        const others = cfg.items.map((_, i) => i).filter((i) => i !== activeIdx);
        const next = others.find((i) => i > activeIdx) ?? others[0];
        if (next !== undefined)
          setTimeout(() => {
            const el = itemRefs.current[next];
            if (el && el.tagName === "A") el.focus();
          }, 80);
      }
    },
    onMenu: () => {
      setMenuOpen((v) => !v);
    },
  };

  return <NavView cfg={cfg} scope={scope} state={viewState} bind={bind} />;
}

/* -------------------------------------------------------------------------- */
/* Static preview                                                             */
/* -------------------------------------------------------------------------- */

function StaticNav({ cfg }: { cfg: ResolvedConfig }) {
  const scope = useScope();
  const count = cfg.items.length;
  const activeIdx = cfg.active >= 1 && cfg.active <= count ? cfg.active - 1 : -1;
  const menu = cfg.canvas === "Menu";
  const compact = cfg.canvas === "Compact";
  const mobile: boolean | null = menu || cfg.layout === "Mobile" ? true : cfg.layout !== "Desktop" && null;
  return (
    <NavView
      cfg={cfg}
      scope={scope}
      state={{
        mobile,
        compact,
        open: menu,
        activeIdx,
        labIdx: menu ? -1 : activeIdx,
        pillIdx: menu ? -1 : activeIdx,
        hoverIdx: -1,
        live: false,
        canvas: true,
        panel: menu,
        allLabels: cfg.allLabels && mobile !== true,
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Public component                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Floating "dynamic island" navigation bar.
 *
 * Features: spring animated pill + label reveal, compact mode on scroll, responsive menu,
 * scroll spy for one-page sites, route detection, keyboard + screen reader support,
 * reduced-motion / reduced-transparency / high-contrast support.
 */
export function DynamicIslandNav(props: DynamicIslandNavProps) {
  const style: React.CSSProperties | undefined = props.fixed
    ? { position: "fixed", top: 0, left: 0, right: 0, zIndex: 10, ...props.style }
    : props.style;
  const cfg = resolveConfig({ ...props, font: props.font ?? DEFAULT_FONT, style });
  return props.staticPreview ? <StaticNav cfg={cfg} /> : <LiveNav cfg={cfg} />;
}

DynamicIslandNav.displayName = "DynamicIslandNav";
