import { useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  // Mock data - in real app this comes from Supabase
  const stats = {
    currentStreak: 12,
    totalEntries: 47,
    toolsUsed: 89,
    averageMood: 6.4,
    bestTool: 'Breathing',
    improvementRate: 34
  };

  const weeklyMoods = [
    { day: 'Mon', mood: 5, hasEntry: true },
    { day: 'Tue', mood: 6, hasEntry: true },
    { day: 'Wed', mood: 7, hasEntry: true },
    { day: 'Thu', mood: 5, hasEntry: true },
    { day: 'Fri', mood: 8, hasEntry: true },
    { day: 'Sat', mood: 7, hasEntry: true },
    { day: 'Sun', mood: 6, hasEntry: false },
  ];

  const toolsUsage = [
    { name: 'Breathing', count: 34, color: '#3b82f6' },
    { name: '5-4-3-2-1', count: 28, color: '#10b981' },
    { name: 'Reality Checks', count: 18, color: '#8b5cf6' },
    { name: 'SOS', count: 9, color: '#ef4444' },
  ];

  const maxToolCount = Math.max(...toolsUsage.map(t => t.count));

  const insights = [
    { icon: '🌙', text: 'Your mood is 40% better when you log sleep >7hrs', color: '#3b82f6' },
    { icon: '☕', text: 'Episodes increase 2x after caffeine intake', color: '#f59e0b' },
    { icon: '🏃', text: 'Physical activity reduces intensity by 45%', color: '#10b981' },
  ];

  const streakDays = 12;
  const streakCells = Array.from({ length: 30 }, (_, i) => ({
    active: i < streakDays,
    index: i
  }));

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, gap: 20 }}>
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Your Progress</Text>
        <Text style={{ fontSize: 16, color: '#666' }}>Track your journey and celebrate wins</Text>
      </View>

      {/* Streak Card */}
      <View style={[styles.card, { backgroundColor: '#eff6ff', borderWidth: 2, borderColor: '#3b82f6' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Current Streak</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#3b82f6' }}>{stats.currentStreak}</Text>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#3b82f6' }}>days</Text>
            </View>
          </View>
          <Text style={{ fontSize: 64 }}>🔥</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {streakCells.map((cell) => (
            <View
              key={cell.index}
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                backgroundColor: cell.active ? '#3b82f6' : '#e5e7eb',
              }}
            />
          ))}
        </View>
        <Text style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
          Keep it going! Consistency builds resilience.
        </Text>
      </View>

      {/* Key Metrics */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Journal Entries</Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000' }}>{stats.totalEntries}</Text>
          </View>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Tools Used</Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000' }}>{stats.toolsUsed}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Avg Mood</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000' }}>{stats.averageMood}</Text>
              <Text style={{ fontSize: 18, color: '#666' }}>/10</Text>
            </View>
          </View>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Improvement</Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#10b981' }}>+{stats.improvementRate}%</Text>
          </View>
        </View>
      </View>

      {/* Period Selector */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {(['week', 'month', 'all'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedPeriod(period)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: selectedPeriod === period ? '#3b82f6' : '#fff',
              borderWidth: 2,
              borderColor: selectedPeriod === period ? '#3b82f6' : '#e5e7eb',
              alignItems: 'center',
            }}
          >
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '600',
              color: selectedPeriod === period ? '#fff' : '#666' 
            }}>
              {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mood Chart */}
      <View style={styles.card}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Mood Trend</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 150 }}>
          {weeklyMoods.map((item, index) => {
            const heightPercent = (item.mood / 10) * 100;
            return (
              <View key={index} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%' }}>
                  <View
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: item.hasEntry ? '#3b82f6' : '#e5e7eb',
                      borderRadius: 6,
                    }}
                  />
                </View>
                <Text style={{ fontSize: 12, color: '#666', fontWeight: '500' }}>{item.day}</Text>
              </View>
            );
          })}
        </View>
        <Text style={{ fontSize: 12, color: '#666', marginTop: 12 }}>
          Gray bars = missing entries. Keep logging daily for better insights!
        </Text>
      </View>

      {/* Tools Usage */}
      <View style={styles.card}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Most Used Tools</Text>
        <View style={{ gap: 12 }}>
          {toolsUsage.map((tool) => (
            <View key={tool.name}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: '500' }}>{tool.name}</Text>
                <Text style={{ fontSize: 15, color: '#666' }}>{tool.count}×</Text>
              </View>
              <View style={{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                <View
                  style={{
                    width: `${(tool.count / maxToolCount) * 100}%`,
                    height: '100%',
                    backgroundColor: tool.color,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* AI Insights */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Insights</Text>
          <Text style={{ fontSize: 18 }}>💡</Text>
        </View>
        <View style={{ gap: 12 }}>
          {insights.map((insight, index) => (
            <View 
              key={index} 
              style={{ 
                flexDirection: 'row', 
                gap: 12, 
                padding: 12, 
                backgroundColor: '#f9fafb', 
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: insight.color
              }}
            >
              <Text style={{ fontSize: 24 }}>{insight.icon}</Text>
              <Text style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>{insight.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Encouragement */}
      <View style={[styles.card, { backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#86efac' }]}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#166534', marginBottom: 8 }}>
          You're Making Progress! 🎉
        </Text>
        <Text style={{ fontSize: 14, color: '#166534', lineHeight: 20 }}>
          {stats.improvementRate >= 30 
            ? "Your symptoms have improved significantly. Keep using what works!"
            : stats.improvementRate >= 15
            ? "You're seeing steady improvement. Stay consistent with your tools."
            : "Every entry and tool use helps. Progress isn't always linear—keep going!"}
        </Text>
      </View>

      {/* Info Card */}
      <View style={{ backgroundColor: '#eff6ff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#93c5fd' }}>
        <Text style={{ fontSize: 14 }}>
          <Text style={{ fontWeight: 'bold' }}>📊 Data Privacy:</Text> All your data stays on your device and syncs encrypted to your private account. Only you can see this.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});