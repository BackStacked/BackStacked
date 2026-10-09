import { readFile } from "node:fs/promises";

export type Tone = "live" | "soon" | "building";

export interface Venture {
  name: string;
  status: string;
  tone: Tone;
}

/** Something drawn with a Simple Icons logo. `icon` is the Simple Icons slug. */
export interface Item {
  name: string;
  icon: string;
}

export interface Config {
  user: string;
  owners: string[];
  style: {
    sans: string;
    mono: string;
    fonts: string;
    accent: { light: string; dark: string };
  };
  banner: {
    name: string;
    headline: string;
    location: string;
    ventures: Venture[];
    chains: Item[];
  };
  stack: { label: string; items: Item[] }[];
  languages: {
    exclude: string[];
    sizeWeight: number;
    countWeight: number;
    limit: number;
  };
  feed: {
    limit: number;
    exclude: string[];
  };
  npmMaintainer: string;
}

export async function loadConfig(path = "profile.config.json"): Promise<Config> {
  return parseConfig(JSON.parse(await readFile(path, "utf8")));
}

export function parseConfig(raw: unknown): Config {
  const root = object(raw, "config");
  const style = object(root.style, "style");
  const accent = object(style.accent, "style.accent");
  const banner = object(root.banner, "banner");
  const languages = object(root.languages, "languages");
  const feed = object(root.feed, "feed");
  const tones: readonly string[] = ["live", "soon", "building"];

  return {
    user: string(root.user, "user"),
    owners: strings(root.owners, "owners"),
    style: {
      sans: string(style.sans, "style.sans"),
      mono: string(style.mono, "style.mono"),
      fonts: style.fonts === undefined ? "assets/fonts" : string(style.fonts, "style.fonts"),
      accent: { light: color(accent.light, "style.accent.light"), dark: color(accent.dark, "style.accent.dark") },
    },
    banner: {
      name: string(banner.name, "banner.name"),
      headline: string(banner.headline, "banner.headline"),
      location: string(banner.location, "banner.location"),
      ventures: list(banner.ventures, "banner.ventures").map((item, i) => {
        const venture = object(item, `banner.ventures[${i}]`);
        const tone = string(venture.tone, `banner.ventures[${i}].tone`);
        if (!tones.includes(tone)) fail(`banner.ventures[${i}].tone`, `one of ${tones.join(", ")}`);
        return {
          name: string(venture.name, `banner.ventures[${i}].name`),
          status: string(venture.status, `banner.ventures[${i}].status`),
          tone: tone as Tone,
        };
      }),
      chains: items(banner.chains, "banner.chains"),
    },
    stack: list(root.stack, "stack").map((group, i) => {
      const g = object(group, `stack[${i}]`);
      return { label: string(g.label, `stack[${i}].label`), items: items(g.items, `stack[${i}].items`) };
    }),
    languages: {
      exclude: strings(languages.exclude, "languages.exclude"),
      sizeWeight: number(languages.sizeWeight, "languages.sizeWeight"),
      countWeight: number(languages.countWeight, "languages.countWeight"),
      limit: number(languages.limit, "languages.limit"),
    },
    feed: {
      limit: number(feed.limit, "feed.limit"),
      exclude: strings(feed.exclude, "feed.exclude"),
    },
    npmMaintainer: string(root.npmMaintainer, "npmMaintainer"),
  };
}

function fail(path: string, expected: string): never {
  throw new Error(`profile.config.json: ${path} must be ${expected}`);
}

function object(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "an object");
  return value as Record<string, unknown>;
}

function list(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, "an array");
  return value;
}

function string(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") fail(path, "a non-empty string");
  return value;
}

function strings(value: unknown, path: string): string[] {
  return list(value, path).map((item, i) => string(item, `${path}[${i}]`));
}

function items(value: unknown, path: string): Item[] {
  return list(value, path).map((entry, i) => {
    const item = object(entry, `${path}[${i}]`);
    return { name: string(item.name, `${path}[${i}].name`), icon: string(item.icon, `${path}[${i}].icon`) };
  });
}

function color(value: unknown, path: string): string {
  const hex = string(value, path);
  if (!/^#[0-9a-f]{6}$/i.test(hex)) fail(path, "a #rrggbb colour");
  return hex;
}

function number(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) fail(path, "a non-negative number");
  return value;
}
