import type { Config } from "../lib/config.ts";
import { LANGUAGE_ICONS, hasIcon, icon } from "../lib/icons.ts";
import { languageShares, type ProfileData } from "../lib/profile.ts";
import { count, esc } from "../lib/svg.ts";
import type { Theme } from "../lib/theme.ts";
import { CARD_W, PAD, card } from "./card.ts";

const BAR_Y = 54;
const BAR_H = 8;
const GAP = 3;
const ROWS = 3;

export function percent(share: number): string {
  return share < 0.001 ? "<0.1%" : `${(share * 100).toFixed(1)}%`;
}

export function renderLanguages(data: ProfileData, config: Config, theme: Theme): string {
  const shares = languageShares(data.languages, config.languages);
  const colour = (i: number): string => theme.series[Math.min(i, theme.series.length - 1)] ?? theme.faint;
  const width = CARD_W - 2 * PAD - GAP * Math.max(0, shares.length - 1);

  let x = PAD;
  const segments = shares
    .map((s, i) => {
      const w = Math.max(2, s.share * width);
      const rect = `<rect x="${x.toFixed(2)}" y="${BAR_Y}" width="${w.toFixed(2)}" height="${BAR_H}" fill="${colour(i)}"/>`;
      x += w + GAP;
      return rect;
    })
    .join("");

  // Column-major, so the ranking reads top to bottom. Each language is marked
  // with its logo in the same shade as its bar segment.
  const legend = shares
    .map((s, i) => {
      const lx = PAD + Math.floor(i / ROWS) * 192;
      const ly = 100 + (i % ROWS) * 28;
      const slug = LANGUAGE_ICONS[s.name];
      const mark = hasIcon(slug)
        ? icon(slug, lx, ly - 13, 16, colour(i))
        : `<rect x="${lx + 3}" y="${ly - 10}" width="10" height="10" rx="2" fill="${colour(i)}"/>`;
      return `${mark}
<text x="${lx + 24}" y="${ly}" class="sans" font-size="14" fill="${theme.text}">${esc(s.name)}</text>
<text x="${lx + 176}" y="${ly}" class="mono" font-size="12" text-anchor="end" fill="${theme.muted}">${percent(s.share)}</text>`;
    })
    .join("\n");

  const { total, private: hidden } = data.repos;
  const note = hidden > 0 ? `${count(total)} repos · incl. private` : `${count(total)} public repos`;
  const summary = shares.map((s) => `${s.name} ${percent(s.share)}`).join(", ");

  return card(
    config,
    theme,
    `Languages across ${count(total)} repositories: ${summary}.`,
    "Languages",
    note,
    `<g clip-path="url(#bar)">${segments}</g>
${legend}
<text x="${PAD}" y="182" class="mono" font-size="11" fill="${theme.faint}">weighted by code size and repo count</text>`,
    `<clipPath id="bar"><rect x="${PAD}" y="${BAR_Y}" width="${CARD_W - 2 * PAD}" height="${BAR_H}" rx="${BAR_H / 2}"/></clipPath>`,
  );
}
