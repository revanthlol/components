// Animation engine parity: ORIGINAL class `Ie` vs ported IslandEngine, frame by frame.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const React = require("react");
const make = require("./original.factory.cjs");

// --- fake rAF (manually pumped) -------------------------------------------------
let queue = new Map();
let nextId = 1;
globalThis.requestAnimationFrame = (cb) => { const id = nextId++; queue.set(id, cb); return id; };
globalThis.cancelAnimationFrame = (id) => { queue.delete(id); };
function pump(ts) { const cbs = [...queue.values()]; queue = new Map(); cbs.forEach((cb) => cb(ts)); return cbs.length; }

// The port is an ES module bundle; load via CJS build
const { IslandEngine } = await import("../../dist/engine-for-tests.mjs");
const orig = make(React, undefined, {});
const OrigEngine = orig.Ie;

const N = 6;
const mkEls = () => {
  const el = () => ({ style: {} });
  return { island: el(), shell: el(), pill: el(), div: el(), more: el(), panel: el(),
    lis: Array.from({ length: N }, el), items: Array.from({ length: N }, el), labs: Array.from({ length: N }, el),
    glyphs: Array.from({ length: N }, el), boxes: Array.from({ length: N }, el) };
};
const snapshot = (els) => JSON.stringify(els, (k, v) => v);

const labelW = [34, 33, 22, 48, 36, 47];
const baseModel = (o = {}) => ({
  n: N, item: 40, pad: [6, 6, 6, 6], gap: 4, dg: 10, logo: false, logoW: 0, div: false,
  extras: labelW.map((w) => w + 14 - 4), mobile: false, panelW: 358, panelH: 0, align: "Center",
  barH: 52, radius: 26, spring: { k: 400, c: 32, m: 1 }, elastic: 0.6, reduced: false, ...o,
});
const baseTargets = (o = {}) => ({
  p: [1, 0, 0, 0, 0, 0], c: [1, 1, 1, 1, 1, 1], m: 0, o: 0, pill: 0, press: 0, pivot: 0, ...o,
});

let totalFrames = 0, mismatches = 0;
function runScenario(name, steps) {
  const A = new OrigEngine(), B = new IslandEngine();
  const ea = mkEls(), eb = mkEls();
  let ts = 1000;
  for (const [si, step] of steps.entries()) {
    const { model, targets, snap = false, frames = 90, dt = 16.667, visible } = step;
    if (visible !== undefined) { A.setVisible(visible); B.setVisible(visible); }
    if (model) {
      A.update(ea, JSON.parse(JSON.stringify(model)), JSON.parse(JSON.stringify(targets)), snap);
      B.update(eb, JSON.parse(JSON.stringify(model)), JSON.parse(JSON.stringify(targets)), snap);
    }
    const cmp = (label) => {
      totalFrames++;
      const sa = snapshot(ea), sb = snapshot(eb);
      if (sa !== sb) {
        mismatches++;
        if (mismatches <= 5) {
          let i = 0; while (sa[i] === sb[i]) i++;
          console.log(`MISMATCH ${name} step ${si} ${label}\n  orig: ...${sa.slice(Math.max(0, i - 60), i + 100)}\n  port: ...${sb.slice(Math.max(0, i - 60), i + 100)}`);
        }
        return false;
      }
      return true;
    };
    cmp("after update");
    for (let f = 0; f < frames; f++) {
      ts += dt;
      pump(ts); // runs whichever tick callbacks are scheduled (A and B share the fake rAF; both are advanced together)
      if (!cmp(`frame ${f}`)) break;
    }
  }
}
// A and B share one fake rAF queue, ticks run in the same order so state evolves in lockstep.

