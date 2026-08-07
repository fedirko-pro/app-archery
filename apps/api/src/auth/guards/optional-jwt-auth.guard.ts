import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SESSION_COOKIE_NAME } from '../utils/cookie-options';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('session') {
  override canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const hasSession = Boolean(request.cookies?.[SESSION_COOKIE_NAME]);
    if (!hasSession) {
      return true;
    }
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  override handleRequest<TUser>(err: Error | null, user: TUser): TUser | null {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
