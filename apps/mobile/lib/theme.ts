import { themes } from "@autorent/tokens";

/** Shared brand colours — dark mode is the hero surface for the app. */
export const colors = themes.dark;

/** Numeric mirrors of the token radii/spacing (React Native needs numbers). */
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 } as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
} as const;

export const font = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
} as const;
