import type { CSSProperties } from "react";
import type { IconName } from "./icons";

/** An image reference. A plain URL string or an object with srcSet / alt. */
export type ImageSource = string | { src: string; srcSet?: string; alt?: string };

export interface NavItem {
  /** Visible label (also the accessible name). */
  label: string;
  /** Built-in icon name. Defaults to "home" for unknown names. */
  icon?: IconName | (string & {});
  /** Custom icon image. Rendered as a CSS mask, so it takes the current text colour. Use a monochrome SVG or PNG. */
  image?: ImageSource;
  /** Link target. Same-page anchors (#id), routes (/work) and absolute URLs work. */
  link?: string;
  /** Open the link in a new tab. */
  newTab?: boolean;
  /**
   * One-page sites: element id (or data-framer-name) of the section this item represents.
   * With an empty `link`, clicking scrolls to the section. The item turns active when the section fills the screen.
   */
  section?: string;
}

export type ThemeName = "Dark" | "Light" | "Auto" | "Custom";

export interface CustomColors {
  fill?: string;
  border?: string;
  /** Highlight pill behind the active / hovered item. */
  pill?: string;
  icon?: string;
  active?: string;
  divider?: string;
  /** Focus ring colour. */
  focus?: string;
  /** CSS box-shadow value. "none" or empty disables it. */
  shadow?: string;
}

/**
 * Motion definition for the spring engine.
 *  - spring with stiffness / damping / mass
 *  - spring with duration (seconds) and bounce (0..0.9)
 *  - tween-like: { type: "tween", duration } (approximated by a critically damped spring)
 */
export interface TransitionConfig {
  type?: "spring" | "tween" | (string & {});
  stiffness?: number;
  damping?: number;
  mass?: number;
  duration?: number;
  bounce?: number;
  [key: string]: unknown;
}

export interface DynamicIslandNavProps {
  /** Up to 10 items. */
  items?: NavItem[];
  /** 1-based index of the highlighted item. 0 = none. Section / route detection can override it. */
  active?: number;
  /** Fraction (30 to 100, in percent) of the viewport a section must fill to become active. */
  switchAt?: number;

  logoType?: "None" | "Image" | "Text";
  logoImage?: ImageSource;
  /** Crop the logo image to a circle. */
  logoRound?: boolean;
  logoText?: string;
  logoLink?: string;
  logoNewTab?: boolean;

  /** "Active": only the current item shows its label. "All": every item shows its label. */
  labels?: "Active" | "All";
  /** "Auto" switches to the mobile menu below `breakpoint` or when the items do not fit. */
  layout?: "Auto" | "Desktop" | "Mobile";
  /** Width in px under which Auto layout uses the mobile menu. */
  breakpoint?: number;
  /** Desktop: shrink to the current item while scrolling down. */
  compact?: boolean;
  /** How the compact island opens again. */
  expand?: "Hover" | "Click";
  /** Scroll distance in px before compact mode may start. */
  scrollOffset?: number;

  theme?: ThemeName;
  /** Colours for theme "Custom". */
  colors?: CustomColors;
  /** Backdrop blur in px (0 to 80). */
  blur?: number;
  /** Font styles for the labels. Any CSS font properties. */
  font?: CSSProperties;
  /** Item height / min width in px (24 to 72). */
  itemSize?: number;
  /** Icon size in px (10 up to itemSize). */
  iconSize?: number;
  /** Border radius of the island. Capped at half the bar height. */
  radius?: string | number;
  /** Island padding, CSS shorthand ("6px", "6px 10px"). */
  padding?: string | number;
  /** Gap: "X" between items, optional second value "Y" between menu rows. */
  gap?: string | number;
  /** Space around the island, CSS shorthand. Safe-area insets are respected. */
  margin?: string | number;
  align?: "Left" | "Center" | "Right";
  transition?: TransitionConfig;
  /** 0 to 1. Amount of stretch and squash during width changes. */
  elasticity?: number;

  /**
   * Renders the static, non-interactive markup (no animation engine, no listeners).
   * Handy for screenshots, SSR previews and design tools. Use with `canvas`.
   */
  staticPreview?: boolean;
  /** Static preview state: "Default", "Compact" or "Menu" (open mobile menu). Only used with `staticPreview`. */
  canvas?: "Default" | "Compact" | "Menu";

  /**
   * Convenience: pins the nav to the top of the viewport (position: fixed; top/left/right 0; z-index 10).
   * Without it the nav sits in normal flow, wrap it yourself if you need different positioning.
   */
  fixed?: boolean;
  /** Extra class on the <nav>. */
  className?: string;
  /** Extra inline style on the <nav>. */
  style?: CSSProperties;
}

/** Item after normalisation. */
export interface ResolvedItem {
  label: string;
  icon: string;
  image: string;
  href: string;
  newTab: boolean;
  section: string;
}

export interface SpringParams {
  /** stiffness */
  k: number;
  /** damping */
  c: number;
  /** mass */
  m: number;
}