const desktop = (t = {}, m = {}) => ({ model: baseModel(m), targets: baseTargets(t) });
runScenario("initial snap", [{ ...desktop(), snap: true, frames: 3 }]);
runScenario("pill hover move", [
  { ...desktop(), snap: true, frames: 2 },
  desktop({ pill: 3, p: [0, 0, 0, 1, 0, 0] }),
  desktop({ pill: 5, p: [0, 0, 0, 0, 0, 1] }),
  desktop({ pill: 0, p: [1, 0, 0, 0, 0, 0] }),
]);
runScenario("press", [
  { ...desktop(), snap: true, frames: 2 },
  desktop({ press: 1 }, {}),
  desktop({ press: 0 }, {}),
]);
runScenario("compact collapse/expand (swap)", [
  { ...desktop(), snap: true, frames: 2 },
  desktop({ c: [0, 0, 0, 1, 0, 0], m: 1, pill: 3, p: [0, 0, 0, 1, 0, 0], pivot: 3 }),
  desktop({ c: [1, 1, 1, 1, 1, 1], m: 0, pill: 3, p: [0, 0, 0, 1, 0, 0], pivot: 3 }),
]);
runScenario("compact: active item changes while compact (ghost swap)", [
  { ...desktop(), snap: true, frames: 2 },
  desktop({ c: [1, 0, 0, 0, 0, 0], m: 1, pill: 0, pivot: 0 }),
  desktop({ c: [0, 0, 1, 0, 0, 0], m: 1, pill: 2, p: [0, 0, 1, 0, 0, 0], pivot: 2 }, {}),
  desktop({ c: [0, 0, 0, 0, 1, 0], m: 1, pill: 4, p: [0, 0, 0, 0, 1, 0], pivot: 4 }, {}),
]);
runScenario("with logo + divider", [
  { ...desktop({}, { logo: true, logoW: 70, div: true }), snap: true, frames: 2 },
  desktop({ pill: 2, p: [0, 0, 1, 0, 0, 0] }, { logo: true, logoW: 70, div: true }),
  desktop({ c: [0, 0, 1, 0, 0, 0], m: 1, pill: 2, p: [0, 0, 1, 0, 0, 0], pivot: 2 }, { logo: true, logoW: 70, div: true }),
]);
runScenario("labels all", [
  { ...desktop({ p: [1, 1, 1, 1, 1, 1] }), snap: true, frames: 2 },
  desktop({ p: [1, 1, 1, 1, 1, 1], pill: 4 }),
]);
for (const align of ["Left", "Center", "Right"]) {
  const mob = (o, extra = {}) => ({ model: baseModel({ mobile: true, align, panelH: 330, ...extra }), targets: baseTargets({ c: [1, 0, 0, 0, 0, 0], o, pill: o ? -1 : 0, p: [o ? 0 : 1, 0, 0, 0, 0, 0], ...(o ? { c: [0, 0, 0, 0, 0, 0] } : {}) }) });
  runScenario(`mobile menu open/close (${align})`, [
    { ...mob(0), snap: true, frames: 2 }, mob(1), mob(0), mob(1, { logo: true, logoW: 70, div: true }),
  ]);
}
runScenario("reduced motion", [
  { ...desktop({}, { reduced: true }), snap: true, frames: 2 },
  desktop({ pill: 4, p: [0, 0, 0, 0, 1, 0], press: 1 }, { reduced: true }),
  desktop({ c: [0, 0, 0, 0, 1, 0], m: 1, pill: 4, pivot: 4 }, { reduced: true }),
]);
runScenario("elasticity 0 / 1 and custom spring", [
  { ...desktop({}, { elastic: 0, spring: { k: 150, c: 14, m: 1.4 } }), snap: true, frames: 2 },
  desktop({ pill: 5, p: [0, 0, 0, 0, 0, 1], c: [0, 0, 0, 0, 0, 1], m: 1, pivot: 5 }, { elastic: 0, spring: { k: 150, c: 14, m: 1.4 } }),
  desktop({ pill: 1, p: [0, 1, 0, 0, 0, 0], c: [1, 1, 1, 1, 1, 1], m: 0, pivot: 1 }, { elastic: 1, spring: { k: 900, c: 20, m: 0.7 } }),
]);
runScenario("variable frame time (slow + fast frames)", [
  { ...desktop(), snap: true, frames: 2 },
  { ...desktop({ pill: 4, p: [0, 0, 0, 0, 1, 0] }), frames: 20, dt: 50 },
  { ...desktop({ pill: 1, p: [0, 1, 0, 0, 0, 0] }), frames: 200, dt: 4 },
]);
runScenario("hide while offscreen then resume", [
  { ...desktop(), snap: true, frames: 2 },
  { ...desktop({ pill: 2, p: [0, 0, 1, 0, 0, 0] }), frames: 3 },
  { visible: false, frames: 3 },
  { ...desktop({ pill: 5, p: [0, 0, 0, 0, 0, 1], c: [0, 0, 0, 0, 0, 1], m: 1, pivot: 5 }), frames: 5 },
  { visible: true, frames: 40 },
]);
runScenario("item count change", [
  { ...desktop(), snap: true, frames: 2 },
  { model: baseModel({ n: 4, extras: labelW.slice(0, 4).map((w) => w + 10) }), targets: { p: [1, 0, 0, 0], c: [1, 1, 1, 1], m: 0, o: 0, pill: 0, press: 0, pivot: 0 }, frames: 40 },
]);

console.log(`Engine parity: ${totalFrames - mismatches} identical frames, ${mismatches} different (of ${totalFrames})`);
process.exit(mismatches ? 1 : 0);
