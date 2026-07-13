'use client';

import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AppShellSkeleton } from '@/components/AppShellSkeleton';
import { ClientOnly } from '@/components/ClientOnly/ClientOnly';
import { RouterShell } from '@/components/providers/AppProviders';
import { LangProvider } from '@/contexts/lang-context';
import i18n from '@/i18n';
import { isRtlLanguage, normalizeAppLang, toI18nLang } from '@/utils/i18n-lang';

interface LangLayoutClientProps {
  lang: string;
  children: React.ReactNode;
}

export default function LangLayoutClient({ lang, children }: LangLayoutClientProps) {
  const appLang = normalizeAppLang(lang);

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
          <RouterShell>{children}</RouterShell>
        </BrowserRouter>
      </ClientOnly>
    </LangProvider>
  );
}
