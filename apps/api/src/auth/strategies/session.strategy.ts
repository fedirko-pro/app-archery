import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { SessionService } from '../session.service';
import { SESSION_COOKIE_NAME } from '../utils/cookie-options';
import { CookieSessionPassportStrategy } from './cookie-session-passport.strategy';

@Injectable()
export class SessionStrategy extends PassportStrategy(CookieSessionPassportStrategy, 'session') {
  constructor(private readonly sessionService: SessionService) {
    super((req: Request, done: (err: Error | null, user?: unknown) => void) => {
      void (async () => {
        try {
          const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
          if (!token) {
            done(null);
            return;
          }

          const user = await sessionService.validateSessionToken(token);
          if (!user) {
            done(null);
            return;
          }

          done(null, {
            sub: user.id,
            email: user.email,
            role: user.role,
          });
        } catch (error) {
          done(error as Error);
        }
      })();
    });
  }
}
