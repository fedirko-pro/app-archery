import { describe, expect, it } from 'vitest';

import { alternateOgLocales, toOgLocale } from './og-locale';

describe('toOgLocale', () => {
  it('maps app language codes', () => {
    expect(toOgLocale('en')).toBe('en_US');
    expect(toOgLocale('ua')).toBe('uk_UA');
    expect(toOgLocale('uk')).toBe('uk_UA');
    expect(toOgLocale('pt')).toBe('pt_PT');
    expect(toOgLocale('it')).toBe('it_IT');
    expect(toOgLocale('es')).toBe('es_ES');
    expect(toOgLocale('de')).toBe('de_DE');
  });

  it('maps BCP-47 variants', () => {
    expect(toOgLocale('pt-BR')).toBe('pt_PT');
    expect(toOgLocale('uk-UA')).toBe('uk_UA');
    expect(toOgLocale('en-US')).toBe('en_US');
  });

  it('falls back to en_US for unknown or empty values', () => {
    expect(toOgLocale(undefined)).toBe('en_US');
    expect(toOgLocale(null)).toBe('en_US');
    expect(toOgLocale('')).toBe('en_US');
    expect(toOgLocale('fr')).toBe('en_US');
  });
});

describe('alternateOgLocales', () => {
  it('excludes the current locale', () => {
    expect(alternateOgLocales('ua')).toEqual(['en_US', 'pt_PT', 'it_IT', 'es_ES', 'de_DE']);
    expect(alternateOgLocales('en')).toEqual(['uk_UA', 'pt_PT', 'it_IT', 'es_ES', 'de_DE']);
  });
});
