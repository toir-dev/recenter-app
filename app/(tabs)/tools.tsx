import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { type ThemeName } from '@/src/theme/colors';
import { useThemeScheme, useThemeTokens } from '@/src/theme/provider';
import { type ThemeTokens } from '@/src/theme/tokens';

type ToolTile = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type ResourceItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type ToolsSections = {
  grounding: {
    title: string;
    description: string;
  };
  learn: {
    title: string;
    description: string;
  };
};

const iconFallback: React.ComponentProps<typeof Feather>['name'] = 'circle';

const tileIconMap: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  breathe: 'wind',
  fiveSenses: 'eye',
};

const resourceIconMap: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  realityChecks: 'help-circle',
  aboutDpdr: 'book-open',
  crisisResources: 'life-buoy',
};

const createStyles = (tokens: ThemeTokens, scheme: ThemeName) => {
  const isDark = scheme === 'dark';
  const background = tokens.background;
  const surface = tokens.surface;
  const mutedSurface = tokens.surfaceMuted;
  const border = tokens.border;
  const textPrimary = tokens.text;
  const textSecondary = tokens.muted;
  const accent = tokens.primary;
  const shadowColor = accent;
  const tileShadow = isDark
    ? { shadowColor, shadowOpacity: 0.28, shadowRadius: 22, elevation: 12 }
    : { shadowColor, shadowOpacity: 0.16, shadowRadius: 16, elevation: 8 };

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: background,
    },
    content: {
      paddingHorizontal: 24,
      paddingVertical: 32,
      gap: 32,
      backgroundColor: background,
    },
    heroWrapper: {
      alignItems: 'center',
      gap: 16,
    },
    heroGradient: {
      width: 220,
      height: 220,
      borderRadius: 110,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor,
      shadowOpacity: 0.42,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 18 },
      elevation: 24,
    },
    heroTitle: {
      fontSize: 36,
      fontWeight: '700',
      color: tokens.onPrimary,
    },
    heroSubtitle: {
      fontSize: 16,
      color: textSecondary,
      textAlign: 'center',
    },
    sectionGroup: {
      gap: 18,
    },
    sectionHeader: {
      gap: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: textPrimary,
    },
    sectionCopy: {
      fontSize: 15,
      color: textSecondary,
    },
    tileGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    tileCard: {
      backgroundColor: surface,
      borderRadius: 28,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      padding: 20,
      flexBasis: '48%',
      gap: 16,
      flexDirection: 'row',
      alignItems: 'center',
      ...tileShadow,
    },
    tileIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: mutedSurface,
    },
    tileTextContainer: {
      flex: 1,
      gap: 4,
    },
    tileTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: textPrimary,
    },
    tileCopy: {
      fontSize: 14,
      color: textSecondary,
    },
    resourceList: {
      gap: 14,
    },
    resourceCard: {
      backgroundColor: surface,
      borderRadius: 24,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      paddingHorizontal: 20,
      paddingVertical: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      shadowColor,
      shadowOpacity: isDark ? 0.22 : 0.14,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    },
    resourceText: {
      flex: 1,
      gap: 4,
    },
    resourceTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: textPrimary,
    },
    resourceCopy: {
      fontSize: 14,
      color: textSecondary,
    },
  });
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ToolsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scheme = useThemeScheme();
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens, scheme), [tokens, scheme]);
  const gradientColors = useMemo(() => [tokens.primary, tokens.accent] as const, [tokens]);
  const iconAccent = tokens.primary;

  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const hero = t('tools.hero', { returnObjects: true }) as { title: string; subtitle: string };
  const sections = t('tools.sections', { returnObjects: true }) as ToolsSections;
  const tiles = t('tools.tiles', { returnObjects: true }) as ToolTile[];
  const resources = t('tools.resources', { returnObjects: true }) as ResourceItem[];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Animated.View
        entering={FadeInUp.duration(500).easing(Easing.out(Easing.ease))}
        style={styles.heroWrapper}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={t('common.sos')}
          onPress={() => router.push('/screens/GroundingScreen')}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={animatedButtonStyle}>
          <LinearGradient
            colors={gradientColors}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Text style={styles.heroTitle}>{hero?.title ?? 'SOS'}</Text>
          </LinearGradient>
        </AnimatedPressable>
        <Text style={styles.heroSubtitle}>{hero?.subtitle}</Text>
      </Animated.View>

      <View style={styles.sectionGroup}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{sections.grounding.title}</Text>
          <Text style={styles.sectionCopy}>{sections.grounding.description}</Text>
        </View>

        <View style={styles.tileGrid}>
          {tiles.map((tile, index) => {
            const iconName =
              tileIconMap[tile.id] ?? (tile.icon as React.ComponentProps<typeof Feather>['name']) ?? iconFallback;
            return (
              <Animated.View
                key={tile.id}
                entering={FadeInUp.duration(600).delay(120 + index * 60).easing(Easing.out(Easing.ease))}
                style={styles.tileCard}>
                <View style={styles.tileIcon}>
                  <Feather name={iconName} size={26} color={iconAccent} />
                </View>
                <View style={styles.tileTextContainer}>
                  <Text style={styles.tileTitle}>{tile.title}</Text>
                  <Text style={styles.tileCopy}>{tile.description}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionGroup}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{sections.learn.title}</Text>
          <Text style={styles.sectionCopy}>{sections.learn.description}</Text>
        </View>

        <View style={styles.resourceList}>
          {resources.map((resource, index) => {
            const iconName =
              resourceIconMap[resource.id] ?? (resource.icon as React.ComponentProps<typeof Feather>['name']) ?? iconFallback;
            return (
              <Animated.View
                key={resource.id}
                entering={FadeInUp.duration(600).delay(200 + index * 60).easing(Easing.out(Easing.ease))}
                style={styles.resourceCard}>
                <Feather name={iconName} size={24} color={iconAccent} />
                <View style={styles.resourceText}>
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  <Text style={styles.resourceCopy}>{resource.description}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={iconAccent} />
              </Animated.View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
