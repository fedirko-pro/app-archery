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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: 'Sokil APP',
  description: 'Sokil APP',
  manifest: '/manifest.webmanifest',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
      translate="no"
      className={`${montserrat.variable} notranslate text-gray-900 antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
