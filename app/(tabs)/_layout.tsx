import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Tabs, useRootNavigationState, useSegments } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { secureStore } from '@/src/lib/secureStore';

const TAB_ROUTE_NAMES = ['tools', 'journal', 'progress'] as const;
type TabRouteName = (typeof TAB_ROUTE_NAMES)[number];

const TAB_ICONS: Record<TabRouteName, React.ComponentProps<typeof FontAwesome>['name']> = {
  tools: 'medkit',
  journal: 'pencil',
  progress: 'area-chart',
};

const LAST_TAB_KEY = 'navigation.lastTab';

const isTabRouteName = (value: string | null): value is TabRouteName =>
  !!value && (TAB_ROUTE_NAMES as readonly string[]).includes(value);

const coerceTabName = (value: string | null): TabRouteName => {
  if (isTabRouteName(value)) {
    return value;
  }

  if (value === 'index' || value === 'learn') {
    return 'tools';
  }

  return 'tools';
};

type NavigationChromeProps = BottomTabBarProps & {
  scheme: 'light' | 'dark';
};

const NavigationChrome = ({ state, descriptors, navigation, scheme }: NavigationChromeProps) => {
  const { bottom } = useSafeAreaInsets();

  const background = scheme === 'dark' ? 'rgba(148, 163, 184, 0.14)' : '#f8fafc';
  const border = scheme === 'dark' ? 'rgba(148, 163, 184, 0.14)' : '#e2e8f0';
  const active = scheme === 'dark' ? '#38bdf8' : '#2563eb';
  const inactive = scheme === 'dark' ? '#64748b' : '#94a3b8';

  return (
    <View style={{ backgroundColor: background, paddingBottom: bottom + 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: border }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 32,
        }}>
        {state.routes.map((route, index) => {
          if (!isTabRouteName(route.name)) {
            return null;
          }

          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name, route.params);
              void secureStore.setItem(LAST_TAB_KEY, route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                {
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.82 : 1,
                },
              ]}>
              <View
                style={{
                  paddingHorizontal: 4,
                  paddingVertical: 4,
                  borderRadius: 25,
                }}>
                <FontAwesome name={TAB_ICONS[route.name]} size={25} color={isFocused ? active : inactive} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

type TabHeaderProps = {
  title: string;
  showSettings?: boolean;
};

const TabHeader = ({ title, showSettings }: TabHeaderProps) => {
  const scheme = useColorScheme();
  const theme = scheme ?? 'light';
  const { top } = useSafeAreaInsets();

  const styles = useMemo(() => {
    const isDark = theme === 'dark';
    const background = isDark ? '#0f172a' : '#f8fafc';
    const border = isDark ? 'rgba(148, 163, 184, 0.12)' : '#e2e8f0';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const iconColor = isDark ? '#cbd5f5' : '#334155';

    return {
      container: {
        paddingTop: top + 10,
        paddingBottom: 14,
        backgroundColor: background,
        borderBottomWidth: Platform.OS === 'ios' ? 0 : 1,
        borderBottomColor: border,
      },
      content: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        paddingHorizontal: 24,
      },
      title: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: textColor,
      },
      iconColor,
    };
  }, [theme, top]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ width: 32 }} />
        <Text style={styles.title}>{title}</Text>
        {showSettings ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={() => {
              console.warn('Settings screen not yet implemented.');
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Feather name="settings" size={22} color={styles.iconColor} />
          </Pressable>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const { t } = useTranslation();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  const [initialRouteName, setInitialRouteName] = useState<TabRouteName>('tools');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateLastTab = async () => {
      const stored = await secureStore.getItem(LAST_TAB_KEY);
      if (!isMounted) {
        return;
      }

      const nextTab = coerceTabName(stored);
      setInitialRouteName(nextTab);
      if (nextTab !== stored) {
        await secureStore.setItem(LAST_TAB_KEY, nextTab);
      }
      if (isMounted) {
        setHydrated(true);
      }
    };

    void hydrateLastTab();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const segmentStrings = segments as string[];
    const tabsGroupIndex = segmentStrings.indexOf('(tabs)');
    if (tabsGroupIndex === -1) {
      return;
    }

    const maybeTab = segmentStrings[tabsGroupIndex + 1] ?? null;
    const nextTab = coerceTabName(maybeTab ?? null);
    void secureStore.setItem(LAST_TAB_KEY, nextTab);
  }, [segments]);

  if (!rootNavigationState?.key || !hydrated) {
    return null;
  }

  return (
    <Tabs
      initialRouteName={initialRouteName}
      tabBar={(props) => <NavigationChrome {...props} scheme={scheme} />}>
      <Tabs.Screen
        name="tools"
        options={{
          title: t('tabs.tools'),
          header: () => <TabHeader title={t('tabs.tools')} showSettings />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: t('tabs.journal'),
          header: () => <TabHeader title={t('tabs.journal')} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('tabs.progress'),
          header: () => <TabHeader title={t('tabs.progress')} />,
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
