import type { Repo } from "./github.ts";

export const START = "<!-- feed:start -->";
export const END = "<!-- feed:end -->";

/** Most recently pushed public repos. Private ones are dropped here even if a caller passes them in. */
export function pickRecent(repos: Repo[], { limit, exclude }: { limit: number; exclude: string[] }): Repo[] {
  const skip = new Set(exclude.map((name) => name.toLowerCase()));
  return repos
    .filter((r) => !r.isPrivate && !r.isArchived && !skip.has(`${r.owner}/${r.name}`.toLowerCase()))
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))
    .slice(0, limit);
}

export function renderFeed(repos: Repo[]): string {
  return repos
    .map((r) => {
      const about = r.description ? ` · ${markdown(clip(r.description, 100))}` : "";
      return `- \`${r.pushedAt.slice(0, 10)}\` [**${markdown(r.name)}**](${r.url})${about}`;
    })
    .join("\n");
}

/** Swaps whatever sits between the feed markers, keeping the file's own line endings. */
export function replaceBlock(doc: string, body: string): string {
  const start = doc.indexOf(START);
  const end = doc.indexOf(END);
  if (start === -1 || end === -1 || end < start || doc.indexOf(START, start + 1) !== -1 || doc.indexOf(END, end + 1) !== -1) {
    throw new Error(`README.md needs exactly one ${START} ... ${END} block`);
  }
  const eol = doc.includes("\r\n") ? "\r\n" : "\n";
  const inner = body ? `${eol}${body.split("\n").join(eol)}${eol}` : eol;
  return doc.slice(0, start + START.length) + inner + doc.slice(end);
}

function markdown(text: string): string {
  return text.replace(/[\\`*_[\]]/g, "\\$&").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s,.;:·-]+$/, "")}…`;
}
