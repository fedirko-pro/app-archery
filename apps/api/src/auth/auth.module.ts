import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CsrfService } from './csrf.service';
import { AuthSession } from './entity/auth-session.entity';
import { OAuthExchangeCode } from './entity/oauth-exchange-code.entity';
import { CsrfGuard } from './guards/csrf.guard';
import { RolesGuard } from './guards/roles.guard';
import { OAuthExchangeService } from './oauth-exchange.service';
import { RolePermissionsModule } from './role-permissions.module';
import { SessionService } from './session.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { SessionStrategy } from './strategies/session.strategy';

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
