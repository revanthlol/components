import type { NavItem } from "./types";

/** Items used when no `items` prop is passed. */
export const DEFAULT_ITEMS: NavItem[] = [
  { label: "Home", icon: "home", link: "", newTab: false },
  { label: "Work", icon: "grid", link: "", newTab: false },
  { label: "Lab", icon: "sparkle", link: "", newTab: false },
  { label: "Journal", icon: "pen", link: "", newTab: false },
  { label: "About", icon: "user", link: "", newTab: false },
  { label: "Contact", icon: "mail", link: "", newTab: false },
];

/** Maximum number of items the island renders (extra items are ignored). */
export const MAX_ITEMS = 10;

/** Maximum width in px of the opened mobile menu panel. */
export const PANEL_MAX_WIDTH = 400;
