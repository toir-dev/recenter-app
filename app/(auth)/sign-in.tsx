import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/state';

export default function SignInScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';
  const signInWithMagicLink = useAuth((state) => state.signInWithMagicLink);
  const signInWithGoogle = useAuth((state) => state.signInWithGoogle);
  const status = useAuth((state) => state.status);
  const pending = useAuth((state) => state.pending);
  const error = useAuth((state) => state.error);
  const setError = useAuth((state) => state.setError);
  const needsOnboarding = useAuth((state) => state.needsOnboarding);
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(tabs)');
    }
  }, [router, status]);

  useEffect(() => {
    if (needsOnboarding) {
      router.replace('/onboarding');
    }
  }, [needsOnboarding, router]);

  const handleMagicLink = async () => {
    const trimmed = email.trim().toLowerCase();
    setFeedback(null);
    setError(null);
    const result = await signInWithMagicLink(trimmed);
    if (!result.error) {
      setFeedback(t('auth.signIn.magicLinkSent'));
    }
  };

  const handleGoogle = async () => {
    setFeedback(null);
    setError(null);
    const result = await signInWithGoogle();
    if (!result.error) {
      router.replace('/(tabs)');
    }
  };

  const isPending = (action: 'email' | 'google') => pending === action;
  const isRedirecting = pending === 'google';
  const isAuthenticated = status === 'authenticated';

  if (isRedirecting || isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <ActivityIndicator size="large" color={isDark ? '#a855f7' : '#4c1d95'} />
          <Text className="text-base text-zinc-600 dark:text-zinc-300">
            {t('auth.signIn.redirecting')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 }}>
        <View className="flex-1 justify-between gap-12">
          <View className="gap-6">
            <View className="gap-3">
              <Text className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                {t('auth.signIn.title')}
              </Text>
              <Text className="text-base text-zinc-600 dark:text-zinc-300">
                {t('auth.signIn.subtitle')}
              </Text>
            </View>

            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  {t('auth.signIn.emailLabel')}
                </Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder={t('auth.signIn.emailPlaceholder')}
                  placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                  value={email}
                  onChangeText={(value) => {
                    if (error) {
                      setError(null);
                    }
                    setFeedback(null);
                    setEmail(value);
                  }}
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isDark ? '#3f3f46' : '#d4d4d8',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    color: isDark ? '#f4f4f5' : '#111827',
                  }}
                />
              </View>
              <Button
                label={t('auth.signIn.magicLinkCta')}
                onPress={handleMagicLink}
                disabled={isPending('email') || !email.trim()}
                className="w-full"
              />
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                {t('auth.signIn.magicLinkHelp')}
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                <Text className="text-xs uppercase tracking-widest text-zinc-400">
                  {t('auth.signIn.divider')}
                </Text>
                <View className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              </View>
              <Button
                label={t('auth.signIn.googleCta')}
                onPress={handleGoogle}
                variant="outline"
                disabled={isPending('google')}
                className="w-full"
              />
            </View>

            {pending ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color={isDark ? '#a855f7' : '#4c1d95'} />
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t('auth.signIn.pending')}
                </Text>
              </View>
            ) : null}

            {feedback ? (
              <Text className="text-sm text-green-600 dark:text-green-400">{feedback}</Text>
            ) : null}

            {error ? (
              <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text>
            ) : null}
          </View>

          <Text
            className="text-center text-sm font-semibold text-zinc-500"
            onPress={() => router.replace('/onboarding')}>
            {t('auth.signIn.manageConsents')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}







