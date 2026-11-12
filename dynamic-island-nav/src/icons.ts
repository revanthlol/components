/**
 * Built-in icon set. Each value is the inner markup of a 24x24 SVG (stroke based).
 * Elements with class "f" receive a soft fill when their item is the current one.
 */
export const ICON_MARKUP = {
  home: "<path class=\"f\" d=\"M4.5 10.2 12 4.25l7.5 5.95v8.3a1.5 1.5 0 0 1-1.5 1.5h-3.25v-5.25h-5.5V20H6a1.5 1.5 0 0 1-1.5-1.5z\"/>",
  grid: "<rect class=\"f\" x=\"4\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1.75\"/><rect class=\"f\" x=\"13.5\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1.75\"/><rect class=\"f\" x=\"4\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1.75\"/><rect class=\"f\" x=\"13.5\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1.75\"/>",
  sparkle: "<path class=\"f\" d=\"M12 4.5c.6 4.1 3.4 6.9 7.5 7.5-4.1.6-6.9 3.4-7.5 7.5-.6-4.1-3.4-6.9-7.5-7.5 4.1-.6 6.9-3.4 7.5-7.5z\"/>",
  pen: "<path class=\"f\" d=\"M14.5 5.5 18.5 9.5 9.5 18.5H5.5V14.5z\"/><path d=\"m12.5 7.5 4 4\"/>",
  book: "<path class=\"f\" d=\"M12 6.5c-1.6-1.3-3.9-2-7.5-2v13c3.6 0 5.9.7 7.5 2 1.6-1.3 3.9-2 7.5-2v-13c-3.6 0-5.9.7-7.5 2z\"/><path d=\"M12 6.5v13\"/>",
  user: "<circle class=\"f\" cx=\"12\" cy=\"8.5\" r=\"3.75\"/><path class=\"f\" d=\"M5 19.5c.9-3.4 3.6-5.25 7-5.25s6.1 1.85 7 5.25\"/>",
  mail: "<rect class=\"f\" x=\"3.75\" y=\"5.5\" width=\"16.5\" height=\"13\" rx=\"2.75\"/><path d=\"m4.75 7.75 6.2 4.6a1.75 1.75 0 0 0 2.1 0l6.2-4.6\"/>",
  search: "<circle class=\"f\" cx=\"11\" cy=\"11\" r=\"6.25\"/><path d=\"m19.5 19.5-3.9-3.9\"/>",
  bag: "<path class=\"f\" d=\"M5.75 8.5h12.5l-.9 10.1a1.5 1.5 0 0 1-1.5 1.4H8.15a1.5 1.5 0 0 1-1.5-1.4z\"/><path d=\"M9 8.5V7.25a3 3 0 0 1 6 0V8.5\"/>",
  briefcase: "<rect class=\"f\" x=\"3.75\" y=\"7.25\" width=\"16.5\" height=\"12\" rx=\"2.5\"/><path d=\"M9 7.25V5.75a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v1.5M3.75 12.5h16.5\"/>",
  layers: "<path class=\"f\" d=\"m12 4.5 8 4.5-8 4.5-8-4.5z\"/><path d=\"m4 14 8 4.5 8-4.5\"/>",
  compass: "<circle class=\"f\" cx=\"12\" cy=\"12\" r=\"8.25\"/><path class=\"f\" d=\"m15.25 8.75-1.9 4.6-4.6 1.9 1.9-4.6z\"/>",
  chat: "<path class=\"f\" d=\"M19.75 11.75c0 3.9-3.5 7-7.75 7-1.1 0-2.15-.2-3.1-.57L4.5 19.5l1.2-3.4c-.92-1.25-1.45-2.75-1.45-4.35 0-3.9 3.5-7 7.75-7s7.75 3.1 7.75 7z\"/>",
  bell: "<path class=\"f\" d=\"M6.5 16.5v-5a5.5 5.5 0 0 1 11 0v5l1.5 1.5H5z\"/><path d=\"M10 20.25a2.1 2.1 0 0 0 4 0\"/>",
  heart: "<path class=\"f\" d=\"M12 19.25s-7.25-4.3-7.25-9.6A4.15 4.15 0 0 1 12 7.1a4.15 4.15 0 0 1 7.25 2.55c0 5.3-7.25 9.6-7.25 9.6z\"/>",
  star: "<path class=\"f\" d=\"m12 4.25 2.35 4.8 5.3.77-3.83 3.73.9 5.27L12 16.33l-4.72 2.49.9-5.27-3.83-3.73 5.3-.77z\"/>",
  calendar: "<rect class=\"f\" x=\"4\" y=\"5.5\" width=\"16\" height=\"14.5\" rx=\"2.5\"/><path d=\"M4 10h16M8.5 3.75v3.5M15.5 3.75v3.5\"/>",
  code: "<path d=\"m8.75 7.5-4.5 4.5 4.5 4.5M15.25 7.5l4.5 4.5-4.5 4.5M13.4 5.25l-2.8 13.5\"/>",
  play: "<path class=\"f\" d=\"M8 6.2v11.6a1 1 0 0 0 1.53.85l9.2-5.8a1 1 0 0 0 0-1.7l-9.2-5.8A1 1 0 0 0 8 6.2z\"/>",
  camera: "<path class=\"f\" d=\"M4 9a2 2 0 0 1 2-2h1.6l1.4-2h6l1.4 2H18a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z\"/><circle cx=\"12\" cy=\"13\" r=\"3.25\"/>",
  music: "<path d=\"M9 17.5V6.25l10-1.75v11.5\"/><circle class=\"f\" cx=\"6.75\" cy=\"17.5\" r=\"2.25\"/><circle class=\"f\" cx=\"16.75\" cy=\"16\" r=\"2.25\"/>",
  globe: "<circle class=\"f\" cx=\"12\" cy=\"12\" r=\"8.25\"/><path d=\"M3.75 12h16.5M12 3.75c2.2 2.3 3.3 5 3.3 8.25s-1.1 5.95-3.3 8.25c-2.2-2.3-3.3-5-3.3-8.25s1.1-5.95 3.3-8.25z\"/>",
  sliders: "<path d=\"M4 7.5h9M17 7.5h3M4 16.5h3M11 16.5h9\"/><circle class=\"f\" cx=\"15\" cy=\"7.5\" r=\"2\"/><circle class=\"f\" cx=\"9\" cy=\"16.5\" r=\"2\"/>",
  folder: "<path class=\"f\" d=\"M3.75 7.25a2 2 0 0 1 2-2h3.6l2 2.25h6.9a2 2 0 0 1 2 2v8.25a2 2 0 0 1-2 2H5.75a2 2 0 0 1-2-2z\"/>",
  image: "<rect class=\"f\" x=\"3.75\" y=\"4.75\" width=\"16.5\" height=\"14.5\" rx=\"2.75\"/><circle cx=\"9\" cy=\"10\" r=\"1.6\"/><path d=\"m4.5 17.25 4.6-4.1a1.5 1.5 0 0 1 2 0l2.4 2.15 2.1-1.75a1.5 1.5 0 0 1 1.95.05L20 15.8\"/>",
  bolt: "<path class=\"f\" d=\"M13.25 3.75 5.75 13.25h6l-1 7 7.5-9.5h-6z\"/>",
  moon: "<path class=\"f\" d=\"M19.25 14.6A7.75 7.75 0 0 1 9.4 4.75a7.75 7.75 0 1 0 9.85 9.85z\"/>",
  sun: "<circle class=\"f\" cx=\"12\" cy=\"12\" r=\"3.75\"/><path d=\"M12 3.5v1.75M12 18.75v1.75M3.5 12h1.75M18.75 12h1.75M5.99 5.99l1.24 1.24M16.77 16.77l1.24 1.24M5.99 18.01l1.24-1.24M16.77 7.23l1.24-1.24\"/>",
  plus: "<path d=\"M12 5.5v13M5.5 12h13\"/>",
  arrow: "<path d=\"M7.5 16.5 16.5 7.5M9 7.5h7.5V15\"/>",
} as const;

export type IconName = keyof typeof ICON_MARKUP;

export const ICON_NAMES = Object.keys(ICON_MARKUP) as IconName[];

/** Human readable titles, same order as ICON_NAMES. */
export const ICON_TITLES: readonly string[] = ["Home","Grid","Sparkle","Pen","Book","User","Mail","Search","Bag","Briefcase","Layers","Compass","Chat","Bell","Heart","Star","Calendar","Code","Play","Camera","Music","Globe","Sliders","Folder","Image","Bolt","Moon","Sun","Plus","Arrow"];

/** Markup of the three-dot "more" button glyph. */
export const DOTS_MARKUP = "<circle cx=\"6\" cy=\"12\" r=\"1.5\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"1.5\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"18\" cy=\"12\" r=\"1.5\" fill=\"currentColor\" stroke=\"none\"/>";
