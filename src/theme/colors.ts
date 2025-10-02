export type ThemeName = 'light' | 'dark';

type ThemePalette = {
  primary: string;
  mint: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  outline: string;
};

const PRIMARY = '#6A8DFF';
const MINT = '#8AD1C2';
const ACCENT = '#E3C77B';
const LIGHT_SURFACE = '#F8FAFC';
const DARK_SURFACE = '#0F172A';

export const themePalettes: Record<ThemeName, ThemePalette> = {
  light: {
    primary: PRIMARY,
    mint: MINT,
    accent: ACCENT,
    surface: LIGHT_SURFACE,
    surfaceAlt: '#ffffff',
    text: '#0F172A',
    muted: '#475569',
    outline: '#CBD5F5',
  },
  dark: {
    primary: PRIMARY,
    mint: MINT,
    accent: ACCENT,
    surface: DARK_SURFACE,
    surfaceAlt: '#1E293B',
    text: '#F8FAFC',
    muted: '#94A3B8',
    outline: '#334155',
  },
};

export type ThemeCandidate = ThemeName | null | undefined;

export const resolveThemeName = (theme?: ThemeCandidate): ThemeName => {
  if (theme === 'dark') {
    return 'dark';
  }

  return 'light';
};
