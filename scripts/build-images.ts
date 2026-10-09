import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { brandFile } from "./lib/brand.ts";
import { loadConfig } from "./lib/config.ts";
import { fetchProfile, type ProfileData } from "./lib/profile.ts";
import { themes } from "./lib/theme.ts";
import { renderBanner } from "./render/banner.ts";
import { renderLanguages } from "./render/languages.ts";
import { renderStack } from "./render/stack.ts";
import { renderStats } from "./render/stats.ts";

// node scripts/build-images.ts [out-dir] [--data saved.json] [--save-data saved.json]
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { data: { type: "string" }, "save-data": { type: "string" } },
});
const out = positionals[0] ?? "dist";
const config = await loadConfig();
const data: ProfileData = values.data
  ? JSON.parse(await readFile(values.data, "utf8"))
  : await fetchProfile(config);
if (values["save-data"]) await writeFile(values["save-data"], `${JSON.stringify(data, null, 2)}\n`);

await mkdir(out, { recursive: true });
for (const theme of themes(config.style.accent)) {
  await writeFile(join(out, `banner-${theme.name}.svg`), renderBanner(config, theme));
  await writeFile(join(out, `stats-${theme.name}.svg`), renderStats(data, config, theme));
  await writeFile(join(out, `languages-${theme.name}.svg`), renderLanguages(data, config, theme));
  await writeFile(join(out, `stack-${theme.name}.svg`), renderStack(config, theme));
  await writeFile(join(out, `logo-${theme.name}.svg`), brandFile("logo", theme.text));
}

const { lastYear } = data.contributions;
console.log(`${lastYear} contributions, ${data.repos.total} repos (${data.repos.private} private) -> ${out}/`);
