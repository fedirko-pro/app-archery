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
    const { setAnalyticsExcluded, trackEvent } = await loadGtag('test');
    setAnalyticsExcluded(false);
    trackEvent('login', { method: 'email' });
    expect(window.dataLayer).toHaveLength(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('queues events until access is allowed, then configures and flushes', async () => {
    const { getAnalyticsAccess, setAnalyticsExcluded, trackEvent } = await loadGtag();
    expect(getAnalyticsAccess()).toBe('pending');

    trackEvent('sign_up', { method: 'google' });
    expect(eventCalls()).toHaveLength(0);

    setAnalyticsExcluded(false);
    const commands = (window.dataLayer as ArrayLike<unknown>[]).map((entry) => Array.from(entry));
    expect(commands.map((args) => args[0])).toEqual(['js', 'config', 'event']);
    expect(commands[2]).toEqual(['event', 'sign_up', { method: 'google' }]);
    expect(getAnalyticsAccess()).toBe('allowed');
  });

  it('sends events directly when allowed and drops undefined params', async () => {
    const { setAnalyticsExcluded, trackEvent } = await loadGtag();
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
    const { setAnalyticsExcluded, trackEvent } = await loadGtag();
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
    const { getAnalyticsAccess, setAnalyticsExcluded, trackAuthEvent } = await loadGtag();
    setAnalyticsExcluded(false);
    trackAuthEvent('login', 'email', { role: 'general_admin' });
    expect(eventCalls()).toHaveLength(0);
    expect(getAnalyticsAccess()).toBe('excluded');
  });

  it('tracks auth events for regular users', async () => {
    const { setAnalyticsExcluded, trackAuthEvent } = await loadGtag();
    setAnalyticsExcluded(false);
    trackAuthEvent('login', 'email', { role: 'user' });
    expect(eventCalls()).toEqual([['event', 'login', { method: 'email' }]]);
  });
});
