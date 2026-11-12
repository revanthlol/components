// Server-render parity: ORIGINAL Framer component vs the standalone port, many prop sets.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));

const MyReact = require("react");
const { renderToString } = require("react-dom/server");
const make = require("./original.factory.cjs");
const { DynamicIslandNav } = require("../../dist/index.cjs");

const cap = { onCanvas: false };
const orig = make(MyReact, undefined, cap); // same React instance on purpose: identical useId sequence

const FONT = {
  fontFamily: '"Inter", "Inter Placeholder", sans-serif',
  fontSize: "14px",
  fontStyle: "normal",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  lineHeight: "1.2em",
};
const six = ["Home", "Work", "Lab", "Journal", "About", "Contact"].map((label, i) => ({
  label,
  icon: ["home", "grid", "sparkle", "pen", "user", "mail"][i],
  link: "https://framer.link/fsd2pgh",
  newTab: true,
  section: label.toLowerCase(),
}));
const base = { font: FONT, items: six, active: 1, transition: { type: "spring", stiffness: 400, damping: 32, mass: 1, delay: 0 }, style: { width: "100%" } };

const cases = {
  "as-published": { ...base },
  light: { ...base, theme: "Light" },
  auto: { ...base, theme: "Auto" },
  custom: { ...base, theme: "Custom", colors: { fill: "rgba(20,30,60,0.8)", border: "#334", pill: "rgba(255,0,0,0.2)", icon: "#99a", active: "#fff", divider: "#445", focus: "#0ff", shadow: "none" } },
  "custom-hex-fill": { ...base, theme: "Custom", colors: { fill: "#1a1a2eCC" } },
  "layout-mobile": { ...base, layout: "Mobile" },
  "layout-desktop": { ...base, layout: "Desktop" },
  "breakpoint-900": { ...base, breakpoint: 900 },
  "breakpoint-0": { ...base, breakpoint: 0 },
  "labels-all": { ...base, labels: "All" },
  "align-left": { ...base, align: "Left" },
  "align-right": { ...base, align: "Right" },
  "logo-text": { ...base, logoType: "Text", logoText: "Acme", logoLink: "/home" },
  "logo-text-nolink": { ...base, logoType: "Text", logoText: "Acme" },
  "logo-text-empty": { ...base, logoType: "Text", logoText: "  " },
  "logo-image": { ...base, logoType: "Image", logoImage: { src: "/logo.png", srcSet: "/logo.png 1x, /logo@2x.png 2x", alt: "Acme logo" }, logoRound: true, logoLink: "https://example.com", logoNewTab: true },
  "logo-image-missing": { ...base, logoType: "Image" },
  "no-active": { ...base, active: 0 },
  "active-3": { ...base, active: 3 },
  "active-out-of-range": { ...base, active: 99 },
  "custom-sizes": { ...base, itemSize: 52, iconSize: 26, padding: "8px 12px", gap: "6px 10px", margin: "24px 12px 8px 12px", radius: "14px", blur: 0 },
  "size-clamps": { ...base, itemSize: 5, iconSize: 500, blur: 999, breakpoint: -5, switchAt: 1 },
  "no-items-prop": { font: FONT },
  "empty-items": { ...base, items: [] },
  "eleven-items": { ...base, items: Array.from({ length: 11 }, (_, i) => ({ label: "I" + i, icon: "star", link: "/p" + i })) },
  "unknown-icon": { ...base, items: [{ label: "A", icon: "nope", link: "/a" }, { label: "B", icon: "bolt" }] },
  "custom-icon-image": { ...base, items: [{ label: "A", image: { src: '/i"x.svg' }, link: "/a" }] },
  "no-links": { ...base, items: [{ label: "A", icon: "home" }, { label: "B", icon: "grid" }] },
  "framer-data-link": { ...base, items: [{ label: "A", link: "data:framer/page-link,xyz", section: "a" }] },
  "section-hash": { ...base, items: [{ label: "A", link: "#a" }, { label: "B", link: "/x#b", section: "#bb" }] },
  "transition-duration": { ...base, transition: { type: "spring", duration: 0.5, bounce: 0.3 } },
  "transition-tween": { ...base, transition: { type: "tween", duration: 0.6 } },
  "compact-off": { ...base, compact: false },
  "expand-click": { ...base, expand: "Click" },
  elasticity: { ...base, elasticity: 0 },
  "font-small": { ...base, font: { ...FONT, fontSize: "12px" } },
  "font-rem": { ...base, font: { ...FONT, fontSize: 1.25 } },
  "style-extra": { ...base, style: { width: "100%", opacity: 0.9 } },
};
const canvasCases = {
  "canvas-default": { ...base },
  "canvas-compact": { ...base, canvas: "Compact" },
  "canvas-menu": { ...base, canvas: "Menu" },
  "canvas-menu-light": { ...base, canvas: "Menu", theme: "Light", align: "Right" },
  "canvas-logo-missing": { ...base, canvas: "Default", logoType: "Image" },
  "canvas-mobile-layout": { ...base, canvas: "Default", layout: "Mobile" },
  "canvas-desktop-layout": { ...base, canvas: "Menu", layout: "Desktop" },
  "canvas-labels-all": { ...base, canvas: "Compact", labels: "All" },
};

const React = MyReact;
let pass = 0;
let fail = 0;
function check(name, props, canvas) {
  cap.onCanvas = canvas;
  const a = renderToString(React.createElement(orig.z, props));
  const b = renderToString(React.createElement(DynamicIslandNav, canvas ? { ...props, staticPreview: true } : props));
  if (a === b) {
    pass++;
  } else {
    fail++;
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    console.log(`FAIL ${name}\n  original: ...${a.slice(Math.max(0, i - 80), i + 160)}\n  port    : ...${b.slice(Math.max(0, i - 80), i + 160)}`);
  }
}
for (const [k, v] of Object.entries(cases)) check(k, v, false);
for (const [k, v] of Object.entries(canvasCases)) check(k, v, true);
console.log(`SSR parity: ${pass} identical, ${fail} different (of ${pass + fail})`);
process.exit(fail ? 1 : 0);
