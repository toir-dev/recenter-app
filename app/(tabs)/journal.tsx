// app/(tabs)/journal.tsx
import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";

import { type ThemeName } from "@/src/theme/colors";
import { useThemeScheme, useThemeTokens } from "@/src/theme/provider";
import { type ThemeTokens } from "@/src/theme/tokens";

type Trigger = {
  id: string;
  title: string;
  icon: React.ReactNode;
  intensity: number; // 0..10
};

const TRIGGERS: Trigger[] = [
  {
    id: "1",
    title: "Social Event",
    icon: <Octicons name="megaphone" size={22} />,
    intensity: 7,
  },
  {
    id: "2",
    title: "Work Stress",
    icon: <MaterialIcons name="work-outline" size={24} />,
    intensity: 5,
  },
  {
    id: "3",
    title: "Family Gathering",
    icon: <Ionicons name="people-outline" size={24} />,
    intensity: 3,
  },
];

export default function JournalScreen() {
  const scheme = useThemeScheme();
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens, scheme), [tokens, scheme]);

  const TriggerCard = ({ trigger }: { trigger: Trigger }) => {
    const pct = Math.min(1, Math.max(0, trigger.intensity / 10));

    return (
      <Pressable style={styles.card} onPress={() => {}}>
        <View style={styles.iconBubble}>
          {React.cloneElement(trigger.icon as any, { color: styles.triggerIcon.color })}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{trigger.title}</Text>
          <Text style={styles.cardSub}>Intensity: {trigger.intensity}/10</Text>

          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              // if this screen can be pushed, wire navigation.goBack()
            }}
          >
            <Ionicons name="chevron-back" size={24} color={styles.backIcon.color} />
          </Pressable>
          <Text style={styles.headerTitle}>Journal</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Pressable style={[styles.pill, styles.pillPrimary]} onPress={() => {}}>
          <Text style={[styles.pillText, styles.pillTextPrimary]}>
            Quick Entry
          </Text>
        </Pressable>

        <Pressable style={[styles.pill, styles.pillSecondary]} onPress={() => {}}>
          <Text style={[styles.pillText, styles.pillTextSecondary]}>
            CBT Template
          </Text>
        </Pressable>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Trigger Log</Text>

          <View style={styles.smallActions}>
            <Pressable style={styles.smallIconBtn} onPress={() => {}}>
              <Ionicons name="calendar-clear-outline" size={18} color={styles.smallIcon.color} />
            </Pressable>
            <Pressable style={styles.smallIconBtn} onPress={() => {}}>
              <Ionicons name="search" size={18} color={styles.smallIcon.color} />
            </Pressable>
          </View>
        </View>

        <View style={styles.triggerList}>
          {TRIGGERS.map((trigger) => (
            <TriggerCard key={trigger.id} trigger={trigger} />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (tokens: ThemeTokens, scheme: ThemeName) => {
  const subtleSurface = tokens.surfaceMuted;
  const iconTint = tokens.muted;
  const isDark = scheme === "dark";

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: tokens.background },
    scroll: { paddingHorizontal: 20, paddingBottom: 20 },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 6,
      paddingBottom: 10,
    },
    backBtn: {
      height: 40,
      width: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: subtleSurface,
    },
    backIcon: {
      color: iconTint,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      color: tokens.text,
      fontSize: 26,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
    headerSpacer: { width: 40 },
    pill: {
      borderRadius: 22,
      paddingVertical: 18,
      paddingHorizontal: 22,
      marginTop: 10,
    },
    pillPrimary: {
      backgroundColor: tokens.primary,
    },
    pillSecondary: {
      backgroundColor: subtleSurface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.border,
    },
    pillText: {
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
    },
    pillTextPrimary: {
      color: tokens.onPrimary,
    },
    pillTextSecondary: {
      color: tokens.primary,
    },
    sectionHeaderRow: {
      marginTop: 22,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    sectionTitle: {
      flex: 1,
      color: tokens.text,
      fontSize: 26,
      fontWeight: "800",
    },
    smallActions: {
      flexDirection: "row",
      backgroundColor: subtleSurface,
      padding: 6,
      borderRadius: 16,
      gap: 6,
    },
    smallIconBtn: {
      height: 30,
      width: 30,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? tokens.background : "#ffffff",
    },
    smallIcon: {
      color: iconTint,
    },
    triggerList: {
      gap: 14,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 14,
      borderRadius: 18,
      backgroundColor: tokens.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.border,
    },
    iconBubble: {
      height: 58,
      width: 58,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: subtleSurface,
    },
    triggerIcon: {
      color: tokens.primary,
    },
    cardBody: {
      flex: 1,
    },
    cardTitle: {
      color: tokens.text,
      fontSize: 22,
      fontWeight: "800",
    },
    cardSub: {
      color: tokens.muted,
      marginTop: 2,
      marginBottom: 8,
      fontSize: 16,
      fontWeight: "600",
    },
    barTrack: {
      height: 10,
      borderRadius: 10,
      backgroundColor: tokens.subtle,
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      borderRadius: 10,
      backgroundColor: tokens.primary,
    },
    bottomSpacer: {
      height: 40,
    },
  });
};
