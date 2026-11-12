import { Fragment, type CSSProperties, type FocusEvent, type MouseEvent, type PointerEvent, type ReactElement } from "react";
import { DOTS_MARKUP, ICON_MARKUP } from "./icons";
import { BASE_CSS } from "./styles";
import { THEMES } from "./themes";
import { PANEL_MAX_WIDTH } from "./defaults";
import { themeDeclarations, themeVars, type ResolvedConfig } from "./normalize";
import type { ResolvedItem } from "./types";

/** Visual state handed from the controller to the view. */
export interface ViewState {
  /** true = mobile menu layout, false = desktop, null = not measured yet */
  mobile: boolean | null;
  compact: boolean;
  open: boolean;
  activeIdx: number;
  labIdx: number;
  pillIdx: number;
  hoverIdx: number;
  /** true once the animation engine has taken over layout */
  live: boolean;
  /** static preview: lets an empty image logo render a placeholder */
  canvas?: boolean;
  panel: boolean;
  allLabels: boolean;
  panelW?: number;
  curKind?: "page" | "location";
}

/** Ref callbacks and event handlers of the live controller. Omitted for the static preview. */
export interface ViewBindings {
  setRoot(el: HTMLElement | null): void;
  setSlot(el: HTMLElement | null): void;
  setIsland(el: HTMLElement | null): void;
  setShell(el: HTMLElement | null): void;
  setPill(el: HTMLElement | null): void;
  setDiv(el: HTMLElement | null): void;
  setLi(i: number, el: HTMLElement | null): void;
  setItem(i: number, el: HTMLElement | null): void;
  setLab(i: number, el: HTMLElement | null): void;
  setGlyph(i: number, el: HTMLElement | null): void;
  setBox(i: number, el: HTMLElement | null): void;
  setMore(el: HTMLElement | null): void;
  setMenu(el: HTMLElement | null): void;
  setPanel(el: HTMLElement | null): void;
  setMeasure(el: HTMLElement | null): void;
  setLogo(el: HTMLElement | null): void;
  onItemDown(i: number, e: PointerEvent<HTMLElement>): void;
  onIslandUp(): void;
  onIslandEnter(e: PointerEvent<HTMLElement>): void;
  onIslandLeave(e: PointerEvent<HTMLElement>): void;
  onIslandMove(e: PointerEvent<HTMLElement>): void;
  onIslandFocus(e: FocusEvent<HTMLElement>): void;
  onIslandBlur(e: FocusEvent<HTMLElement>): void;
  onItemMove(i: number, e: PointerEvent<HTMLElement>): void;
  onItemFocus(i: number, e: FocusEvent<HTMLElement>): void;
  onItemBlur(i: number): void;
  onItemClick(i: number, e: MouseEvent<HTMLElement>): void;
  onPanelClick(i: number, e: MouseEvent<HTMLElement>): void;
  onMore(e: MouseEvent<HTMLElement>): void;
  onMenu(): void;
}

/* ----------------------------- helpers ----------------------------- */

function linkAttrs(href: string, newTab: boolean) {
  return href ? (newTab ? { href, target: "_blank", rel: "noopener noreferrer" } : { href }) : {};
}

function itemLinkAttrs(item: ResolvedItem) {
  return item.href ? linkAttrs(item.href, item.newTab) : { href: "#" + item.section };
}

/** Selector part that hides everything except the current item and shows the menu button. */
function mobileRules(sel: string): string {
  return (
    `${sel}:not([data-live]) .lis-li:not(.is-cur){display:none!important}` +
    `${sel} .lis-li.is-cur{margin-left:0}` +
    `${sel} .lis-more{display:none!important}` +
    `${sel} .lis-spacer{display:block}` +
    `${sel} .lis-menu{display:grid}` +
    `${sel} .lis-panel{display:block}` +
    `${sel}.no-cur .lis-div{display:none}`
  );
}

