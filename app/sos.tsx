import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { Text, View } from '@/components/Themed';
import '@/lib/i18n';

export default function SosScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="flex-1 justify-center gap-6 px-6">
      <View className="gap-2">
        <Text className="text-4xl font-semibold text-rose-500">{t('sos.title')}</Text>
        <Text className="text-base text-zinc-600 dark:text-zinc-300">{t('sos.body')}</Text>
      </View>

      <View className="gap-3">
        <Pressable
          style={{
            borderRadius: 24,
            backgroundColor: '#ef4444',
            paddingVertical: 16,
            paddingHorizontal: 20,
          }}
          onPress={() => router.back()}>
          <Text className="text-center text-base font-semibold text-white">{t('sos.primary')}</Text>
        </Pressable>
        <Pressable
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#e4e4e7',
            paddingVertical: 16,
            paddingHorizontal: 20,
          }}
          onPress={() => router.push('/tools')}>
          <Text className="text-center text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {t('sos.secondary')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
