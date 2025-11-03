export type AppLanguage = 'pt' | 'en' | 'it' | 'ua' | 'es';

export const SUPPORTED_APP_LANGS: AppLanguage[] = ['pt', 'en', 'it', 'ua', 'es'];

const APP_TO_I18N_MAP: Record<AppLanguage, string> = {
  pt: 'pt',
  en: 'en',
  it: 'it',
  ua: 'uk', // BCP-47 code for Ukrainian is "uk"
  es: 'es',
};

const I18N_TO_APP_MAP: Record<string, AppLanguage> = {
  pt: 'pt',
  'pt-PT': 'pt',
  en: 'en',
  'en-US': 'en',
  it: 'it',
  'it-IT': 'it',
  uk: 'ua',
  'uk-UA': 'ua',
  es: 'es',
  'es-ES': 'es',
};

export function normalizeAppLang(lang: string | undefined | null): AppLanguage {
  const lower = (lang || '').toLowerCase();
  if (SUPPORTED_APP_LANGS.includes(lower as AppLanguage)) {
    return lower as AppLanguage;
  }
  return 'pt';
}

export function toI18nLang(appLang: AppLanguage): string {
  return APP_TO_I18N_MAP[appLang];
}

export function fromI18nLang(i18nLang: string): AppLanguage {
  const lower = i18nLang.toLowerCase();
  return I18N_TO_APP_MAP[lower] || 'pt';
}

export function isRtlLanguage(_appLang: AppLanguage): boolean {
  return false; // No RTL languages in current set
}

export function getCurrentI18nLang(): string {
  // Prefer i18next stored lang, then <html lang>, then default
  try {
    const stored = localStorage.getItem('i18nextLng');
    if (stored) return stored;
  } catch {}
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang) return htmlLang;
  }
  return 'pt';
}

export function getDefaultAppLang(): AppLanguage {
  // Get the current i18n language and convert it to app language
  const i18nLang = getCurrentI18nLang();
  return fromI18nLang(i18nLang);
}

/** Choose localized description by app language with sensible fallbacks. */
export function pickLocalizedDescription(
  record: { [k: string]: any },
  appLang: AppLanguage,
  baseKey: string = 'description'
): string | undefined {
  const langForKey = appLang === 'ua' ? 'uk' : appLang;
  const langKey = `${baseKey}_${langForKey}`;
  const direct = record[langKey];
  if (typeof direct === 'string' && direct.trim()) return direct;

  // fallback order: pt -> en -> it -> es -> uk -> plain description
  const fallbacks: Array<AppLanguage | 'uk'> = ['pt', 'en', 'it', 'es', 'ua', 'uk'];
  for (const fb of fallbacks) {
    const fbKey = fb === 'ua' ? 'uk' : fb;
    const v = record[`${baseKey}_${fbKey}`];
    if (typeof v === 'string' && v.trim()) return v;
  }
  const plain = record[baseKey];
  return typeof plain === 'string' && plain.trim() ? plain : undefined;
}


