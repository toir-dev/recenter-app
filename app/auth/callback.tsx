import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/state';
import { applySessionFromUrl } from '@/src/state/useAuth';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const status = useAuth((state) => state.status);
  const error = useAuth((state) => state.error);

  useEffect(() => {
    const hydrate = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        await applySessionFromUrl(url);
      }
    };
    hydrate();
  }, []);

  const incoming = Linking.useURL();
  useEffect(() => {
    if (incoming) {
      applySessionFromUrl(incoming).catch((err) => console.warn('[auth] callback handling failed', err));
    }
  }, [incoming]);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(tabs)');
    } else if (status === 'unauthenticated' && error) {
      router.replace('/sign-in');
    }
  }, [error, router, status]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <ActivityIndicator size="large" color="#4c1d95" />
        <Text className="text-base text-zinc-600 dark:text-zinc-300">
          {t('auth.callback.message')}
        </Text>
        {error ? (
          <Text className="text-sm text-red-600 dark:text-red-400 text-center">{error}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}





