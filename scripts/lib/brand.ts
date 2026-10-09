import { readFileSync } from "node:fs";

export const BRAND_DIR = "assets/brand";

/** The brand SVGs are drawn in this ink; other themes swap it out. */
const INK = "#09090b";

export function brandFile(name: "logo" | "mark", ink: string, dir = BRAND_DIR): string {
  return readFileSync(`${dir}/${name}.svg`, "utf8").replaceAll(INK, ink);
}

/** The mark as an element to nest in another SVG: `height` tall, top-left corner at x, y. */
export function markElement(x: number, y: number, height: number, ink: string): string {
  const svg = brandFile("mark", ink);
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
  const inner = /<svg[^>]*>([\s\S]*)<\/svg>/.exec(svg)?.[1];
  if (!viewBox || !inner) throw new Error(`${BRAND_DIR}/mark.svg is not an SVG`);
  const [, , w = 1, h = 1] = viewBox.split(/\s+/).map(Number);
  return `<svg x="${x}" y="${y}" width="${((height * w) / h).toFixed(2)}" height="${height}" viewBox="${viewBox}">${inner.trim()}</svg>`;
}

export function markWidth(height: number): number {
  const viewBox = /viewBox="([^"]+)"/.exec(brandFile("mark", INK))?.[1] ?? "0 0 1 1";
  const [, , w = 1, h = 1] = viewBox.split(/\s+/).map(Number);
  return (height * w) / h;
}
