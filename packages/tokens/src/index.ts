/**
 * AutoRent design tokens — the single source of truth for both web (Tailwind)
 * and mobile (NativeWind). Change a value here and it changes everywhere.
 *
 * Aesthetic: near-black automotive surfaces, one electric-blue accent used
 * sparingly, warm neutrals for content. Dark mode is the hero; light mode is
 * equally polished. All pairings target WCAG AA.
 */

/** 8px spacing grid. */
export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "24px",
  6: "32px",
  7: "48px",
  8: "64px",
  9: "96px",
} as const;

/** Consistent radii (12 / 16 are the workhorses). */
export const radii = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "9999px",
} as const;

export const typography = {
  fontSans: '"Geist", "Inter", system-ui, -apple-system, sans-serif',
  fontMono: '"Geist Mono", ui-monospace, monospace',
  size: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
    "4xl": "36px",
    "5xl": "48px",
    "6xl": "60px",
  },
  weight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

/** Semantic colour roles. Every surface/content pairing is AA-contrast. */
export interface SemanticColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  foreground: string;
  muted: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  destructive: string;
  success: string;
  warning: string;
}

export const themes: { dark: SemanticColors; light: SemanticColors } = {
  dark: {
    background: "#0A0B0D",
    surface: "#121316",
    surfaceElevated: "#1A1C20",
    border: "#26282E",
    foreground: "#F5F6F7",
    muted: "#8A8F98",
    primary: "#4C82FF",
    primaryForeground: "#0A0B0D",
    accent: "#4C82FF",
    destructive: "#F0616D",
    success: "#3DD68C",
    warning: "#F5B34C",
  },
  light: {
    background: "#FFFFFF",
    surface: "#F7F8FA",
    surfaceElevated: "#FFFFFF",
    border: "#E4E7EC",
    foreground: "#0A0B0D",
    muted: "#667085",
    primary: "#2563EB",
    primaryForeground: "#FFFFFF",
    accent: "#2563EB",
    destructive: "#DC2626",
    success: "#16A34A",
    warning: "#D97706",
  },
};

export const tokens = { spacing, radii, typography, themes } as const;

export type Tokens = typeof tokens;
