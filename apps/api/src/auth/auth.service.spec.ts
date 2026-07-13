import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { SessionService } from './session.service';
import { OAuthExchangeService } from './oauth-exchange.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let sessionService: jest.Mocked<SessionService>;
  let emailService: jest.Mocked<EmailService>;
  let configService: jest.Mocked<ConfigService>;

  const mockRes = { cookie: jest.fn() } as unknown as Response;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    role: 'user',
    appLanguage: 'en',
    authProvider: 'local',
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findByResetToken: jest.fn(),
            setResetPasswordToken: jest.fn(),
            clearResetPasswordToken: jest.fn(),
            updatePasswordAndClearResetToken: jest.fn(),
            setPasswordForOAuthUser: jest.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            createSession: jest.fn().mockResolvedValue(undefined),
            revokeSession: jest.fn().mockResolvedValue(undefined),
            clearSessionCookie: jest.fn(),
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
          provide: EmailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
            sendRoleChangedEmail: jest.fn(),
            sendWelcomeEmail: jest.fn(),
            sendInvitationEmail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:3000') },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    sessionService = module.get(SessionService) as jest.Mocked<SessionService>;
    emailService = module.get(EmailService) as jest.Mocked<EmailService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  describe('login', () => {
    it('should create a session for valid credentials', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(
        {
          email: 'test@example.com',
          password: 'correct-password',
        },
        mockRes,
      );

      expect(result).toEqual({ user: mockUser });
      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com', true);
      expect(sessionService.createSession).toHaveBeenCalledWith(mockUser, mockRes, undefined);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong-password' }, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nonexistent@example.com', password: 'any' }, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should pass request metadata to session creation', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const meta = { userAgent: 'jest-agent', ipAddress: '127.0.0.1' };

      await authService.login(
        { email: 'test@example.com', password: 'correct-password' },
        mockRes,
        meta,
      );

      expect(sessionService.createSession).toHaveBeenCalledWith(mockUser, mockRes, meta);
    });
  });

  describe('logout', () => {
    it('should revoke session and clear cookie when token is provided', async () => {
      const result = await authService.logout(mockRes, 'session-token');

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(sessionService.revokeSession).toHaveBeenCalledWith('session-token');
      expect(sessionService.clearSessionCookie).toHaveBeenCalledWith(mockRes);
    });

    it('should clear cookie without revoking when token is missing', async () => {
      const result = await authService.logout(mockRes);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(sessionService.revokeSession).not.toHaveBeenCalled();
      expect(sessionService.clearSessionCookie).toHaveBeenCalledWith(mockRes);
    });
  });

  describe('resetPassword', () => {
    it('should reset password for valid token', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      userService.findByResetToken.mockResolvedValue({
        ...mockUser,
        resetPasswordExpires: futureDate,
      } as any);
      userService.updatePasswordAndClearResetToken.mockResolvedValue(undefined);

      const result = await authService.resetPassword({
        token: 'valid-token',
        password: 'new-password-1234',
        confirmPassword: 'new-password-1234',
      });

      expect(result).toEqual({ message: 'Password has been reset successfully' });
      expect(userService.updatePasswordAndClearResetToken).toHaveBeenCalledWith(
        'user-1',
        'new-password-1234',
      );
    });

    it('should throw BadRequestException for expired token', async () => {
      const pastDate = new Date(Date.now() - 3600000);
      userService.findByResetToken.mockResolvedValue({
        ...mockUser,
        resetPasswordExpires: pastDate,
      } as any);

      await expect(
        authService.resetPassword({
          token: 'expired-token',
          password: 'new-password-1234',
          confirmPassword: 'new-password-1234',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      userService.findByResetToken.mockResolvedValue({
        ...mockUser,
        resetPasswordExpires: futureDate,
      } as any);

      await expect(
        authService.resetPassword({
          token: 'valid-token',
          password: 'password-1',
          confirmPassword: 'password-2',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should always return same message regardless of whether user exists', async () => {
      const message = 'If an account with that email exists, a password reset link has been sent.';

      userService.findByEmail.mockResolvedValue(null);
      let result = await authService.forgotPassword({ email: 'unknown@example.com' });
      expect(result.message).toBe(message);

      userService.findByEmail.mockResolvedValue(mockUser as any);
      result = await authService.forgotPassword({ email: 'known@example.com' });
      expect(result.message).toBe(message);
    });

    it('should send email and save token when user exists', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as any);
      emailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      await authService.forgotPassword({ email: 'test@example.com' });

      expect(userService.setResetPasswordToken).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
        expect.any(Date),
      );
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should clear token if email sending fails', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as any);
      emailService.sendPasswordResetEmail.mockRejectedValue(new Error('Email failed'));

      await expect(authService.forgotPassword({ email: 'test@example.com' })).rejects.toThrow(
        'Failed to send password reset email',
      );
      expect(userService.clearResetPasswordToken).toHaveBeenCalledWith('user-1');
    });
  });

  describe('setPasswordForOAuthUser', () => {
    it('should set password for Google OAuth user without password', async () => {
      userService.findById.mockResolvedValue({
        ...mockUser,
        authProvider: 'google',
        password: undefined,
      } as any);

      const result = await authService.setPasswordForOAuthUser('user-1', {
        password: 'new-password-1234',
        confirmPassword: 'new-password-1234',
      });

      expect(result).toEqual({ message: 'Password has been set successfully' });
      expect(userService.setPasswordForOAuthUser).toHaveBeenCalledWith(
        'user-1',
        'new-password-1234',
      );
    });

    it('should throw BadRequestException for non-OAuth user', async () => {
      userService.findById.mockResolvedValue(mockUser as any);

      await expect(
        authService.setPasswordForOAuthUser('user-1', {
          password: 'new-password-1234',
          confirmPassword: 'new-password-1234',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      userService.findById.mockResolvedValue({
        ...mockUser,
        authProvider: 'google',
        password: undefined,
      } as any);

      await expect(
        authService.setPasswordForOAuthUser('user-1', {
          password: 'password-1',
          confirmPassword: 'password-2',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(
        authService.setPasswordForOAuthUser('non-existent', {
          password: 'new-password-1234',
          confirmPassword: 'new-password-1234',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('adminResetUserPassword', () => {
    it('should send password reset email for valid user', async () => {
      userService.findById.mockResolvedValue(mockUser as any);
      emailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await authService.adminResetUserPassword('user-1');

      expect(result).toEqual({ message: 'Password reset email has been sent to the user' });
      expect(userService.setResetPasswordToken).toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(authService.adminResetUserPassword('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(authService.validateUser('bad@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
