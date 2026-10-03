/**
 * Palette helper — kept as a small JS API so future
 * variant work (amber / claret heroes) is one-line.
 * Mirrors marketing-shared.jsx :: accentFor.
 */

export type Palette = "mint" | "amber" | "claret";

export type Accent = {
  a: string;
  b: string;
  on: string;
  label: string;
};

const T = {
  accent: "#5BE4C3",
  accent2: "#8FE85B",
};

export const fwT = {
  paper: "#06090E",
  paperSheet: "#0B1119",
  ink: "#F6F4EE",
  ink2: "#9BA7B5",
  ink3: "#5F6B7A",
  rule: "rgba(255,255,255,0.10)",
  ruleStrong: "rgba(255,255,255,0.18)",
  accent: T.accent,
  accent2: T.accent2,
  amber: "#F4A85C",
  claret: "#E2664E",
  glass: "rgba(20,30,42,0.55)",
};

export const fwF = {
  display: 'var(--font-display)',
  ui: 'var(--font-ui)',
  mono: 'var(--font-mono)',
};

export function accentFor(palette: Palette = "mint"): Accent {
  if (palette === "amber") return { a: "#F4A85C", b: "#E2664E", on: "#1F1108", label: "Amber" };
  if (palette === "claret") return { a: "#E2664E", b: "#F4A85C", on: "#1A0905", label: "Claret" };
  return { a: T.accent, b: T.accent2, on: "#06090E", label: "Mint" };
}
