import '@/sass/main.scss';
import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import { cookies, headers } from 'next/headers';

import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { RootProviders } from '@/components/providers/AppProviders';
import { buildSiteMetadata } from '@/lib/site-metadata';
import { resolveSiteUrl } from '@/lib/tournament-metadata';
import { normalizeAppLang, toI18nLang } from '@/utils/i18n-lang';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000080',
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const siteUrl = resolveSiteUrl(headersList);
  const cookieStore = await cookies();
  const lang = resolveHtmlLang(cookieStore);

  return {
    ...buildSiteMetadata({ lang, siteUrl }),
    metadataBase: new URL(siteUrl),
    icons: {
      icon: '/favicon.png',
      apple: '/logo192.png',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Sokil',
    },
    other: {
      google: 'notranslate',
    },
  };
}

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
      translate="no"
      className={`${montserrat.variable} notranslate text-gray-900 antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
