import { execFile } from "node:child_process";
import { promisify } from "node:util";

export type GraphQL = <T>(query: string, variables?: Record<string, string | number | null>) => Promise<T>;

export interface Language {
  name: string;
  size: number;
}

export interface Repo {
  owner: string;
  name: string;
  url: string;
  description: string | null;
  isPrivate: boolean;
  isArchived: boolean;
  pushedAt: string;
  languages: Language[];
}

export interface Contributions {
  lastYear: number;
  allTime: number;
  activeDays: number;
  weeks: number[];
}

/**
 * Talks to the GraphQL API with a token when one is given. Without a token it
 * goes through the gh CLI, so a local run picks up whoever is logged in there.
 */
export function graphql(token: string | undefined): GraphQL {
  return token ? viaFetch(token) : viaGh();
}

function viaFetch(token: string): GraphQL {
  return async <T>(query: string, variables = {}) => {
    for (let attempt = 1; ; attempt++) {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          authorization: `bearer ${token}`,
          "content-type": "application/json",
          "user-agent": "backstacked-profile",
        },
        body: JSON.stringify({ query, variables }),
      });
      if (res.status >= 500 && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        continue;
      }
      const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
      if (!res.ok || body.errors?.length || !body.data) {
        const reason = body.errors?.map((e) => e.message).join("; ") ?? res.statusText;
        throw new Error(`GitHub GraphQL ${res.status}: ${reason}`);
      }
      return body.data;
    }
  };
}

function viaGh(): GraphQL {
  const run = promisify(execFile);
  return async <T>(query: string, variables = {}) => {
    const args = ["api", "graphql", "-f", `query=${query}`];
    for (const [key, value] of Object.entries(variables)) {
      args.push(typeof value === "string" ? "-f" : "-F", `${key}=${value}`);
    }
    const { stdout } = await run("gh", args, { maxBuffer: 64 * 1024 * 1024 });
    return (JSON.parse(stdout) as { data: T }).data;
  };
}

const REPOS = `
query ($login: String!, $after: String, $privacy: RepositoryPrivacy) {
  repositoryOwner(login: $login) {
    repositories(first: 100, after: $after, privacy: $privacy, isFork: false, ownerAffiliations: OWNER,
                 orderBy: {field: PUSHED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name url description isPrivate isArchived pushedAt
        languages(first: 20, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name } }
        }
      }
    }
  }
}`;

interface ReposPage {
  repositoryOwner: {
    repositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: {
        name: string;
        url: string;
        description: string | null;
        isPrivate: boolean;
        isArchived: boolean;
        pushedAt: string;
        languages: { edges: { size: number; node: { name: string } }[] };
      }[];
    };
  } | null;
}

/** Non-fork repos owned by `owner`. With "public", private repos never leave the API. */
export async function listRepos(gql: GraphQL, owner: string, visibility: "all" | "public"): Promise<Repo[]> {
  const repos: Repo[] = [];
  let after: string | null = null;
  do {
    const data: ReposPage = await gql<ReposPage>(REPOS, {
      login: owner,
      after,
      privacy: visibility === "public" ? "PUBLIC" : null,
    });
    const page = data.repositoryOwner?.repositories;
    if (!page) throw new Error(`No GitHub user or organisation named ${owner}`);
    for (const node of page.nodes) {
      repos.push({
        owner,
        name: node.name,
        url: node.url,
        description: node.description,
        isPrivate: node.isPrivate,
        isArchived: node.isArchived,
        pushedAt: node.pushedAt,
        languages: node.languages.edges.map((e) => ({ name: e.node.name, size: e.size })),
      });
    }
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return repos;
}

interface Calendar {
  user: {
    createdAt: string;
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: { contributionDays: { contributionCount: number }[] }[];
      };
    };
  } | null;
}

/**
 * The calendar includes private work as anonymous counts when the user shows
 * private contributions on their profile, so no special token is needed here.
 */
export async function contributions(gql: GraphQL, login: string, now = new Date()): Promise<Contributions> {
  const data = await gql<Calendar>(
    `query ($login: String!) {
      user(login: $login) {
        createdAt
        contributionsCollection {
          contributionCalendar { totalContributions weeks { contributionDays { contributionCount } } }
        }
      }
    }`,
    { login },
  );
  if (!data.user) throw new Error(`No GitHub user named ${login}`);
  const calendar = data.user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount));

  // A collection can span at most a year, so all-time is one aliased field per year.
  const thisYear = now.getUTCFullYear();
  const years: number[] = [];
  for (let y = new Date(data.user.createdAt).getUTCFullYear(); y <= thisYear; y++) years.push(y);
  const fields = years.map((y) => {
    const to = y === thisYear ? now.toISOString() : `${y}-12-31T23:59:59Z`;
    return `y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${to}") { contributionCalendar { totalContributions } }`;
  });
  const totals = await gql<{ user: Record<string, { contributionCalendar: { totalContributions: number } }> }>(
    `query ($login: String!) { user(login: $login) { ${fields.join("\n")} } }`,
    { login },
  );

  return {
    lastYear: calendar.totalContributions,
    allTime: Object.values(totals.user).reduce((sum, c) => sum + c.contributionCalendar.totalContributions, 0),
    activeDays: days.filter((count) => count > 0).length,
    weeks: calendar.weeks.map((w) => w.contributionDays.reduce((sum, d) => sum + d.contributionCount, 0)),
  };
}

/** Packages on npm maintained by `maintainer`, or null if the registry is unreachable. */
export async function npmPackageCount(maintainer: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=maintainer:${encodeURIComponent(maintainer)}&size=250`,
    );
    if (!res.ok) return null;
    return ((await res.json()) as { total: number }).total;
  } catch {
    return null;
  }
}
