import type { CSSProperties } from "react";
import { DEFAULT_ITEMS, MAX_ITEMS } from "./defaults";
import { ICON_MARKUP } from "./icons";
import { THEMES, type ThemeTokens } from "./themes";
import type {
  DynamicIslandNavProps,
  ImageSource,
  ResolvedItem,
  SpringParams,
  TransitionConfig,
} from "./types";
import {
  clamp,
  cleanHref,
  isNoShadow,
  parseBox,
  readFontSize,
  toNumber,
  toOpaqueColor,
} from "./utils";

/** Everything the view and the controller need, with all props validated, clamped and defaulted. */
export interface ResolvedConfig {
  items: ResolvedItem[];
  active: number;
  logo: {
    type: "None" | "Image" | "Text";
    image: string;
    srcSet: string;
    alt: string;
    round: boolean;
    text: string;
    href: string;
    newTab: boolean;
  };
  expand: "Hover" | "Click";
  /** switchAt as a 0..1 fraction */
  switchAt: number;
  logoFont: CSSProperties;
  logoH: number;
  layout: "Auto" | "Desktop" | "Mobile";
  bp: number;
  compact: boolean;
  offset: number;
  col: ThemeTokens;
  auto: boolean;
  allLabels: boolean;
  panelFont: CSSProperties;
  blur: number;
  font: CSSProperties;
  item: number;
  icon: number;
  /** [top, right, bottom, left] */
  pad: number[];
  gap: number;
  gapY: number;
  /** gap between divider / logo and items */
  dg: number;
  margin: number[];
  barH: number;
  radius: number;
  /** inner item radius */
  ir: number;
  lo: number;
  lp: number;
  align: "Left" | "Center" | "Right";
  spring: SpringParams;
  elastic: number;
  canvas: "Default" | "Compact" | "Menu";
  style: CSSProperties | undefined;
  className: string;
}

/** Converts a transition definition into spring parameters (stiffness k, damping c, mass m). */
export function springFromTransition(tr: TransitionConfig | undefined | null): SpringParams {
  const fallback: SpringParams = { k: 400, c: 32, m: 1 };
  if (!tr || typeof tr !== "object") return fallback;
  if (tr.type === undefined || tr.type === "spring") {
    if (typeof tr.stiffness === "number" || typeof tr.damping === "number") {
      return {
        k: Math.max(10, toNumber(tr.stiffness, 400)),
        c: Math.max(1, toNumber(tr.damping, 32)),
        m: Math.max(0.1, toNumber(tr.mass, 1)),
      };
    }
    if (typeof tr.duration === "number") {
      const w = (2 * Math.PI) / Math.max(0.08, tr.duration);
      const damping = 1 - clamp(toNumber(tr.bounce, 0.2), 0, 0.9);
      return { k: w * w, c: 2 * damping * w, m: 1 };
    }
    return fallback;
  }
  const w = 6 / Math.max(0.08, toNumber(tr.duration, 0.4));
  return { k: w * w, c: 2 * w, m: 1 };
}

const imageSrc = (v: ImageSource | undefined): string =>
  typeof v === "string" ? v : v?.src || "";

