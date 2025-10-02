import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from '@/components/Themed';
import '@/lib/i18n';

type Lesson = {
  id: string;
  title: string;
  summary: string;
};

export default function LearnScreen() {
  const { t } = useTranslation();
  const lessons = useMemo(() => t('learn.lessons', { returnObjects: true }) as Lesson[], [t]);

  return (
    <View className="flex-1 gap-4 px-6 py-10">
      <Text className="text-3xl font-semibold">{t('learn.title')}</Text>
      <Text className="text-base text-zinc-600 dark:text-zinc-300">{t('learn.subtitle')}</Text>

      <View className="mt-4 gap-3">
        {lessons.map((lesson) => (
          <View
            key={lesson.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <Text className="text-lg font-semibold">{lesson.title}</Text>
            <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{lesson.summary}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
