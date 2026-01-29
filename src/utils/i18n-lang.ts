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
  return (
    I18N_TO_APP_MAP[lower] ||
    I18N_TO_APP_MAP[lower.split('-')[0]] ||
    'pt'
  );
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

/**
 * Choose localized description by app language with sensible fallbacks.
 * Supports both snake_case (description_en) and camelCase (descriptionEn) formats.
 */
export function pickLocalizedDescription(
  record: Record<string, unknown>,
  appLang: AppLanguage,
  baseKey: string = 'description'
): string | undefined {
  const langForKey = appLang === 'ua' ? 'uk' : appLang;

  // Try camelCase format first (e.g., descriptionEn)
  const camelCaseKey = baseKey + langForKey.charAt(0).toUpperCase() + langForKey.slice(1);
  const camelCaseDirect = record[camelCaseKey];
  if (typeof camelCaseDirect === 'string' && camelCaseDirect.trim()) return camelCaseDirect;

  // Try snake_case format (e.g., description_en) for backward compatibility
  const snakeCaseKey = `${baseKey}_${langForKey}`;
  const snakeCaseDirect = record[snakeCaseKey];
  if (typeof snakeCaseDirect === 'string' && snakeCaseDirect.trim()) return snakeCaseDirect;

  // fallback order: pt -> en -> it -> es -> uk -> plain description
  const fallbacks: Array<AppLanguage | 'uk'> = ['pt', 'en', 'it', 'es', 'ua', 'uk'];
  for (const fb of fallbacks) {
    const fbKey = fb === 'ua' ? 'uk' : fb;

    // Try camelCase format
    const camelFallbackKey = baseKey + fbKey.charAt(0).toUpperCase() + fbKey.slice(1);
    const camelFallback = record[camelFallbackKey];
    if (typeof camelFallback === 'string' && camelFallback.trim()) return camelFallback;

    // Try snake_case format
    const snakeFallbackKey = `${baseKey}_${fbKey}`;
    const snakeFallback = record[snakeFallbackKey];
    if (typeof snakeFallback === 'string' && snakeFallback.trim()) return snakeFallback;
  }
  const plain = record[baseKey];
  return typeof plain === 'string' && plain.trim() ? plain : undefined;
}