export function resolveConfig(e: DynamicIslandNavProps): ResolvedConfig {
  const theme: "Dark" | "Light" | "Custom" | "Auto" =
    e.theme === "Light" || e.theme === "Custom" || e.theme === "Auto" ? e.theme : "Dark";

  let col: ThemeTokens;
  if (theme === "Custom") {
    const c = e.colors || {};
    const d = THEMES.Dark;
    col = {
      fill: c.fill || d.fill,
      border: c.border || d.border,
      hl: "rgba(255, 255, 255, 0.07)",
      shadow: typeof c.shadow === "string" ? c.shadow : d.shadow,
      pill: c.pill || d.pill,
      pillHl: "rgba(255, 255, 255, 0.08)",
      rowHover: `color-mix(in srgb, ${c.pill || d.pill} 55%, transparent)`,
      icon: c.icon || d.icon,
      active: c.active || d.active,
      divider: c.divider || d.divider,
      focus: c.focus || d.focus,
      iconHc: c.active || d.active,
      borderHc: `color-mix(in srgb, ${c.active || d.active} 30%, transparent)`,
      pillHc: c.pill || d.pill,
      fillSolid: toOpaqueColor(c.fill || d.fill),
    };
  } else {
    col = THEMES[theme === "Auto" ? "Dark" : theme];
  }

  const item = clamp(toNumber(e.itemSize, 40), 24, 72);
  const icon = clamp(toNumber(e.iconSize, 20), 10, item);
  const pad = parseBox(e.padding ?? "6px", 6).map((v) => Math.max(0, v));
  const gapParts = String(e.gap ?? "4px")
    .trim()
    .split(/\s+/)
    .map((v) => parseFloat(v))
    .filter((v) => isFinite(v));
  // One value: both axes. Two values: "row column" like CSS gap (row = menu rows, column = between items).
  const gap = Math.max(0, gapParts.length > 1 ? gapParts[1] : gapParts.length ? gapParts[0] : toNumber(e.gap, 4));
  const gapY = Math.max(0, gapParts.length ? gapParts[0] : gap);
  const barH = pad[0] + item + pad[2];
  const radius = Math.min(
    Math.max(0, toNumber(String(e.radius ?? "999px").split(/\s+/)[0], 999)),
    barH / 2,
  );
  const ir = clamp(radius - Math.min(pad[0], pad[3]), 0, item / 2);
  const font: CSSProperties = e.font || {};

  const items: ResolvedItem[] = (Array.isArray(e.items) ? e.items : DEFAULT_ITEMS)
    .slice(0, MAX_ITEMS)
    .map((it) => ({
      label: String(it?.label ?? ""),
      icon: it?.icon && (ICON_MARKUP as Record<string, string>)[it.icon] ? it.icon : "home",
      image: imageSrc(it?.image),
      href: cleanHref(it?.link),
      newTab: !!it?.newTab,
      section: String(it?.section ?? "")
        .trim()
        .replace(/^#/, ""),
    }));

  const logoType = e.logoType === "Image" || e.logoType === "Text" ? e.logoType : "None";
  const fontPx = readFontSize(font, 14);
  const logoImage = typeof e.logoImage === "string" ? { src: e.logoImage } : e.logoImage;

  return {
    items,
    active: Math.round(toNumber(e.active, 1)),
    logo: {
      type: logoType,
      image: logoImage?.src || "",
      srcSet: (logoImage as { srcSet?: string } | undefined)?.srcSet || "",
      alt: (logoImage as { alt?: string } | undefined)?.alt || "",
      round: !!e.logoRound,
      text: String(e.logoText ?? "Studio"),
      href: cleanHref(e.logoLink),
      newTab: !!e.logoNewTab,
    },
    expand: e.expand === "Click" ? "Click" : "Hover",
    switchAt: clamp(toNumber(e.switchAt, 80), 30, 100) / 100,
    logoFont: {
      ...font,
      fontSize: Math.max(15, fontPx + 1) + "px",
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    logoH: Math.round(item * 0.6),
    layout: e.layout === "Desktop" || e.layout === "Mobile" ? e.layout : "Auto",
    bp: clamp(toNumber(e.breakpoint, 640), 0, 4000),
    compact: e.compact !== false,
    offset: Math.max(0, toNumber(e.scrollOffset, 120)),
    col,
    auto: theme === "Auto",
    allLabels: e.labels === "All",
    panelFont: { ...font, fontSize: Math.max(17, readFontSize(font, 14)) + "px" },
    blur: clamp(toNumber(e.blur, 20), 0, 80),
    font,
    item,
    icon,
    pad,
    gap,
    gapY,
    dg: gap + 6,
    margin: parseBox(e.margin ?? "16px", 16).map((v) => Math.max(0, v)),
    barH,
    radius,
    ir,
    lo: Math.round(item * 0.1),
    lp: Math.round(item * 0.35),
    align: e.align === "Left" || e.align === "Right" ? e.align : "Center",
    spring: springFromTransition(e.transition),
    elastic: clamp(toNumber(e.elasticity, 0.6), 0, 1),
    canvas: e.canvas === "Compact" || e.canvas === "Menu" ? e.canvas : "Default",
    style: e.style,
    className: e.className ?? "",
  };
}

/** Maps theme tokens to the CSS custom properties consumed by BASE_CSS. */
export function themeVars(t: ThemeTokens): Record<string, string> {
  return {
    "--lis-fill": t.fill,
    "--lis-border": t.border,
    "--lis-hl": t.hl,
    "--lis-shadow": isNoShadow(t.shadow) ? "0 0 #0000" : t.shadow,
    "--lis-pill": t.pill,
    "--lis-pill-hl": t.pillHl,
    "--lis-row-hover": t.rowHover,
    "--lis-icon": t.icon,
    "--lis-active": t.active,
    "--lis-divider": t.divider,
    "--lis-focus": t.focus,
    "--lis-icon-hc": t.iconHc,
    "--lis-border-hc": t.borderHc,
    "--lis-pill-hc": t.pillHc,
    "--lis-fill-solid": t.fillSolid,
  };
}

/** Serialises theme tokens as a declaration list for use inside a <style> rule. */
export function themeDeclarations(t: ThemeTokens): string {
  return Object.entries(themeVars(t))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}
