import { THEME_NAMES } from "./theme.ts";

/** Rendered (or, for the logo, themed) by scripts/build-images.ts. */
export const IMAGES = ["banner", "stats", "languages", "stack", "logo"] as const;

/** Rendered by Platane/snk in the profile workflow. */
export const SNAKE = "snake";

/** Every file the profile workflow publishes to the output branch. */
export function outputFiles(): string[] {
  return [...IMAGES, SNAKE].flatMap((name) => THEME_NAMES.map((theme) => `${name}-${theme}.svg`));
}
