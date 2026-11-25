'use client';

/**
 * Cookie consent for analytics, stored on the device.
 *
 * The choice lives in localStorage under a versioned record. Bump CONSENT_VERSION
 * when what we ask for changes (for example a new purpose), so everyone is asked again.
 */

export const CONSENT_STORAGE_KEY = 'sokil_cookie_consent';
export const CONSENT_VERSION = 1;

export type ConsentChoice = 'granted' | 'denied';
export type ConsentState = ConsentChoice | 'unknown';

interface StoredConsent {
  v: number;
  analytics: ConsentChoice;
  at: string;
}

let cached: ConsentState | null = null;
let settingsOpen = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function parseStoredConsent(raw: string | null): ConsentState {
  if (!raw) return 'unknown';
  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsent> | null;
    if (
      parsed &&
      parsed.v === CONSENT_VERSION &&
      (parsed.analytics === 'granted' || parsed.analytics === 'denied')
    ) {
      return parsed.analytics;
    }
  } catch {
    // malformed value: ask again
  }
  return 'unknown';
}

function readStoredConsent(): ConsentState {
  if (typeof window === 'undefined') return 'unknown';
  try {
    return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return 'unknown';
  }
}

export function getConsent(): ConsentState {
  if (cached === null) {
    cached = readStoredConsent();
  }
  return cached;
}

export function saveConsent(choice: ConsentChoice): void {
  cached = choice;
  settingsOpen = false;
  if (typeof window !== 'undefined') {
    try {
      const record: StoredConsent = {
        v: CONSENT_VERSION,
        analytics: choice,
        at: new Date().toISOString(),
      };
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // storage unavailable: the choice still applies for this page view
    }
  }
  notify();
}

export function isConsentSettingsOpen(): boolean {
  return settingsOpen;
}

/** Re-open the banner so the visitor can change an earlier choice. */
export function openConsentSettings(): void {
  if (!settingsOpen) {
    settingsOpen = true;
    notify();
  }
}

export function closeConsentSettings(): void {
  if (settingsOpen) {
    settingsOpen = false;
    notify();
  }
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Remove Google Analytics cookies (_ga, _ga_<id>) for this site after consent is withdrawn. */
export function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined') return;
  const names = document.cookie
    .split(';')
    .map((part) => part.split('=')[0]?.trim() ?? '')
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid');
  if (names.length === 0) return;

  const host = window.location.hostname;
  const parts = host.split('.');
  const domains = new Set<string>(['', host]);
  for (let i = 1; i < parts.length - 1; i++) {
    domains.add(`.${parts.slice(i).join('.')}`);
  }
  domains.add(`.${host}`);

  for (const name of names) {
    for (const domain of domains) {
      const domainAttr = domain ? `; domain=${domain}` : '';
      // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available in Safari/Firefox
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}`;
    }
  }
}

export function resetConsentStateForTests(): void {
  cached = null;
  settingsOpen = false;
  listeners.clear();
}
