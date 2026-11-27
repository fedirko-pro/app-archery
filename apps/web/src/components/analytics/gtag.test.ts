import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type GtagModule = typeof import('./gtag');

async function loadGtag(siteMode: 'prod' | 'test' = 'prod'): Promise<GtagModule> {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_SITE_MODE', siteMode);
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID', 'G-TEST123');
  return import('./gtag');
}

function eventCalls(): unknown[][] {
  return (window.dataLayer as ArrayLike<unknown>[])
    .map((entry) => Array.from(entry))
    .filter((args) => args[0] === 'event');
}

describe('analytics helpers', () => {
  beforeEach(() => {
    window.dataLayer = [];
    delete window.gtag;
    delete (window as unknown as Record<string, unknown>)['ga-disable-G-TEST123'];
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('isAdminPath', () => {
    it('matches admin routes with or without a locale prefix', async () => {
      const { isAdminPath } = await loadGtag();
      expect(isAdminPath('/admin')).toBe(true);
      expect(isAdminPath('/admin/users')).toBe(true);
      expect(isAdminPath('/en/admin')).toBe(true);
      expect(isAdminPath('/ua/admin/access-control')).toBe(true);
      expect(isAdminPath('/pt-BR/admin/users')).toBe(true);
    });

    it('does not match other routes', async () => {
      const { isAdminPath } = await loadGtag();
      expect(isAdminPath('/en/home')).toBe(false);
      expect(isAdminPath('/en/administration')).toBe(false);
      expect(isAdminPath('/en/trainings/admin')).toBe(false);
      expect(isAdminPath('/')).toBe(false);
    });
  });

  it('excludes admin-capable roles and admin paths', async () => {
    const { isAnalyticsExcluded } = await loadGtag();
    expect(isAnalyticsExcluded('/en/home', 'general_admin')).toBe(true);
    expect(isAnalyticsExcluded('/en/home', 'club_admin')).toBe(true);
    expect(isAnalyticsExcluded('/en/home', 'federation_admin')).toBe(true);
    expect(isAnalyticsExcluded('/en/admin/users', 'user')).toBe(true);
    expect(isAnalyticsExcluded('/en/home', 'user')).toBe(false);
    expect(isAnalyticsExcluded('/en/about', null)).toBe(false);
  });

  it('detects recent sign-ups from createdAt', async () => {
    const { isRecentSignUp } = await loadGtag();
    const now = Date.parse('2026-11-25T14:00:00Z');
    expect(isRecentSignUp('2026-11-25T13:58:00Z', now)).toBe(true);
    expect(isRecentSignUp('2026-11-25T13:00:00Z', now)).toBe(false);
    expect(isRecentSignUp(undefined, now)).toBe(false);
    expect(isRecentSignUp('not-a-date', now)).toBe(false);
  });

  it('does nothing outside prod', async () => {
    const { setAnalyticsConsent, setAnalyticsExcluded, trackEvent } = await loadGtag('test');
    setAnalyticsConsent('granted');
    setAnalyticsExcluded(false);
    trackEvent('login', { method: 'email' });
    expect(window.dataLayer).toHaveLength(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('asks for consent whenever a GA ID is configured, even outside prod', async () => {
    const { isConsentRequired } = await loadGtag('test');
    expect(isConsentRequired).toBe(true);
  });

  it('queues events until access is allowed, then configures and flushes', async () => {
    const { getAnalyticsAccess, setAnalyticsConsent, setAnalyticsExcluded, trackEvent } =
      await loadGtag();
    expect(getAnalyticsAccess()).toBe('pending');

    trackEvent('sign_up', { method: 'google' });
    expect(eventCalls()).toHaveLength(0);

    setAnalyticsExcluded(false);
    expect(getAnalyticsAccess()).toBe('pending');
    expect(eventCalls()).toHaveLength(0);

    setAnalyticsConsent('granted');
    const commands = (window.dataLayer as ArrayLike<unknown>[]).map((entry) => Array.from(entry));
    expect(commands.map((args) => args[0])).toEqual([
      'consent',
      'consent',
      'js',
      'config',
      'event',
    ]);
    expect(commands[0]).toEqual([
      'consent',
      'default',
      {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      },
    ]);
    expect(commands[1]).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);
    expect(commands[4]).toEqual(['event', 'sign_up', { method: 'google' }]);
    expect(getAnalyticsAccess()).toBe('allowed');
  });

  it('sends events directly when allowed and drops undefined params', async () => {
    const { setAnalyticsConsent, setAnalyticsExcluded, trackEvent } = await loadGtag();
    setAnalyticsConsent('granted');
    setAnalyticsExcluded(false);
    trackEvent('training_session_logged', {
      shots_count: 36,
      arrows_per_set: undefined,
      has_score: true,
      has_mood: false,
    });
    expect(eventCalls()).toEqual([
      ['event', 'training_session_logged', { shots_count: 36, has_score: true, has_mood: false }],
    ]);
  });

  it('drops events and disables GA when excluded', async () => {
    const { setAnalyticsConsent, setAnalyticsExcluded, trackEvent } = await loadGtag();
    setAnalyticsConsent('granted');
    trackEvent('login', { method: 'email' });
    setAnalyticsExcluded(true);
    trackEvent('login', { method: 'email' });
    expect(eventCalls()).toHaveLength(0);
    expect(sessionStorage.length).toBe(0);
    expect((window as unknown as Record<string, unknown>)['ga-disable-G-TEST123']).toBe(true);

    setAnalyticsExcluded(false);
    expect((window as unknown as Record<string, unknown>)['ga-disable-G-TEST123']).toBe(false);
    expect(eventCalls()).toHaveLength(0);
  });

  it('skips auth events for admin users and excludes them', async () => {
    const { getAnalyticsAccess, setAnalyticsConsent, setAnalyticsExcluded, trackAuthEvent } =
      await loadGtag();
    setAnalyticsConsent('granted');
    setAnalyticsExcluded(false);
    trackAuthEvent('login', 'email', { role: 'general_admin' });
    expect(eventCalls()).toHaveLength(0);
    expect(getAnalyticsAccess()).toBe('excluded');
  });

  it('tracks auth events for regular users', async () => {
    const { setAnalyticsConsent, setAnalyticsExcluded, trackAuthEvent } = await loadGtag();
    setAnalyticsConsent('granted');
    setAnalyticsExcluded(false);
    trackAuthEvent('login', 'email', { role: 'user' });
    expect(eventCalls()).toEqual([['event', 'login', { method: 'email' }]]);
  });

  describe('cookie consent', () => {
    it('combines consent and the admin decision', async () => {
      const { resolveAnalyticsAccess } = await loadGtag();
      expect(resolveAnalyticsAccess('allowed', 'granted')).toBe('allowed');
      expect(resolveAnalyticsAccess('allowed', 'unknown')).toBe('pending');
      expect(resolveAnalyticsAccess('pending', 'granted')).toBe('pending');
      expect(resolveAnalyticsAccess('allowed', 'denied')).toBe('excluded');
      expect(resolveAnalyticsAccess('pending', 'denied')).toBe('excluded');
      expect(resolveAnalyticsAccess('excluded', 'granted')).toBe('excluded');
      expect(resolveAnalyticsAccess('excluded', 'unknown')).toBe('excluded');
    });

    it('never configures GA or sends events without consent', async () => {
      const { getAnalyticsAccess, setAnalyticsExcluded, trackEvent } = await loadGtag();
      setAnalyticsExcluded(false);
      trackEvent('login', { method: 'email' });
      const commands = (window.dataLayer as ArrayLike<unknown>[]).map((e) => Array.from(e)[0]);
      expect(commands).not.toContain('config');
      expect(commands).not.toContain('event');
      expect(getAnalyticsAccess()).toBe('pending');
      expect((window as unknown as Record<string, unknown>)['ga-disable-G-TEST123']).toBe(true);
    });

    it('drops queued events when the visitor rejects', async () => {
      const { getAnalyticsAccess, setAnalyticsConsent, setAnalyticsExcluded, trackEvent } =
        await loadGtag();
      setAnalyticsExcluded(false);
      trackEvent('sign_up', { method: 'email' });
      expect(sessionStorage.getItem('sokil_ga_pending_events')).not.toBeNull();

      setAnalyticsConsent('denied');
      expect(sessionStorage.getItem('sokil_ga_pending_events')).toBeNull();
      expect(getAnalyticsAccess()).toBe('excluded');

      trackEvent('login', { method: 'email' });
      expect(eventCalls()).toHaveLength(0);
      expect(sessionStorage.length).toBe(0);
    });

    it('does not queue events when consent was already denied', async () => {
      localStorage.setItem(
        'sokil_cookie_consent',
        JSON.stringify({ v: 1, analytics: 'denied', at: '2026-11-25T00:00:00Z' }),
      );
      const { trackEvent } = await loadGtag();
      trackEvent('login', { method: 'email' });
      expect(sessionStorage.length).toBe(0);
    });

    it('uses a stored grant from an earlier visit', async () => {
      localStorage.setItem(
        'sokil_cookie_consent',
        JSON.stringify({ v: 1, analytics: 'granted', at: '2026-11-25T00:00:00Z' }),
      );
      const { getAnalyticsAccess, setAnalyticsExcluded } = await loadGtag();
      setAnalyticsExcluded(false);
      expect(getAnalyticsAccess()).toBe('allowed');
    });

    it('keeps admins out even after they accept', async () => {
      const { getAnalyticsAccess, setAnalyticsConsent, setAnalyticsExcluded, trackEvent } =
        await loadGtag();
      setAnalyticsExcluded(true);
      setAnalyticsConsent('granted');
      trackEvent('login', { method: 'email' });
      expect(getAnalyticsAccess()).toBe('excluded');
      expect(eventCalls()).toHaveLength(0);
      const commands = (window.dataLayer as ArrayLike<unknown>[]).map((e) => Array.from(e)[0]);
      expect(commands).not.toContain('config');
    });

    it('stops GA and clears its cookies when consent is withdrawn', async () => {
      const { getAnalyticsAccess, setAnalyticsConsent, setAnalyticsExcluded, trackEvent } =
        await loadGtag();
      setAnalyticsExcluded(false);
      setAnalyticsConsent('granted');
      // biome-ignore lint/suspicious/noDocumentCookie: jsdom test setup
      document.cookie = '_ga=GA1.1.123; path=/';
      // biome-ignore lint/suspicious/noDocumentCookie: jsdom test setup
      document.cookie = '_ga_TEST123=GS1.1.456; path=/';

      setAnalyticsConsent('denied');
      trackEvent('login', { method: 'email' });

      expect(getAnalyticsAccess()).toBe('excluded');
      expect((window as unknown as Record<string, unknown>)['ga-disable-G-TEST123']).toBe(true);
      const commands = (window.dataLayer as ArrayLike<unknown>[]).map((e) => Array.from(e));
      expect(commands.at(-1)).toEqual(['consent', 'update', { analytics_storage: 'denied' }]);
      expect(eventCalls()).toHaveLength(0);
      expect(document.cookie).not.toContain('_ga');
    });
  });
});
