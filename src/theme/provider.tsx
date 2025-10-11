import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";

import { loadSettings } from "@/src/settings/storage";

import { themePalettes, type ThemeName, type ThemePalette } from "./colors";
import { buildThemeTokens, type ThemeTokens } from "./tokens";

type ThemeContextValue = {
  scheme: ThemeName;
  setScheme: (next: ThemeName) => void;
  palette: ThemePalette;
  tokens: ThemeTokens;
  hydrated: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = Appearance.getColorScheme();
  const initialScheme: ThemeName = systemScheme === "dark" ? "dark" : "light";
  const [scheme, setSchemeState] = useState<ThemeName>(initialScheme);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const settings = await loadSettings();
        if (!isMounted) {
          return;
        }
        setSchemeState(settings.darkMode ? "dark" : "light");
      } catch (error) {
        console.warn("[theme] Failed to load settings, falling back to system scheme.", error);
      } finally {
        if (isMounted) {
          setHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const setScheme = useCallback((next: ThemeName) => {
    setSchemeState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const palette = themePalettes[scheme];
    const tokens = buildThemeTokens(palette, scheme);

    return {
      scheme,
      setScheme,
      palette,
      tokens,
      hydrated,
    };
  }, [scheme, setScheme, hydrated]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme must be used within an AppThemeProvider");
  }
  return ctx;
}

export const useThemePalette = () => useAppTheme().palette;
export const useThemeScheme = () => useAppTheme().scheme;
export const useThemeHydration = () => useAppTheme().hydrated;
export const useThemeTokens = () => useAppTheme().tokens;
