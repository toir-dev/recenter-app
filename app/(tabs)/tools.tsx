import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from '@/components/Themed';
import '@/lib/i18n';

type ToolItem = {
  id: string;
  title: string;
  description: string;
};

export default function ToolsScreen() {
  const { t } = useTranslation();
  const items = useMemo(() => t('tools.items', { returnObjects: true }) as ToolItem[], [t]);

  return (
    <View className="flex-1 gap-4 px-6 py-10">
      <Text className="text-3xl font-semibold">{t('tools.title')}</Text>
      <Text className="text-base text-zinc-600 dark:text-zinc-300">{t('tools.subtitle')}</Text>
      <View className="mt-4 gap-3">
        {items.map((item) => (
          <View
            key={item.id}
            className="rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
            <Text className="text-lg font-medium">{item.title}</Text>
            <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{item.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
