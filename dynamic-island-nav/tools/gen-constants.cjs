const React = require('react');
const make = require('../tests/parity/original.factory.cjs');
const cap = {};
const o = make(React, undefined, cap);
const out = __dirname + '/../src/';
const fs = require('fs');

// icons
const iconLines = Object.entries(o.B).map(([k, v]) => `  ${k}: ${JSON.stringify(v)},`).join('\n');
fs.writeFileSync(out + 'icons.ts',
`/**
 * Built-in icon set. Each value is the inner markup of a 24x24 SVG (stroke based).
 * Elements with class "f" receive a soft fill when their item is the current one.
 */
export const ICON_MARKUP = {
${iconLines}
} as const;

export type IconName = keyof typeof ICON_MARKUP;

export const ICON_NAMES = Object.keys(ICON_MARKUP) as IconName[];

/** Human readable titles, same order as ICON_NAMES. */
export const ICON_TITLES: readonly string[] = ${JSON.stringify(o.H)};

/** Markup of the three-dot "more" button glyph. */
export const DOTS_MARKUP = ${JSON.stringify(o.U)};
`);

// themes
const themeBlock = (t) => '{\n' + Object.entries(t).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n') + '\n  }';
fs.writeFileSync(out + 'themes.ts',
`/** Fully resolved colour tokens of a theme. */
export interface ThemeTokens {
  fill: string;
  border: string;
  hl: string;
  shadow: string;
  pill: string;
  pillHl: string;
  rowHover: string;
  icon: string;
  active: string;
  divider: string;
  focus: string;
  iconHc: string;
  borderHc: string;
  pillHc: string;
  fillSolid: string;
}

export const THEMES: { Dark: ThemeTokens; Light: ThemeTokens } = {
  Dark: ${themeBlock(o.W.Dark)},
  Light: ${themeBlock(o.W.Light)},
};
`);

// css
fs.writeFileSync(out + 'styles.ts',
`/**
 * Static stylesheet of the component. Every rule is scoped by the "lis-" prefix and is
 * driven by CSS custom properties that the component sets inline on its root element.
 */
export const BASE_CSS = ${JSON.stringify(o.Fe)};
`);

// default items
console.log('generated', Object.keys(o.B).length, 'icons');
