
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
  function O(e, t, n) {
  return (
    t in e
      ? Object.defineProperty(e, t, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[t] = n),
    e
  );
}
function k(e, t, n) {
  let r = Me.get(e);
  (r || ((r = {}), Me.set(e, r)), r[t] !== n && ((r[t] = n), (e.style[t] = n)));
}
function A(e, t) {
  let n = typeof e == `number` ? e : parseFloat(String(e ?? ``));
  return isFinite(n) ? n : t;
}
function j(e, t) {
  if (typeof e == `number` && isFinite(e)) return [e, e, e, e];
  let n = String(e ?? ``)
    .trim()
    .split(/\s+/)
    .map((e) => parseFloat(e))
    .filter((e) => isFinite(e));
  return n.length === 1
    ? [n[0], n[0], n[0], n[0]]
    : n.length === 2
      ? [n[0], n[1], n[0], n[1]]
      : n.length === 3
        ? [n[0], n[1], n[2], n[1]]
        : n.length >= 4
          ? [n[0], n[1], n[2], n[3]]
          : [t, t, t, t];
}
function ge(e) {
  let t = { k: 400, c: 32, m: 1 };
  if (!e || typeof e != `object`) return t;
  if (e.type === void 0 || e.type === `spring`) {
    if (typeof e.stiffness == `number` || typeof e.damping == `number`)
      return {
        k: Math.max(10, A(e.stiffness, 400)),
        c: Math.max(1, A(e.damping, 32)),
        m: Math.max(0.1, A(e.mass, 1)),
      };
    if (typeof e.duration == `number`) {
      let t = (2 * Math.PI) / Math.max(0.08, e.duration),
        n = 1 - G(A(e.bounce, 0.2), 0, 0.9);
      return { k: t * t, c: 2 * n * t, m: 1 };
    }
    return t;
  }
  let n = 6 / Math.max(0.08, A(e.duration, 0.4));
  return { k: n * n, c: 2 * n, m: 1 };
}
function M(e) {
  let t = e.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (t) return `rgb(${t[1]}, ${t[2]}, ${t[3]})`;
  let n = e.trim().match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (n) return `#` + n[1];
  let r = e.trim().match(/^#([0-9a-f]{3})[0-9a-f]?$/i);
  return r ? `#` + r[1] : e;
}
function _e(e, t) {
  let n = e?.fontSize;
  if (typeof n == `number`) return n;
  let r = parseFloat(String(n ?? ``));
  return isFinite(r) && String(n).trim().endsWith(`px`)
    ? r
    : isFinite(r) && r > 0 && r < 4
      ? r * 16
      : t;
}
function ve(e) {
  let t = e.trim().toLowerCase();
  return t === `` || t === `none`;
}
function ye(e) {
  let t = typeof e == `string` ? e.trim() : ``;
  return /^data:framer\//i.test(t) ? `` : t;
}
function be(e) {
  let t =
      e.theme === `Light` || e.theme === `Custom` || e.theme === `Auto`
        ? e.theme
        : `Dark`,
    n;
  if (t === `Custom`) {
    let t = e.colors || {},
      r = W.Dark;
    n = {
      fill: t.fill || r.fill,
      border: t.border || r.border,
      hl: `rgba(255, 255, 255, 0.07)`,
      shadow: typeof t.shadow == `string` ? t.shadow : r.shadow,
      pill: t.pill || r.pill,
      pillHl: `rgba(255, 255, 255, 0.08)`,
      rowHover: `color-mix(in srgb, ${t.pill || r.pill} 55%, transparent)`,
      icon: t.icon || r.icon,
      active: t.active || r.active,
      divider: t.divider || r.divider,
      focus: t.focus || r.focus,
      iconHc: t.active || r.active,
      borderHc: `color-mix(in srgb, ${t.active || r.active} 30%, transparent)`,
      pillHc: t.pill || r.pill,
      fillSolid: M(t.fill || r.fill),
    };
  } else n = W[t === `Auto` ? `Dark` : t];
  let r = G(A(e.itemSize, 40), 24, 72),
    i = G(A(e.iconSize, 20), 10, r),
    a = j(e.padding ?? `6px`, 6).map((e) => Math.max(0, e)),
    o = String(e.gap ?? `4px`)
      .trim()
      .split(/\s+/)
      .map((e) => parseFloat(e))
      .filter((e) => isFinite(e)),
    s = Math.max(0, o.length > 1 ? o[1] : o.length ? o[0] : A(e.gap, 4)),
    c = Math.max(0, o.length ? o[0] : s),
    l = a[0] + r + a[2],
    u = Math.min(
      Math.max(0, A(String(e.radius ?? `999px`).split(/\s+/)[0], 999)),
      l / 2,
    ),
    d = G(u - Math.min(a[0], a[3]), 0, r / 2),
    f = e.font || {},
    p = (Array.isArray(e.items) ? e.items : Ne).slice(0, 10).map((e) => ({
      label: String(e?.label ?? ``),
      icon: e?.icon && B[e.icon] ? e.icon : `home`,
      image: e?.image?.src || ``,
      href: ye(e?.link),
      newTab: !!e?.newTab,
      section: String(e?.section ?? ``)
        .trim()
        .replace(/^#/, ``),
    })),
    m = e.logoType === `Image` || e.logoType === `Text` ? e.logoType : `None`,
    h = _e(f, 14);
  return {
    items: p,
    active: Math.round(A(e.active, 1)),
    logo: {
      type: m,
      image: e.logoImage?.src || ``,
      srcSet: e.logoImage?.srcSet || ``,
      alt: e.logoImage?.alt || ``,
      round: !!e.logoRound,
      text: String(e.logoText ?? `Studio`),
      href: ye(e.logoLink),
      newTab: !!e.logoNewTab,
    },
    expand: e.expand === `Click` ? `Click` : `Hover`,
    switchAt: G(A(e.switchAt, 80), 30, 100) / 100,
    logoFont: {
      ...f,
      fontSize: Math.max(15, h + 1) + `px`,
      fontWeight: 600,
      letterSpacing: `-0.02em`,
    },
    logoH: Math.round(r * 0.6),
    layout: e.layout === `Desktop` || e.layout === `Mobile` ? e.layout : `Auto`,
    bp: G(A(e.breakpoint, 640), 0, 4e3),
    compact: e.compact !== !1,
    offset: Math.max(0, A(e.scrollOffset, 120)),
    col: n,
    auto: t === `Auto`,
    allLabels: e.labels === `All`,
    panelFont: { ...f, fontSize: Math.max(17, _e(f, 14)) + `px` },
    blur: G(A(e.blur, 20), 0, 80),
    font: f,
    item: r,
    icon: i,
    pad: a,
    gap: s,
    gapY: c,
    dg: s + 6,
    margin: j(e.margin ?? `16px`, 16).map((e) => Math.max(0, e)),
    barH: l,
    radius: u,
    ir: d,
    lo: Math.round(r * 0.1),
    lp: Math.round(r * 0.35),
    align: e.align === `Left` || e.align === `Right` ? e.align : `Center`,
    spring: ge(e.transition),
    elastic: G(A(e.elasticity, 0.6), 0, 1),
    canvas:
      e.canvas === `Compact` || e.canvas === `Menu` ? e.canvas : `Default`,
    style: e.style,
  };
}
function xe(e) {
  return `${e}:not([data-live]) .lis-li:not(.is-cur){display:none!important}${e} .lis-li.is-cur{margin-left:0}${e} .lis-more{display:none!important}${e} .lis-spacer{display:block}${e} .lis-menu{display:grid}${e} .lis-panel{display:block}${e}.no-cur .lis-div{display:none}`;
}
function N(e, t) {
  let n = xe(`.lis-root.is-mobile`);
  if (t.layout === `Auto`) {
    let r = t.bp - t.margin[1] - t.margin[3] - 0.5;
    r > 0 &&
      (n += `@container (max-width:${r.toFixed(1)}px){${xe(`.` + e + `:not([data-live])`)}}`);
  }
  return (
    t.auto &&
      (n += `.${e}{${P(W.Light)}}@media (prefers-color-scheme:dark){.${e}{${P(W.Dark)}}}`),
    n
  );
}
function Se(e) {
  return {
    "--lis-fill": e.fill,
    "--lis-border": e.border,
    "--lis-hl": e.hl,
    "--lis-shadow": ve(e.shadow) ? `0 0 #0000` : e.shadow,
    "--lis-pill": e.pill,
    "--lis-pill-hl": e.pillHl,
    "--lis-row-hover": e.rowHover,
    "--lis-icon": e.icon,
    "--lis-active": e.active,
    "--lis-divider": e.divider,
    "--lis-focus": e.focus,
    "--lis-icon-hc": e.iconHc,
    "--lis-border-hc": e.borderHc,
    "--lis-pill-hc": e.pillHc,
    "--lis-fill-solid": e.fillSolid,
  };
}
function P(e) {
  return Object.entries(Se(e))
    .map(([e, t]) => `${e}:${t}`)
    .join(`;`);
}
function Ce(e) {
  return {
    "--lis-item": e.item + `px`,
    "--lis-icon-s": e.icon + `px`,
    "--lis-gap": e.gap + `px`,
    "--lis-gap-y": e.gapY + `px`,
    "--lis-dg": e.dg + `px`,
    "--lis-pt": e.pad[0] + `px`,
    "--lis-pr": e.pad[1] + `px`,
    "--lis-pb": e.pad[2] + `px`,
    "--lis-pl": e.pad[3] + `px`,
    "--lis-bh": e.barH + `px`,
    "--lis-r": e.radius + `px`,
    "--lis-ir": e.ir + `px`,
    "--lis-lo": e.lo + `px`,
    "--lis-lp": e.lp + `px`,
    "--lis-logo-h": e.logoH + `px`,
    "--lis-blur": e.blur + `px`,
    "--lis-pw": `min(${Pe}px, 100%)`,
    ...(e.auto ? {} : Se(e.col)),
  };
}
function F(e) {
  if (e.image) {
    let t = `url("${e.image.replace(/"/g, `%22`)}")`;
    return p(`span`, {
      className: `lis-glyph lis-glyph-img`,
      "aria-hidden": `true`,
      style: { WebkitMaskImage: t, maskImage: t },
    });
  }
  return p(`svg`, {
    className: `lis-glyph`,
    viewBox: `0 0 24 24`,
    "aria-hidden": `true`,
    focusable: `false`,
    dangerouslySetInnerHTML: { __html: e.markup ?? B[e.name] ?? B.home },
  });
}
function we(e) {
  if (!e || typeof document > `u`) return null;
  let t = document.getElementById(e);
  if (t) return t;
  try {
    let t =
      typeof CSS < `u` && CSS.escape
        ? CSS.escape(e)
        : e.replace(/["\\]/g, `\\$&`);
    return document.querySelector(`[data-framer-name="${t}" i]`);
  } catch {
    return null;
  }
}
function Te(e, t) {
  return e
    ? t
      ? { href: e, target: `_blank`, rel: `noopener noreferrer` }
      : { href: e }
    : {};
}
function Ee(e) {
  return e.href ? Te(e.href, e.newTab) : { href: `#` + e.section };
}
function De(e) {
  let { r: t, scope: n, st: r, bind: i } = e,
    a = t.items.length,
    o = r.activeIdx >= 0 && r.activeIdx < a,
    s =
      `lis-root ` +
      n +
      (r.mobile === !0 ? ` is-mobile` : ``) +
      (r.compact ? ` is-compact` : ``) +
      (r.open ? ` is-open` : ``) +
      (o ? `` : ` no-cur`),
    c =
      t.align === `Left`
        ? `flex-start`
        : t.align === `Right`
          ? `flex-end`
          : `center`,
    u = n + `-panel`,
    d = t.logo,
    m = (d.type === `Image` && d.alt) || d.text,
    h = d.type === `Image` && !d.image,
    g =
      d.type === `Text`
        ? d.text.trim() !== ``
        : d.type === `Image`
          ? !!d.image || !!r.canvas
          : !1,
    _ = null;
  d.type === `Image`
    ? (_ = d.image
        ? p(`img`, {
            src: d.image,
            srcSet: d.srcSet || void 0,
            alt: m,
            draggable: !1,
          })
        : p(`span`, {
            className: `lis-logo-ph`,
            "aria-hidden": `true`,
            children: f(`svg`, {
              viewBox: `0 0 24 24`,
              focusable: `false`,
              children: [
                p(`rect`, {
                  x: `3.5`,
                  y: `4.5`,
                  width: `17`,
                  height: `15`,
                  rx: `2.5`,
                }),
                p(`path`, { d: `m5 17 4.5-4 3.5 3 2.5-2 3.5 3` }),
              ],
            }),
          }))
    : d.type === `Text` &&
      (_ = p(`span`, { style: t.logoFont, children: d.text }));
  let v =
      `lis-logo is-` +
      d.type.toLowerCase() +
      (d.type === `Image` && d.round && !h ? ` is-round` : ``),
    y = {
      ...t.style,
      ...Ce(t),
      padding: `max(${t.margin[0]}px, env(safe-area-inset-top, 0px)) max(${t.margin[1]}px, env(safe-area-inset-right, 0px)) ${t.margin[2]}px max(${t.margin[3]}px, env(safe-area-inset-left, 0px))`,
    };
  return (
    r.panelW && (y[`--lis-pw`] = r.panelW + `px`),
    f(`nav`, {
      ref: i ? (e) => i.setRoot(e) : void 0,
      className: s,
      "aria-label": `Main`,
      "data-live": r.live ? `` : void 0,
      style: y,
      children: [
        p(`style`, { dangerouslySetInnerHTML: { __html: Fe + N(n, t) } }),
        p(`span`, {
          className: `lis-measure`,
          "aria-hidden": `true`,
          ref: i ? (e) => i.setMeasure(e) : void 0,
          children: t.items.map((e, n) =>
            p(`span`, { style: t.font, children: e.label }, n),
          ),
        }),
        p(`div`, {
          className: `lis-slot`,
          style: { justifyContent: c },
          ref: i ? (e) => i.setSlot(e) : void 0,
          children: f(`div`, {
            className: `lis-island`,
            ref: i ? (e) => i.setIsland(e) : void 0,
            onPointerEnter: i?.onIslandEnter,
            onPointerLeave: i?.onIslandLeave,
            onPointerMove: i?.onIslandMove,
            onPointerUp: i?.onIslandUp,
            onPointerCancel: i?.onIslandUp,
            onFocus: i?.onIslandFocus,
            onBlur: i?.onIslandBlur,
            onKeyDown: i?.onIslandKey,
            children: [
              p(`div`, {
                className: `lis-shell`,
                "aria-hidden": `true`,
                ref: i ? (e) => i.setShell(e) : void 0,
              }),
              f(`div`, {
                className: `lis-clip`,
                children: [
                  p(`div`, {
                    className: `lis-pill`,
                    "aria-hidden": `true`,
                    ref: i ? (e) => i.setPill(e) : void 0,
                  }),
                  f(`div`, {
                    className: `lis-row`,
                    children: [
                      g &&
                        (d.href
                          ? p(`a`, {
                              className: v,
                              "aria-label": void 0,
                              draggable: !1,
                              ref: i ? (e) => i.setLogo(e) : void 0,
                              ...Te(d.href, d.newTab),
                              children: _,
                            })
                          : p(`span`, {
                              className: v,
                              "aria-label": void 0,
                              ref: i ? (e) => i.setLogo(e) : void 0,
                              children: _,
                            })),
                      g &&
                        a > 0 &&
                        p(`span`, {
                          className: `lis-div`,
                          "aria-hidden": `true`,
                          ref: i ? (e) => i.setDiv(e) : void 0,
                        }),
                      p(`ul`, {
                        className: `lis-list`,
                        children: t.items.map((e, n) => {
                          let a = n === r.activeIdx,
                            o = r.allLabels || n === r.labIdx,
                            s =
                              `lis-item` +
                              (a || n === r.pillIdx || n === r.labIdx
                                ? ` is-on`
                                : ``) +
                              (o ? ` is-lab` : ``) +
                              (n === r.pillIdx ? ` is-pill` : ``),
                            c = f(l, {
                              children: [
                                f(`span`, {
                                  className: `lis-box`,
                                  ref: i ? (e) => i.setBox(n, e) : void 0,
                                  children: [
                                    p(`span`, {
                                      className: `lis-ico`,
                                      children: p(`span`, {
                                        style: {
                                          display: `grid`,
                                          placeItems: `center`,
                                        },
                                        ref: i
                                          ? (e) => i.setGlyph(n, e)
                                          : void 0,
                                        children: p(F, {
                                          name: e.icon,
                                          image: e.image,
                                        }),
                                      }),
                                    }),
                                    p(`span`, {
                                      className: `lis-lab`,
                                      "aria-hidden": `true`,
                                      style: t.font,
                                      ref: i ? (e) => i.setLab(n, e) : void 0,
                                      children: e.label,
                                    }),
                                  ],
                                }),
                                p(`span`, {
                                  className: `lis-sr`,
                                  children: e.label,
                                }),
                              ],
                            }),
                            u = {
                              className: s,
                              ref: i ? (e) => i.setItem(n, e) : void 0,
                              onPointerMove: i
                                ? (e) => i.onItemMove(n, e)
                                : void 0,
                              onPointerDown: i
                                ? (e) => i.onItemDown(n, e)
                                : void 0,
                              onFocus: i ? (e) => i.onItemFocus(n, e) : void 0,
                              onBlur: i ? () => i.onItemBlur(n) : void 0,
                            };
                          return p(
                            `li`,
                            {
                              className: `lis-li` + (a ? ` is-cur` : ``),
                              ref: i ? (e) => i.setLi(n, e) : void 0,
                              children:
                                e.href || e.section
                                  ? p(`a`, {
                                      ...u,
                                      ...Ee(e),
                                      "aria-current": a
                                        ? r.curKind || `page`
                                        : void 0,
                                      draggable: !1,
                                      onClick: i
                                        ? (e) => i.onItemClick(n, e)
                                        : void 0,
                                      children: c,
                                    })
                                  : p(`span`, { ...u, children: c }),
                            },
                            n,
                          );
                        }),
                      }),
                      p(`button`, {
                        type: `button`,
                        className: `lis-more`,
                        "aria-label": `Show all links`,
                        tabIndex: r.compact && r.mobile !== !0 ? 0 : -1,
                        "aria-hidden":
                          r.compact && r.mobile !== !0 ? void 0 : !0,
                        onClick: i?.onMore,
                        ref: i ? (e) => i.setMore(e) : void 0,
                        children: p(F, { name: `dots`, markup: U }),
                      }),
                      p(`span`, {
                        className: `lis-spacer`,
                        "aria-hidden": `true`,
                      }),
                      f(`button`, {
                        type: `button`,
                        className: `lis-menu`,
                        "aria-expanded": r.open,
                        "aria-controls": r.panel ? u : void 0,
                        "aria-label": r.open ? `Close menu` : `Open menu`,
                        onClick: i?.onMenu,
                        ref: i ? (e) => i.setMenu(e) : void 0,
                        children: [
                          p(`span`, {
                            className: `lis-bar`,
                            "aria-hidden": `true`,
                          }),
                          p(`span`, {
                            className: `lis-bar`,
                            "aria-hidden": `true`,
                          }),
                        ],
                      }),
                    ],
                  }),
                  r.panel &&
                    p(`div`, {
                      className: `lis-panel`,
                      id: u,
                      "aria-hidden": !r.open || void 0,
                      ref: i ? (e) => i.setPanel(e) : void 0,
                      children: p(`ul`, {
                        className: `lis-plist`,
                        children: t.items.map((e, n) => {
                          let a = n === r.activeIdx,
                            o = { "--d": `${70 + n * 28}ms` },
                            s = f(l, {
                              children: [
                                p(`span`, {
                                  className: `lis-ico`,
                                  children: p(F, {
                                    name: e.icon,
                                    image: e.image,
                                  }),
                                }),
                                p(`span`, {
                                  className: `lis-ptext`,
                                  style: t.panelFont,
                                  children: e.label,
                                }),
                              ],
                            });
                          return p(
                            `li`,
                            {
                              children:
                                e.href || e.section
                                  ? p(`a`, {
                                      className:
                                        `lis-prow` + (a ? ` is-cur` : ``),
                                      style: o,
                                      "aria-current": a
                                        ? r.curKind || `page`
                                        : void 0,
                                      draggable: !1,
                                      ...Ee(e),
                                      onClick: i
                                        ? (e) => i.onPanelClick(n, e)
                                        : void 0,
                                      children: s,
                                    })
                                  : p(`span`, {
                                      className:
                                        `lis-prow` + (a ? ` is-cur` : ``),
                                      style: o,
                                      children: s,
                                    }),
                            },
                            n,
                          );
                        }),
                      }),
                    }),
                ],
              }),
            ],
          }),
        }),
      ],
    })
  );
}
function I(e, t, n) {
  let r = -t.k * (e.x - e.t) - t.c * e.v;
  ((e.v += (r / t.m) * n), (e.x += e.v * n));
}
function L(e, t) {
  return Math.abs(e.x - e.t) < t && Math.abs(e.v) < t * 20;
}
function Oe() {
  let e = d;
  return `lis-` + (e.useId ? e.useId() : `x`).replace(/[^a-zA-Z0-9_-]/g, ``);
}
function ke(e, t) {
  if (!e || e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n++)
    if (Math.abs(e[n] - t[n]) > 0.25) return !1;
  return !0;
}
function Ae(e) {
  let { r: t } = e,
    n = Oe(),
    r = t.items.length,
    [i, a] = s(null),
    [l, u] = s(null),
    [d, f] = s(null),
    [m, h] = s(!1),
    [g, v] = s(!1),
    [y, ee] = s(!1),
    [te, ne] = s(!1),
    [b, x] = s(!1),
    [re, ie] = s(0),
    [ae, oe] = s(0),
    [se, ce] = s(0),
    [le, ue] = s(null),
    [de, S] = s(null),
    [C, w] = s(0),
    [T, E] = s(null),
    [fe, D] = s(null),
    [pe, me] = s(null),
    [he, O] = s(!1),
    [k, A] = s(!1),
    j = c(null),
    ge = c(null),
    M = c(null),
    _e = c(null),
    ve = c(null),
    ye = c(null),
    be = c(null),
    xe = c(null),
    N = c(null),
    Se = c(null),
    P = c(null),
    Ce = c([]),
    F = c([]),
    Te = c([]),
    Ee = c([]),
    I = c([]),
    L = c(null);
  L.current ||= new Ie();
  let Ae = c(null),
    R = c(null),
    z = c(null),
    B = c(null),
    V = c(!1),
    H = c({ x: -1, y: -1, t: -1e9, ev: null }),
    U = c({ armed: !0, x: -1, y: -1 }),
    W = c(null),
    G = c(0),
    K = c([]),
    q = c(null),
    J = c(null),
    Me = c(``),
    Ne = c(!1),
    Fe = c(0),
    Y = c(!1),
    Le = c(null);
  ((Ae.current = i), (Ne.current = b), (V.current = te));
  let Re = t.active >= 1 && t.active <= r ? t.active - 1 : -1,
    ze = pe !== null && pe < r ? pe : null,
    X =
      T !== null && T < r
        ? T
        : ze === null
          ? fe !== null && fe < r
            ? fe
            : Re
          : ze,
    Be = T === null && ze !== null ? `location` : `page`,
    Ve = (de || []).map((e) => e + t.lp - t.lo),
    He = Ve.length ? Math.max(...Ve) : 0,
    Ue = ae > 0 ? ae : Math.max(0, re - t.margin[1] - t.margin[3]),
    We =
      t.logo.type === `Text`
        ? t.logo.text.trim() !== ``
        : t.logo.type === `Image` && !!t.logo.image,
    Ge = se > 0 ? se : t.item,
    Z = We ? Ge + t.dg + (r > 0 ? 1 + t.dg : 0) : 0,
    Ke = t.allLabels ? Ve.reduce((e, t) => e + t, 0) : He,
    qe = t.pad[3] + Z + r * t.item + Math.max(0, r - 1) * t.gap + Ke + t.pad[1],
    Je = de !== null && re > 0,
    Ye =
      t.layout === `Mobile`
        ? !0
        : t.layout === `Desktop`
          ? !1
          : Je
            ? re < t.bp || qe > Ue + 0.5
            : null,
    Q = Ye === !0,
    Xe = !Q && t.compact && y && !te && !g && !(t.expand === `Hover` && m),
    Ze = Math.min(Pe, Math.max(0, Ue)),
    $,
    Qe;
  Q
    ? (($ = b ? -1 : X), (Qe = b ? -1 : X))
    : Xe
      ? (($ = X), (Qe = X))
      : (($ = i ?? d ?? X), (Qe = l ?? d ?? X));
  let $e = {
    mobile: Ye,
    compact: Xe,
    open: Q && b,
    activeIdx: X,
    labIdx: Qe,
    pillIdx: $,
    hoverIdx: i ?? -1,
    live: k,
    panel: Q,
    allLabels: t.allLabels && !Q,
    panelW: Q && Ze > 0 ? Ze : void 0,
    curKind: Be,
  };
  (je(() => {
    let e = j.current,
      n = Se.current;
    if (!e || !n) return;
    let i = e.getBoundingClientRect().width,
      a = ge.current ? ge.current.getBoundingClientRect().width : 0,
      o = P.current ? P.current.getBoundingClientRect().width : 0;
    if (
      Math.abs(i - re) > 0.5 ||
      Math.abs(a - ae) > 0.5 ||
      Math.abs(o - se) > 0.25
    ) {
      (ie(i), oe(a), ce(o));
      return;
    }
    let s = [],
      c = n.children;
    for (let e = 0; e < r; e++) {
      let t = c[e];
      s.push(t ? Math.ceil(t.getBoundingClientRect().width * 4) / 4 : 0);
    }
    if (!ke(de, s)) {
      S(s);
      return;
    }
    if (Q && N.current) {
      let e = N.current.offsetHeight;
      if (Math.abs(e - C) > 0.5) {
        w(e);
        return;
      }
    }
    if (Ye === null) return;
    let l = L.current,
      u = {
        n: r,
        item: t.item,
        pad: t.pad,
        gap: t.gap,
        dg: t.dg,
        logo: We,
        logoW: We ? Ge : 0,
        div: We && r > 0 && !(Q && X < 0),
        extras: Ve,
        mobile: Q,
        panelW: Ze,
        panelH: C,
        align: t.align,
        barH: t.barH,
        radius: t.radius,
        spring: t.spring,
        elastic: t.elastic,
        reduced: he,
      },
      d = {
        p: t.items.map((e, n) => (n === Qe || (t.allLabels && !Q) ? 1 : 0)),
        c: t.items.map((e, t) => (Q ? +(t === X && !b) : Xe ? +(t === X) : 1)),
        m: !Q && Xe ? 1 : 0,
        o: Q && b ? 1 : 0,
        pill: $,
        press: +(le !== null && le === $ && !Q),
        pivot: X,
      },
      f = {
        island: M.current,
        shell: _e.current,
        pill: ve.current,
        div: ye.current,
        more: be.current,
        panel: N.current,
        lis: Ce.current.slice(0, r),
        items: F.current.slice(0, r),
        labs: Te.current.slice(0, r),
        glyphs: Ee.current.slice(0, r),
        boxes: I.current.slice(0, r),
      },
      p = Le.current !== Q;
    ((Le.current = Q), l.update(f, u, d, !k || p), k || A(!0));
  }),
    _(() => {
      let e = j.current,
        t = Se.current;
      if (!e || typeof ResizeObserver > `u`) return;
      let n = 0,
        r = new ResizeObserver(() => {
          n ||= requestAnimationFrame(() => {
            n = 0;
            let r = e.getBoundingClientRect().width;
            ie((e) => (Math.abs(e - r) > 0.5 ? r : e));
            let i = ge.current;
            if (i) {
              let e = i.getBoundingClientRect().width;
              oe((t) => (Math.abs(t - e) > 0.5 ? e : t));
            }
            let a = P.current,
              o = a ? a.getBoundingClientRect().width : 0;
            if ((ce((e) => (Math.abs(e - o) > 0.25 ? o : e)), t)) {
              let e = [];
              for (let n = 0; n < t.children.length; n++)
                e.push(
                  Math.ceil(t.children[n].getBoundingClientRect().width * 4) /
                    4,
                );
              S((t) => (ke(t, e) ? t : e));
            }
          });
        });
      if ((r.observe(e), t))
        for (let e = 0; e < t.children.length; e++) r.observe(t.children[e]);
      let i = P.current;
      i && r.observe(i);
      let a = document.fonts,
        o = !0;
      return (
        a &&
          a.ready &&
          a.ready.then(() => {
            if (!o || !t) return;
            let e = [];
            for (let n = 0; n < t.children.length; n++)
              e.push(
                Math.ceil(t.children[n].getBoundingClientRect().width * 4) / 4,
              );
            S((t) => (ke(t, e) ? t : e));
          }),
        () => {
          ((o = !1), r.disconnect(), n && cancelAnimationFrame(n));
        }
      );
    }, [r, t.logo.type, t.logo.image, t.logo.text]),
    _(() => {
      let e = N.current;
      if (!e || typeof ResizeObserver > `u`) return;
      let t = new ResizeObserver(() => {
        let t = e.offsetHeight;
        w((e) => (Math.abs(e - t) > 0.5 ? t : e));
      });
      return (t.observe(e), () => t.disconnect());
    }, [Q, r]),
    _(() => {
      let e = N.current;
      e && e.toggleAttribute(`inert`, !(Q && b));
    }, [Q, b]),
    _(() => {
      let e = j.current,
        t = L.current;
      if (!e || !t || typeof IntersectionObserver > `u`) return;
      let n = new IntersectionObserver((e) => {
        let n = e[e.length - 1];
        n && t.setVisible(n.isIntersecting);
      });
      return (
        n.observe(e),
        () => {
          (n.disconnect(), t.setVisible(!0));
        }
      );
    }, []),
    _(() => {
      if (o === void 0 || !o.matchMedia) return;
      let e = o.matchMedia(`(prefers-reduced-motion: reduce)`),
        t = () => O(e.matches);
      return (
        t(),
        e.addEventListener ? e.addEventListener(`change`, t) : e.addListener(t),
        () => {
          e.removeEventListener
            ? e.removeEventListener(`change`, t)
            : e.removeListener(t);
        }
      );
    }, []),
    _(() => {
      if (o === void 0) return;
      let e = o.location.href,
        n = () => {
          let n = o.location;
          n.href !== e && ((e = n.href), E(null));
          let r = (e) => e.replace(/\/+$/, ``) || `/`,
            i = null;
          for (let e = 0; e < t.items.length && i === null; e++) {
            let a = t.items[e].href;
            if (a)
              try {
                let t = new URL(a, n.href);
                if (
                  t.origin !== n.origin ||
                  r(t.pathname) !== r(n.pathname) ||
                  (t.hash && t.hash !== n.hash)
                )
                  continue;
                i = e;
              } catch {}
          }
          D(i);
        };
      n();
      let r,
        i,
        a = () => {
          (r && clearTimeout(r),
            i && clearTimeout(i),
            (r = setTimeout(n, 80)),
            (i = setTimeout(n, 500)));
        };
      return (
        o.addEventListener(`popstate`, n),
        o.addEventListener(`hashchange`, n),
        document.addEventListener(`click`, a, !0),
        () => {
          (r && clearTimeout(r),
            i && clearTimeout(i),
            o.removeEventListener(`popstate`, n),
            o.removeEventListener(`hashchange`, n),
            document.removeEventListener(`click`, a, !0));
        }
      );
    }, [
      t.items.map((e) => e.href).join(`
`),
    ]),
    _(() => {
      if (o === void 0) return;
      let e = o.location,
        n = (e) => e.replace(/\/+$/, ``) || `/`,
        r = t.items.map((t) => {
          if (t.section) return t.section;
          if (!t.href) return ``;
          try {
            let r = new URL(t.href, e.href);
            if (
              r.origin === e.origin &&
              n(r.pathname) === n(e.pathname) &&
              r.hash.length > 1
            )
              return decodeURIComponent(r.hash.slice(1));
          } catch {}
          return ``;
        });
      if (((K.current = r), !r.some(Boolean))) {
        me(null);
        return;
      }
      let i = 0,
        a,
        s,
        c,
        l = 0,
        u = (e) => {
          ((s = e), (c = void 0), me((t) => (t === e ? t : e)));
        },
        d = () => {
          i = 0;
          let e = o.innerHeight || document.documentElement.clientHeight,
            n = o.scrollY || 0,
            d =
              n > 0 &&
              Math.ceil(n + e) >= document.documentElement.scrollHeight - 2,
            p = [],
            m = [];
          for (let t = 0; t < r.length; t++) {
            let n = we(r[t]),
              i = n ? n.getBoundingClientRect() : null;
            if (!i || i.height <= 0) {
              (p.push(-1), m.push(0));
              continue;
            }
            let a = Math.max(0, Math.min(i.bottom, e) - Math.max(i.top, 0));
            (p.push(a / Math.max(1, Math.min(e, i.height))), m.push(i.top));
          }
          let h = q.current;
          if (h && (performance.now() > h.until || !(p[h.i] >= 0)))
            q.current = null;
          else if (h)
            return (p[h.i] >= t.switchAt - 0.001 && (q.current = null), u(h.i));
          let g = s === void 0 ? null : s,
            _ = [];
          for (let e = 0; e < p.length; e++)
            p[e] >= t.switchAt - 0.001 && _.push(e);
          let v = null;
          if (d) {
            for (let e = 0; e < p.length; e++)
              p[e] >= 0.25 && (v === null || m[e] > m[v]) && (v = e);
            v === null && (v = g);
          } else if (g !== null && _.indexOf(g) >= 0) v = g;
          else if (_.length) {
            v = _[0];
            for (let e of _)
              (p[e] > p[v] + 0.001 ||
                (Math.abs(p[e] - p[v]) <= 0.001 && m[e] < m[v])) &&
                (v = e);
          } else if (g !== null && p[g] > 0) v = g;
          else if (g !== null)
            for (let e = 0; e < p.length; e++)
              p[e] > 0 && (v === null || p[e] > p[v]) && (v = e);
          if (s === void 0) return u(v);
          if (v === s) {
            c = void 0;
            return;
          }
          let y = performance.now();
          if ((c !== v && ((c = v), (l = y)), y - l >= 140)) return u(v);
          (a && clearTimeout(a), (a = setTimeout(f, 150 - (y - l))));
        },
        f = () => {
          i ||= requestAnimationFrame(d);
        };
      (d(), (J.current = f));
      let p = () => {
          q.current = null;
        },
        m = [`wheel`, `touchstart`, `keydown`, `pointerdown`];
      m.forEach((e) => o.addEventListener(e, p, { capture: !0, passive: !0 }));
      let h = [300, 1200].map((e) => setTimeout(f, e));
      return (
        o.addEventListener(`scroll`, f, { passive: !0 }),
        o.addEventListener(`resize`, f),
        () => {
          (h.forEach(clearTimeout),
            a && clearTimeout(a),
            (J.current = null),
            m.forEach((e) => o.removeEventListener(e, p, { capture: !0 })),
            o.removeEventListener(`scroll`, f),
            o.removeEventListener(`resize`, f),
            i && cancelAnimationFrame(i));
        }
      );
    }, [
      t.items.map((e) => e.section + `|` + e.href).join(`
`),
      t.switchAt,
    ]),
    _(() => {
      if (o === void 0) return;
      let e = o.scrollY || 0,
        n = 0,
        r = 0,
        i = 0,
        a = 0,
        s = (e) => {
          Y.current !== e && ((Y.current = e), ee(e), e && ne(!1));
        },
        c = () => {
          a = 0;
          let c = o.scrollY || 0,
            l = c - e;
          if (
            ((e = c),
            Ne.current && Math.abs(c - Fe.current) > 64 && x(!1),
            c <= t.offset)
          ) {
            ((n = 0), (r = 0), s(!1));
            return;
          }
          (V.current && l > 0
            ? ((i += l), i > 48 && ((i = 0), (V.current = !1), ne(!1)))
            : (!V.current || l < 0) && (i = 0),
            l > 0
              ? ((n += l), (r = 0), n > 10 && s(!0))
              : l < 0 && ((r -= l), (n = 0), r > 10 && s(!1)));
        },
        l = () => {
          a ||= requestAnimationFrame(c);
        };
      return (
        c(),
        o.addEventListener(`scroll`, l, { passive: !0 }),
        () => {
          (o.removeEventListener(`scroll`, l), a && cancelAnimationFrame(a));
        }
      );
    }, [t.offset]),
    _(() => {
      if (!b) return;
      Fe.current = o.scrollY || 0;
      let e = (e) => {
          let t = M.current;
          t && e.target instanceof Node && !t.contains(e.target) && x(!1);
        },
        t = (e) => {
          if (e.key !== `Escape`) return;
          let t = M.current,
            n = document.activeElement,
            r = !!(t && n && t.contains(n));
          (x(!1), (r || n === document.body) && xe.current?.focus());
        };
      return (
        document.addEventListener(`pointerdown`, e, !0),
        document.addEventListener(`keydown`, t),
        () => {
          (document.removeEventListener(`pointerdown`, e, !0),
            document.removeEventListener(`keydown`, t));
        }
      );
    }, [b]),
    _(() => {
      !Q && b && x(!1);
    }, [Q, b]),
    _(() => {
      if (o === void 0) return;
      let e = (e) => {
        if (e.pointerType === `touch`) return;
        let t = H.current;
        if (t.x < 0) {
          ((t.x = e.clientX), (t.y = e.clientY), (t.ev = null));
          return;
        }
        Math.abs(e.clientX - t.x) + Math.abs(e.clientY - t.y) > 0.5
          ? ((t.x = e.clientX),
            (t.y = e.clientY),
            (t.t = performance.now()),
            (t.ev = e))
          : (t.ev = null);
      };
      return (
        o.addEventListener(`pointermove`, e, { capture: !0, passive: !0 }),
        () => o.removeEventListener(`pointermove`, e, { capture: !0 })
      );
    }, []));
  let et = (Xe ? `c` : `e`) + (b ? `o` : ``);
  (_(() => {
    let e = W.current;
    ((W.current = et),
      !(e === null || e === et) &&
        ((G.current = performance.now()),
        (U.current = { armed: !1, x: H.current.x, y: H.current.y }),
        M.current?.removeAttribute(`data-pt`),
        R.current && clearTimeout(R.current),
        (R.current = null),
        a(null),
        u(null)));
  }, [et]),
    _(
      () => () => {
        (L.current?.stop(),
          R.current && clearTimeout(R.current),
          z.current && clearTimeout(z.current),
          B.current && clearTimeout(B.current));
      },
      [],
    ));
  let tt = (e) => e.pointerType === `mouse` || e.pointerType === `pen`,
    nt = (e) => H.current.ev === e.nativeEvent,
    rt = () => {
      (R.current && clearTimeout(R.current), (R.current = null));
    },
    it = (e) => {
      let t = U.current;
      return t.armed
        ? !0
        : t.x < 0
          ? ((t.x = e.clientX), (t.y = e.clientY), !1)
          : Math.hypot(e.clientX - t.x, e.clientY - t.y) < 4
            ? !1
            : ((t.armed = !0), !0);
    },
    at = (e) => !!we(K.current[e]),
    ot = (e) => {
      let n = t.items[e];
      if (!n) return ``;
      if (!n.href) return n.section;
      if (n.newTab) return ``;
      try {
        let e = o.location,
          t = (e) => e.replace(/\/+$/, ``) || `/`,
          r = new URL(n.href, e.href);
        if (
          r.origin !== e.origin ||
          t(r.pathname) !== t(e.pathname) ||
          (r.search && r.search !== e.search)
        )
          return ``;
        let i =
          r.hash.length > 1 ? decodeURIComponent(r.hash.slice(1)) : n.section;
        return we(i) ? i : ``;
      } catch {
        return ``;
      }
    },
    st = (e, t) => {
      if (t.button !== 0 || t.metaKey || t.ctrlKey || t.shiftKey || t.altKey)
        return !1;
      let n = ot(e);
      if (!n) return !1;
      t.preventDefault();
      let r = we(n);
      if (!r) return !0;
      if (
        (E(null),
        (q.current =
          K.current[e] === n ? { i: e, until: performance.now() + 3e3 } : null),
        q.current && setTimeout(() => J.current?.(), 3050),
        r.scrollIntoView({
          behavior: he ? `auto` : `smooth`,
          block: `start`,
          inline: `nearest`,
        }),
        t.detail === 0)
      ) {
        let e = !r.hasAttribute(`tabindex`),
          t = r.style.outline,
          n = () => {
            (r.removeAttribute(`tabindex`), (r.style.outline = t));
          };
        e && (r.setAttribute(`tabindex`, `-1`), (r.style.outline = `none`));
        try {
          r.focus({ preventScroll: !0 });
        } catch {}
        e &&
          (document.activeElement === r
            ? r.addEventListener(`blur`, n, { once: !0 })
            : n());
      }
      if (document.getElementById(n) === r)
        try {
          let e = new URL(o.location.href);
          if (((e.hash = n), e.href !== o.location.href)) {
            let t = o.history.state,
              r =
                t && typeof t == `object` && `routeId` in t
                  ? { ...t, hash: n }
                  : t;
            o.history.replaceState(r, ``, e.pathname + e.search + e.hash);
          }
        } catch {}
      return (J.current?.(), !0);
    },
    ct = () => {
      let e = M.current;
      e && !e.hasAttribute(`data-pt`) && e.setAttribute(`data-pt`, ``);
    },
    lt = () => {
      t.expand !== `Hover` ||
        m ||
        B.current ||
        (B.current = setTimeout(() => {
          ((B.current = null), h(!0));
        }, 180));
    };
  return p(De, {
    r: t,
    scope: n,
    st: $e,
    bind: {
      setRoot: (e) => {
        j.current = e;
      },
      setSlot: (e) => {
        ge.current = e;
      },
      setIsland: (e) => {
        M.current = e;
      },
      setShell: (e) => {
        _e.current = e;
      },
      setPill: (e) => {
        ve.current = e;
      },
      setDiv: (e) => {
        ye.current = e;
      },
      setLi: (e, t) => {
        Ce.current[e] = t;
      },
      setItem: (e, t) => {
        F.current[e] = t;
      },
      setLab: (e, t) => {
        Te.current[e] = t;
      },
      setGlyph: (e, t) => {
        Ee.current[e] = t;
      },
      setBox: (e, t) => {
        I.current[e] = t;
      },
      setMore: (e) => {
        be.current = e;
      },
      setMenu: (e) => {
        xe.current = e;
      },
      setPanel: (e) => {
        N.current = e;
      },
      setMeasure: (e) => {
        Se.current = e;
      },
      setLogo: (e) => {
        P.current = e;
      },
      onItemDown: (e, t) => {
        ((Me.current = t.pointerType), !(!tt(t) || Q) && ue(e));
      },
      onIslandUp: () => {
        ue(null);
      },
      onIslandEnter: (e) => {
        tt(e) &&
          (performance.now() - H.current.t > 100 ||
            (z.current && clearTimeout(z.current),
            (z.current = null),
            U.current.x < 0 && (U.current.armed = !0),
            it(e) && (ct(), lt())));
      },
      onIslandLeave: (e) => {
        tt(e) &&
          (ue(null),
          rt(),
          a(null),
          u(null),
          B.current && clearTimeout(B.current),
          (B.current = null),
          z.current && clearTimeout(z.current),
          M.current?.removeAttribute(`data-pt`),
          (z.current = setTimeout(() => {
            ((z.current = null), h(!1));
          }, 260)));
      },
      onIslandMove: (e) => {
        !tt(e) ||
          !nt(e) ||
          (z.current && clearTimeout(z.current),
          (z.current = null),
          it(e) && (ct(), lt()));
      },
      onIslandFocus: (e) => {
        let t = !1;
        try {
          t = e.target.matches(`:focus-visible`);
        } catch {
          t = !1;
        }
        t && v(!0);
      },
      onIslandBlur: (e) => {
        let t = M.current,
          n = e.relatedTarget;
        (t && n && t.contains(n)) || (v(!1), f(null), Ne.current && n && x(!1));
      },
      onIslandKey: () => {},
      onItemMove: (e, n) => {
        !tt(n) ||
          Q ||
          !nt(n) ||
          !it(n) ||
          (Ae.current !== e &&
            ((Ae.current = e),
            a(e),
            rt(),
            !t.allLabels &&
              (R.current = setTimeout(() => {
                ((R.current = null), u(e));
              }, 140))));
      },
      onItemFocus: (e, t) => {
        let n = !1;
        try {
          n = t.currentTarget.matches(`:focus-visible`);
        } catch {
          n = !1;
        }
        n && f(e);
      },
      onItemBlur: (e) => {
        f((t) => (t === e ? null : t));
      },
      onItemClick: (e, n) => {
        let r = t.items[e];
        if (!r || (!r.href && !r.section)) return;
        let i = !U.current.armed && performance.now() - G.current < 500;
        if (n.detail > 0 && Me.current === `mouse` && i) {
          n.preventDefault();
          return;
        }
        st(e, n) || !r.href || at(e) || r.newTab || E(e);
      },
      onPanelClick: (e, n) => {
        let r = t.items[e];
        !r ||
          (!r.href && !r.section) ||
          (!st(e, n) && r.href && !r.newTab && !at(e) && E(e), x(!1));
      },
      onMore: (e) => {
        if (((V.current = !0), ne(!0), e.detail === 0)) {
          let e = t.items.map((e, t) => t).filter((e) => e !== X),
            n = e.find((e) => e > X) ?? e[0];
          n !== void 0 &&
            setTimeout(() => {
              let e = F.current[n];
              e && e.tagName === `A` && e.focus();
            }, 80);
        }
      },
      onMenu: () => {
        x((e) => !e);
      },
    },
  });
}
function R(e) {
  let { r: t } = e,
    n = Oe(),
    r = t.items.length,
    i = t.active >= 1 && t.active <= r ? t.active - 1 : -1,
    a = t.canvas === `Menu`,
    o = t.canvas === `Compact`,
    s = a || t.layout === `Mobile` ? !0 : t.layout !== `Desktop` && null;
  return p(De, {
    r: t,
    scope: n,
    st: {
      mobile: s,
      compact: o,
      open: a,
      activeIdx: i,
      labIdx: a ? -1 : i,
      pillIdx: a ? -1 : i,
      hoverIdx: -1,
      live: !1,
      canvas: !0,
      panel: a,
      allLabels: t.allLabels && s !== !0,
    },
  });
}
function z(e) {
  let t = ce(),
    n = be(e);
  return p(t ? R : Ae, { r: n });
}
var je,
  B,
  V,
  H,
  U,
  W,
  G,
  K,
  q,
  J,
  Me,
  Ne,
  Pe,
  Fe,
  Y,
  Ie,
  Le = e(() => {
    (i(),
      h(),
      g(),
      b(),
      (je = o === void 0 ? _ : r),
      (B = {
        home: `<path class="f" d="M4.5 10.2 12 4.25l7.5 5.95v8.3a1.5 1.5 0 0 1-1.5 1.5h-3.25v-5.25h-5.5V20H6a1.5 1.5 0 0 1-1.5-1.5z"/>`,
        grid: `<rect class="f" x="4" y="4" width="6.5" height="6.5" rx="1.75"/><rect class="f" x="13.5" y="4" width="6.5" height="6.5" rx="1.75"/><rect class="f" x="4" y="13.5" width="6.5" height="6.5" rx="1.75"/><rect class="f" x="13.5" y="13.5" width="6.5" height="6.5" rx="1.75"/>`,
        sparkle: `<path class="f" d="M12 4.5c.6 4.1 3.4 6.9 7.5 7.5-4.1.6-6.9 3.4-7.5 7.5-.6-4.1-3.4-6.9-7.5-7.5 4.1-.6 6.9-3.4 7.5-7.5z"/>`,
        pen: `<path class="f" d="M14.5 5.5 18.5 9.5 9.5 18.5H5.5V14.5z"/><path d="m12.5 7.5 4 4"/>`,
        book: `<path class="f" d="M12 6.5c-1.6-1.3-3.9-2-7.5-2v13c3.6 0 5.9.7 7.5 2 1.6-1.3 3.9-2 7.5-2v-13c-3.6 0-5.9.7-7.5 2z"/><path d="M12 6.5v13"/>`,
        user: `<circle class="f" cx="12" cy="8.5" r="3.75"/><path class="f" d="M5 19.5c.9-3.4 3.6-5.25 7-5.25s6.1 1.85 7 5.25"/>`,
        mail: `<rect class="f" x="3.75" y="5.5" width="16.5" height="13" rx="2.75"/><path d="m4.75 7.75 6.2 4.6a1.75 1.75 0 0 0 2.1 0l6.2-4.6"/>`,
        search: `<circle class="f" cx="11" cy="11" r="6.25"/><path d="m19.5 19.5-3.9-3.9"/>`,
        bag: `<path class="f" d="M5.75 8.5h12.5l-.9 10.1a1.5 1.5 0 0 1-1.5 1.4H8.15a1.5 1.5 0 0 1-1.5-1.4z"/><path d="M9 8.5V7.25a3 3 0 0 1 6 0V8.5"/>`,
        briefcase: `<rect class="f" x="3.75" y="7.25" width="16.5" height="12" rx="2.5"/><path d="M9 7.25V5.75a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v1.5M3.75 12.5h16.5"/>`,
        layers: `<path class="f" d="m12 4.5 8 4.5-8 4.5-8-4.5z"/><path d="m4 14 8 4.5 8-4.5"/>`,
        compass: `<circle class="f" cx="12" cy="12" r="8.25"/><path class="f" d="m15.25 8.75-1.9 4.6-4.6 1.9 1.9-4.6z"/>`,
        chat: `<path class="f" d="M19.75 11.75c0 3.9-3.5 7-7.75 7-1.1 0-2.15-.2-3.1-.57L4.5 19.5l1.2-3.4c-.92-1.25-1.45-2.75-1.45-4.35 0-3.9 3.5-7 7.75-7s7.75 3.1 7.75 7z"/>`,
        bell: `<path class="f" d="M6.5 16.5v-5a5.5 5.5 0 0 1 11 0v5l1.5 1.5H5z"/><path d="M10 20.25a2.1 2.1 0 0 0 4 0"/>`,
        heart: `<path class="f" d="M12 19.25s-7.25-4.3-7.25-9.6A4.15 4.15 0 0 1 12 7.1a4.15 4.15 0 0 1 7.25 2.55c0 5.3-7.25 9.6-7.25 9.6z"/>`,
        star: `<path class="f" d="m12 4.25 2.35 4.8 5.3.77-3.83 3.73.9 5.27L12 16.33l-4.72 2.49.9-5.27-3.83-3.73 5.3-.77z"/>`,
        calendar: `<rect class="f" x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.75v3.5M15.5 3.75v3.5"/>`,
        code: `<path d="m8.75 7.5-4.5 4.5 4.5 4.5M15.25 7.5l4.5 4.5-4.5 4.5M13.4 5.25l-2.8 13.5"/>`,
        play: `<path class="f" d="M8 6.2v11.6a1 1 0 0 0 1.53.85l9.2-5.8a1 1 0 0 0 0-1.7l-9.2-5.8A1 1 0 0 0 8 6.2z"/>`,
        camera: `<path class="f" d="M4 9a2 2 0 0 1 2-2h1.6l1.4-2h6l1.4 2H18a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.25"/>`,
        music: `<path d="M9 17.5V6.25l10-1.75v11.5"/><circle class="f" cx="6.75" cy="17.5" r="2.25"/><circle class="f" cx="16.75" cy="16" r="2.25"/>`,
        globe: `<circle class="f" cx="12" cy="12" r="8.25"/><path d="M3.75 12h16.5M12 3.75c2.2 2.3 3.3 5 3.3 8.25s-1.1 5.95-3.3 8.25c-2.2-2.3-3.3-5-3.3-8.25s1.1-5.95 3.3-8.25z"/>`,
        sliders: `<path d="M4 7.5h9M17 7.5h3M4 16.5h3M11 16.5h9"/><circle class="f" cx="15" cy="7.5" r="2"/><circle class="f" cx="9" cy="16.5" r="2"/>`,
        folder: `<path class="f" d="M3.75 7.25a2 2 0 0 1 2-2h3.6l2 2.25h6.9a2 2 0 0 1 2 2v8.25a2 2 0 0 1-2 2H5.75a2 2 0 0 1-2-2z"/>`,
        image: `<rect class="f" x="3.75" y="4.75" width="16.5" height="14.5" rx="2.75"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17.25 4.6-4.1a1.5 1.5 0 0 1 2 0l2.4 2.15 2.1-1.75a1.5 1.5 0 0 1 1.95.05L20 15.8"/>`,
        bolt: `<path class="f" d="M13.25 3.75 5.75 13.25h6l-1 7 7.5-9.5h-6z"/>`,
        moon: `<path class="f" d="M19.25 14.6A7.75 7.75 0 0 1 9.4 4.75a7.75 7.75 0 1 0 9.85 9.85z"/>`,
        sun: `<circle class="f" cx="12" cy="12" r="3.75"/><path d="M12 3.5v1.75M12 18.75v1.75M3.5 12h1.75M18.75 12h1.75M5.99 5.99l1.24 1.24M16.77 16.77l1.24 1.24M5.99 18.01l1.24-1.24M16.77 7.23l1.24-1.24"/>`,
        plus: `<path d="M12 5.5v13M5.5 12h13"/>`,
        arrow: `<path d="M7.5 16.5 16.5 7.5M9 7.5h7.5V15"/>`,
      }),
      (V = Object.keys(B)),
      (H =
        `Home.Grid.Sparkle.Pen.Book.User.Mail.Search.Bag.Briefcase.Layers.Compass.Chat.Bell.Heart.Star.Calendar.Code.Play.Camera.Music.Globe.Sliders.Folder.Image.Bolt.Moon.Sun.Plus.Arrow`.split(
          `.`,
        )),
      (U = `<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>`),
      (W = {
        Dark: {
          fill: `rgba(16, 16, 19, 0.9)`,
          border: `rgba(255, 255, 255, 0.08)`,
          hl: `rgba(255, 255, 255, 0.07)`,
          shadow: `0px 1px 2px 0px rgba(0, 0, 0, 0.18), 0px 14px 34px -12px rgba(0, 0, 0, 0.55)`,
          pill: `rgba(255, 255, 255, 0.12)`,
          pillHl: `rgba(255, 255, 255, 0.09)`,
          rowHover: `rgba(255, 255, 255, 0.06)`,
          icon: `rgba(255, 255, 255, 0.56)`,
          active: `#FFFFFF`,
          divider: `rgba(255, 255, 255, 0.12)`,
          focus: `rgba(255, 255, 255, 0.92)`,
          iconHc: `rgba(255, 255, 255, 0.82)`,
          borderHc: `rgba(255, 255, 255, 0.28)`,
          pillHc: `rgba(255, 255, 255, 0.2)`,
          fillSolid: `#101013`,
        },
        Light: {
          fill: `rgba(255, 255, 255, 0.8)`,
          border: `rgba(15, 15, 20, 0.07)`,
          hl: `rgba(255, 255, 255, 0.95)`,
          shadow: `0px 1px 2px 0px rgba(15, 15, 20, 0.06), 0px 12px 32px -14px rgba(15, 15, 20, 0.28)`,
          pill: `rgba(15, 15, 20, 0.065)`,
          pillHl: `rgba(255, 255, 255, 0.7)`,
          rowHover: `rgba(15, 15, 20, 0.04)`,
          icon: `rgba(15, 15, 20, 0.6)`,
          active: `#0F0F14`,
          divider: `rgba(15, 15, 20, 0.1)`,
          focus: `rgba(15, 15, 20, 0.88)`,
          iconHc: `rgba(15, 15, 20, 0.8)`,
          borderHc: `rgba(15, 15, 20, 0.24)`,
          pillHc: `rgba(15, 15, 20, 0.11)`,
          fillSolid: `#FFFFFF`,
        },
      }),
      (G = (e, t, n) => (e < t ? t : e > n ? n : e)),
      (K = (e) => G(e, 0, 1)),
      (q = (e, t, n) => {
        let r = K((n - e) / (t - e));
        return r * r * (3 - 2 * r);
      }),
      (J = (e) => e.toFixed(2) + `px`),
      (Me = new WeakMap()),
      (Ne = [
        { label: `Home`, icon: `home`, link: ``, newTab: !1 },
        { label: `Work`, icon: `grid`, link: ``, newTab: !1 },
        { label: `Lab`, icon: `sparkle`, link: ``, newTab: !1 },
        { label: `Journal`, icon: `pen`, link: ``, newTab: !1 },
        { label: `About`, icon: `user`, link: ``, newTab: !1 },
        { label: `Contact`, icon: `mail`, link: ``, newTab: !1 },
      ]),
      (Pe = 400),
      (Fe = `
.lis-root{position:relative;box-sizing:border-box;width:100%;pointer-events:none;container-type:inline-size;-webkit-tap-highlight-color:transparent}
.lis-root *,.lis-root *::before,.lis-root *::after{box-sizing:border-box}
.lis-slot{position:relative;display:flex;align-items:flex-start;height:var(--lis-bh)}
.lis-island{position:relative;flex:none;pointer-events:auto}
.lis-shell{position:absolute;inset:0;border-radius:var(--lis-r);background:var(--lis-fill);box-shadow:var(--lis-shadow),inset 0 0 0 1px var(--lis-border),inset 0 1px 0 0 var(--lis-hl);-webkit-backdrop-filter:blur(var(--lis-blur)) saturate(170%);backdrop-filter:blur(var(--lis-blur)) saturate(170%);transform-origin:50% 50%;pointer-events:none}
.lis-clip{position:relative;border-radius:var(--lis-r);overflow:hidden;isolation:isolate}
.lis-row{position:relative;display:flex;align-items:center;height:var(--lis-bh);padding:var(--lis-pt) var(--lis-pr) var(--lis-pb) var(--lis-pl);white-space:nowrap}
.lis-logo{position:relative;flex:none;display:flex;align-items:center;justify-content:center;min-width:var(--lis-item);height:var(--lis-item);margin-right:var(--lis-dg);border-radius:var(--lis-ir);color:var(--lis-active);text-decoration:none;outline:none;white-space:nowrap;-webkit-user-select:none;user-select:none}
a.lis-logo{position:relative;cursor:pointer}
a.lis-logo::before{content:"";position:absolute;top:calc(var(--lis-pt) * -1);bottom:calc(var(--lis-pb) * -1);left:calc(var(--lis-pl) * -1);right:calc(var(--lis-dg) * -.5)}
.lis-logo:focus-visible{outline:2px solid var(--lis-focus);outline-offset:-2px}
.lis-logo.is-image{padding:0 calc((var(--lis-item) - var(--lis-logo-h)) / 2)}
.lis-logo.is-image img{display:block;height:var(--lis-logo-h);width:auto;max-width:160px;object-fit:contain;pointer-events:none}
.lis-logo.is-text{padding:0 10px;line-height:1.2}
.lis-logo.is-round{padding:0}
.lis-logo.is-round img{width:calc(var(--lis-item) - 6px);height:calc(var(--lis-item) - 6px);max-width:none;border-radius:50%;object-fit:cover}
.lis-logo-ph{display:grid;place-items:center;width:var(--lis-logo-h);height:var(--lis-logo-h);border-radius:7px;border:1.5px dashed var(--lis-icon);color:var(--lis-icon);opacity:.8}
.lis-logo-ph svg{width:60%;height:60%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.lis-div{flex:none;width:1px;height:calc(var(--lis-item) * .45);margin-right:var(--lis-dg);border-radius:1px;background:var(--lis-divider)}
.lis-list{display:flex;align-items:center;flex:none;margin:0;padding:0;list-style:none}
.lis-li{display:flex;flex:none;margin:0;padding:0}
.lis-li+.lis-li{margin-left:var(--lis-gap)}
.lis-item{position:relative;display:flex;flex:none;height:var(--lis-item);min-width:var(--lis-item);border-radius:var(--lis-ir);color:var(--lis-icon);text-decoration:none;outline:none;cursor:default;-webkit-user-select:none;user-select:none;transition:color .24s ease}
a.lis-item::before{content:"";position:absolute;top:calc(var(--lis-pt) * -1);bottom:calc(var(--lis-pb) * -1);left:calc(var(--lis-gap) * -.5);right:calc(var(--lis-gap) * -.5)}
.lis-box{position:relative;display:flex;align-items:center;flex:none;height:100%;overflow:hidden;border-radius:inherit}
a.lis-item{cursor:pointer}
.lis-item.is-on{color:var(--lis-active)}
.lis-item:focus-visible{outline:2px solid var(--lis-focus);outline-offset:-2px}
.lis-ico{display:grid;place-items:center;flex:none;width:var(--lis-item);height:var(--lis-item);transition:transform .3s cubic-bezier(.3,.7,.4,1)}
a.lis-item:active .lis-ico,a.lis-prow:active .lis-ico{transform:scale(.88)}
.lis-glyph{display:block;flex:none;width:var(--lis-icon-s);height:var(--lis-icon-s);fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.lis-glyph .f{fill:currentColor;fill-opacity:0;transition:fill-opacity .3s ease}
.lis-li.is-cur .lis-glyph .f,.lis-prow.is-cur .lis-glyph .f{fill-opacity:.2}
.lis-glyph-img{background-color:currentColor;-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center}
.lis-lab{display:block;flex:none;margin-left:calc(var(--lis-lo) * -1);padding-right:var(--lis-lp);line-height:1.2;white-space:nowrap;color:inherit}
.lis-sr{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.lis-pill{position:absolute;left:0;top:var(--lis-pt);width:0;height:var(--lis-item);border-radius:var(--lis-ir);background:var(--lis-pill);box-shadow:inset 0 1px 0 0 var(--lis-pill-hl);opacity:0;pointer-events:none;transform-origin:50% 50%}
.lis-more,.lis-menu{position:relative;display:none;place-items:center;flex:none;width:var(--lis-item);height:var(--lis-item);margin:0 0 0 var(--lis-gap);padding:0;border:0;border-radius:var(--lis-ir);background:none;font:inherit;outline:none;cursor:pointer;-webkit-appearance:none;appearance:none}
.lis-more::before,.lis-menu::before{content:"";position:absolute;top:calc(var(--lis-pt) * -1);bottom:calc(var(--lis-pb) * -1);left:calc(var(--lis-gap) * -.5);right:calc(var(--lis-pr) * -1)}
.lis-more{color:var(--lis-icon);transition:color .2s ease,background-color .2s ease}
.lis-menu{color:var(--lis-active)}
.lis-more:focus-visible,.lis-menu:focus-visible{outline:2px solid var(--lis-focus);outline-offset:-2px}
.lis-more .lis-glyph circle{transition:transform .32s cubic-bezier(.3,1.4,.5,1)}
@media (hover:hover){.lis-island[data-pt] .lis-more:hover{color:var(--lis-active);background:var(--lis-row-hover)}.lis-island[data-pt] .lis-more:hover .lis-glyph circle:nth-child(1){transform:translateX(-1.5px)}.lis-island[data-pt] .lis-more:hover .lis-glyph circle:nth-child(3){transform:translateX(1.5px)}}
.lis-spacer{display:none;flex:1 1 auto;min-width:0}
.lis-bar{position:absolute;left:50%;top:50%;width:16px;height:1.75px;margin:-.875px 0 0 -8px;border-radius:2px;background:currentColor;transition:transform .45s cubic-bezier(.3,1.35,.5,1)}
.lis-bar:nth-child(1){transform:translateY(-3.5px)}
.lis-bar:nth-child(2){transform:translateY(3.5px)}
.lis-root.is-open .lis-bar:nth-child(1){transform:rotate(45deg)}
.lis-root.is-open .lis-bar:nth-child(2){transform:rotate(-45deg)}
.lis-panel{display:none;width:var(--lis-pw);padding:2px var(--lis-pr) var(--lis-pb) var(--lis-pl)}
.lis-plist{display:grid;gap:var(--lis-gap-y);margin:0;padding:0;list-style:none}
.lis-plist>li{margin:0;padding:0}
.lis-prow{display:flex;align-items:center;gap:8px;height:48px;padding:0 16px 0 6px;border-radius:var(--lis-ir);color:var(--lis-icon);text-decoration:none;outline:none;cursor:default;-webkit-user-select:none;user-select:none;transition:background-color .2s ease,color .2s ease}
a.lis-prow{cursor:pointer}
.lis-prow .lis-ico{width:36px;height:36px}
.lis-ptext{color:var(--lis-active);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lis-prow.is-cur{background:var(--lis-pill);box-shadow:inset 0 1px 0 0 var(--lis-pill-hl);color:var(--lis-active)}
.lis-prow:focus-visible{outline:2px solid var(--lis-focus);outline-offset:-2px}
@media (hover:hover){.lis-island[data-pt] a.lis-prow:not(.is-cur):hover{background:var(--lis-row-hover);color:var(--lis-active)}}
.lis-measure{position:absolute;left:0;top:0;height:0;overflow:hidden;visibility:hidden;white-space:nowrap;pointer-events:none}
.lis-measure>span{display:inline-block;line-height:1.2;white-space:nowrap}
.lis-root:not([data-live]) .lis-item:not(.is-lab) .lis-lab{display:none}
.lis-root:not([data-live]) .lis-item.is-pill{background:var(--lis-pill);box-shadow:inset 0 1px 0 0 var(--lis-pill-hl)}
.lis-root:not([data-live]) .lis-pill{display:none}
.lis-root:not([data-live]).is-compact .lis-li:not(.is-cur){display:none}
.lis-root:not([data-live]).is-compact .lis-li.is-cur{margin-left:0}
.lis-root:not([data-live]).is-compact .lis-more{display:grid}
.lis-root:not([data-live]).is-open .lis-island{width:var(--lis-pw)}
.lis-root:not([data-live]).is-open .lis-li,.lis-root:not([data-live]).is-open .lis-div{display:none!important}
.lis-root:not([data-live]).is-open .lis-panel{display:block;position:relative}
.lis-root[data-live] .lis-clip{position:absolute;inset:0}
.lis-root[data-live] .lis-row{position:absolute;left:0;top:0;right:0}
.lis-root[data-live] .lis-item{min-width:0}
.lis-root[data-live] .lis-box{flex:1 1 auto;width:100%;min-width:0}
.lis-root[data-live] .lis-more{display:grid}
.lis-root[data-live] .lis-shell,.lis-root[data-live] .lis-pill{will-change:transform}
.lis-root[data-live] .lis-slot{contain:size layout style}
.lis-root[data-live] .lis-panel{position:absolute;left:0;top:var(--lis-bh)}
.lis-root[data-live] .lis-prow{opacity:0;transform:translateY(-6px) scale(.98);transition:opacity .14s ease,transform .2s ease,background-color .2s ease,color .2s ease}
.lis-root[data-live].is-open .lis-prow{opacity:1;transform:none;transition:opacity .3s ease var(--d),transform .55s cubic-bezier(.2,.9,.25,1) var(--d),background-color .2s ease,color .2s ease}
@media (prefers-contrast:more){.lis-root{--lis-icon:var(--lis-icon-hc)!important;--lis-border:var(--lis-border-hc)!important;--lis-pill:var(--lis-pill-hc)!important}}
@media (prefers-reduced-transparency:reduce){.lis-shell{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;background:var(--lis-fill-solid)!important}}
@media (prefers-reduced-motion:reduce){.lis-root .lis-prow,.lis-root .lis-bar,.lis-root .lis-ico,.lis-root .lis-item{transition:none!important}.lis-root[data-live] .lis-prow{transform:none!important}}
`),
      (Y = class {
        snap() {
          ((this.x = this.t), (this.v = 0));
        }
        constructor(e = 0) {
          (O(this, `x`, void 0),
            O(this, `v`, 0),
            O(this, `t`, void 0),
            (this.x = e),
            (this.t = e));
        }
      }),
      (Ie = class {
        clearSwap() {
          (this.ghost.fill(!1), this.swapFrom.fill(void 0));
        }
        update(e, t, n, r) {
          this.els = e;
          let i = this.M,
            a = !i || i.n !== t.n || i.mobile !== t.mobile;
          for (this.M = t; this.p.length < t.n;)
            this.p.push(new Y(n.p[this.p.length] ?? 0));
          for (; this.c.length < t.n;)
            this.c.push(new Y(n.c[this.c.length] ?? 1));
          ((this.p.length = t.n),
            (this.c.length = t.n),
            (this.cGoal.length = t.n),
            (this.cWait.length = t.n));
          let o = n.pivot >= 0 && n.pivot < t.n ? n.pivot : (t.n - 1) / 2,
            s = 0;
          for (let e = 0; e < t.n; e++) s = Math.max(s, Math.abs(e - o));
          let c = 0,
            l = 0,
            u = -1,
            d = -1;
          for (let e = 0; e < t.n; e++) {
            let t = this.cGoal[e];
            t === void 0 ||
              n.c[e] === t ||
              (n.c[e] > t ? (c++, (u = e)) : (l++, (d = e)));
          }
          let f = c <= 1 && l <= 1;
          ((this.ghost.length = t.n),
            (this.ghostX.length = t.n),
            (this.ghostW.length = t.n),
            (this.swapFrom.length = t.n),
            (this.swapDir.length = t.n));
          let p =
            !!i &&
            !a &&
            (t.mobile
              ? this.o.t === 0 && this.o.x < 0.02 && n.o === 0
              : this.m.t === 1 && this.m.x > 0.98 && n.m === 1) &&
            !r &&
            !t.reduced &&
            c === 1 &&
            l === 1;
          if (p) {
            let e = this.layout(!1);
            ((this.ghost[d] = !0),
              (this.ghostX[d] = e.xs[d] ?? 0),
              (this.ghostW[d] = e.ws[d] ?? 0),
              (this.swapFrom[d] = void 0),
              (this.ghost[u] = !1),
              (this.swapFrom[u] = e.ws[d] ?? 0));
            let t = u > d ? 1 : -1;
            ((this.swapDir[d] = t), (this.swapDir[u] = t));
          } else c + l > 0 && this.clearSwap();
          for (let e = 0; e < t.n; e++) {
            this.p[e].t = n.p[e];
            let r = n.c[e];
            if (this.cGoal[e] === void 0)
              ((this.cGoal[e] = r), (this.cWait[e] = 0), (this.c[e].t = r));
            else if (r !== this.cGoal[e]) {
              this.cGoal[e] = r;
              let n = Math.abs(e - o),
                i =
                  t.reduced || f
                    ? 0
                    : r > this.c[e].t
                      ? n * 0.018
                      : (s - n) * 0.012;
              ((this.cWait[e] = i), i <= 0 && (this.c[e].t = r));
            }
          }
          (p && ((this.p[u].x = this.p[u].t), (this.p[u].v = 0)),
            (this.m.t = n.m),
            (this.o.t = n.o),
            (this.ps.t = n.press));
          let m = this.pill < 0 || this.pa.x < 0.05;
          if (
            ((this.pill = n.pill),
            (this.pa.t = +(n.pill >= 0)),
            a || r || t.reduced)
          ) {
            this.snapAll();
            return;
          }
          if (n.pill >= 0 && m) {
            let e = this.layout(!1);
            ((this.pl.x = this.pl.t = e.xs[n.pill] ?? 0),
              (this.pr.x = this.pr.t =
                (e.xs[n.pill] ?? 0) + (e.ws[n.pill] ?? 0)),
              (this.pl.v = this.pr.v = 0));
          }
          this.kick();
        }
        snapAll() {
          this.clearSwap();
          for (let e = 0; e < this.c.length; e++)
            (this.cGoal[e] !== void 0 && (this.c[e].t = this.cGoal[e]),
              (this.cWait[e] = 0));
          for (let e of this.p) e.snap();
          for (let e of this.c) e.snap();
          (this.m.snap(), this.o.snap(), this.pa.snap(), this.ps.snap());
          let e = this.layout(!1);
          (this.pill >= 0 &&
            this.pill < (this.M?.n ?? 0) &&
            ((this.pl.t = e.xs[this.pill]),
            (this.pr.t = e.xs[this.pill] + e.ws[this.pill])),
            this.pl.snap(),
            this.pr.snap(),
            (this.wPrev = e.W),
            (this.wVel = 0),
            this.raf && cancelAnimationFrame(this.raf),
            (this.raf = 0),
            (this.last = 0),
            this.paint(e));
        }
        kick() {
          if (!(this.raf || this.dead)) {
            if (!this.visible) {
              this.pending = !0;
              return;
            }
            ((this.last = 0), (this.raf = requestAnimationFrame(this.tick)));
          }
        }
        setVisible(e) {
          this.visible === e ||
            this.dead ||
            ((this.visible = e),
            e
              ? this.pending &&
                ((this.pending = !1), this.M && this.els && this.snapAll())
              : (this.raf &&
                  (cancelAnimationFrame(this.raf),
                  (this.raf = 0),
                  (this.pending = !0)),
                (this.last = 0)));
        }
        stop() {
          ((this.dead = !0),
            this.raf && cancelAnimationFrame(this.raf),
            (this.raf = 0));
        }
        layout(e) {
          let t = this.M,
            n = (t) => (e ? t.t : t.x),
            r = t.pad[3];
          t.logo && (r += t.logoW + t.dg + (t.div ? 1 + t.dg : 0));
          let i = [],
            a = [],
            o = [],
            s = 0;
          for (let e = 0; e < t.n; e++) {
            if (this.ghost[e]) {
              (i.push(this.ghostX[e]), a.push(this.ghostW[e]), o.push(0));
              continue;
            }
            let c = K(n(this.c[e])),
              l = Math.max(0, n(this.p[e])),
              u = t.gap * Math.min(c, s);
            ((r += u), i.push(r), o.push(u));
            let d = t.item + l * (t.extras[e] ?? 0),
              f = this.swapFrom[e],
              p = f === void 0 ? c * d : f + (d - f) * c;
            (a.push(p), (r += p), (s = Math.max(s, f === void 0 ? c : 1)));
          }
          let c = 0,
            l = 0,
            u,
            d = t.barH;
          if (t.mobile) {
            let e = r + t.gap + t.item + t.pad[1],
              i = Math.max(0, n(this.o));
            ((u = e + (Math.max(e, t.panelW) - e) * i),
              (d = t.barH + t.panelH * i));
          } else {
            let e = K(n(this.m));
            ((c = t.gap * Math.min(e, s)),
              (r += c),
              (l = e * t.item),
              (r += l),
              (u = r + t.pad[1]));
          }
          return { xs: i, ws: a, leads: o, moreLead: c, moreW: l, W: u, H: d };
        }
        allResting() {
          for (let e of this.cWait) if (e > 0) return !1;
          for (let e of this.p) if (!L(e, 0.0015)) return !1;
          for (let e of this.c) if (!L(e, 0.0015)) return !1;
          return (
            L(this.m, 0.0015) &&
            L(this.o, 0.0015) &&
            L(this.pa, 0.003) &&
            L(this.ps, 0.002) &&
            L(this.pl, 0.08) &&
            L(this.pr, 0.08)
          );
        }
        paint(e) {
          let t = this.els,
            n = this.M;
          if (!t || !n) return;
          t.island &&
            (k(t.island, `width`, J(e.W)), k(t.island, `height`, J(e.H)));
          let r = n.item * 0.38;
          for (let i = 0; i < n.n; i++) {
            let a = t.lis[i],
              o = t.items[i];
            if (!a || !o) continue;
            let s = K(this.c[i].x),
              c = !!this.ghost[i],
              l = this.swapFrom[i],
              u = t.glyphs[i],
              d = t.boxes ? t.boxes[i] : null,
              f = 0,
              p = 0;
            (c
              ? (k(a, `position`, `absolute`),
                k(a, `left`, J(this.ghostX[i])),
                k(a, `top`, J(n.pad[0])),
                k(a, `marginLeft`, `0px`),
                k(o, `width`, J(this.ghostW[i])),
                k(a, `opacity`, q(0.5, 1, s).toFixed(3)),
                k(a, `visibility`, s < 0.002 ? `hidden` : ``),
                u && k(u, `transform`, ``),
                (f = -(this.swapDir[i] || 1) * r * (1 - s)),
                (p = (1 - s) * 3))
              : (k(a, `position`, ``),
                k(a, `left`, ``),
                k(a, `top`, ``),
                k(o, `width`, J(e.ws[i])),
                k(a, `marginLeft`, J(e.leads[i])),
                l === void 0
                  ? (k(a, `opacity`, s < 0.999 ? s.toFixed(3) : ``),
                    k(a, `visibility`, s < 0.002 ? `hidden` : ``),
                    u &&
                      k(
                        u,
                        `transform`,
                        s < 0.999
                          ? `scale(${(0.55 + 0.45 * s).toFixed(3)})`
                          : ``,
                      ))
                  : (k(a, `opacity`, q(0.22, 0.85, s).toFixed(3)),
                    k(a, `visibility`, ``),
                    u && k(u, `transform`, ``),
                    (f = (this.swapDir[i] || 1) * r * (1 - s)),
                    (p = (1 - s) * 3))),
              d &&
                (k(
                  d,
                  `transform`,
                  Math.abs(f) > 0.01 ? `translateY(${f.toFixed(2)}px)` : ``,
                ),
                k(
                  d,
                  `filter`,
                  !n.reduced && p > 0.04 ? `blur(${p.toFixed(2)}px)` : ``,
                )));
            let m = t.labs[i];
            if (m) {
              let e = c ? 1 : K(this.p[i].x);
              (k(m, `opacity`, q(0.3, 1, e).toFixed(3)),
                k(
                  m,
                  `transform`,
                  e < 0.999 ? `translateX(${((1 - e) * -6).toFixed(2)}px)` : ``,
                ),
                k(
                  m,
                  `filter`,
                  !n.reduced && e > 0.01 && e < 0.985
                    ? `blur(${((1 - e) * 3).toFixed(2)}px)`
                    : ``,
                ));
            }
          }
          if (t.more) {
            let r = K(this.m.x);
            (k(t.more, `width`, J(e.moreW)),
              k(t.more, `marginLeft`, J(e.moreLead)),
              k(t.more, `opacity`, r < 0.999 ? r.toFixed(3) : ``),
              k(t.more, `visibility`, r < 0.002 && !n.mobile ? `hidden` : ``));
          }
          if (t.pill) {
            let e = this.pl.x,
              r = this.pr.x,
              i = Math.max(0, r - e),
              a = K(this.pa.x);
            (this.pill >= 0 &&
              this.pill < n.n &&
              this.swapFrom[this.pill] === void 0 &&
              (a *= K(this.c[this.pill].x)),
              n.mobile && (a *= 1 - K(this.o.x * 1.6)));
            let o = Math.max(1, this.pr.t - this.pl.t),
              s = Math.max(0, i / o - 1),
              c = n.reduced ? 0 : K(this.ps.x),
              l = (1 - Math.min(0.16, s * 0.32 * n.elastic)) * (1 - 0.07 * c),
              u = 1 - 0.035 * c;
            (k(t.pill, `width`, J(i)),
              k(
                t.pill,
                `transform`,
                `translate3d(${e.toFixed(2)}px,0,0)` +
                  (l < 0.999 || u < 0.999
                    ? ` scale(${u.toFixed(3)},${l.toFixed(3)})`
                    : ``),
              ),
              k(t.pill, `opacity`, a.toFixed(3)));
          }
          if (t.shell) {
            let e =
              n.reduced || n.mobile
                ? 0
                : n.elastic * 0.05 * Math.tanh(Math.abs(this.wVel) / 900);
            k(
              t.shell,
              `transform`,
              e > 0.0015
                ? `scale(${(1 + e * 0.3).toFixed(4)},${(1 - e).toFixed(4)})`
                : ``,
            );
          }
          if (
            (t.div &&
              k(
                t.div,
                `opacity`,
                n.mobile ? (1 - K(this.o.x * 1.6)).toFixed(3) : ``,
              ),
            t.panel && n.mobile)
          ) {
            let r =
              n.align === `Center`
                ? (e.W - n.panelW) / 2
                : n.align === `Right`
                  ? e.W - n.panelW
                  : 0;
            (k(t.panel, `transform`, `translate3d(${r.toFixed(2)}px,0,0)`),
              k(
                t.panel,
                `visibility`,
                this.o.x > 0.002 || this.o.t > 0 ? `` : `hidden`,
              ));
          }
        }
        constructor() {
          (O(this, `els`, null),
            O(this, `M`, null),
            O(this, `p`, []),
            O(this, `c`, []),
            O(this, `m`, new Y()),
            O(this, `o`, new Y()),
            O(this, `pl`, new Y()),
            O(this, `pr`, new Y()),
            O(this, `pa`, new Y()),
            O(this, `ps`, new Y()),
            O(this, `cGoal`, []),
            O(this, `cWait`, []),
            O(this, `pill`, -1),
            O(this, `raf`, 0),
            O(this, `last`, 0),
            O(this, `wPrev`, -1),
            O(this, `wVel`, 0),
            O(this, `dead`, !1),
            O(this, `visible`, !0),
            O(this, `pending`, !1),
            O(this, `ghost`, []),
            O(this, `ghostX`, []),
            O(this, `ghostW`, []),
            O(this, `swapFrom`, []),
            O(this, `swapDir`, []),
            O(this, `tick`, (e) => {
              this.raf = 0;
              let t = this.M;
              if (!t || !this.els || this.dead) return;
              let n = this.last ? (e - this.last) / 1e3 : 1 / 60;
              ((this.last = e), (n = G(n, 0.001, 1 / 20)));
              let r = Math.max(1, Math.ceil(n / (1 / 240))),
                i = n / r,
                a = t.spring,
                o = t.elastic,
                s = a.k * 1.6,
                c = { k: s, c: 2 * 0.82 * Math.sqrt(s * a.m), m: a.m },
                l = s * (1 - 0.62 * o),
                u = { k: l, c: 2 * 0.86 * Math.sqrt(l * a.m), m: a.m },
                d = { k: 520, c: 2 * Math.sqrt(520), m: 1 },
                f = { k: 900, c: 2 * 0.62 * 30, m: 1 },
                p = a.k * 0.5,
                m = { k: p, c: 2 * 0.9 * Math.sqrt(p * a.m), m: a.m };
              for (let e = 0; e < this.c.length; e++)
                this.cWait[e] > 0 &&
                  ((this.cWait[e] -= n),
                  this.cWait[e] <= 0 &&
                    ((this.cWait[e] = 0), (this.c[e].t = this.cGoal[e])));
              let h = this.layout(!1);
              for (let e = 0; e < r; e++) {
                for (let e of this.p) I(e, a, i);
                for (let e = 0; e < this.c.length; e++)
                  I(
                    this.c[e],
                    this.ghost[e] || this.swapFrom[e] !== void 0 ? m : a,
                    i,
                  );
                (I(this.m, a, i),
                  I(this.o, a, i),
                  I(this.pa, d, i),
                  I(this.ps, f, i),
                  (h = this.layout(!1)),
                  this.pill >= 0 &&
                    this.pill < t.n &&
                    ((this.pl.t = h.xs[this.pill]),
                    (this.pr.t = h.xs[this.pill] + h.ws[this.pill])));
                let e =
                  (this.pl.t + this.pr.t) / 2 - (this.pl.x + this.pr.x) / 2;
                e > 0.5
                  ? (I(this.pr, c, i), I(this.pl, u, i))
                  : e < -0.5
                    ? (I(this.pl, c, i), I(this.pr, u, i))
                    : (I(this.pl, c, i), I(this.pr, c, i));
              }
              let g = !1;
              for (let e = 0; e < t.n; e++)
                (this.ghost[e] &&
                  this.c[e].t <= 0 &&
                  this.c[e].x < 0.002 &&
                  ((this.ghost[e] = !1), (g = !0)),
                  this.swapFrom[e] !== void 0 &&
                    this.c[e].t >= 1 &&
                    L(this.c[e], 0.0015) &&
                    ((this.swapFrom[e] = void 0), (g = !0)));
              if ((g && (h = this.layout(!1)), this.wPrev >= 0)) {
                let e = (h.W - this.wPrev) / n;
                this.wVel += (e - this.wVel) * 0.35;
              }
              if (
                ((this.wPrev = h.W),
                this.allResting() && Math.abs(this.wVel) < 4)
              ) {
                this.wVel = 0;
                for (let e of this.p) e.snap();
                for (let e of this.c) e.snap();
                (this.m.snap(),
                  this.o.snap(),
                  this.pa.snap(),
                  this.ps.snap(),
                  this.pl.snap(),
                  this.pr.snap(),
                  this.clearSwap(),
                  (h = this.layout(!1)),
                  this.paint(h),
                  (this.last = 0));
                return;
              }
              (this.paint(h), (this.raf = requestAnimationFrame(this.tick)));
            }));
        }
      }),
      (z.displayName = `Dynamic Island Nav`),
      le(z, {
        items: {
          type: D.Array,
          title: `Items`,
          maxCount: 10,
          control: {
            type: D.Object,
            controls: {
              label: { type: D.String, title: `Label`, defaultValue: `Link` },
              icon: {
                type: D.Enum,
                title: `Icon`,
                options: V,
                optionTitles: H,
                defaultValue: `home`,
              },
              image: { type: D.ResponsiveImage, title: `Custom Icon` },
              link: { type: D.Link, title: `Link` },
              newTab: {
                type: D.Boolean,
                title: `New Tab`,
                defaultValue: !1,
                enabledTitle: `Yes`,
                disabledTitle: `No`,
              },
              section: {
                type: D.String,
                title: `Section`,
                placeholder: `e.g. work`,
                description: `One-page sites: the Scroll Section ID, e.g. work. Leave Link empty and a click scrolls there; a Link to another page (e.g. /work) stays a link. The item turns active when the section fills the screen. Leave empty if the item links to its own page.`,
              },
            },
          },
          defaultValue: Ne,
        },
        active: {
          type: D.Number,
          title: `Active`,
          defaultValue: 1,
          min: 0,
          max: 10,
          step: 1,
          displayStepper: !0,
          description: `Which item is highlighted (1 = first, 0 = none). Separate pages: set it on each page and leave Section empty, a link to the current page is detected too. One page: use Section on the items.`,
        },
        switchAt: {
          type: D.Number,
          title: `Switch At`,
          defaultValue: 80,
          min: 30,
          max: 100,
          step: 5,
          unit: `%`,
          description: `How much of the screen a section has to fill before its item becomes active.`,
          hidden: (e) =>
            !(
              Array.isArray(e.items) &&
              e.items.some(
                (e) =>
                  String(e?.section ?? ``).trim() !== `` ||
                  String(e?.link ?? ``).includes(`#`),
              )
            ),
        },
        logoType: {
          type: D.Enum,
          title: `Logo`,
          options: [`None`, `Image`, `Text`],
          optionTitles: [`None`, `Image`, `Text`],
          displaySegmentedControl: !0,
          defaultValue: `None`,
        },
        logoImage: {
          type: D.ResponsiveImage,
          title: `Logo Image`,
          hidden: (e) => e.logoType !== `Image`,
        },
        logoRound: {
          type: D.Boolean,
          title: `Round`,
          defaultValue: !1,
          enabledTitle: `Yes`,
          disabledTitle: `No`,
          description: `Crops the image to a circle, e.g. for an avatar.`,
          hidden: (e) => e.logoType !== `Image`,
        },
        logoText: {
          type: D.String,
          title: `Logo Text`,
          defaultValue: `Studio`,
          hidden: (e) => e.logoType !== `Text`,
        },
        logoLink: {
          type: D.Link,
          title: `Logo Link`,
          hidden: (e) => e.logoType === void 0 || e.logoType === `None`,
        },
        logoNewTab: {
          type: D.Boolean,
          title: `New Tab`,
          defaultValue: !1,
          enabledTitle: `Yes`,
          disabledTitle: `No`,
          hidden: (e) => e.logoType === void 0 || e.logoType === `None`,
        },
        labels: {
          type: D.Enum,
          title: `Labels`,
          options: [`Active`, `All`],
          optionTitles: [`Active`, `All`],
          displaySegmentedControl: !0,
          defaultValue: `Active`,
          description: `Active: the current page shows its label, the others unfold on hover.`,
        },
        layout: {
          type: D.Enum,
          title: `Layout`,
          options: [`Auto`, `Desktop`, `Mobile`],
          optionTitles: [`Auto`, `Desktop`, `Mobile`],
          defaultValue: `Auto`,
        },
        breakpoint: {
          type: D.Number,
          title: `Breakpoint`,
          defaultValue: 640,
          min: 320,
          max: 1600,
          step: 10,
          unit: `px`,
          hidden: (e) => e.layout !== void 0 && e.layout !== `Auto`,
        },
        compact: {
          type: D.Boolean,
          title: `Compact`,
          defaultValue: !0,
          enabledTitle: `On`,
          disabledTitle: `Off`,
          description: `Desktop: shrinks to the current item while scrolling down. Phone keeps icon and name.`,
        },
        expand: {
          type: D.Enum,
          title: `Expand`,
          options: [`Hover`, `Click`],
          optionTitles: [`Hover`, `Click ⋯`],
          displaySegmentedControl: !0,
          defaultValue: `Hover`,
          description: `How the compact island opens again. Hover only reacts to a moving pointer.`,
          hidden: (e) => e.compact === !1,
        },
        scrollOffset: {
          type: D.Number,
          title: `Scroll Offset`,
          defaultValue: 120,
          min: 0,
          max: 2e3,
          step: 10,
          unit: `px`,
          hidden: (e) => e.compact === !1,
        },
        theme: {
          type: D.Enum,
          title: `Theme`,
          options: [`Dark`, `Light`, `Auto`, `Custom`],
          optionTitles: [`Dark`, `Light`, `Auto (System)`, `Custom`],
          defaultValue: `Dark`,
        },
        colors: {
          type: D.Object,
          title: `Colors`,
          hidden: (e) => e.theme !== `Custom`,
          controls: {
            fill: {
              type: D.Color,
              title: `Fill`,
              defaultValue: `rgba(16, 16, 19, 0.9)`,
            },
            border: {
              type: D.Color,
              title: `Border`,
              defaultValue: `rgba(255, 255, 255, 0.08)`,
            },
            pill: {
              type: D.Color,
              title: `Highlight`,
              defaultValue: `rgba(255, 255, 255, 0.12)`,
            },
            icon: {
              type: D.Color,
              title: `Icon`,
              defaultValue: `rgba(255, 255, 255, 0.56)`,
            },
            active: { type: D.Color, title: `Active`, defaultValue: `#FFFFFF` },
            divider: {
              type: D.Color,
              title: `Divider`,
              defaultValue: `rgba(255, 255, 255, 0.12)`,
            },
            focus: {
              type: D.Color,
              title: `Focus Ring`,
              defaultValue: `rgba(255, 255, 255, 0.92)`,
            },
            shadow: {
              type: D.BoxShadow,
              title: `Shadow`,
              defaultValue: `0px 1px 2px 0px rgba(0, 0, 0, 0.18), 0px 14px 34px -12px rgba(0, 0, 0, 0.55)`,
            },
          },
        },
        blur: {
          type: D.Number,
          title: `Blur`,
          defaultValue: 20,
          min: 0,
          max: 60,
          step: 1,
          unit: `px`,
        },
        font: {
          type: D.Font,
          title: `Font`,
          controls: `extended`,
          defaultFontType: `sans-serif`,
          defaultValue: {
            fontSize: `14px`,
            variant: `Medium`,
            letterSpacing: `-0.01em`,
            lineHeight: `1.2em`,
          },
        },
        itemSize: {
          type: D.Number,
          title: `Item Size`,
          defaultValue: 40,
          min: 28,
          max: 64,
          step: 1,
          unit: `px`,
        },
        iconSize: {
          type: D.Number,
          title: `Icon Size`,
          defaultValue: 20,
          min: 12,
          max: 32,
          step: 1,
          unit: `px`,
        },
        radius: {
          type: D.BorderRadius,
          title: `Radius`,
          defaultValue: `999px`,
        },
        padding: { type: D.Padding, title: `Padding`, defaultValue: `6px` },
        gap: {
          type: D.Gap,
          title: `Gap`,
          defaultValue: `4px`,
          description: `X: between items. Y: between menu rows.`,
        },
        margin: { type: D.Padding, title: `Margin`, defaultValue: `16px` },
        align: {
          type: D.Enum,
          title: `Align`,
          options: [`Left`, `Center`, `Right`],
          optionTitles: [`Left`, `Center`, `Right`],
          displaySegmentedControl: !0,
          defaultValue: `Center`,
        },
        transition: {
          type: D.Transition,
          title: `Transition`,
          defaultValue: {
            type: `spring`,
            stiffness: 400,
            damping: 32,
            mass: 1,
          },
        },
        elasticity: {
          type: D.Number,
          title: `Elasticity`,
          defaultValue: 0.6,
          min: 0,
          max: 1,
          step: 0.05,
        },
        canvas: {
          type: D.Enum,
          title: `Canvas`,
          options: [`Default`, `Compact`, `Menu`],
          optionTitles: [`Default`, `Compact`, `Menu Open`],
          defaultValue: `Default`,
          description: `Built by Matthias Ölschlegel 💪  
[Explore more components](https://framer.link/fsd2pgh)`,
        },
      }));
  });
  Le();
  return { be, Ae, R, z, De, Ie, Y, B, W, Fe, Ne, Pe, V, H, U, ge, j, A, G, K, q, J, I, L, xe, N, P, Se, Ce, ye, ke, _e };
};
