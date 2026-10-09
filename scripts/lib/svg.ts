import { fontCss, type Typeface } from "./fonts.ts";

const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function esc(text: string): string {
  return text.replace(/[&<>"']/g, (c) => entities[c] ?? c);
}

export const count = (n: number): string => new Intl.NumberFormat("en-US").format(n);

/** Advance width of monospace text; Space Mono is 0.612em, most others 0.6em. */
export const monoWidth = (text: string, size: number): number => text.length * size * 0.612;

export function document(width: number, height: number, title: string, body: string, type: Typeface, css = ""): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">`,
    `<title id="title">${esc(title)}</title>`,
    `<style>${fontCss(type)}${css}</style>`,
    body,
    `</svg>`,
    "",
  ].join("\n");
}
