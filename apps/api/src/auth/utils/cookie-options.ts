import type { CookieOptions } from 'express';
import { ConfigService } from '@nestjs/config';

export const SESSION_COOKIE_NAME = 'session';
export const CSRF_COOKIE_NAME = 'csrf';

export function getSessionCookieOptions(configService: ConfigService): CookieOptions {
  const domain = configService.get<string>('COOKIE_DOMAIN');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    ...(domain ? { domain } : {}),
  };
}

export function getCsrfCookieOptions(configService: ConfigService): CookieOptions {
  const domain = configService.get<string>('COOKIE_DOMAIN');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    ...(domain ? { domain } : {}),
  };
}
