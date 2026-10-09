import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { END, START } from "../scripts/lib/feed.ts";
import { outputFiles } from "../scripts/lib/outputs.ts";
import { checkReadme } from "../scripts/lib/readme.ts";

const RAW = "https://raw.githubusercontent.com/BackStacked/BackStacked";
const picture = (name: string, alt = "alt text") =>
  `<picture><source srcset="${RAW}/output/${name}-dark.svg"><img src="${RAW}/output/${name}-light.svg" alt="${alt}"></picture>`;
const valid = `${picture("banner")}\n${START}\n${END}\n`;

test("the real README passes", () => {
  assert.deepEqual(checkReadme(readFileSync("README.md", "utf8"), "BackStacked", existsSync), []);
});

test("catches links to files this repo doesn't have", () => {
  const link = (path: string) => `<a href="https://github.com/BackStacked/BackStacked/blob/main/${path}">x</a>`;
  const problems = checkReadme(`${valid}${link("profile.config.json")}${link("gone.yml")}`, "BackStacked", existsSync);
  assert.deepEqual(problems, ["links to gone.yml, which is not in the repo"]);
});

test("a minimal README passes", () => {
  assert.deepEqual(checkReadme(valid, "BackStacked"), []);
});

test("catches images without alt text", () => {
  assert.equal(checkReadme(valid.replace('alt="alt text"', 'alt=" "'), "BackStacked").length, 1);
  assert.equal(checkReadme(`${valid}![](${RAW}/output/stats-light.svg)`, "BackStacked").length >= 1, true);
});

test("catches images on the wrong branch, from another repo, or never built", () => {
  const problems = checkReadme(
    `${valid}<img src="${RAW}/main/x.svg" alt="a"><img src="https://raw.githubusercontent.com/someone/someone/output/banner-light.svg" alt="a">${picture("nope")}`,
    "BackStacked",
  );
  assert.ok(problems.some((p) => p.includes('branch "main"')));
  assert.ok(problems.some((p) => p.includes("another repo")));
  assert.ok(problems.some((p) => p.includes("nope-light.svg")));
});

test("catches a light image without its dark twin", () => {
  const problems = checkReadme(`${valid}<img src="${RAW}/output/stats-light.svg" alt="a">`, "BackStacked");
  assert.ok(problems.some((p) => p.includes("stats-dark.svg")));
});

test("catches relative links, which break on the profile page", () => {
  const problems = checkReadme(`${valid}[config](profile.config.json) <a href="./x">x</a>`, "BackStacked");
  assert.equal(problems.filter((p) => p.startsWith("relative link")).length, 2);
});

test("the workflow publishes every image in both themes", () => {
  for (const name of ["banner", "stats", "languages", "stack", "logo", "snake"]) {
    assert.ok(outputFiles().includes(`${name}-light.svg`));
    assert.ok(outputFiles().includes(`${name}-dark.svg`));
  }
});
