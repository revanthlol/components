/** Small numeric / string helpers used across the component. */

export const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v;

export const clamp01 = (v: number): number => clamp(v, 0, 1);

/** Hermite smoothstep between edge0 and edge1. */
export const smoothstep = (edge0: number, edge1: number, v: number): number => {
  const t = clamp01((v - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/** Formats a number as a CSS px value with two decimals. */
export const px = (v: number): string => v.toFixed(2) + "px";

/** Parses a number or numeric string, falling back when it is not finite. */
export function toNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return isFinite(n) ? n : fallback;
}

/**
 * Parses a CSS-like 1 to 4 value shorthand ("6px", "6px 10px", ...) into [top, right, bottom, left].
 * Numbers apply to all four sides.
 */
export function parseBox(v: unknown, fallback: number): [number, number, number, number] {
  if (typeof v === "number" && isFinite(v)) return [v, v, v, v];
  const n = String(v ?? "")
    .trim()
    .split(/\s+/)
    .map((s) => parseFloat(s))
    .filter((x) => isFinite(x));
  return n.length === 1
    ? [n[0], n[0], n[0], n[0]]
    : n.length === 2
      ? [n[0], n[1], n[0], n[1]]
      : n.length === 3
        ? [n[0], n[1], n[2], n[1]]
        : n.length >= 4
          ? [n[0], n[1], n[2], n[3]]
          : [fallback, fallback, fallback, fallback];
}

/** Reduces any colour string to an opaque equivalent (used for the reduced-transparency fallback). */
export function toOpaqueColor(c: string): string {
  const rgb = c.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgb) return `rgb(${rgb[1]}, ${rgb[2]}, ${rgb[3]})`;
  const hex6 = c.trim().match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (hex6) return "#" + hex6[1];
  const hex3 = c.trim().match(/^#([0-9a-f]{3})[0-9a-f]?$/i);
  return hex3 ? "#" + hex3[1] : c;
}

/** True when a CSS shadow string means "no shadow". */
export function isNoShadow(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === "" || s === "none";
}

/** Strips Framer-internal placeholder URLs that are not real links. */
export function cleanHref(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  return /^data:framer\//i.test(s) ? "" : s;
}

/** Reads a numeric font size in px out of a style object (rem-like values below 4 are treated as 16px multiples). */
export function readFontSize(font: { fontSize?: unknown } | undefined, fallback: number): number {
  const raw = font?.fontSize;
  if (typeof raw === "number") return raw;
  const n = parseFloat(String(raw ?? ""));
  return isFinite(n) && String(raw).trim().endsWith("px")
    ? n
    : isFinite(n) && n > 0 && n < 4
      ? n * 16
      : fallback;
}

/** Compares two number arrays with a 0.25px tolerance. */
export function sameWidths(a: number[] | null, b: number[]): boolean {
  if (!a || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 0.25) return false;
  return true;
}
