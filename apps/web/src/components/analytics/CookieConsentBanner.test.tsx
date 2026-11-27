import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// react-router v8 needs React 19 APIs that the jsdom test runtime (React 18) lacks.
vi.mock('react-router', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: '/en/home' }),
  useParams: () => ({ lang: 'en' }),
}));

async function renderBanner() {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_SITE_MODE', 'prod');
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID', 'G-TEST123');
  const i18n = (await import('../../i18n')).default;
  await i18n.changeLanguage('en');
  const { CookieConsentBanner } = await import('./CookieConsentBanner');
  const { CookieSettingsLink } = await import('./CookieSettingsLink');
  const gtag = await import('./gtag');
  render(
    <>
      <CookieSettingsLink />
      <CookieConsentBanner />
    </>,
  );
  return gtag;
}

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.dataLayer = [];
    delete window.gtag;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('asks first, with equal Accept and Reject buttons and a privacy link', async () => {
    await renderBanner();
    expect(screen.getByRole('region', { name: 'Cookies' })).toBeTruthy();
    const accept = screen.getByRole('button', { name: 'Accept' });
    const reject = screen.getByRole('button', { name: 'Reject' });
    expect(accept.className).toBe(reject.className);
    expect(screen.getByRole('link', { name: 'Privacy policy' }).getAttribute('href')).toBe(
      '/en/privacy',
    );
  });

  it('stores Reject, hides, and can be re-opened from Cookie settings', async () => {
    const { getAnalyticsAccess } = await renderBanner();
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(screen.queryByRole('region', { name: 'Cookies' })).toBeNull();
    expect(JSON.parse(localStorage.getItem('sokil_cookie_consent') ?? '{}').analytics).toBe(
      'denied',
    );
    expect(getAnalyticsAccess()).toBe('excluded');

    fireEvent.click(screen.getByRole('button', { name: 'Cookie settings' }));
    expect(screen.getByText('Current choice: analytics cookies rejected.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Reject' }));

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    });
    expect(screen.queryByRole('region', { name: 'Cookies' })).toBeNull();
    expect(JSON.parse(localStorage.getItem('sokil_cookie_consent') ?? '{}').analytics).toBe(
      'granted',
    );
  });
});
