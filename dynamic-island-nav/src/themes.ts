/** Fully resolved colour tokens of a theme. */
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
  Dark: {
    fill: "rgba(16, 16, 19, 0.9)",
    border: "rgba(255, 255, 255, 0.08)",
    hl: "rgba(255, 255, 255, 0.07)",
    shadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.18), 0px 14px 34px -12px rgba(0, 0, 0, 0.55)",
    pill: "rgba(255, 255, 255, 0.12)",
    pillHl: "rgba(255, 255, 255, 0.09)",
    rowHover: "rgba(255, 255, 255, 0.06)",
    icon: "rgba(255, 255, 255, 0.56)",
    active: "#FFFFFF",
    divider: "rgba(255, 255, 255, 0.12)",
    focus: "rgba(255, 255, 255, 0.92)",
    iconHc: "rgba(255, 255, 255, 0.82)",
    borderHc: "rgba(255, 255, 255, 0.28)",
    pillHc: "rgba(255, 255, 255, 0.2)",
    fillSolid: "#101013",
  },
  Light: {
    fill: "rgba(255, 255, 255, 0.8)",
    border: "rgba(15, 15, 20, 0.07)",
    hl: "rgba(255, 255, 255, 0.95)",
    shadow: "0px 1px 2px 0px rgba(15, 15, 20, 0.06), 0px 12px 32px -14px rgba(15, 15, 20, 0.28)",
    pill: "rgba(15, 15, 20, 0.065)",
    pillHl: "rgba(255, 255, 255, 0.7)",
    rowHover: "rgba(15, 15, 20, 0.04)",
    icon: "rgba(15, 15, 20, 0.6)",
    active: "#0F0F14",
    divider: "rgba(15, 15, 20, 0.1)",
    focus: "rgba(15, 15, 20, 0.88)",
    iconHc: "rgba(15, 15, 20, 0.8)",
    borderHc: "rgba(15, 15, 20, 0.24)",
    pillHc: "rgba(15, 15, 20, 0.11)",
    fillSolid: "#FFFFFF",
  },
};
