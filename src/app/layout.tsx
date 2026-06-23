import '@/sass/main.scss';
import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import { cookies } from 'next/headers';

import { RootProviders } from '@/components/providers/AppProviders';
import { normalizeAppLang, toI18nLang } from '@/utils/i18n-lang';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Sokil APP',
  description: 'Sokil APP',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: '#000080',
};

function resolveHtmlLang(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  const appLangCookie = cookieStore.get('appLang')?.value;
  if (appLangCookie) {
    return toI18nLang(normalizeAppLang(appLangCookie));
  }

  const i18nCookie = cookieStore.get('i18nextLng')?.value;
  if (i18nCookie) {
    return toI18nLang(normalizeAppLang(i18nCookie === 'uk' ? 'ua' : i18nCookie));
  }

  return toI18nLang(normalizeAppLang(undefined));
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const htmlLang = resolveHtmlLang(cookieStore);

  return (
    <html
      lang={htmlLang}
      className={`${montserrat.variable} text-gray-900 antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
