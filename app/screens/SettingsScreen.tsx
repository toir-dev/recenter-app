// app/settings.tsx (or screens/SettingsScreen.tsx)
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAsyncStorage } from "@/lib/asyncStorage";
import { isPhysicalDevice } from "@/lib/device";
import { createDefaultSettings, loadSettings, saveSettings, type SettingsState } from "@/src/settings/storage";
import { useAppTheme, useThemeTokens } from "@/src/theme/provider";
import { type ThemeTokens } from "@/src/theme/tokens";

import { supabase } from "../../src/lib/supabase";

// ---- types & constants ----
const DAILY_ID_KEY = "recenter.notif.dailyId";
const WEEKLY_ID_KEY = "recenter.notif.weeklyId";

// ---- helpers: notifications ----
async function ensureNotifPermissions(): Promise<boolean> {
  if (!isPhysicalDevice()) {
    Alert.alert("Notifications", "Must use a physical device for notifications.");
    return false;
  }
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync();
  return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

async function createChannelsIfNeeded() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

async function scheduleDailyJournalReminder(hour = 9, minute = 0) {
  const storage = await getAsyncStorage();
  await createChannelsIfNeeded();
  const trigger: Notifications.NotificationTriggerInput = {
    hour,
    minute,
    repeats: true,
    channelId: "default",
  };
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Journal reminder",
      body: "Daily prompt: take 2 minutes to reflect and write.",
      sound: true,
    },
    trigger,
  });
  await storage.setItem(DAILY_ID_KEY, id);
  return id;
}

async function cancelDailyReminder() {
  const storage = await getAsyncStorage();
  const existing = await storage.getItem(DAILY_ID_KEY);
  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(existing);
    await storage.removeItem(DAILY_ID_KEY);
  }
}

async function scheduleWeeklyProgressUpdate(weekday = 1 /* Monday */, hour = 18, minute = 0) {
  const storage = await getAsyncStorage();
  await createChannelsIfNeeded();
  const trigger: Notifications.NotificationTriggerInput =
    Platform.select({
      ios: { weekday, hour, minute, repeats: true },
      android: { weekday, hour, minute, repeats: true, channelId: "default" } as any,
      default: { hour, minute, repeats: true },
    })!;
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Weekly progress",
      body: "Your summary is ready — check your trends and wins.",
      sound: true,
    },
    trigger,
  });
  await storage.setItem(WEEKLY_ID_KEY, id);
  return id;
}

async function cancelWeeklyUpdate() {
  const storage = await getAsyncStorage();
  const existing = await storage.getItem(WEEKLY_ID_KEY);
  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(existing);
    await storage.removeItem(WEEKLY_ID_KEY);
  }
}

// ---- storage ----
// Storage helpers are provided via src/settings/storage.ts

