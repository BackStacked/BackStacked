import { writeFile } from "node:fs/promises";
import { loadConfig } from "./lib/config.ts";
import { ICONS_FILE, SIMPLE_ICONS_VERSION, wantedIcons, type IconSet } from "./lib/icons.ts";

// Copies the Simple Icons paths this profile uses into assets/icons.json, so
// image builds never depend on a CDN. Run it after adding an icon to the config.
const config = await loadConfig();
const set: IconSet = { source: `simple-icons@${SIMPLE_ICONS_VERSION} (CC0-1.0)`, icons: {} };

for (const slug of wantedIcons(config)) {
  const res = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@${SIMPLE_ICONS_VERSION}/icons/${slug}.svg`);
  if (!res.ok) throw new Error(`simple-icons has no "${slug}" (HTTP ${res.status})`);
  const svg = await res.text();
  const title = /<title>([^<]*)<\/title>/.exec(svg)?.[1];
  const path = /<path d="([^"]+)"/.exec(svg)?.[1];
  if (!title || !path) throw new Error(`Unexpected SVG for "${slug}"`);
  set.icons[slug] = { title, path };
}

await writeFile(ICONS_FILE, `${JSON.stringify(set, null, 2)}\n`);
console.log(`${Object.keys(set.icons).length} icons -> ${ICONS_FILE}`);
