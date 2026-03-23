import { getCurrentI18nLang } from './i18n-lang';

export const DEFAULT_COUNTRY_CODE = 'PT';
// v2: avoid being stuck on old auto-detected values (e.g. en-US -> US)
export const TOURNAMENTS_COUNTRY_STORAGE_KEY = 'tournaments.countryCode.v2';
export const TOURNAMENTS_FEDERATION_STORAGE_KEY = 'tournaments.federationId';

const APP_LANG_TO_COUNTRY: Record<string, string> = {
  pt: 'PT',
  'pt-pt': 'PT',
  'pt-br': 'BR', // If supporting Brazil
  it: 'IT',
  'it-it': 'IT',
  es: 'ES',
  'es-es': 'ES',
  'es-mx': 'MX', // If supporting Mexico
  uk: 'UA',
  'uk-ua': 'UA',
  en: 'GB', // Default to UK for English
  'en-gb': 'GB',
  'en-us': 'US',
  fr: 'FR',
  'fr-fr': 'FR',
  de: 'DE',
  'de-de': 'DE',
};

function countryFromLanguageHint(lang: string): string | null {
  const raw = (lang || '').toLowerCase();
  const base = raw.split('-')[0];
  return APP_LANG_TO_COUNTRY[raw] ?? APP_LANG_TO_COUNTRY[base] ?? null;
}

export function detectCountryCodeFromLocale(): string {
  // Prefer app/i18n language hint first (since we don't do IP geo)
  const i18nLang = getCurrentI18nLang();
  const fromLang = countryFromLanguageHint(i18nLang);
  if (fromLang) return fromLang;

  const locale = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || '';
  const re = /[-_](?<region>[a-z]{2}|\d{3})\b/i;
  const match = re.exec(locale);
  const region = match?.groups?.region;
  if (!region) return DEFAULT_COUNTRY_CODE;

  // If numeric region (e.g., "en-001"), treat as unknown and fallback.
  if (/^\d+$/.test(region)) return DEFAULT_COUNTRY_CODE;

  return region.toUpperCase();
}

export function getInitialTournamentCountryCode(): string {
  const saved = localStorage.getItem(TOURNAMENTS_COUNTRY_STORAGE_KEY);
  if (saved && /^[A-Z]{2}$/.test(saved)) return saved;
  return detectCountryCodeFromLocale();
}

export function saveTournamentCountryCode(code: string): void {
  if (code) localStorage.setItem(TOURNAMENTS_COUNTRY_STORAGE_KEY, code);
  else localStorage.removeItem(TOURNAMENTS_COUNTRY_STORAGE_KEY);
}

export function getInitialTournamentFederationId(): string | null {
  return localStorage.getItem(TOURNAMENTS_FEDERATION_STORAGE_KEY);
}

export function saveTournamentFederationId(id: string | null): void {
  if (id) localStorage.setItem(TOURNAMENTS_FEDERATION_STORAGE_KEY, id);
  else localStorage.removeItem(TOURNAMENTS_FEDERATION_STORAGE_KEY);
}
