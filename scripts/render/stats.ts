import type { Config } from "../lib/config.ts";
import type { ProfileData } from "../lib/profile.ts";
import { count, esc } from "../lib/svg.ts";
import type { Theme } from "../lib/theme.ts";
import { CARD_W, PAD, card } from "./card.ts";

const SPARK_TOP = 124;
const SPARK_H = 36;

export function renderStats(data: ProfileData, config: Config, theme: Theme): string {
  const { lastYear, allTime, activeDays, weeks } = data.contributions;
  const metrics: [string, string][] = [
    [count(lastYear), "contributions"],
    [count(activeDays), "active days"],
    [count(data.repos.total), "repositories"],
  ];
  const columns = metrics
    .map(([value, label], i) => {
      const x = PAD + i * 136;
      return `<text x="${x}" y="86" class="sans" font-size="30" font-weight="700" letter-spacing="-.5" fill="${theme.text}">${esc(value)}</text>
<text x="${x}" y="106" class="mono" font-size="11" fill="${theme.muted}">${esc(label)}</text>`;
    })
    .join("\n");

  // Square-root scale: a few huge weeks shouldn't flatten the rest of the year.
  const peak = Math.sqrt(Math.max(1, ...weeks));
  const step = (CARD_W - 2 * PAD) / Math.max(1, weeks.length);
  const bars = weeks
    .map((week, i) => {
      const h = week > 0 ? Math.max(3, (Math.sqrt(week) / peak) * SPARK_H) : 2;
      const fill = week > 0 ? theme.accent : theme.empty;
      return `<rect x="${(PAD + i * step).toFixed(2)}" y="${(SPARK_TOP + SPARK_H - h).toFixed(2)}" width="${(step - 2.2).toFixed(2)}" height="${h.toFixed(2)}" rx="1" fill="${fill}"/>`;
    })
    .join("");

  const footer = [`${count(allTime)} all-time`];
  if (data.npmPackages) footer.push(`${data.npmPackages} npm packages`);
  const synced = new Date(data.generatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return card(
    config,
    theme,
    `${count(lastYear)} contributions on ${count(activeDays)} active days in the last 12 months; ${count(allTime)} all-time.`,
    "Activity",
    "last 12 months",
    `${columns}
<g>${bars}</g>
<text x="${PAD}" y="182" class="mono" font-size="11" fill="${theme.muted}">${esc(footer.join("  ·  "))}</text>
<text x="${CARD_W - PAD}" y="182" class="mono" font-size="11" text-anchor="end" fill="${theme.faint}">synced ${esc(synced)}</text>`,
  );
}
