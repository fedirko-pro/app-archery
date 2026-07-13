import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { CsrfService } from '../csrf.service';
import { CSRF_COOKIE_NAME } from '../utils/cookie-options';

export const SKIP_CSRF_KEY = 'skipCsrf';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly csrfService: CsrfService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return true;
    }

    const headerToken = request.headers['x-csrf-token'] as string | undefined;
    const cookieToken = request.cookies?.[CSRF_COOKIE_NAME] as string | undefined;

    if (!this.csrfService.validate(headerToken, cookieToken)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
