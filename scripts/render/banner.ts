import { markElement, markWidth } from "../lib/brand.ts";
import type { Config } from "../lib/config.ts";
import { icon } from "../lib/icons.ts";
import { document, esc, monoWidth } from "../lib/svg.ts";
import type { Theme } from "../lib/theme.ts";

const W = 1200;
const H = 300;
const MARGIN = 64;
const BLOCK = 76;
const GAP_X = 40;
const GAP_Y = 30;
const CYCLE = 4.8;
const LOGO = 34;
const MARK_H = 24;
const LABEL_SIZE = 17;
const LABEL_SPACING = 0.4;

const css = `
.flow{stroke-dasharray:4 7;animation:flow 1.6s linear infinite}
.hl{opacity:0;animation:hl ${CYCLE}s ease-in-out infinite}
.cursor{animation:blink 1.1s steps(1) infinite}
@keyframes flow{to{stroke-dashoffset:-22}}
@keyframes hl{0%,40%,100%{opacity:0}8%,20%{opacity:1}}
@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.flow,.hl,.cursor{animation:none}.hl{opacity:1}}`;

/**
 * Name and headline on the left; on the right, the chains Swapzy runs on drawn
 * as linked blocks, with a confirmation sweeping along them.
 */
export function renderBanner(config: Config, theme: Theme): string {
  const { name, headline, location, ventures, chains } = config.banner;

  const cols = Math.ceil(chains.length / 2);
  const left = W - MARGIN - (cols * BLOCK + (cols - 1) * GAP_X);
  const top = (H - (2 * BLOCK + GAP_Y)) / 2;
  // Two rows, the second running back the other way, so the links read as one chain.
  const blocks = chains.map((chain, i) => {
    const row = i < cols ? 0 : 1;
    const col = row === 0 ? i : cols - 1 - (i - cols);
    return { chain, x: left + col * (BLOCK + GAP_X), y: top + row * (BLOCK + GAP_Y) };
  });
  const links = blocks.map((b, i) => `${i === 0 ? "M" : "L"}${b.x + BLOCK / 2} ${b.y + BLOCK / 2}`).join(" ");

  const label = `@${config.user}  ·  ${location}`;
  const labelX = MARGIN + markWidth(MARK_H) + 12;
  const cursorX = labelX + label.length * LABEL_SPACING + monoWidth(label, LABEL_SIZE) + 6;

  let x = MARGIN;
  const chips = ventures.map((v) => {
    const width = 33 + monoWidth(v.name, 15) + 9 + monoWidth(v.status, 14) + 16;
    const chip = `<g transform="translate(${x.toFixed(1)} 220)">
  <rect width="${width.toFixed(1)}" height="36" rx="18" fill="${theme.panel}" stroke="${theme.border}"/>
  <circle cx="21" cy="18" r="4.5" fill="${theme.tone[v.tone]}"/>
  <text x="33" y="23" class="mono" font-size="15" fill="${theme.text}">${esc(v.name)}<tspan dx="9" font-size="14" fill="${theme.muted}">${esc(v.status)}</tspan></text>
</g>`;
    x += width + 10;
    return chip;
  });

  const blockMarkup = blocks.map(
    (b, i) => `<g transform="translate(${b.x} ${b.y})">
  <rect width="${BLOCK}" height="${BLOCK}" rx="12" fill="${theme.panel}" stroke="${theme.border}" stroke-width="1.5"/>
  <rect class="hl" style="animation-delay:${((i * CYCLE) / blocks.length).toFixed(2)}s" x=".75" y=".75" width="${BLOCK - 1.5}" height="${BLOCK - 1.5}" rx="11.25" fill="none" stroke="${theme.accent}" stroke-width="1.5"/>
  ${icon(b.chain.icon, (BLOCK - LOGO) / 2, (BLOCK - LOGO) / 2, LOGO, theme.text)}
</g>`,
  );

  const body = `<defs>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="${theme.grid}"/></pattern>
  <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset=".35" stop-color="#000"/><stop offset=".8" stop-color="#fff"/></linearGradient>
  <mask id="right"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="${theme.bg}" stroke="${theme.border}"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15.5" fill="url(#dots)" mask="url(#right)"/>
${markElement(MARGIN, 66, MARK_H, theme.text)}
<text x="${labelX.toFixed(1)}" y="84" class="mono" font-size="${LABEL_SIZE}" letter-spacing="${LABEL_SPACING}" fill="${theme.muted}"><tspan fill="${theme.accent}">@${esc(config.user)}</tspan>  ·  ${esc(location)}</text>
<rect class="cursor" x="${cursorX.toFixed(1)}" y="69" width="10" height="19" fill="${theme.accent}"/>
<text x="${MARGIN}" y="152" class="sans" font-size="56" font-weight="700" letter-spacing="-1.5" fill="${theme.text}">${esc(name)}</text>
<text x="${MARGIN}" y="196" class="sans" font-size="23" fill="${theme.muted}">${esc(headline)}</text>
${chips.join("\n")}
<path class="flow" d="${links}" fill="none" stroke="${theme.faint}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
${blockMarkup.join("\n")}`;

  const title = `${name}, ${headline}. Chains: ${chains.map((c) => c.name).join(", ")}.`;
  return document(W, H, title, body, config.style, css);
}
