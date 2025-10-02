import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, TextInput } from 'react-native';

import { Text, View } from '@/components/Themed';
import '@/lib/i18n';

export default function JournalScreen() {
  const { t } = useTranslation();
  const [entry, setEntry] = useState('');
  const isRTL = I18nManager.isRTL;

  return (
    <View className="flex-1 gap-4 px-6 py-10">
      <Text className="text-3xl font-semibold">{t('journal.title')}</Text>
      <Text className="text-base text-zinc-600 dark:text-zinc-300">{t('journal.subtitle')}</Text>

      <TextInput
        multiline
        value={entry}
        onChangeText={setEntry}
        placeholder={t('journal.placeholder')}
        placeholderTextColor="#9ca3af"
        style={{
          borderRadius: 24,
          borderWidth: 1,
          borderColor: '#d4d4d8',
          paddingHorizontal: 20,
          paddingVertical: 16,
          minHeight: 200,
          textAlignVertical: 'top',
          fontSize: 16,
          backgroundColor: '#ffffff',
          textAlign: isRTL ? 'right' : 'left',
          writingDirection: isRTL ? 'rtl' : 'ltr',
        }}
      />
    </View>
  );
}
