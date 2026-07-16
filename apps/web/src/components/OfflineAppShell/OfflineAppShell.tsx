'use client';

import { useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AppShellSkeleton } from '@/components/AppShellSkeleton';
import { ClientOnly } from '@/components/ClientOnly/ClientOnly';
import Content from '@/components/Content/Content';
import { RouterShell } from '@/components/providers/AppProviders';
import { LangProvider } from '@/contexts/lang-context';
import i18n from '@/i18n';
import { getDefaultAppLang, isRtlLanguage, normalizeAppLang, toI18nLang } from '@/utils/i18n-lang';

/**
 * Full client app shell used as the service-worker navigation fallback.
 * Keeps the browser URL (e.g. /ua/my-trainings) so react-router can restore the route offline.
 */
export function OfflineAppShell() {
  const appLang = useMemo(() => {
    if (typeof window === 'undefined') {
      return getDefaultAppLang();
    }
    const segment = window.location.pathname.split('/').filter(Boolean)[0];
    return normalizeAppLang(segment);
  }, []);

  useEffect(() => {
    const i18nLang = toI18nLang(appLang);
    if (i18n.language !== i18nLang) {
      void i18n.changeLanguage(i18nLang);
    }
    document.documentElement.setAttribute('lang', i18nLang);
    document.documentElement.setAttribute('dir', isRtlLanguage(appLang) ? 'rtl' : 'ltr');
  }, [appLang]);

  return (
    <LangProvider lang={appLang}>
      <ClientOnly fallback={<AppShellSkeleton />}>
        <BrowserRouter>
          <RouterShell>
            <Content />
          </RouterShell>
        </BrowserRouter>
      </ClientOnly>
    </LangProvider>
  );
}
