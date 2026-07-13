import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { SessionStrategy } from './strategies/session.strategy';
import { RolesGuard } from './guards/roles.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { RolePermissionsModule } from './role-permissions.module';
import { AuthSession } from './entity/auth-session.entity';
import { OAuthExchangeCode } from './entity/oauth-exchange-code.entity';
import { SessionService } from './session.service';
import { OAuthExchangeService } from './oauth-exchange.service';
import { CsrfService } from './csrf.service';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    UserModule,
    EmailModule,
    PassportModule,
    RolePermissionsModule,
    MikroOrmModule.forFeature([AuthSession, OAuthExchangeCode]),
  ],
  providers: [
    AuthService,
    SessionStrategy,
    GoogleStrategy,
    RolesGuard,
    SessionService,
    OAuthExchangeService,
    CsrfService,
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
  controllers: [AuthController],
  exports: [SessionService, CsrfService],
})
export class AuthModule {}
