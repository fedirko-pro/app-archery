import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { generateSecureToken } from './utils/token-hash';
import { CSRF_COOKIE_NAME, getCsrfCookieOptions } from './utils/cookie-options';

@Injectable()
export class CsrfService {
  constructor(private readonly configService: ConfigService) {}

  issueToken(res: Response): string {
    const token = generateSecureToken(16);
    res.cookie(CSRF_COOKIE_NAME, token, {
      ...getCsrfCookieOptions(this.configService),
      maxAge: 24 * 60 * 60 * 1000,
    });
    return token;
  }

  validate(headerToken: string | undefined, cookieToken: string | undefined): boolean {
    if (!headerToken || !cookieToken) return false;
    return headerToken === cookieToken;
  }
}
