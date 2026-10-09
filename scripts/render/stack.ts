import type { Config } from "../lib/config.ts";
import { icon } from "../lib/icons.ts";
import { document, esc, monoWidth } from "../lib/svg.ts";
import type { Theme } from "../lib/theme.ts";

const W = 1200;
const MARGIN = 64;
const LABEL_W = 170;
const CHIP_H = 40;
const CHIP_GAP = 10;
const ROW_GAP = 14;
const TOP = 92;
const LOGO = 20;
const TEXT = 15;

/** The stack as rows of logo chips, one row per group, wrapping when a row runs out of room. */
export function renderStack(config: Config, theme: Theme): string {
  const right = W - MARGIN;
  let y = TOP;
  const rows = config.stack.map((group) => {
    let x = MARGIN + LABEL_W;
    const rowTop = y;
    const chips = group.items.map((item) => {
      const width = 14 + LOGO + 10 + monoWidth(item.name, TEXT) + 16;
      if (x + width > right) {
        x = MARGIN + LABEL_W;
        y += CHIP_H + CHIP_GAP;
      }
      const chip = `<g transform="translate(${x.toFixed(1)} ${y})">
  <rect width="${width.toFixed(1)}" height="${CHIP_H}" rx="10" fill="${theme.panel}" stroke="${theme.border}"/>
  ${icon(item.icon, 14, (CHIP_H - LOGO) / 2, LOGO, theme.text)}
  <text x="${14 + LOGO + 10}" y="${CHIP_H / 2 + 5}" class="mono" font-size="${TEXT}" fill="${theme.text}">${esc(item.name)}</text>
</g>`;
      x += width + CHIP_GAP;
      return chip;
    });
    const label = `<text x="${MARGIN}" y="${rowTop + CHIP_H / 2 + 5}" class="mono" font-size="13" letter-spacing="1.4" fill="${theme.muted}">${esc(group.label.toUpperCase())}</text>`;
    y += CHIP_H + ROW_GAP;
    return label + chips.join("");
  });

  const height = y - ROW_GAP + 52;
  const title = `Stack. ${config.stack.map((g) => `${g.label}: ${g.items.map((i) => i.name).join(", ")}`).join(". ")}.`;
  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${height - 1}" rx="16" fill="${theme.bg}" stroke="${theme.border}"/>
<rect x="${MARGIN}" y="44" width="9" height="9" fill="${theme.accent}"/>
<text x="${MARGIN + 20}" y="53" class="mono" font-size="14" letter-spacing="1.6" fill="${theme.muted}">STACK</text>
${rows.join("\n")}`;
  return document(W, height, title, body, config.style);
}
