import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface Typeface {
  sans: string;
  mono: string;
  /** Folder holding <family-slug>-<weight>.woff2 files. */
  fonts: string;
}

const SANS_FALLBACK = `system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
const MONO_FALLBACK = `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
const FACES = [
  ["sans", 400],
  ["sans", 700],
  ["mono", 400],
  ["mono", 700],
] as const;

const cache = new Map<string, string>();

export const slug = (family: string): string => family.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * An image on GitHub can't fetch web fonts, so the fonts travel inside the SVG
 * as data URIs. The files are subset to the glyphs the images use, about 5 KB each.
 */
export function fontCss(type: Typeface): string {
  const faces = new Map<string, string>();
  for (const [kind, weight] of FACES) {
    const family = type[kind];
    const file = join(type.fonts, `${slug(family)}-${weight}.woff2`);
    if (faces.has(file)) continue;
    let data = cache.get(file);
    if (data === undefined) {
      data = readFileSync(file).toString("base64");
      cache.set(file, data);
    }
    faces.set(file, `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${data}) format('woff2')}`);
  }
  return (
    [...faces.values()].join("") +
    `.sans{font-family:'${type.sans}',${SANS_FALLBACK}}.mono{font-family:'${type.mono}',${MONO_FALLBACK}}`
  );
}
