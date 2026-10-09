import assert from "node:assert/strict";
import { test } from "node:test";
import { END, START, pickRecent, renderFeed, replaceBlock } from "../scripts/lib/feed.ts";
import type { Repo } from "../scripts/lib/github.ts";

const repo = (name: string, pushedAt: string, extra: Partial<Repo> = {}): Repo => ({
  owner: "BackStacked",
  name,
  url: `https://github.com/BackStacked/${name}`,
  description: null,
  isPrivate: false,
  isArchived: false,
  pushedAt,
  languages: [],
  ...extra,
});

test("pickRecent never lets a private repo through", () => {
  const picked = pickRecent(
    [
      repo("secret", "2026-10-09T00:00:00Z", { isPrivate: true }),
      repo("old", "2026-01-01T00:00:00Z", { isArchived: true }),
      repo("profile", "2026-10-08T00:00:00Z", { owner: "BackStacked", name: "BackStacked" }),
      repo("b", "2026-10-02T00:00:00Z"),
      repo("a", "2026-10-03T00:00:00Z"),
      repo("c", "2026-10-01T00:00:00Z"),
    ],
    { limit: 2, exclude: ["backstacked/backstacked"] },
  );
  assert.deepEqual(picked.map((r) => r.name), ["a", "b"]);
});

test("renderFeed escapes descriptions and clips long ones", () => {
  const line = renderFeed([
    repo("x", "2026-10-05T12:00:00Z", { description: `<img src=x> *bold* [link] ${"word ".repeat(40)}` }),
  ]);
  assert.match(line, /^- `2026-10-05` \[\*\*x\*\*\]\(https:\/\/github\.com\/BackStacked\/x\)/);
  assert.ok(line.includes("&lt;img src=x&gt; \\*bold\\* \\[link\\]"));
  assert.ok(line.endsWith("…"));
  assert.ok(!line.includes("<img"));
});

test("replaceBlock swaps only what sits between the markers", () => {
  const doc = `top\n${START}\nold\n${END}\nbottom\n`;
  const next = replaceBlock(doc, "- new");
  assert.equal(next, `top\n${START}\n- new\n${END}\nbottom\n`);
  assert.equal(replaceBlock(next, "- new"), next);
});

test("replaceBlock keeps CRLF files CRLF", () => {
  const doc = `top\r\n${START}\r\n${END}\r\n`;
  assert.equal(replaceBlock(doc, "- a\n- b"), `top\r\n${START}\r\n- a\r\n- b\r\n${END}\r\n`);
});

test("replaceBlock refuses missing or doubled markers", () => {
  assert.throws(() => replaceBlock("no markers", "x"));
  assert.throws(() => replaceBlock(`${START}${END}${START}${END}`, "x"));
  assert.throws(() => replaceBlock(`${END}${START}`, "x"));
});
