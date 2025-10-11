// app/insights.tsx  (or screens/InsightsScreen.tsx)

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAsyncStorage } from "@/lib/asyncStorage";

/** ---- PALETTE (kept consistent with your other screens) ---- */
const C = {
  bg: "#0f1a1f",
  card: "#0d1a20",
  border: "rgba(61,104,128,0.35)",
  text: "#e6eef3",
  sub: "#89a5b4",
  primary: "#14a8ff",
  mood: "#2fb3ff", // blue
  dpdr: "#a6f3e1", // mint
  track: "#243943",
};

const REFLECTION_KEY = "recenter.weeklyReflection.v1";

export default function InsightsScreen() {
  const router = useRouter();
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const storage = await getAsyncStorage();
      const saved = await storage.getItem(REFLECTION_KEY);
      if (saved && isMounted) {
        setReflection(saved);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistReflection = async (v: string) => {
    setReflection(v);
    const storage = await getAsyncStorage();
    await storage.setItem(REFLECTION_KEY, v);
  };

  // --- chart data (demo; wire to real data anytime) ---
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const sleepLine = [6.5, 7.8, 6.9, 7.2, 6.7, 6.3, 5.8].map((v) => ({ value: v }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#cfd8de" />
          </Pressable>
          <Text style={styles.headerTitle}>Your Weekly Insights</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Micro Goals & Suggestions */}
        <Section title="Micro Goals & Suggestions" icon={<Ionicons name="bulb-outline" size={18} color={C.primary} />} subtitle="Personalized tips to help you feel grounded.">
          <SuggestionCard
            iconBg="#0b2430"
            icon={<MaterialCommunityIcons name="meditation" size={20} color={C.dpdr} />}
            title="Try a 5-minute meditation"
            desc="Since you find breathing exercises helpful, this could be a great next step. Consistency is key."
          />
          <SuggestionCard
            iconBg="#0b2833"
            icon={<Ionicons name="moon-outline" size={20} color={C.dpdr} />}
            title="Aim for 7+ hours of sleep"
            desc="Your data shows a strong link between more sleep and lower symptoms. Prioritizing rest could make a big difference."
          />
          <SuggestionCard
            iconBg="#0b2c22"
            icon={<MaterialCommunityIcons name="pen" size={18} color={C.dpdr} />}
            title="Journal about feeling 'disconnected'"
            desc="You've mentioned this feeling often. Explore what situations trigger it to find new patterns."
          />
        </Section>

        {/* Mood & Triggers */}
        <Section
          title="Mood & Triggers"
          icon={<Ionicons name="aperture-outline" size={18} color={C.primary} />}
          subtitle="Notice what's linked to your feelings."
        >
          <TriggerBar label="Work Stress" value={0.8} />
          <TriggerBar label="Social Anxiety" value={0.55} />
          <TriggerBar label="Lack of Sleep" value={0.9} />
        </Section>

        {/* Tool Effectiveness */}
        <Section
          title="Tool Effectiveness"
          icon={<Ionicons name="sparkles-outline" size={18} color={C.primary} />}
          subtitle="See how your grounding tools help."
        >
          <BeforeAfterRow label="5-4-3-2-1 Technique" before={0.35} after={0.70} deltaText="+35%" />
          <BeforeAfterRow label="Box Breathing" before={0.40} after={0.60} deltaText="+20%" />
          <View style={styles.legendRow}>
            <LegendDot color="#517184" text="Before" />
            <LegendDot color={C.dpdr} text="After" />
          </View>
        </Section>

        {/* Sleep & Time of Day */}
        <Section
          title="Sleep & Time of Day"
          icon={<Ionicons name="moon-outline" size={18} color={C.primary} />}
          subtitle="More sleep consistently lowers symptoms."
        >
          <View style={styles.chartWrap}>
            <LineChart
              data={sleepLine}
              curved
              thickness={3}
              color={C.mood}
              startFillColor={C.mood}
              endFillColor={C.mood}
              startOpacity={0.18}
              endOpacity={0.02}
              hideDataPoints
              hideYAxisText
              noOfSections={4}
              yAxisColor={"transparent"}
              rulesType="dashed"
              rulesColor="#2a3f4a"
              xAxisLabelTexts={days}
              xAxisLabelTextStyle={{ color: C.sub, fontSize: 12 }}
              initialSpacing={20}
              endSpacing={20}
              backgroundColor={C.card}
            />
          </View>
        </Section>

        {/* Emotion Patterns */}
        <Section
          title="Emotion Patterns"
          icon={<Ionicons name="happy-outline" size={18} color={C.primary} />}
          subtitle="Common words from your journal entries."
        >
          <View style={styles.tagsWrap}>
            {[
              { t: "anxious", s: 14 },
              { t: "unreal", s: 14 },
              { t: "disconnected", s: 24, big: true },
              { t: "foggy", s: 13 },
              { t: "tired", s: 14 },
              { t: "stressed", s: 18 },
            ].map((k, i) => (
              <View key={i} style={[styles.tag, k.big && styles.tagBig]}>
                <Text style={[styles.tagText, { fontSize: k.s }]}>{k.t}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Weekly Reflection */}
        <Section
          title="Weekly Reflection"
          icon={<Ionicons name="create-outline" size={18} color={C.primary} />}
          subtitle="A moment to check in with yourself."
        >
          <View style={styles.reflectionBox}>
            <TextInput
              multiline
              value={reflection}
              onChangeText={persistReflection}
              placeholder="What was one small moment this week where you felt most like yourself? What were you doing?"
              placeholderTextColor="#9fb6c4"
              style={styles.input}
            />
          </View>
        </Section>

        <View style={{ height: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** ---------- UI Pieces ---------- */

function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIcon}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={{ gap: 12 }}>{children}</View>
    </View>
  );
}

function SuggestionCard({
  icon,
  iconBg,
  title,
  desc,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.suggestionCard}>
      <View style={[styles.suggIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.suggTitle}>{title}</Text>
        <Text style={styles.suggDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function TriggerBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.triggerRow}>
      <Text style={styles.triggerLabel}>{label}</Text>
      <View style={styles.triggerTrack}>
        <View style={[styles.triggerFill, { width: `${value * 100}%` }]} />
      </View>
    </View>
  );
}

function BeforeAfterRow({
  label,
  before,
  after,
  deltaText,
}: {
  label: string;
  before: number; // 0..1
  after: number; // 0..1
  deltaText: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.beforeAfterHeader}>
        <Text style={styles.beforeAfterLabel}>{label}</Text>
        <Text style={styles.deltaText}>{deltaText}</Text>
      </View>
      <View style={styles.baTrack}>
        <View style={[styles.baBar, { width: `${before * 100}%`, backgroundColor: "#517184" }]} />
        <View style={[styles.baBar, { width: `${after * 100}%`, backgroundColor: C.dpdr }]} />
      </View>
    </View>
  );
}

function LegendDot({ color, text }: { color: string; text: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{text}</Text>
    </View>
  );
}

/** ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  backBtn: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: C.text,
    fontSize: 22,
    fontWeight: "800",
  },

  sectionCard: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  sectionIcon: {
    height: 30,
    width: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b2430",
  },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: "900" },
  sectionSub: { color: C.sub, marginTop: 3, fontWeight: "600" },

  // Suggestion pills
  suggestionCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#0b2027",
    borderRadius: 16,
    padding: 12,
  },
  suggIconWrap: {
    height: 36,
    width: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  suggTitle: { color: C.text, fontWeight: "800", fontSize: 15 },
  suggDesc: { color: C.sub, marginTop: 4, fontWeight: "600" },

  // Mood & Triggers
  triggerRow: { gap: 8 },
  triggerLabel: { color: C.sub, fontWeight: "800" },
  triggerTrack: {
    height: 12,
    backgroundColor: "#344a56",
    borderRadius: 10,
    overflow: "hidden",
  },
  triggerFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 10,
  },

  // Before / After
  beforeAfterHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  beforeAfterLabel: { flex: 1, color: C.text, fontWeight: "800" },
  deltaText: { color: "#93ffb9", fontWeight: "900" },
  baTrack: {
    height: 12,
    borderRadius: 10,
    backgroundColor: C.track,
    overflow: "hidden",
  },
  baBar: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: 10,
  },
  legendRow: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
    marginTop: 6,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: C.sub, fontWeight: "700" },

  // Chart
  chartWrap: {
    backgroundColor: C.card,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },

  // Emotion tags
  tagsWrap: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#12343f",
    borderRadius: 14,
  },
  tagBig: { paddingVertical: 8, paddingHorizontal: 12 },
  tagText: { color: "#b9ffd9", fontWeight: "800" },

  // Reflection
  reflectionBox: {
    backgroundColor: "#0b2027",
    borderRadius: 16,
    padding: 12,
  },
  input: {
    minHeight: 92,
    color: C.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
