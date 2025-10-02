import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from '@/components/Themed';
import '@/lib/i18n';

type ProgressMetric = {
  id: string;
  label: string;
  value: string;
};

export default function ProgressScreen() {
  const { t } = useTranslation();
  const metrics = useMemo(() => t('progress.metrics', { returnObjects: true }) as ProgressMetric[], [t]);

  return (
    <View className="flex-1 gap-4 px-6 py-10">
      <Text className="text-3xl font-semibold">{t('progress.title')}</Text>
      <Text className="text-base text-zinc-600 dark:text-zinc-300">{t('progress.subtitle')}</Text>

      <View className="mt-4 gap-3">
        {metrics.map((metric) => (
          <View
            key={metric.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <Text className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {metric.label}
            </Text>
            <Text className="mt-1 text-2xl font-semibold">{metric.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
