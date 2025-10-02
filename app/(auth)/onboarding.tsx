import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/Button';
import { ToggleRow } from '@/src/components/ui/ToggleRow';
import { useAuth } from '@/src/state';
import type { OnboardingConsents } from '@/src/state/useAuth';

const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? 'https://example.com/terms';
const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? 'https://example.com/privacy';

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const completeOnboarding = useAuth((state) => state.completeOnboarding);
  const storedConsents = useAuth((state) => state.consents);
  const [consents, setConsents] = useState<OnboardingConsents>(storedConsents);
  const [error, setError] = useState<string | null>(null);

  const toggleConsent = (key: keyof OnboardingConsents) => (value: boolean) => {
    setConsents((current) => ({ ...current, [key]: value }));
    if (error) {
      setError(null);
    }
  };

  const handleContinue = async () => {
    if (!consents.termsAccepted || !consents.privacyAccepted) {
      setError(t('auth.onboarding.errorRequired'));
      return;
    }

    await completeOnboarding(consents);
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 }}>
        <View className="flex-1 justify-between gap-12">
          <View className="gap-6">
            <View className="gap-3">
              <Text className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                {t('auth.onboarding.title')}
              </Text>
              <Text className="text-base text-zinc-600 dark:text-zinc-300">
                {t('auth.onboarding.subtitle')}
              </Text>
            </View>

            <View className="gap-4">
              <ToggleRow
                label={t('auth.onboarding.termsLabel')}
                description={t('auth.onboarding.termsDescription')}
                value={consents.termsAccepted}
                onValueChange={toggleConsent('termsAccepted')}
              />
              <ToggleRow
                label={t('auth.onboarding.privacyLabel')}
                description={t('auth.onboarding.privacyDescription')}
                value={consents.privacyAccepted}
                onValueChange={toggleConsent('privacyAccepted')}
              />
              <ToggleRow
                label={t('auth.onboarding.analyticsLabel')}
                description={t('auth.onboarding.analyticsDescription')}
                value={consents.analytics}
                onValueChange={toggleConsent('analytics')}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                {t('auth.onboarding.disclaimer')}
              </Text>
              <View className="flex-row gap-2">
                <Text
                  className="text-sm font-semibold text-blue-600"
                  onPress={() => handleOpenUrl(TERMS_URL)}>
                  {t('auth.onboarding.termsLink')}
                </Text>
                <Text className="text-sm text-zinc-500">-</Text>
                <Text
                  className="text-sm font-semibold text-blue-600"
                  onPress={() => handleOpenUrl(PRIVACY_URL)}>
                  {t('auth.onboarding.privacyLink')}
                </Text>
              </View>
            </View>

            {error ? (
              <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text>
            ) : null}
          </View>

          <Button
            label={t('auth.onboarding.continue')}
            onPress={handleContinue}
            disabled={!consents.termsAccepted || !consents.privacyAccepted}
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}








