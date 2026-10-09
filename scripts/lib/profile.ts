import type { Config } from "./config.ts";
import { contributions, graphql, listRepos, npmPackageCount, type Contributions, type Repo } from "./github.ts";

export interface LanguageTotal {
  name: string;
  size: number;
  repos: number;
}

export interface LanguageShare {
  name: string;
  share: number;
}

export interface ProfileData {
  generatedAt: string;
  contributions: Contributions;
  repos: { total: number; private: number };
  languages: LanguageTotal[];
  npmPackages: number | null;
}

/**
 * Picks the token for an owner: PROFILE_TOKEN_<OWNER> (a fine-grained token
 * scoped to that one account), then PROFILE_TOKEN, then GITHUB_TOKEN, which
 * only sees public repos. Unset everywhere means "use the gh CLI".
 */
export function tokenFor(owner: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const scoped = `PROFILE_TOKEN_${owner.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  return env[scoped] || env.PROFILE_TOKEN || env.GITHUB_TOKEN || undefined;
}

export async function fetchProfile(config: Config, now = new Date()): Promise<ProfileData> {
  const [calendar, repos, npmPackages] = await Promise.all([
    contributions(graphql(tokenFor(config.user)), config.user, now),
    Promise.all(config.owners.map((owner) => listRepos(graphql(tokenFor(owner)), owner, "all"))),
    npmPackageCount(config.npmMaintainer),
  ]);
  const all = repos.flat();
  return {
    generatedAt: now.toISOString(),
    contributions: calendar,
    repos: { total: all.length, private: all.filter((r) => r.isPrivate).length },
    languages: aggregateLanguages(all, config.languages.exclude),
    npmPackages,
  };
}

/** Bytes and repo counts per language. Only totals leave this function, never repo names. */
export function aggregateLanguages(repos: Repo[], exclude: string[]): LanguageTotal[] {
  const skip = new Set(exclude.map((name) => name.toLowerCase()));
  const totals = new Map<string, LanguageTotal>();
  for (const repo of repos) {
    for (const lang of repo.languages) {
      if (skip.has(lang.name.toLowerCase()) || lang.size <= 0) continue;
      const total = totals.get(lang.name) ?? { name: lang.name, size: 0, repos: 0 };
      total.size += lang.size;
      total.repos += 1;
      totals.set(lang.name, total);
    }
  }
  return [...totals.values()].sort((a, b) => b.size - a.size);
}

/**
 * Scores each language as size^sizeWeight * repos^countWeight, the same idea
 * as github-readme-stats, so one huge repo can't hide everything else.
 * Languages past `limit` are folded into "Other", unless only one is left.
 */
export function languageShares(
  totals: LanguageTotal[],
  { sizeWeight, countWeight, limit }: { sizeWeight: number; countWeight: number; limit: number },
): LanguageShare[] {
  const scored = totals
    .map((t) => ({ name: t.name, score: t.size ** sizeWeight * t.repos ** countWeight }))
    .sort((a, b) => b.score - a.score);
  const sum = scored.reduce((s, t) => s + t.score, 0);
  if (sum === 0) return [];
  const shown = scored.length === limit + 1 ? scored.length : limit;
  const shares = scored.slice(0, shown).map((t) => ({ name: t.name, share: t.score / sum }));
  const rest = scored.slice(shown).reduce((s, t) => s + t.score, 0);
  if (rest > 0) shares.push({ name: "Other", share: rest / sum });
  return shares;
}
