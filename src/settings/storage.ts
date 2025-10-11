import { Appearance } from "react-native";

import { getAsyncStorage } from "@/lib/asyncStorage";

export type SettingsState = {
  journalReminders: boolean;
  progressUpdates: boolean;
  darkMode: boolean;
};

export const SETTINGS_KEY = "recenter.settings.v1";

export const createDefaultSettings = (): SettingsState => {
  const systemScheme = Appearance.getColorScheme();

  return {
    journalReminders: true,
    progressUpdates: false,
    darkMode: systemScheme === "dark",
  };
};

export const loadSettings = async (): Promise<SettingsState> => {
  const storage = await getAsyncStorage();
  const raw = await storage.getItem(SETTINGS_KEY);

  if (!raw) {
    return createDefaultSettings();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    const defaults = createDefaultSettings();

    return {
      journalReminders: parsed.journalReminders ?? defaults.journalReminders,
      progressUpdates: parsed.progressUpdates ?? defaults.progressUpdates,
      darkMode: parsed.darkMode ?? defaults.darkMode,
    };
  } catch (error) {
    console.warn("[settings] Failed to parse settings, falling back to defaults.", error);
    return createDefaultSettings();
  }
};

export const saveSettings = async (next: SettingsState) => {
  const storage = await getAsyncStorage();
  await storage.setItem(SETTINGS_KEY, JSON.stringify(next));
};
