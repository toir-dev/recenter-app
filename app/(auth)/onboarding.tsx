import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/state';

const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? 'https://example.com/terms';
const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? 'https://example.com/privacy';

type Slide = {
  key: string;
  title: string;
  description: string;
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const completeOnboarding = useAuth((state) => state.completeOnboarding);
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo<Slide[]>(
    () => [
      {
        key: 'welcome',
        title: t('auth.onboarding.slides.welcome.title'),
        description: t('auth.onboarding.slides.welcome.description'),
      },
      {
        key: 'practice',
        title: t('auth.onboarding.slides.practice.title'),
        description: t('auth.onboarding.slides.practice.description'),
      },
      {
        key: 'ready',
        title: t('auth.onboarding.slides.ready.title'),
        description: t('auth.onboarding.slides.ready.description'),
      },
    ],
    [t]
  );

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (!Number.isNaN(index)) {
      setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1));
    }
  };

  const handleNext = async () => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
      return;
    }

    await completeOnboarding();
    router.replace('/sign-in');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/sign-in');
  };

  const handleOpenUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('auth.onboarding.linkError'));
      }
    } catch (linkError) {
      console.warn('[onboarding] Failed to open url', linkError);
      Alert.alert(t('auth.onboarding.linkError'));
    }
  };

  const isLastSlide = activeIndex === slides.length - 1;
  const primaryCta = isLastSlide ? t('auth.onboarding.getStarted') : t('auth.onboarding.next');
  const isDark = colorScheme === 'dark';
  const accentColor = isDark ? '#a855f7' : '#4c1d95';
  const accentSurface = isDark ? 'rgba(168,85,247,0.18)' : 'rgba(76,29,149,0.08)';
  const cardBorder = isDark ? 'rgba(63,63,70,0.7)' : 'rgba(228,228,231,0.85)';
  const cardBackground = isDark ? 'rgba(24,24,27,0.94)' : '#ffffff';
  const indicatorInactive = isDark ? '#27272a' : '#e4e4e7';
  const subtitleColor = isDark ? '#d4d4d8' : '#52525b';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      <View style={styles.content}>
        <View style={styles.skipRow}>
          <Text
            style={[styles.skipText, { color: isDark ? '#71717a' : '#a1a1aa' }]}
            onPress={handleSkip}>
            {t('auth.onboarding.skip')}
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: 'stretch' }}>
          {slides.map((slide, index) => (
            <View key={slide.key} style={[styles.slide, { width }]}>
              <View style={styles.slideContent}>
                <View
                  style={[
                    styles.slideCard,
                    {
                      borderColor: cardBorder,
                      backgroundColor: cardBackground,
                    },
                  ]}>
                  <View
                    style={[
                      styles.stepBadge,
                      {
                        backgroundColor: accentSurface,
                      },
                    ]}>
                    <Text style={[styles.stepBadgeText, { color: accentColor }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.slideCopy}>
                    <Text style={[styles.slideTitle, { color: isDark ? '#fafafa' : '#18181b' }]}>
                      {slide.title}
                    </Text>
                    <Text style={[styles.slideDescription, { color: subtitleColor }]}>
                      {slide.description}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.indicatorRow}>
            {slides.map((slide, index) => (
              <View
                key={slide.key}
                style={[
                  styles.indicator,
                  {
                    width: index === activeIndex ? 16 : 8,
                    backgroundColor: index === activeIndex ? accentColor : indicatorInactive,
                  },
                ]}
              />
            ))}
          </View>

          <Button label={primaryCta} onPress={handleNext} style={styles.fullWidthButton} />

          <Text style={[styles.legal, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
            {t('auth.onboarding.agreementPrefix')}{' '}
            <Text
              style={[styles.legalLink, { color: accentColor }]}
              onPress={() => handleOpenUrl(TERMS_URL)}>
              {t('auth.onboarding.termsLink')}
            </Text>{' '}
            {t('auth.onboarding.agreementConnector')}{' '}
            <Text
              style={[styles.legalLink, { color: accentColor }]}
              onPress={() => handleOpenUrl(PRIVACY_URL)}>
              {t('auth.onboarding.privacyLink')}
            </Text>
            .
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    height: '100%',
    paddingHorizontal: 24,
    paddingBottom: 80,
    paddingTop: 32,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
  },
  slideCard: {
    gap: 24,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    shadowColor: '#101828',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  stepBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    width: 80,
    height: 80,
  },
  stepBadgeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  slideCopy: {
    gap: 12,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '600',
  },
  slideDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    gap: 24,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 999,
  },
  fullWidthButton: {
    alignSelf: 'stretch',
  },
  legal: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
  legalLink: {
    fontWeight: '600',
  },
});
