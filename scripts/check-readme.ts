import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { loadConfig } from "./lib/config.ts";
import { checkReadme, referencedOutputs } from "./lib/readme.ts";

// node scripts/check-readme.ts [--dist dir]   (--dist also checks the built files exist)
const { values } = parseArgs({ options: { dist: { type: "string" } } });
const config = await loadConfig();
const readme = await readFile("README.md", "utf8");
const problems = checkReadme(readme, config.user);

if (values.dist) {
  for (const file of referencedOutputs(readme)) {
    const size = await stat(join(values.dist, file)).then((s) => s.size, () => 0);
    if (size === 0) problems.push(`${values.dist}/${file} is missing or empty`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`✗ ${problem}`);
  process.exit(1);
}
console.log("README.md looks good");
