import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, ScrollView, Text, View } from 'react-native';

import { Text as ThemedText } from '@/components/Themed';
import { setAppLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';
import { BreathCircle, Button, Card, ListItem, ProgressBar, ToggleRow } from '@/src/components/ui';
import { useAuth } from '@/src/state';
import { themePalettes, type ThemeName } from '@/src/theme';

const previewThemes: ThemeName[] = ['light', 'dark'];

type GalleryItem = {
  id: string;
  title: string;
  subtitle: string;
};

type LanguageEntry = {
  label: string;
  native: string;
};

const normalizeLanguage = (value: string | undefined): SupportedLanguage => {
  if (!value) {
    return 'en';
  }
  const match = SUPPORTED_LANGUAGES.find((lng) => value.startsWith(lng));
  return match ?? 'en';
};

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const [toggleState, setToggleState] = useState<Record<ThemeName, boolean>>({
    light: true,
    dark: false,
  });
  const [signingOut, setSigningOut] = useState(false);

  const currentLanguage = normalizeLanguage(i18n.language);
  const isRTL = I18nManager.isRTL;

  const galleryItems = useMemo(
    () => t('home.gallery.items', { returnObjects: true }) as GalleryItem[],
    [t]
  );

  const languageEntries = useMemo(
    () => t('languages', { returnObjects: true }) as Record<string, LanguageEntry>,
    [t]
  );

  const signOut = useAuth((state) => state.signOut);
  const user = useAuth((state) => state.user);
  const profile = useAuth((state) => state.profile);
  const profileError = useAuth((state) => state.profileError);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, gap: 32 }}
      showsVerticalScrollIndicator={false}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <View style={{ gap: 8 }}>
        <ThemedText className="text-3xl font-semibold">{t('home.gallery.title')}</ThemedText>
        <ThemedText className="text-base text-zinc-600 dark:text-zinc-300">
          {t('home.gallery.subtitle')}
        </ThemedText>
      </View>

      {previewThemes.map((theme) => {
        const palette = themePalettes[theme];
        const isDark = theme === 'dark';

        return (
          <View
            key={theme}
            style={{
              borderRadius: 32,
              borderWidth: 1,
              borderColor: palette.outline,
              backgroundColor: palette.surface,
              padding: 24,
              gap: 20,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: palette.text,
              }}>
              {isDark ? t('home.gallery.themeDark') : t('home.gallery.themeLight')}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
              <Button
                label={t('home.gallery.buttons.primary')}
                theme={theme}
                variant="primary"
                style={{ flexGrow: 1 }}
              />
              <Button
                label={t('home.gallery.buttons.secondary')}
                theme={theme}
                variant="secondary"
                style={{ flexGrow: 1 }}
              />
              <Button
                label={t('home.gallery.buttons.outline')}
                theme={theme}
                variant="outline"
                style={{ flexGrow: 1 }}
              />
            </View>

            <Card
              theme={theme}
              title={t('home.gallery.cardTitle')}
              subtitle={t('home.gallery.cardSubtitle')}>
              {galleryItems.map((item) => (
                <ListItem
                  key={`${theme}-${item.id}`}
                  theme={theme}
                  title={item.title}
                  subtitle={item.subtitle}
                  trailing={<Text style={{ color: palette.primary, fontSize: 18 }}>{'>'}</Text>}
                />
              ))}
            </Card>

            <ToggleRow
              theme={theme}
              label={t('home.gallery.toggle.label')}
              description={t('home.gallery.toggle.description')}
              value={toggleState[theme]}
              onValueChange={(value) =>
                setToggleState((prev) => ({
                  ...prev,
                  [theme]: value,
                }))
              }
            />

            <ProgressBar
              theme={theme}
              label={t('home.gallery.progress.label')}
              progress={isDark ? 0.42 : 0.68}
            />

            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <BreathCircle theme={theme} />
            </View>
          </View>
        );
      })}

      <Card theme="light" title={t('dev.languageCard.title')} subtitle={t('dev.languageCard.subtitle')}>
        {SUPPORTED_LANGUAGES.map((code) => {
          const entry = languageEntries[code];
          const isActive = currentLanguage === code;

          return (
            <ListItem
              key={code}
              theme="light"
              title={entry?.label ?? code.toUpperCase()}
              subtitle={entry?.native ?? code.toUpperCase()}
              onPress={() => {
                void setAppLanguage(code);
              }}
              trailing={
                isActive ? (
                  <Text style={{ color: themePalettes.light.primary, fontSize: 16 }}>?</Text>
                ) : undefined
              }
            />
          );
        })}
      </Card>

      <Card
        theme="light"
        title={t('auth.account.title')}
        subtitle={t('auth.account.subtitle')}>
        <ListItem
          theme="light"
          title={profile?.display_name ?? user?.email ?? t('auth.account.unknownUser')}
          subtitle={user?.email ?? undefined}
        />
        <Button
          label={signingOut ? t('auth.account.signingOut') : t('auth.account.signOut')}
          onPress={handleSignOut}
          variant="outline"
          disabled={signingOut}
          className="mt-4"
        />
        {profileError ? (
          <Text style={{ marginTop: 12, fontSize: 12, color: '#b91c1c' }}>{profileError}</Text>
        ) : null}
      </Card>
    </ScrollView>
  );
}

