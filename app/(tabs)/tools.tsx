import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { 
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  Easing
} from 'react-native-reanimated';

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

type Theme = 'light' | 'dark';

const createStyles = (theme: Theme) => {
  const isDark = theme === 'dark';
  const background = isDark ? '#101c22' : '#f6f7f8';
  const surface = isDark ? '#1a2831' : '#ffffff';
  const mutedSurface = isDark ? '#0b1220' : '#f1f5f9';
  const border = isDark ? 'rgba(148, 163, 184, 0.16)' : '#e2e8f0';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const tileShadow = isDark
    ? { shadowColor: '#13a4ec', shadowOpacity: 0.25, shadowRadius: 18, elevation: 10 }
    : { shadowColor: '#13a4ec', shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 };

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: background,
    },
    content: {
      paddingHorizontal: 24,
      paddingVertical: 32,
      gap: 32,
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
      shadowColor: '#13a4ec',
      shadowOpacity: 0.5,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 18 },
      elevation: 24,
    },
    heroTitle: {
      fontSize: 36,
      fontWeight: '700',
      color: '#ffffff',
    },
    heroSubtitle: {
      fontSize: 16,
      color: textSecondary,
      textAlign: 'center',
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
      borderWidth: 1,
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
      borderWidth: 1,
      borderColor: border,
      paddingHorizontal: 20,
      paddingVertical: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      shadowColor: isDark ? '#020617' : '#020817',
      shadowOpacity: 0.18,
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
    sectionGroup: {
      gap: 18,
    },
  });
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ToolsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const systemScheme = useColorScheme();
  const theme: Theme = systemScheme === 'dark' ? 'dark' : 'light';
  const styles = useMemo(() => createStyles(theme), [theme]);

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
          onPress={() => router.push('/sos')}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={animatedButtonStyle}>
          <LinearGradient
            colors={['#13a4ec', '#A6F0C6']}
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
          {tiles.map((tile) => {
            const iconName = tileIconMap[tile.id] ?? (tile.icon as React.ComponentProps<typeof Feather>['name']) ?? iconFallback;
            return (
              <Animated.View 
                key={tile.id}
                entering={FadeInUp.duration(600).delay(200).easing(Easing.out(Easing.ease))}
                style={styles.tileCard}>
                <View style={styles.tileIcon}>
                  <Feather name={iconName} size={26} color="#13a4ec" />
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
          {resources.map((resource) => {
            const iconName = resourceIconMap[resource.id] ?? (resource.icon as React.ComponentProps<typeof Feather>['name']) ?? iconFallback;
            return (
              <Animated.View 
                key={resource.id}
                entering={FadeInUp.duration(600).delay(300).easing(Easing.out(Easing.ease))}
                style={styles.resourceCard}>
                <Feather name={iconName} size={24} color="#13a4ec" />
                <View style={styles.resourceText}>
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  <Text style={styles.resourceCopy}>{resource.description}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#13a4ec" />
              </Animated.View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}