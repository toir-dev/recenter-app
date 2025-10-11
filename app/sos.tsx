import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import '@/lib/i18n';

export default function SosScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('sos.title')}</Text>
        <Text style={styles.body} lightColor="#52525b" darkColor="#d4d4d8">
          {t('sos.body')}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryAction} onPress={() => router.back()}>
          <Text style={styles.primaryLabel}>{t('sos.primary')}</Text>
        </Pressable>
        <Pressable style={styles.secondaryAction} onPress={() => router.push('/tools')}>
          <Text style={styles.secondaryLabel} lightColor="#18181b" darkColor="#fafafa">
            {t('sos.secondary')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#f43f5e',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    gap: 12,
  },
  primaryAction: {
    borderRadius: 24,
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  primaryLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryAction: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  secondaryLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
