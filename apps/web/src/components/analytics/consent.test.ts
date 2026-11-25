import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  getConsent,
  isConsentSettingsOpen,
  openConsentSettings,
  parseStoredConsent,
  resetConsentStateForTests,
  saveConsent,
  subscribeConsent,
} from './consent';

describe('cookie consent storage', () => {
  beforeEach(() => {
    localStorage.clear();
    resetConsentStateForTests();
  });

  it('parses only valid records of the current version', () => {
    expect(parseStoredConsent(null)).toBe('unknown');
    expect(parseStoredConsent('not json')).toBe('unknown');
    expect(parseStoredConsent('null')).toBe('unknown');
    expect(parseStoredConsent(JSON.stringify({ v: CONSENT_VERSION, analytics: 'maybe' }))).toBe(
      'unknown',
    );
    expect(
      parseStoredConsent(JSON.stringify({ v: CONSENT_VERSION - 1, analytics: 'granted' })),
    ).toBe('unknown');
    expect(parseStoredConsent(JSON.stringify({ v: CONSENT_VERSION, analytics: 'granted' }))).toBe(
      'granted',
    );
    expect(parseStoredConsent(JSON.stringify({ v: CONSENT_VERSION, analytics: 'denied' }))).toBe(
      'denied',
    );
  });

  it('starts unknown and persists a versioned choice', () => {
    expect(getConsent()).toBe('unknown');
    saveConsent('granted');
    expect(getConsent()).toBe('granted');

    const stored = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}');
    expect(stored).toMatchObject({ v: CONSENT_VERSION, analytics: 'granted' });
    expect(typeof stored.at).toBe('string');

    resetConsentStateForTests();
    expect(getConsent()).toBe('granted');
  });

  it('re-opens settings and closes them when a choice is saved', () => {
    const listener = vi.fn();
    subscribeConsent(listener);
    saveConsent('denied');
    openConsentSettings();
    expect(isConsentSettingsOpen()).toBe(true);

    saveConsent('granted');
    expect(isConsentSettingsOpen()).toBe(false);
    expect(getConsent()).toBe('granted');
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
