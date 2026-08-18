const OG_LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  'en-us': 'en_US',
  'en-gb': 'en_US',
  ua: 'uk_UA',
  uk: 'uk_UA',
  'uk-ua': 'uk_UA',
  pt: 'pt_PT',
  'pt-pt': 'pt_PT',
  'pt-br': 'pt_PT',
  it: 'it_IT',
  'it-it': 'it_IT',
  es: 'es_ES',
  'es-es': 'es_ES',
  de: 'de_DE',
  'de-de': 'de_DE',
};

const ALL_OG_LOCALES = ['en_US', 'uk_UA', 'pt_PT', 'it_IT', 'es_ES', 'de_DE'];

export function toOgLocale(lang: string | undefined | null): string {
  const lower = (lang || '').toLowerCase();
  return OG_LOCALE_MAP[lower] || OG_LOCALE_MAP[lower.split('-')[0]] || OG_LOCALE_MAP.en;
}

export function alternateOgLocales(lang: string | undefined | null): string[] {
  const current = toOgLocale(lang);
  return ALL_OG_LOCALES.filter((locale) => locale !== current);
}
