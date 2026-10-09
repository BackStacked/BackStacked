import type { Config } from "../lib/config.ts";
import { document, esc } from "../lib/svg.ts";
import type { Theme } from "../lib/theme.ts";

export const CARD_W = 420;
export const CARD_H = 200;
export const PAD = 24;

/** Frame shared by the dashboard cards: panel, accent mark, header row. */
export function card(config: Config, theme: Theme, title: string, label: string, note: string, body: string, defs = ""): string {
  return document(
    CARD_W,
    CARD_H,
    title,
    `${defs ? `<defs>${defs}</defs>` : ""}
<rect x=".5" y=".5" width="${CARD_W - 1}" height="${CARD_H - 1}" rx="12" fill="${theme.panel}" stroke="${theme.border}"/>
<rect x="${PAD}" y="28" width="7" height="7" fill="${theme.accent}"/>
<text x="${PAD + 15}" y="35" class="mono" font-size="11" letter-spacing="1.4" fill="${theme.muted}">${esc(label.toUpperCase())}</text>
<text x="${CARD_W - PAD}" y="35" class="mono" font-size="11" text-anchor="end" fill="${theme.faint}">${esc(note)}</text>
${body}`,
    config.style,
  );
}
