import { describe, expect, it } from 'vitest';

import {
  normalizeAppLang,
  pickLocalizedDescription,
  toI18nLang,
  fromI18nLang,
} from './i18n-lang';

describe('normalizeAppLang', () => {
  it('returns supported language as-is (lowercase)', () => {
    expect(normalizeAppLang('en')).toBe('en');
    expect(normalizeAppLang('pt')).toBe('pt');
    expect(normalizeAppLang('PT')).toBe('pt');
    expect(normalizeAppLang('UA')).toBe('ua');
  });

  it('returns "pt" for unsupported or empty', () => {
    expect(normalizeAppLang('fr')).toBe('pt');
    expect(normalizeAppLang('')).toBe('pt');
    expect(normalizeAppLang(undefined)).toBe('pt');
    expect(normalizeAppLang(null as unknown as string)).toBe('pt');
  });
});

describe('toI18nLang', () => {
  it('maps app language to i18n code', () => {
    expect(toI18nLang('en')).toBe('en');
    expect(toI18nLang('ua')).toBe('uk');
    expect(toI18nLang('pt')).toBe('pt');
  });
});

describe('fromI18nLang', () => {
  it('maps i18n code to app language', () => {
    expect(fromI18nLang('en')).toBe('en');
    expect(fromI18nLang('uk')).toBe('ua');
    expect(fromI18nLang('uk-UA')).toBe('ua');
  });
});

describe('pickLocalizedDescription', () => {
  it('returns description for requested language when present', () => {
    const record = {
      description_en: 'Hello',
      description_pt: 'Olá',
    };
    expect(pickLocalizedDescription(record, 'en')).toBe('Hello');
    expect(pickLocalizedDescription(record, 'pt')).toBe('Olá');
  });

  it('maps ua to uk key', () => {
    const record = { description_uk: 'Привіт' };
    expect(pickLocalizedDescription(record, 'ua')).toBe('Привіт');
  });

  it('falls back to base description when lang key missing', () => {
    const record = { description: 'Default' };
    expect(pickLocalizedDescription(record, 'en')).toBe('Default');
  });

  it('returns undefined for empty or missing', () => {
    expect(pickLocalizedDescription({}, 'en')).toBeUndefined();
    expect(pickLocalizedDescription({ description_en: '  ' }, 'en')).toBeUndefined();
  });
});
