import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';

import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { CsrfGuard } from '../../src/auth/guards/csrf.guard';
import { CsrfService } from '../../src/auth/csrf.service';
import { OAuthExchangeService } from '../../src/auth/oauth-exchange.service';
import { RolePermissionsService } from '../../src/auth/role-permissions.service';
import { SessionService } from '../../src/auth/session.service';
import { EmailService } from '../../src/email/email.service';
import { UserService } from '../../src/user/user.service';

export interface AuthIntegrationMocks {
  userService: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    findByResetToken: jest.Mock;
    setResetPasswordToken: jest.Mock;
    clearResetPasswordToken: jest.Mock;
    updatePasswordAndClearResetToken: jest.Mock;
    setPasswordForOAuthUser: jest.Mock;
  };
  sessionService: {
    createSession: jest.Mock;
    revokeSession: jest.Mock;
    clearSessionCookie: jest.Mock;
    validateSessionToken: jest.Mock;
  };
}

const configValues: Record<string, string> = {
  FRONTEND_URL: 'http://localhost:3001',
  NODE_ENV: 'test',
};

export async function createAuthIntegrationApp(): Promise<{
  app: INestApplication;
  mocks: AuthIntegrationMocks;
}> {
  const userService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByResetToken: jest.fn(),
    setResetPasswordToken: jest.fn(),
    clearResetPasswordToken: jest.fn(),
    updatePasswordAndClearResetToken: jest.fn(),
    setPasswordForOAuthUser: jest.fn(),
  };

  const sessionService = {
    createSession: jest.fn().mockResolvedValue(undefined),
    revokeSession: jest.fn().mockResolvedValue(undefined),
    clearSessionCookie: jest.fn(),
    validateSessionToken: jest.fn(),
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      AuthService,
      CsrfService,
      CsrfGuard,
      Reflector,
      {
        provide: UserService,
        useValue: userService,
      },
      {
        provide: SessionService,
        useValue: sessionService,
      },
      {
        provide: EmailService,
        useValue: {
          sendPasswordResetEmail: jest.fn(),
          sendRoleChangedEmail: jest.fn(),
          sendWelcomeEmail: jest.fn(),
          sendInvitationEmail: jest.fn(),
        },
      },
      {
        provide: OAuthExchangeService,
        useValue: {
          createExchangeCode: jest.fn(),
          consumeExchangeCode: jest.fn(),
        },
      },
      {
        provide: RolePermissionsService,
        useValue: {
          getMatrix: jest.fn(),
          setPermission: jest.fn(),
        },
      },
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn((key: string) => configValues[key]),
        },
      },
      {
        provide: APP_GUARD,
        useClass: CsrfGuard,
      },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  return {
    app,
    mocks: { userService, sessionService },
  };
}
