import { readFileSync } from "node:fs";
import type { Config } from "./config.ts";

export const ICONS_FILE = "assets/icons.json";
export const SIMPLE_ICONS_VERSION = "16.34.0";

/** GitHub language names to Simple Icons slugs, for the languages card. */
export const LANGUAGE_ICONS: Record<string, string> = {
  TypeScript: "typescript",
  JavaScript: "javascript",
  Python: "python",
  Rust: "rust",
  Go: "go",
  Solidity: "solidity",
  PLpgSQL: "postgresql",
  Shell: "gnubash",
  HTML: "html5",
  CSS: "css",
  Java: "openjdk",
  "C++": "cplusplus",
  "C#": "dotnet",
  PHP: "php",
  Ruby: "ruby",
  Kotlin: "kotlin",
  Swift: "swift",
  Dart: "dart",
  Zig: "zig",
};

export interface IconSet {
  source: string;
  icons: Record<string, { title: string; path: string }>;
}

let loaded: IconSet | undefined;

export function iconSet(file = ICONS_FILE): IconSet {
  loaded ??= JSON.parse(readFileSync(file, "utf8")) as IconSet;
  return loaded;
}

/** Every slug the config and the languages card can ask for. */
export function wantedIcons(config: Config): string[] {
  return [
    ...new Set([
      ...config.banner.chains.map((c) => c.icon),
      ...config.stack.flatMap((group) => group.items.map((item) => item.icon)),
      ...Object.values(LANGUAGE_ICONS),
    ]),
  ].sort();
}

/** A Simple Icons glyph (24×24 viewBox) drawn at x, y with the given size and colour. */
export function icon(slug: string, x: number, y: number, size: number, fill: string): string {
  const glyph = iconSet().icons[slug];
  if (!glyph) throw new Error(`Icon "${slug}" is not in ${ICONS_FILE}. Run: npm run icons`);
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24"><path fill="${fill}" d="${glyph.path}"/></svg>`;
}

export function hasIcon(slug: string | undefined): slug is string {
  return slug !== undefined && slug in iconSet().icons;
}