// ---- UI components ----
// ---- screen ----
export default function SettingsScreen() {
  const router = useRouter();
  const { setScheme, scheme } = useAppTheme();
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const [state, setState] = useState<SettingsState>(() => createDefaultSettings());
  const [initialSettings, setInitialSettings] = useState<SettingsState | null>(null);

  const updateSetting = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));

    if (key === 'darkMode') {
      setScheme(value ? 'dark' : 'light');
    }
  }, [setScheme]);

  const isSaveDisabled = useMemo(() => {
    if (!initialSettings) {
      return true;
    }

    return (
      initialSettings.journalReminders === state.journalReminders &&
      initialSettings.progressUpdates === state.progressUpdates &&
      initialSettings.darkMode === state.darkMode
    );
  }, [initialSettings, state.darkMode, state.journalReminders, state.progressUpdates]);

  useEffect(() => {
    (async () => {
      const storage = await getAsyncStorage();
      const loadedSettings = await loadSettings();
      const hydratedSettings = { ...loadedSettings };

      setState(hydratedSettings);
      setInitialSettings(hydratedSettings);

      if (hydratedSettings.journalReminders) {
        const ok = await ensureNotifPermissions();
        if (ok) {
          const id = await storage.getItem(DAILY_ID_KEY);
          if (!id) {
            await scheduleDailyJournalReminder();
          }
        }
      } else {
        await cancelDailyReminder();
      }

      if (hydratedSettings.progressUpdates) {
        const ok = await ensureNotifPermissions();
        if (ok) {
          const id = await storage.getItem(WEEKLY_ID_KEY);
          if (!id) {
            await scheduleWeeklyProgressUpdate(1, 18, 0);
          }
        }
      } else {
        await cancelWeeklyUpdate();
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (initialSettings && initialSettings.darkMode !== state.darkMode) {
        setScheme(initialSettings.darkMode ? 'dark' : 'light');
      }
    };
  }, [initialSettings, setScheme, state.darkMode]);
  const switchColors = useMemo(
    () => ({
      trackOn: scheme === 'dark' ? 'rgba(106, 141, 255, 0.55)' : 'rgba(106, 141, 255, 0.5)',
      trackOff: tokens.subtle,
      thumbOn: scheme === 'dark' ? '#E5EDFF' : '#1F2937',
      thumbOff: scheme === 'dark' ? tokens.background : '#ffffff',
    }),
    [scheme, tokens]
  );

  const SectionHeader = ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
  }) => <Text style={[styles.sectionHeader, style]}>{children}</Text>;

  const ChevronRow = ({
    title,
    subtitle,
    onPress,
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
  }) => (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.cardSub}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={styles.trailingIcon.color} />
    </Pressable>
  );

  const ToggleRow = ({
    title,
    subtitle,
    value,
    onValueChange,
  }: {
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (next: boolean) => void;
  }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.cardSub}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: switchColors.trackOn, false: switchColors.trackOff }}
        thumbColor={value ? switchColors.thumbOn : switchColors.thumbOff}
        ios_backgroundColor={switchColors.trackOff}
      />
    </View>
  );
  const applyAndSave = async () => {
    const next = { ...state };

    try {
      if (next.journalReminders) {
        const ok = await ensureNotifPermissions();
        if (ok) {
          await scheduleDailyJournalReminder();
        }
      } else {
        await cancelDailyReminder();
      }

      if (next.progressUpdates) {
        const ok = await ensureNotifPermissions();
        if (ok) {
          await scheduleWeeklyProgressUpdate(1, 18, 0);
        }
      } else {
        await cancelWeeklyUpdate();
      }

      await saveSettings(next);
      setScheme(next.darkMode ? 'dark' : 'light');
      setInitialSettings(next);
      setState(next);

      Alert.alert("Saved", "Your settings have been updated.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not save settings.");
    }
  };

  const logOut = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase?.auth.signOut();
          } catch {}
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={styles.backIcon.color} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <SectionHeader>Account</SectionHeader>
        <View style={styles.sectionGroup}>
          <ChevronRow
            title="Profile"
            subtitle="Manage your personal information"
            onPress={() => router.push("/settings/profile" as any)}
          />
          <ChevronRow
            title="Change Password"
            subtitle="Update your password"
            onPress={() => router.push("/settings/change-password" as any)}
          />
        </View>

        <SectionHeader style={styles.sectionSpacer}>Notifications</SectionHeader>
        <View style={styles.sectionGroup}>
          <ToggleRow
            title="Journal Reminders"
            subtitle="Daily prompts to write"
            value={state.journalReminders}
            onValueChange={(v) => updateSetting('journalReminders', v)}
          />
          <ToggleRow
            title="Progress Updates"
            subtitle="Weekly summaries"
            value={state.progressUpdates}
            onValueChange={(v) => updateSetting('progressUpdates', v)}
          />
        </View>

        <SectionHeader style={styles.sectionSpacer}>Theme</SectionHeader>
        <ToggleRow
          title="Dark Mode"
          subtitle="Reduce eye strain at night"
          value={state.darkMode}
          onValueChange={(v) => updateSetting('darkMode', v)}
        />

        <SectionHeader style={styles.sectionSpacer}>Privacy</SectionHeader>
        <View style={styles.sectionGroup}>
          <ChevronRow
            title="Privacy Policy"
            onPress={() => Linking.openURL("https://yourdomain.com/privacy")}
          />
          <ChevronRow
            title="Terms of Service"
            onPress={() => Linking.openURL("https://yourdomain.com/terms")}
          />
          <ChevronRow
            title="Data Management"
            subtitle="Export or delete your data"
            onPress={() => router.push("/settings/data" as any)}
          />
        </View>

        <View style={styles.footerSpacer} />
        <Pressable onPress={applyAndSave} disabled={isSaveDisabled} style={[styles.primaryBtn, isSaveDisabled && { opacity: 0.6 }]}>
          <Text style={styles.primaryBtnText}>Save Changes</Text>
        </Pressable>

        <Pressable onPress={logOut} style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </Pressable>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- styles ----
const createStyles = (tokens: ThemeTokens) => {
  const iconTint = tokens.muted;
  const iconBackground = tokens.surfaceMuted;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: tokens.background },
    scroll: { paddingHorizontal: 20, paddingBottom: 28, backgroundColor: tokens.background },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 6,
      paddingBottom: 10,
    },
    backBtn: {
      height: 40,
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: iconBackground,
    },
    backIcon: {
      color: iconTint,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: tokens.text,
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: 0.4,
    },
    sectionHeader: {
      color: tokens.text,
      fontSize: 24,
      fontWeight: '800',
      marginTop: 10,
      marginBottom: 12,
    },
    card: {
      backgroundColor: tokens.surface,
      borderColor: tokens.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      color: tokens.text,
      fontSize: 18,
      fontWeight: '700',
    },
    cardSub: {
      color: tokens.muted,
      fontSize: 14,
      marginTop: 6,
    },
    sectionGroup: {
      gap: 12,
    },
    sectionSpacer: {
      marginTop: 28,
    },
    primaryBtn: {
      backgroundColor: tokens.primary,
      borderRadius: 18,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      color: tokens.onPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    logoutBtn: {
      marginTop: 14,
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: tokens.destructive,
      backgroundColor: 'transparent',
    },
    logoutBtnText: {
      color: tokens.destructive,
      fontSize: 18,
      fontWeight: '800',
    },
    trailingIcon: {
      color: iconTint,
    },
    footerSpacer: {
      height: 24,
    },
  });
};