/**
 * Instance CSS: server-side first paint rules (before the engine is live) plus, in "Auto" layout,
 * a container query that mirrors the JS breakpoint, plus the system colour scheme for theme "Auto".
 */
function scopedCss(scope: string, cfg: ResolvedConfig): string {
  let css = mobileRules(".lis-root.is-mobile");
  if (cfg.layout === "Auto") {
    const w = cfg.bp - cfg.margin[1] - cfg.margin[3] - 0.5;
    if (w > 0) css += `@container (max-width:${w.toFixed(1)}px){${mobileRules("." + scope + ":not([data-live])")}}`;
  }
  if (cfg.auto)
    css += `.${scope}{${themeDeclarations(THEMES.Light)}}@media (prefers-color-scheme:dark){.${scope}{${themeDeclarations(THEMES.Dark)}}}`;
  return css;
}

/** Layout related CSS custom properties set on the root. */
function layoutVars(cfg: ResolvedConfig): Record<string, string> {
  return {
    "--lis-item": cfg.item + "px",
    "--lis-icon-s": cfg.icon + "px",
    "--lis-gap": cfg.gap + "px",
    "--lis-gap-y": cfg.gapY + "px",
    "--lis-dg": cfg.dg + "px",
    "--lis-pt": cfg.pad[0] + "px",
    "--lis-pr": cfg.pad[1] + "px",
    "--lis-pb": cfg.pad[2] + "px",
    "--lis-pl": cfg.pad[3] + "px",
    "--lis-bh": cfg.barH + "px",
    "--lis-r": cfg.radius + "px",
    "--lis-ir": cfg.ir + "px",
    "--lis-lo": cfg.lo + "px",
    "--lis-lp": cfg.lp + "px",
    "--lis-logo-h": cfg.logoH + "px",
    "--lis-blur": cfg.blur + "px",
    "--lis-pw": `min(${PANEL_MAX_WIDTH}px, 100%)`,
    ...(cfg.auto ? {} : themeVars(cfg.col)),
  };
}

/** One icon: custom image (CSS mask) or built-in SVG. */
function Glyph(props: { name: string; image?: string; markup?: string }) {
  if (props.image) {
    const url = `url("${props.image.replace(/"/g, "%22")}")`;
    return (
      <span
        className="lis-glyph lis-glyph-img"
        aria-hidden="true"
        style={{ WebkitMaskImage: url, maskImage: url }}
      />
    );
  }
  return (
    <svg
      className="lis-glyph"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{
        __html: props.markup ?? (ICON_MARKUP as Record<string, string>)[props.name] ?? ICON_MARKUP.home,
      }}
    />
  );
}

/* ------------------------------- view ------------------------------ */

