import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAsyncStorage } from "@/lib/asyncStorage";
import { type ThemeName } from "@/src/theme/colors";
import { useThemeScheme, useThemeTokens } from "@/src/theme/provider";
import { type ThemeTokens } from "@/src/theme/tokens";

// ---------- types & constants ----------
type Range = "week" | "month";

const STORAGE_KEY = "recenter.progress.range";

const MOOD_COLOR = '#2fb3ff';
const DPDR_COLOR = '#7dd3c0';

const createColors = (tokens: ThemeTokens, scheme: ThemeName) => {
  const isDark = scheme === 'dark';

  return {
    bg: tokens.background,
    card: tokens.surface,
    cardBg: isDark ? tokens.surface : '#ffffff',
    text: tokens.text,
    sub: tokens.muted,
    primary: tokens.primary,
    onPrimary: tokens.onPrimary,
    mood: MOOD_COLOR,
    dpdr: DPDR_COLOR,
    track: isDark ? tokens.surfaceMuted : 'rgba(15, 23, 42, 0.08)',
  };
};

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ---------- demo data ----------
function useProgressData(range: Range) {
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const mondayBasedDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const weekCompleted = mondayBasedDay + 1;

  // Chart data - smooth curves
  const week = {
    labels: WEEK_LABELS,
    moodData: [
      { value: 5.5 },
      { value: 6.2 },
      { value: 7.8 },
      { value: 8.5 },
      { value: 7.2 },
      { value: 6.8 },
      { value: 6.5 },
    ],
    dpdrData: [
      { value: 7.0 },
      { value: 6.5 },
      { value: 5.8 },
      { value: 4.2 },
      { value: 5.5 },
      { value: 6.8 },
      { value: 6.2 },
    ],
    weekCompleted,
    currentDay: mondayBasedDay,
  };

  const month = {
    labels: ["W1", "W2", "W3", "W4"],
    moodData: [
      { value: 6.0 },
      { value: 6.5 },
      { value: 7.2 },
      { value: 6.8 },
    ],
    dpdrData: [
      { value: 6.5 },
      { value: 5.8 },
      { value: 5.0 },
      { value: 5.5 },
    ],
    weekCompleted,
    currentDay: mondayBasedDay,
  };

  const streak = 23;
  const breathingSessions = 8;
  const groundingSessions = 5;

  if (range === "week") {
    return { ...week, streak, breathingSessions, groundingSessions };
  }
  return { ...month, streak, breathingSessions, groundingSessions };
}

