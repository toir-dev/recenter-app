// app/(tabs)/journal.tsx
import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";

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
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              // if this screen can be pushed, wire navigation.goBack()
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#cfd8de" />
          </Pressable>
          <Text style={styles.headerTitle}>Journal</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Primary actions */}
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

        {/* Trigger Log header + actions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Trigger Log</Text>

          <View style={styles.smallActions}>
            <Pressable style={styles.smallIconBtn} onPress={() => {}}>
              <Ionicons name="calendar-clear-outline" size={18} color="#9fb6c4" />
            </Pressable>
            <Pressable style={styles.smallIconBtn} onPress={() => {}}>
              <Ionicons name="search" size={18} color="#9fb6c4" />
            </Pressable>
          </View>
        </View>

        {/* Trigger cards */}
        <View style={{ gap: 14 }}>
          {TRIGGERS.map((t) => (
            <TriggerCard key={t.id} trigger={t} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TriggerCard({ trigger }: { trigger: Trigger }) {
  const pct = Math.min(1, Math.max(0, trigger.intensity / 10));

  return (
    <Pressable style={styles.card} onPress={() => {}}>
      {/* Icon bubble */}
      <View style={styles.iconBubble}>
        <View style={{ transform: [{ translateY: 1 }] }}>
          {React.cloneElement(trigger.icon as any, { color: "#29a8eb" })}
        </View>
      </View>

      {/* Text + bar */}
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{trigger.title}</Text>
        <Text style={styles.cardSub}>Intensity: {trigger.intensity}/10</Text>

        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1a1f" },
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
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#e6eef3",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  // Pills
  pill: {
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 22,
    marginTop: 10,
  },
  pillPrimary: {
    backgroundColor: "#14a8ff",
  },
  pillSecondary: {
    backgroundColor: "#0e2a33",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(41,168,235,0.25)",
  },
  pillText: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  pillTextPrimary: {
    color: "#061319",
  },
  pillTextSecondary: {
    color: "#2fb3ff",
  },

  // Section header
  sectionHeaderRow: {
    marginTop: 22,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    flex: 1,
    color: "#d7e5ec",
    fontSize: 26,
    fontWeight: "800",
  },
  smallActions: {
    flexDirection: "row",
    backgroundColor: "#17262d",
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
    backgroundColor: "#0f1e25",
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#0d1a20",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(61,104,128,0.35)",
  },
  iconBubble: {
    height: 58,
    width: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b2833",
  },
  cardTitle: {
    color: "#d7e5ec",
    fontSize: 22,
    fontWeight: "800",
  },
  cardSub: {
    color: "#89a5b4",
    marginTop: 2,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
  },

  // Progress bar
  barTrack: {
    height: 10,
    borderRadius: 10,
    backgroundColor: "#243943",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#28a8ea",
  },
});