export function NavView(props: {
  cfg: ResolvedConfig;
  scope: string;
  state: ViewState;
  bind?: ViewBindings;
}) {
  const { cfg, scope, state: st, bind } = props;
  const count = cfg.items.length;
  const hasCurrent = st.activeIdx >= 0 && st.activeIdx < count;

  const rootClass =
    "lis-root " +
    scope +
    (st.mobile === true ? " is-mobile" : "") +
    (st.compact ? " is-compact" : "") +
    (st.open ? " is-open" : "") +
    (hasCurrent ? "" : " no-cur") +
    (cfg.className ? " " + cfg.className : "");

  const justify = cfg.align === "Left" ? "flex-start" : cfg.align === "Right" ? "flex-end" : "center";
  const panelId = scope + "-panel";

  const logo = cfg.logo;
  const logoAlt = (logo.type === "Image" && logo.alt) || logo.text;
  const logoIsPlaceholder = logo.type === "Image" && !logo.image;
  const showLogo =
    logo.type === "Text"
      ? logo.text.trim() !== ""
      : logo.type === "Image"
        ? !!logo.image || !!st.canvas
        : false;

  let logoNode: ReactElement | null = null;
  if (logo.type === "Image") {
    logoNode = logo.image ? (
      <img src={logo.image} srcSet={logo.srcSet || undefined} alt={logoAlt} draggable={false} />
    ) : (
      <span className="lis-logo-ph" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
          <path d="m5 17 4.5-4 3.5 3 2.5-2 3.5 3" />
        </svg>
      </span>
    );
  } else if (logo.type === "Text") {
    logoNode = <span style={cfg.logoFont}>{logo.text}</span>;
  }
  const logoClass =
    "lis-logo is-" + logo.type.toLowerCase() + (logo.type === "Image" && logo.round && !logoIsPlaceholder ? " is-round" : "");

  const rootStyle: CSSProperties & Record<string, string | number | undefined> = {
    ...cfg.style,
    ...layoutVars(cfg),
    padding: `max(${cfg.margin[0]}px, env(safe-area-inset-top, 0px)) max(${cfg.margin[1]}px, env(safe-area-inset-right, 0px)) ${cfg.margin[2]}px max(${cfg.margin[3]}px, env(safe-area-inset-left, 0px))`,
  };
  if (st.panelW) rootStyle["--lis-pw"] = st.panelW + "px";

  const curAttr = (isCurrent: boolean) => (isCurrent ? st.curKind || "page" : undefined);

  return (
    <nav
      ref={bind ? (el) => bind.setRoot(el) : undefined}
      className={rootClass}
      aria-label="Main"
      data-live={st.live ? "" : undefined}
      style={rootStyle}
    >
      <style dangerouslySetInnerHTML={{ __html: BASE_CSS + scopedCss(scope, cfg) }} />
      {/* Hidden measuring row: the engine reads label widths from here */}
      <span className="lis-measure" aria-hidden="true" ref={bind ? (el) => bind.setMeasure(el) : undefined}>
        {cfg.items.map((it, i) => (
          <span key={i} style={cfg.font}>
            {it.label}
          </span>
        ))}
      </span>
      <div className="lis-slot" style={{ justifyContent: justify }} ref={bind ? (el) => bind.setSlot(el) : undefined}>
        <div
          className="lis-island"
          ref={bind ? (el) => bind.setIsland(el) : undefined}
          onPointerEnter={bind?.onIslandEnter}
          onPointerLeave={bind?.onIslandLeave}
          onPointerMove={bind?.onIslandMove}
          onPointerUp={bind?.onIslandUp}
          onPointerCancel={bind?.onIslandUp}
          onFocus={bind?.onIslandFocus}
          onBlur={bind?.onIslandBlur}
        >
          <div className="lis-shell" aria-hidden="true" ref={bind ? (el) => bind.setShell(el) : undefined} />
          <div className="lis-clip">
            <div className="lis-pill" aria-hidden="true" ref={bind ? (el) => bind.setPill(el) : undefined} />
            <div className="lis-row">
              {showLogo &&
                (logo.href ? (
                  <a
                    className={logoClass}
                    aria-label={undefined}
                    draggable={false}
                    ref={bind ? (el) => bind.setLogo(el) : undefined}
                    {...linkAttrs(logo.href, logo.newTab)}
                  >
                    {logoNode}
                  </a>
                ) : (
                  <span className={logoClass} aria-label={undefined} ref={bind ? (el) => bind.setLogo(el) : undefined}>
                    {logoNode}
                  </span>
                ))}
              {showLogo && count > 0 && (
                <span className="lis-div" aria-hidden="true" ref={bind ? (el) => bind.setDiv(el) : undefined} />
              )}
              <ul className="lis-list">
                {cfg.items.map((it, i) => {
                  const isCurrent = i === st.activeIdx;
                  const showLabel = st.allLabels || i === st.labIdx;
                  const itemClass =
                    "lis-item" +
                    (isCurrent || i === st.pillIdx || i === st.labIdx ? " is-on" : "") +
                    (showLabel ? " is-lab" : "") +
                    (i === st.pillIdx ? " is-pill" : "");
                  const content = (
                    <Fragment>
                      <span className="lis-box" ref={bind ? (el) => bind.setBox(i, el) : undefined}>
                        <span className="lis-ico">
                          <span
                            style={{ display: "grid", placeItems: "center" }}
                            ref={bind ? (el) => bind.setGlyph(i, el) : undefined}
                          >
                            <Glyph name={it.icon} image={it.image} />
                          </span>
                        </span>
                        <span
                          className="lis-lab"
                          aria-hidden="true"
                          style={cfg.font}
                          ref={bind ? (el) => bind.setLab(i, el) : undefined}
                        >
                          {it.label}
                        </span>
                      </span>
                      <span className="lis-sr">{it.label}</span>
                    </Fragment>
                  );
                  const common = {
                    className: itemClass,
                    ref: bind ? (el: HTMLElement | null) => bind.setItem(i, el) : undefined,
                    onPointerMove: bind ? (e: PointerEvent<HTMLElement>) => bind.onItemMove(i, e) : undefined,
                    onPointerDown: bind ? (e: PointerEvent<HTMLElement>) => bind.onItemDown(i, e) : undefined,
                    onFocus: bind ? (e: FocusEvent<HTMLElement>) => bind.onItemFocus(i, e) : undefined,
                    onBlur: bind ? () => bind.onItemBlur(i) : undefined,
                  };
                  return (
                    <li
                      key={i}
                      className={"lis-li" + (isCurrent ? " is-cur" : "")}
                      ref={bind ? (el) => bind.setLi(i, el) : undefined}
                    >
                      {it.href || it.section ? (
                        <a
                          {...(common as object)}
                          {...itemLinkAttrs(it)}
                          aria-current={curAttr(isCurrent)}
                          draggable={false}
                          onClick={bind ? (e) => bind.onItemClick(i, e) : undefined}
                        >
                          {content}
                        </a>
                      ) : (
                        <span {...(common as object)}>{content}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className="lis-more"
                aria-label="Show all links"
                tabIndex={st.compact && st.mobile !== true ? 0 : -1}
                aria-hidden={st.compact && st.mobile !== true ? undefined : true}
                onClick={bind?.onMore}
                ref={bind ? (el) => bind.setMore(el) : undefined}
              >
                <Glyph name="dots" markup={DOTS_MARKUP} />
              </button>
              <span className="lis-spacer" aria-hidden="true" />
              <button
                type="button"
                className="lis-menu"
                aria-expanded={st.open}
                aria-controls={st.panel ? panelId : undefined}
                aria-label={st.open ? "Close menu" : "Open menu"}
                onClick={bind?.onMenu}
                ref={bind ? (el) => bind.setMenu(el) : undefined}
              >
                <span className="lis-bar" aria-hidden="true" />
                <span className="lis-bar" aria-hidden="true" />
              </button>
            </div>
            {st.panel && (
              <div
                className="lis-panel"
                id={panelId}
                aria-hidden={!st.open || undefined}
                ref={bind ? (el) => bind.setPanel(el) : undefined}
              >
                <ul className="lis-plist">
                  {cfg.items.map((it, i) => {
                    const isCurrent = i === st.activeIdx;
                    const rowStyle = { "--d": `${70 + i * 28}ms` } as CSSProperties;
                    const rowClass = "lis-prow" + (isCurrent ? " is-cur" : "");
                    const rowContent = (
                      <Fragment>
                        <span className="lis-ico">
                          <Glyph name={it.icon} image={it.image} />
                        </span>
                        <span className="lis-ptext" style={cfg.panelFont}>
                          {it.label}
                        </span>
                      </Fragment>
                    );
                    return (
                      <li key={i}>
                        {it.href || it.section ? (
                          <a
                            className={rowClass}
                            style={rowStyle}
                            aria-current={curAttr(isCurrent)}
                            draggable={false}
                            {...itemLinkAttrs(it)}
                            onClick={bind ? (e) => bind.onPanelClick(i, e) : undefined}
                          >
                            {rowContent}
                          </a>
                        ) : (
                          <span className={rowClass} style={rowStyle}>
                            {rowContent}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
