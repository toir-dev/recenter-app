import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Tabs, useRootNavigationState, useSegments, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { secureStore } from '@/src/lib/secureStore';
import { useThemeTokens } from '@/src/theme/provider';


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

const withAlpha = (color: string, alpha: number) => {
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (trimmed.startsWith('rgba')) {
    const parts = trimmed.substring(trimmed.indexOf('(') + 1, trimmed.lastIndexOf(')')).split(',');
    return `rgba(${parts[0].trim()}, ${parts[1].trim()}, ${parts[2].trim()}, ${alpha})`;
  }
  if (trimmed.startsWith('rgb')) {
    const parts = trimmed.substring(trimmed.indexOf('(') + 1, trimmed.lastIndexOf(')')).split(',');
    return `rgba(${parts[0].trim()}, ${parts[1].trim()}, ${parts[2].trim()}, ${alpha})`;
  }
  return trimmed;
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
          alignItems: 'center' as const,
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
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
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
  variant: 'tools' | 'journal' | 'progress';
};

const TabHeader = ({ title, showSettings = false }: TabHeaderProps) => {
  const scheme = useColorScheme();
  const router = useRouter();
  const tokens = useThemeTokens();
  const { top } = useSafeAreaInsets();
  const { styles, iconColor } = useMemo(() => {
    const containerBackground = withAlpha(tokens.background, scheme === 'dark' ? 0.92 : 0.7);
    const buttonBackground = withAlpha(tokens.surfaceMuted, scheme === 'dark' ? 0.9 : 0.55);
    const textColor = tokens.text;
    const iconColorValue = textColor;
    const shadowColor = scheme === 'dark' ? 'rgba(4, 12, 16, 0.6)' : 'rgba(15, 23, 42, 0.15)';

    const created = StyleSheet.create({
      container: {
        paddingTop: top + 10,
        paddingBottom: 14,
        backgroundColor: containerBackground,
        borderBottomWidth: 0,
        borderBottomColor: 'transparent',
      },
      content: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        paddingHorizontal: 24,
      },
      placeholder: {
        width: 36,
      },
      settingsButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: buttonBackground,
      },
      settingsButtonPressed: {
        opacity: 0.65,
      },
      titleWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 6,
      },
      title: {
        fontSize: 18,
        fontWeight: '600',
        color: textColor,
        letterSpacing: 0.5,
        textShadowColor: shadowColor,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
      },
    });

    return { styles: created, iconColor: iconColorValue };
  }, [scheme, tokens, top, ]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.placeholder} />
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{title}</Text>
        </View>
        {showSettings ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            hitSlop={8}
            onPress={() => {
              router.push('/screens/SettingsScreen');
            }}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed ? styles.settingsButtonPressed : null,
            ]}>
            <Feather name="settings" size={18} color={iconColor} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
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
  const tokens = useThemeTokens();

  const [initialRouteName, setInitialRouteName] = useState<TabRouteName>('tools');
  const [hydrated, setHydrated] = useState(false);
  const sceneStyle = useMemo(() => ({ backgroundColor: tokens.background }), [tokens.background]);


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
          headerStyle: { backgroundColor: 'transparent' },
          headerShadowVisible: false,
          sceneStyle,
          header: () => (
            <TabHeader title={t('tabs.tools')} showSettings variant="tools" />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: t('tabs.journal'),
          headerStyle: { backgroundColor: 'transparent' },
          headerShadowVisible: false,
          sceneStyle,
          header: () => (
            <TabHeader title={t('tabs.journal')} showSettings variant="journal" />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('tabs.progress'),
          headerStyle: { backgroundColor: 'transparent' },
          headerShadowVisible: false,
          sceneStyle,
          header: () => (
            <TabHeader title={t('tabs.progress')} showSettings variant="progress" />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}


