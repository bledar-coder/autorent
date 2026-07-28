import type { Config } from "tailwindcss";
import { radii, typography } from "@autorent/tokens";

/**
 * Tailwind consumes @autorent/tokens directly: radii, spacing scale and the
 * font stack come from the token object, and the semantic colors resolve to CSS
 * variables that globals.css fills per theme (dark = hero, light = polished).
 */
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        border: "var(--color-border)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        accent: "var(--color-accent)",
        destructive: "var(--color-destructive)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
      },
      borderColor: {
        DEFAULT: "var(--color-border)",
      },
      borderRadius: {
        sm: radii.sm,
        md: radii.md,
        lg: radii.lg,
        xl: radii.xl,
      },
      fontFamily: {
        sans: [typography.fontSans],
        mono: [typography.fontMono],
      },
    },
  },
  plugins: [],
};

export default config;
