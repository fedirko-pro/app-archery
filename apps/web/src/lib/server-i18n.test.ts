import { describe, expect, it } from 'vitest';

import { createServerTranslate } from './server-i18n';

describe('createServerTranslate', () => {
  it('resolves a nested key in English', () => {
    expect(createServerTranslate('en')('achievements.streak2Weeks.title')).toBe('Warming Up');
  });

  it('resolves keys for non-English languages', () => {
    expect(createServerTranslate('de')('achievements.streak2Weeks.title')).toBe('Aufwärmen');
    expect(createServerTranslate('pt')('achievements.streak2Weeks.title')).toBe('Aquecimento');
  });

  it('maps the app language "ua" to the "uk" bundle', () => {
    expect(createServerTranslate('ua')('achievements.streak2Weeks.title')).toBe('Розминка');
  });

  it('falls back to English for an unsupported language', () => {
    expect(createServerTranslate('fr')('achievements.streak2Weeks.title')).toBe('Warming Up');
    expect(createServerTranslate(undefined)('achievements.streak2Weeks.title')).toBe('Warming Up');
  });

  it('returns the key itself when it is missing everywhere', () => {
    expect(createServerTranslate('en')('achievements.nope.title')).toBe('achievements.nope.title');
  });

  it('does not return objects for partial keys', () => {
    expect(createServerTranslate('en')('achievements.streak2Weeks')).toBe(
      'achievements.streak2Weeks',
    );
  });

  it('interpolates variables', () => {
    expect(createServerTranslate('en')('progressShare.shareText', { earned: 3, total: 12 })).toBe(
      '3 of 12 achievements unlocked',
    );
  });

  it('leaves placeholders untouched when no variable is supplied', () => {
    expect(createServerTranslate('en')('publicProfile.shareText')).toBe('{{name}} on Sokil');
  });
});
