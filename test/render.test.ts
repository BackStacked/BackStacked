import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { brandFile } from "../scripts/lib/brand.ts";
import { loadConfig } from "../scripts/lib/config.ts";
import { iconSet, wantedIcons } from "../scripts/lib/icons.ts";
import type { ProfileData } from "../scripts/lib/profile.ts";
import { themes } from "../scripts/lib/theme.ts";
import { renderBanner } from "../scripts/render/banner.ts";
import { percent, renderLanguages } from "../scripts/render/languages.ts";
import { renderStack } from "../scripts/render/stack.ts";
import { renderStats } from "../scripts/render/stats.ts";
import { assertWellFormed } from "./xml.ts";

const config = await loadConfig();
const data: ProfileData = JSON.parse(readFileSync("test/fixtures/profile.json", "utf8"));

for (const theme of themes(config.style.accent)) {
  const images = {
    banner: renderBanner(config, theme),
    stats: renderStats(data, config, theme),
    languages: renderLanguages(data, config, theme),
    stack: renderStack(config, theme),
    logo: brandFile("logo", theme.text),
  };
  for (const [name, svg] of Object.entries(images)) {
    test(`${name} (${theme.name}) is well-formed SVG with nothing undefined`, () => {
      assertWellFormed(svg);
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
    });
  }

  test(`banner (${theme.name}) escapes the headline and respects reduced motion`, () => {
    assert.ok(images.banner.includes("Backend &amp; Web3"));
    assert.match(images.banner, /prefers-reduced-motion:reduce/);
  });

  test(`text images (${theme.name}) carry their fonts and a title`, () => {
    for (const svg of [images.banner, images.stats, images.languages, images.stack]) {
      assert.match(svg, /@font-face\{font-family:'Space Grotesk'/);
      assert.match(svg, /<title id="title">[^<]+<\/title>/);
    }
  });

  test(`logo (${theme.name}) is drawn in the theme's ink`, () => {
    assert.ok(images.logo.includes(theme.text));
  });
}

test("every icon the config asks for is vendored", () => {
  const vendored = iconSet().icons;
  assert.deepEqual(wantedIcons(config).filter((slug) => !(slug in vendored)), []);
});

test("languages card falls back to a swatch for languages without a logo", () => {
  const svg = renderLanguages(data, { ...config, languages: { ...config.languages, limit: 6 } }, themes(config.style.accent)[0]!);
  assert.ok(svg.includes(">Elixir<"));
});

test("percent formats small shares without rounding them to zero", () => {
  assert.equal(percent(0.7412), "74.1%");
  assert.equal(percent(0.0004), "<0.1%");
});
