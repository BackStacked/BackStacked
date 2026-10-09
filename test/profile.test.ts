import assert from "node:assert/strict";
import { test } from "node:test";
import type { Repo } from "../scripts/lib/github.ts";
import { aggregateLanguages, languageShares, tokenFor } from "../scripts/lib/profile.ts";

const repo = (name: string, languages: [string, number][], isPrivate = false): Repo => ({
  owner: "BackStacked",
  name,
  url: `https://github.com/BackStacked/${name}`,
  description: null,
  isPrivate,
  isArchived: false,
  pushedAt: "2026-10-01T00:00:00Z",
  languages: languages.map(([lang, size]) => ({ name: lang, size })),
});

test("aggregateLanguages sums bytes and repos, skipping excluded and empty languages", () => {
  const totals = aggregateLanguages(
    [
      repo("a", [["TypeScript", 100], ["CSS", 50]]),
      repo("b", [["TypeScript", 300], ["Rust", 40]], true),
      repo("c", [["Rust", 0]]),
    ],
    ["css"],
  );
  assert.deepEqual(totals, [
    { name: "TypeScript", size: 400, repos: 2 },
    { name: "Rust", size: 40, repos: 1 },
  ]);
});

test("languageShares adds up to one and folds the tail into Other", () => {
  const totals = ["A", "B", "C", "D"].map((name, i) => ({ name, size: 1000 / (i + 1), repos: 1 }));
  const shares = languageShares(totals, { sizeWeight: 1, countWeight: 0, limit: 2 });
  assert.deepEqual(shares.map((s) => s.name), ["A", "B", "Other"]);
  assert.ok(Math.abs(shares.reduce((sum, s) => sum + s.share, 0) - 1) < 1e-9);
});

test("languageShares names a single leftover language instead of calling it Other", () => {
  const totals = ["A", "B", "C"].map((name) => ({ name, size: 10, repos: 1 }));
  assert.deepEqual(
    languageShares(totals, { sizeWeight: 1, countWeight: 0, limit: 2 }).map((s) => s.name),
    ["A", "B", "C"],
  );
});

test("countWeight lets a language used in many repos outrank one huge repo", () => {
  const totals = [
    { name: "Huge", size: 10_000, repos: 1 },
    { name: "Everywhere", size: 2_500, repos: 20 },
  ];
  assert.equal(languageShares(totals, { sizeWeight: 1, countWeight: 0, limit: 5 })[0]?.name, "Huge");
  assert.equal(languageShares(totals, { sizeWeight: 0.5, countWeight: 0.5, limit: 5 })[0]?.name, "Everywhere");
});

test("tokenFor prefers the owner's own token, then PROFILE_TOKEN, then GITHUB_TOKEN", () => {
  const env = { PROFILE_TOKEN_GRABZY_CC: "scoped", PROFILE_TOKEN: "shared", GITHUB_TOKEN: "actions" };
  assert.equal(tokenFor("Grabzy-CC", env), "scoped");
  assert.equal(tokenFor("SwapzyCC", env), "shared");
  assert.equal(tokenFor("SwapzyCC", { PROFILE_TOKEN: "", GITHUB_TOKEN: "actions" }), "actions");
  assert.equal(tokenFor("SwapzyCC", {}), undefined);
});
