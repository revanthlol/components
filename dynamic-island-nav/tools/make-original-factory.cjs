// Builds a runnable factory around the ORIGINAL Framer component code (lines 45..2498 of the pretty file).
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../original/component/component.original.pretty.mjs', 'utf8').split('\n');
let body = src.slice(44, 2498).join('\n'); // from "function O" through the "})," that closes Le
body = body.replace(/\n\s*\}\),\s*$/, '\n  });'); // end the var declaration list
const factory = `
module.exports = function makeOriginal(React, o /* window or undefined */, capture) {
  const e = (fn) => { let done = false; return () => { if (!done) { done = true; fn(); } }; };
  const { useLayoutEffect: r, useState: s, useRef: c, Fragment: l, useEffect: _, useMemo: u, useId: useIdFn } = React;
  const d = React;
  const jsx = (type, props, key) => React.createElement(type, key === undefined ? props : { ...props, key });
  const p = (type, props, key) => { const { children, ...rest } = props || {}; return React.createElement(type, key === undefined ? rest : { ...rest, key }, ...(children === undefined ? [] : Array.isArray(children) ? children : [children])); };
  const f = p;
  const noop = () => {};
  const i = noop, h = noop, g = noop, b = noop;
  const D = new Proxy({}, { get: (_t, k) => k });
  const le = (comp, controls) => { capture.controls = controls; capture.comp = comp; };
  const ce = () => capture.onCanvas === true;
  ${body}
  Le();
  return { be, Ae, R, z, De, Ie, Y, B, W, Fe, Ne, Pe, V, H, U, ge, j, A, G, K, q, J, I, L, xe, N, P, Se, Ce, ye, ke, _e };
};
`;
fs.writeFileSync(__dirname + '/../tests/parity/original.factory.cjs', factory);
console.log('ok', factory.length);
