import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getDefaultAppLang, normalizeAppLang, SUPPORTED_APP_LANGS } from './src/utils/i18n-lang';

const LANG_PATTERN = new RegExp(`^/(${SUPPORTED_APP_LANGS.join('|')})(/|$)`);

function withNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

function getDefaultLang(request: NextRequest): string {
  const cookieLang = request.cookies.get('i18nextLng')?.value;
  if (cookieLang) {
    return normalizeAppLang(cookieLang === 'uk' ? 'ua' : cookieLang);
  }
  return getDefaultAppLang();
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/pdf/')
  ) {
    return NextResponse.next();
  }

  // Service-worker navigation fallback shell (must not be lang-prefixed).
  if (pathname === '/~offline') {
    return withNoStoreHeaders(NextResponse.next());
  }

  if (pathname === '/auth/google/callback') {
    return NextResponse.next();
  }

  if (LANG_PATTERN.test(pathname)) {
    const response = withNoStoreHeaders(NextResponse.next());
    const lang = pathname.split('/')[1];
    if (lang) {
      response.cookies.set('appLang', lang, {
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        sameSite: 'lax',
      });
    }
    return response;
  }

  const defaultLang = getDefaultLang(request);

  if (pathname === '/') {
    return withNoStoreHeaders(
      NextResponse.redirect(new URL(`/${defaultLang}/tournaments`, request.url)),
    );
  }

  const langAgnosticPaths = ['signin', 'signup', 'reset-password'];
  const barePath = pathname.replace(/^\//, '');

  if (langAgnosticPaths.includes(barePath)) {
    return withNoStoreHeaders(
      NextResponse.redirect(new URL(`/${defaultLang}/${barePath}${search}`, request.url)),
    );
  }

  if (barePath.startsWith('apply/')) {
    return withNoStoreHeaders(
      NextResponse.redirect(new URL(`/${defaultLang}/${barePath}${search}`, request.url)),
    );
  }

  return withNoStoreHeaders(
    NextResponse.redirect(new URL(`/${defaultLang}${pathname}${search}`, request.url)),
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)'],
};
