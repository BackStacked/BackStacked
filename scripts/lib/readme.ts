import { replaceBlock } from "./feed.ts";
import { outputFiles } from "./outputs.ts";

const RAW = /https:\/\/raw\.githubusercontent\.com\/([^/\s"')]+)\/([^/\s"')]+)\/([^/\s"')]+)\/([^\s"')?#]+)/g;

/** Files on the output branch that the README points at. */
export function referencedOutputs(readme: string): string[] {
  return [...new Set([...readme.matchAll(RAW)].map((m) => m[4] ?? ""))];
}

/** Everything that would make the profile render badly. Returns one line per problem. */
export function checkReadme(readme: string, user: string): string[] {
  const problems: string[] = [];

  for (const [tag] of readme.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt="[^"]*\S[^"]*"/i.test(tag)) problems.push(`<img> without alt text: ${tag.slice(0, 90)}`);
  }
  for (const [image, alt] of readme.matchAll(/!\[([^\]]*)\]\(/g)) {
    if (!alt?.trim()) problems.push(`markdown image without alt text: ${image}`);
  }

  try {
    replaceBlock(readme, "");
  } catch (error) {
    problems.push((error as Error).message);
  }

  const known = new Set(outputFiles());
  for (const [url, owner, repo, branch, file] of readme.matchAll(RAW)) {
    if (`${owner}/${repo}` !== `${user}/${user}`) problems.push(`image from another repo: ${url}`);
    else if (branch !== "output") problems.push(`image on branch "${branch}" instead of "output": ${url}`);
    else if (!known.has(file ?? "")) problems.push(`no workflow step builds ${file}`);
  }
  const files = new Set(referencedOutputs(readme));
  for (const file of files) {
    const twin = file.endsWith("-light.svg") ? file.replace("-light.svg", "-dark.svg") : file.replace("-dark.svg", "-light.svg");
    if (twin !== file && !files.has(twin)) problems.push(`${file} has no ${twin} counterpart for the other theme`);
  }

  // The profile page resolves relative links against github.com/<user>, not the repo.
  const links = [
    ...[...readme.matchAll(/(?:href|src|srcset)="([^"]+)"/g)].map((m) => m[1]),
    ...[...readme.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]),
  ];
  for (const link of links) {
    if (link && !/^(https?:|mailto:|#)/.test(link)) problems.push(`relative link breaks on the profile page: ${link}`);
  }

  if (/\{\{|\bTODO\b|lorem ipsum/i.test(readme)) problems.push("placeholder text left in README.md");
  return problems;
}
