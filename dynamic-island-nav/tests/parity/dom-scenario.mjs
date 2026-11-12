// Interactive parity in jsdom: scroll spy, compact mode, click-to-scroll, mobile menu, hover.
import { createRequire } from "node:module";
import { JSDOM } from "jsdom";
const require = createRequire(import.meta.url);

const dom = new JSDOM('<!doctype html><body><div id="a"></div></body>', { pretendToBeVisual: true, url: "https://example.test/" });
const w = dom.window;
Object.assign(globalThis, { window: w, document: w.document, HTMLElement: w.HTMLElement, Node: w.Node, CSS: undefined,
  requestAnimationFrame: w.requestAnimationFrame.bind(w), cancelAnimationFrame: w.cancelAnimationFrame.bind(w) });
globalThis.IS_REACT_ACT_ENVIRONMENT = false;

const React = require("react");
const { createRoot } = require("react-dom/client");
const make = require("./original.factory.cjs");
const orig = make(React, w, {});
const { DynamicIslandNav } = require("../../dist/index.cjs");

// ---- layout mocks ----
let ROOT_W = 1000;
const LABEL = { Home: 34, Work: 33, Lab: 22, Journal: 48, About: 36, Contact: 47 };
w.HTMLElement.prototype.getBoundingClientRect = function () {
  const c = this.className || "";
  let width = 0, height = 0, top = 0;
  if (typeof c === "string" && c.includes("lis-root")) width = ROOT_W;
  else if (typeof c === "string" && c.includes("lis-slot")) width = ROOT_W - 32;
  else if (this.parentElement?.className?.toString().includes("lis-measure")) width = LABEL[this.textContent] ?? 40;
  else if (this.dataset?.sec !== undefined) { const i = +this.dataset.sec; top = i * 800 - w.scrollY; height = 800; return { top, bottom: top + height, left: 0, right: 1000, width: 1000, height, x: 0, y: top }; }
  return { top, bottom: top + height, left: 0, right: width, width, height, x: 0, y: top };
};
Object.defineProperty(w.HTMLElement.prototype, "offsetHeight", { get() { return String(this.className).includes("lis-panel") ? 330 : 0; } });
w.HTMLElement.prototype.scrollIntoView = function () { const i = +this.dataset.sec; w.scrollY = i * 800; w.dispatchEvent(new w.Event("scroll")); };
Object.defineProperty(w, "innerHeight", { value: 800, configurable: true });
Object.defineProperty(w.document.documentElement, "scrollHeight", { value: 4800, configurable: true });
w.scrollY = 0;

const names = ["home", "work", "lab", "journal", "about", "contact"];
names.forEach((n, i) => { const s = w.document.createElement("section"); s.id = n; s.dataset.sec = String(i); w.document.body.appendChild(s); });
const FONT = { fontFamily: "Inter", fontSize: "14px", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: "1.2em" };
const items = names.map((n, i) => ({ label: ["Home", "Work", "Lab", "Journal", "About", "Contact"][i], icon: ["home", "grid", "sparkle", "pen", "user", "mail"][i], link: "", newTab: false, section: n }));
const props = { items, font: FONT, active: 1 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (h) => h.replace(/lis-r\d+/g, "lis-X").replace(/:r\d+:/g, "");
const IMPL = process.argv[2];
const Comp = IMPL === "orig" ? orig.z : DynamicIslandNav;
const rootA = createRoot(w.document.getElementById("a"));
rootA.render(React.createElement(Comp, props));
const out = [];

async function cmp(label, ms = 700) {
  await sleep(ms);
  out.push({ label, html: norm(w.document.getElementById("a").innerHTML).replace(/<style>[\s\S]*?<\/style>/, "") });
}
const q = (id, sel) => w.document.getElementById(id).querySelector(sel);
const scrollTo = (y) => { w.scrollY = y; w.dispatchEvent(new w.Event("scroll")); };

await cmp("initial layout (desktop)");
scrollTo(900); await cmp("scroll spy: section 2 active after scroll");
scrollTo(2500); await cmp("scroll spy: section 4");
scrollTo(0); await cmp("back to top (compact off)");
scrollTo(1700); await sleep(100); scrollTo(2000); await cmp("scrolling down => compact island");
// click "Contact" in the expanded island: reveal first via more button
q("a", ".lis-more").click(); await cmp("more button expands compact island");
scrollTo(0); await sleep(300);
// click item with section => scrollIntoView + spy
q("a", ".lis-li:nth-child(5) a").dispatchEvent(new w.MouseEvent("click", { bubbles: true, cancelable: true, button: 0, detail: 1 }));
await cmp("click About => smooth scroll + active", 1200);
// mobile
ROOT_W = 320; w.dispatchEvent(new w.Event("resize"));
rootA.render(React.createElement(Comp, { ...props, active: 2 }));
await cmp("narrow viewport => mobile layout (remeasure by re-render)", 900);
q("a", ".lis-menu").click(); await cmp("mobile menu opened", 1000);
w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await cmp("Escape closes menu", 1000);
(await import("node:fs")).writeFileSync(process.argv[3], JSON.stringify(out)); process.exit(0);
