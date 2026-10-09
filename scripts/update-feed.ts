import { readFile, writeFile } from "node:fs/promises";
import { loadConfig } from "./lib/config.ts";
import { pickRecent, renderFeed, replaceBlock } from "./lib/feed.ts";
import { graphql, listRepos } from "./lib/github.ts";

const path = process.argv[2] ?? "README.md";
const config = await loadConfig();

// Deliberately GITHUB_TOKEN and never PROFILE_TOKEN: this list is published, so
// it is built with a token that cannot see private repos in the first place.
const gql = graphql(process.env.GITHUB_TOKEN);
const repos = (await Promise.all(config.owners.map((owner) => listRepos(gql, owner, "public")))).flat();

const readme = await readFile(path, "utf8");
const next = replaceBlock(readme, renderFeed(pickRecent(repos, config.feed)));
if (next === readme) {
  console.log(`${path}: feed unchanged`);
} else {
  await writeFile(path, next);
  console.log(`${path}: feed updated`);
}
