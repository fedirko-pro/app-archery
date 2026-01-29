import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
import itCommon from './locales/it/common.json';
import ptCommon from './locales/pt/common.json';
import ukCommon from './locales/uk/common.json';
import { SUPPORTED_APP_LANGS, toI18nLang } from './utils/i18n-lang';

const resources = {
  en: { common: enCommon },
  pt: { common: ptCommon },
  it: { common: itCommon },
  uk: { common: ukCommon },
  es: { common: esCommon },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_APP_LANGS.map(toI18nLang),
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
  });

export default i18n;