// ---------- screen ----------
export default function ProgressScreen() {
  const router = useRouter();
  const scheme = useThemeScheme();
  const tokens = useThemeTokens();
  const colors = useMemo(() => createColors(tokens, scheme), [tokens, scheme]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [range, setRange] = useState<Range>("week");

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.sectionTitle}>{children}</Text>
  );

  const Pill = ({
    active,
    children,
    onPress,
  }: {
    active?: boolean;
    children: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        active ? styles.pillActive : styles.pillInactive,
      ]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {children}
      </Text>
    </Pressable>
  );

  const ProgressBar = ({ pct, color }: { pct: number; color: string }) => (
    <View style={styles.barTrack}>
      <View
        style={[
          styles.barFill,
          { width: `${Math.max(0, Math.min(1, pct)) * 100}%`, backgroundColor: color },
        ]}
      />
    </View>
  );

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const storage = await getAsyncStorage();
      const saved = (await storage.getItem(STORAGE_KEY)) as Range | null;

      if (!isMounted) {
        return;
      }

      if (saved === 'week' || saved === 'month') {
        setRange(saved);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const data = useProgressData(range);

  const handleSelectRange = useCallback((nextRange: Range) => {
    setRange(nextRange);

    void (async () => {
      const storage = await getAsyncStorage();
      await storage.setItem(STORAGE_KEY, nextRange);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Your Progress</Text>
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakNumber}>{data.streak}</Text>
            <Text style={styles.streakSubtext}>days of mindful practice</Text>

            <View style={styles.weekRow}>
              <Text style={styles.weekLabel}>This week</Text>
              <Text style={styles.weekCount}>{data.weekCompleted}/7 days</Text>
            </View>

            <View style={styles.segmentRow}>
              {Array.from({ length: 7 }, (_, i) => {
                const filled = i < data.weekCompleted;
                return (
                  <View
                    key={i}
                    style={[
                      styles.segment,
                      { backgroundColor: filled ? colors.primary : colors.track },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.streakBadge}>
            <View style={styles.badgeCircle}>
              <Ionicons name="flame-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.badgeText}>Keep it up!</Text>
          </View>
        </View>

        {/* Recovery Patterns */}
        <View style={styles.sectionHeaderContainer}>
          <SectionTitle>Recovery Patterns</SectionTitle>
        </View>
        <View style={styles.pillsContainer}>
          <View style={styles.pillsWrap}>
            <Pill active={range === "week"} onPress={() => handleSelectRange("week")}>
              Week
            </Pill>
            <Pill active={range === "month"} onPress={() => handleSelectRange("month")}>
              Month
            </Pill>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.mood }]} />
              <Text style={styles.legendText}>Mood</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.dpdr }]} />
              <Text style={styles.legendText}>DPDR</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <LineChart
              areaChart
              curved
              data={data.moodData}
              data2={data.dpdrData}
              height={200}
              width={320}
              spacing={range === "week" ? 42 : 75}
              initialSpacing={10}
              color1={colors.mood}
              color2={colors.dpdr}
              hideDataPoints
              startFillColor1={colors.mood}
              startFillColor2={colors.dpdr}
              startOpacity={0.4}
              endOpacity={0.1}
              backgroundColor="transparent"
              hideRules
              hideYAxisText
              xAxisColor="transparent"
              yAxisColor="transparent"
              pointerConfig={{
                pointerStripHeight: 160,
                pointerStripColor: colors.sub,
                pointerStripWidth: 1,
                strokeDashArray: [2, 5],
                pointerColor: colors.primary,
                radius: 4,
                pointerLabelWidth: 100,
                pointerLabelHeight: 90,
                activatePointersOnLongPress: false,
                autoAdjustPointerLabelPosition: false,
                pointerLabelComponent: (items: any) => {
                  return (
                    <View style={styles.pointerLabel}>
                      <Text style={styles.pointerValue}>{items[0].value}</Text>
                    </View>
                  );
                },
              }}
            />
            <View style={styles.xAxisLabels}>
              {data.labels.map((label, index) => (
                <Text key={index} style={styles.xAxisLabel}>
                  {label}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Tool Usage */}
        <SectionTitle>Tool Usage</SectionTitle>
        
        <View style={styles.toolCard}>
          <View style={styles.toolIcon}>
            <Ionicons name="git-branch-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.toolContent}>
            <View style={styles.toolHeader}>
              <Text style={styles.toolTitle}>Breathing</Text>
              <Text style={styles.toolCount}>{data.breathingSessions} sessions</Text>
            </View>
            <ProgressBar pct={data.breathingSessions / 10} color={colors.primary} />
          </View>
        </View>

        <View style={styles.toolCard}>
          <View style={[styles.toolIcon, { backgroundColor: "#1a3d3f" }]}>
            <Ionicons name="scan-outline" size={24} color={colors.dpdr} />
          </View>
          <View style={styles.toolContent}>
            <View style={styles.toolHeader}>
              <Text style={styles.toolTitle}>Grounding</Text>
              <Text style={styles.toolCount}>{data.groundingSessions} sessions</Text>
            </View>
            <ProgressBar pct={data.groundingSessions / 10} color={colors.dpdr} />
          </View>
        </View>

        {/* Key Insights */}
        <SectionTitle>Key Insights</SectionTitle>
        <View style={styles.insightsRow}>
          <View style={styles.insightCard}>
            <View style={styles.insightBadge}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} opacity={0.3} />
            </View>
            <Text style={styles.insightTitle}>Best Tool</Text>
            <Text style={styles.insightText}>Breathing helps most after high DPDR.</Text>
          </View>
          <View style={styles.insightCard}>
            <View style={styles.insightBadge}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} opacity={0.3} />
            </View>
            <Text style={styles.insightTitle}>Positive Trend</Text>
            <Text style={styles.insightText}>Your mood is up 15% this week.</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/screens/InsightsScreen")}
          style={styles.exploreButton}
        >
          <Text style={styles.exploreText}>Explore All Insights</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- styles ----------
const createStyles = (colors: ReturnType<typeof createColors>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 12 },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // Streak Card
  streakCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    marginBottom: 32,
  },
  streakLeft: {
    flex: 1,
  },
  streakLabel: {
    color: colors.sub,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  streakNumber: {
    color: colors.primary,
    fontSize: 72,
    fontWeight: "700",
    lineHeight: 72,
    letterSpacing: -2,
  },
  streakSubtext: {
    color: colors.sub,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  weekLabel: {
    color: colors.sub,
    fontSize: 14,
    fontWeight: "500",
  },
  weekCount: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentRow: {
    flexDirection: "row",
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  streakBadge: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  badgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(20, 168, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.sub,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
  },

  // Recovery Patterns
  sectionHeaderContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  pillsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  pillsWrap: {
    flexDirection: "row",
    backgroundColor: "#1a2a2e",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillInactive: {
    backgroundColor: "transparent",
  },
  pillText: {
    color: colors.sub,
    fontSize: 14,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#0a1214",
  },

  // Chart
  chartCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
  },
  legendRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.sub,
    fontSize: 14,
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 8,
  },
  xAxisLabel: {
    color: colors.sub,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  pointerLabel: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pointerValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },

  // Tool Usage
  toolCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 16,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1a3442",
    alignItems: "center",
    justifyContent: "center",
  },
  toolContent: {
    flex: 1,
    gap: 12,
  },
  toolHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toolTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  toolCount: {
    color: colors.sub,
    fontSize: 14,
    fontWeight: "600",
  },
  barTrack: {
    height: 8,
    width: "100%",
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },

  // Key Insights
  insightsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  insightCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 20,
    minHeight: 120,
  },
  insightBadge: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  insightTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  insightText: {
    color: colors.sub,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },

  // Explore Button
  exploreButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  exploreText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
