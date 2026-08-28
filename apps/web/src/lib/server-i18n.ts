import deCommon from '@/locales/de/common.json';
import enCommon from '@/locales/en/common.json';
import esCommon from '@/locales/es/common.json';
import itCommon from '@/locales/it/common.json';
import ptCommon from '@/locales/pt/common.json';
import ukCommon from '@/locales/uk/common.json';
import { normalizeAppLang, toI18nLang } from '@/utils/i18n-lang';

type Bundle = Record<string, unknown>;

const BUNDLES: Record<string, Bundle> = {
  en: enCommon,
  pt: ptCommon,
  it: itCommon,
  uk: ukCommon,
  es: esCommon,
  de: deCommon,
};

export type ServerTranslate = (key: string, vars?: Record<string, string | number>) => string;

function lookup(bundle: Bundle, key: string): string | undefined {
  let current: unknown = bundle;
  for (const part of key.split('.')) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    current = (current as Bundle)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(value: string, vars?: Record<string, string | number>): string {
  if (!vars) {
    return value;
  }
  return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * Translator for server-rendered metadata, where the browser i18next instance is
 * unavailable. Falls back to English, then to the key itself.
 */
export function createServerTranslate(lang: string | undefined | null): ServerTranslate {
  const bundle = BUNDLES[toI18nLang(normalizeAppLang(lang))] ?? enCommon;

  return (key, vars) => {
    const value = lookup(bundle, key) ?? lookup(enCommon, key);
    return value === undefined ? key : interpolate(value, vars);
  };
}
