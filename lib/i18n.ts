import * as Localization from 'expo-localization';
import i18n from 'i18next';
import type { TOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from '../i18n/ar.json';
import da from '../i18n/da.json';
import en from '../i18n/en.json';
import fr from '../i18n/fr.json';

type TranslationDictionary = Record<string, unknown>;

type TranslationResources = {
  [lng: string]: {
    translation: TranslationDictionary;
  };
};

export const SUPPORTED_LANGUAGES = ['en', 'ar', 'fr', 'da'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
const RTL_LANGUAGES = new Set<SupportedLanguage>(['ar', 'da']);

const resources: TranslationResources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
  fr: {
    translation: fr,
  },
  da: {
    translation: da,
  },
};

const languageMap: Record<string, SupportedLanguage> = {
  en: 'en',
  ar: 'ar',
  fr: 'fr',
  da: 'da',
};

let currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;
let initialized = false;

const resolveBestLanguage = (): SupportedLanguage => {
  const locales = Localization.getLocales();
  for (const locale of locales) {
    const code = locale.languageCode?.toLowerCase();
    if (code && languageMap[code]) {
      return languageMap[code];
    }
  }

  return DEFAULT_LANGUAGE;
};

const applyDirection = (language: SupportedLanguage) => {
  const shouldUseRTL = RTL_LANGUAGES.has(language);

  I18nManager.allowRTL(shouldUseRTL);
  I18nManager.forceRTL(shouldUseRTL);
  I18nManager.swapLeftAndRightInRTL(true);
};

export const ensureI18n = () => {
  if (initialized) {
    return i18n;
  }

  const lng = resolveBestLanguage();

  i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: DEFAULT_LANGUAGE,
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

  applyDirection(lng);
  currentLanguage = lng;
  initialized = true;

  return i18n;
};

ensureI18n();

export const getCurrentLanguage = () => currentLanguage;
export const isLanguageRTL = (language: SupportedLanguage) => RTL_LANGUAGES.has(language);

export const setAppLanguage = async (language: SupportedLanguage) => {
  const target = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
  if (target === currentLanguage) {
    return;
  }

  await i18n.changeLanguage(target);
  currentLanguage = target;
  applyDirection(target);
};

export const t = (key: string, options?: TOptions) => {
  return ensureI18n().t(key, options);
};

export default i18n;


