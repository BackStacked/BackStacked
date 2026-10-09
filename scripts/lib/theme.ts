import type { Tone } from "./config.ts";

export const THEME_NAMES = ["light", "dark"] as const;

export interface Theme {
  name: (typeof THEME_NAMES)[number];
  bg: string;
  panel: string;
  border: string;
  grid: string;
  text: string;
  muted: string;
  faint: string;
  empty: string;
  /** The single accent colour. Everything else is neutral. */
  accent: string;
  /** Chart series in rank order: the accent first, then greys. */
  series: readonly string[];
  tone: Record<Tone, string>;
}

const neutrals = {
  light: {
    bg: "#fafafa",
    panel: "#ffffff",
    border: "#e4e4e7",
    grid: "#e4e4e7",
    text: "#09090b",
    muted: "#52525b",
    faint: "#a1a1aa",
    empty: "#ececef",
    greys: ["#3f3f46", "#71717a", "#a1a1aa", "#c4c4cc", "#dcdce1"],
  },
  dark: {
    bg: "#09090b",
    panel: "#0c0c0f",
    border: "#27272a",
    grid: "#1d1d21",
    text: "#fafafa",
    muted: "#a1a1aa",
    faint: "#5b5b63",
    empty: "#1c1c20",
    greys: ["#d4d4d8", "#a1a1aa", "#71717a", "#52525b", "#3f3f46"],
  },
};

export function themes(accent: Record<Theme["name"], string>): Theme[] {
  return THEME_NAMES.map((name) => {
    const { greys, ...base } = neutrals[name];
    return {
      name,
      ...base,
      accent: accent[name],
      series: [accent[name], ...greys],
      tone: { live: accent[name], soon: base.muted, building: base.faint },
    };
  });
}
