import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/Themed';
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4c1d95" />
        <Text style={styles.message} lightColor="#52525b" darkColor="#d4d4d8">
          {t('auth.callback.message')}
        </Text>
        {error ? (
          <Text style={styles.error} lightColor="#dc2626" darkColor="#f87171">
            {error}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});




