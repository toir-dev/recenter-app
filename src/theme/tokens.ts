import { themePalettes, type ThemeName, type ThemePalette } from "./colors";

export type ThemeTokens = {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  subtle: string;
  destructive: string;
};

export const buildThemeTokens = (palette: ThemePalette, scheme: ThemeName): ThemeTokens => {
  const isDark = scheme === "dark";

  return {
    background: palette.surface,
    surface: palette.surfaceAlt,
    surfaceMuted: isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(15, 23, 42, 0.05)",
    surfaceRaised: isDark ? "rgba(15, 23, 42, 0.68)" : "#ffffff",
    border: palette.outline,
    borderStrong: isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(15, 23, 42, 0.15)",
    text: palette.text,
    muted: palette.muted,
    primary: palette.primary,
    onPrimary: isDark ? "#04111f" : "#F8FAFC",
    accent: palette.accent,
    onAccent: isDark ? "#04111f" : "#0F172A",
    subtle: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(15, 23, 42, 0.08)",
    destructive: isDark ? "#F87171" : "#B91C1C",
  };
};

export const getThemeTokens = (scheme: ThemeName) => buildThemeTokens(themePalettes[scheme], scheme);
