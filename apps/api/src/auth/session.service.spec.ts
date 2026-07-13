import { EntityManager } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

import { User } from '../user/entity/user.entity';
import { AuthSession } from './entity/auth-session.entity';
import { SESSION_COOKIE_NAME } from './utils/cookie-options';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let entityManager: {
    create: jest.Mock;
    persistAndFlush: jest.Mock;
    findOne: jest.Mock;
    flush: jest.Mock;
  };
  let configService: { get: jest.Mock };
  let mockRes: { cookie: jest.Mock; clearCookie: jest.Mock };

  const mockUser = { id: 'user-1', email: 'test@example.com' } as User;

  beforeEach(() => {
    entityManager = {
      create: jest.fn().mockImplementation((_entity, data) => data),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'SESSION_TTL_SECONDS') return '3600';
        if (key === 'NODE_ENV') return 'test';
        return undefined;
      }),
    };

    mockRes = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    service = new SessionService(
      entityManager as unknown as EntityManager,
      configService as unknown as ConfigService,
    );
  });

  describe('createSession', () => {
    it('persists a session and sets the session cookie', async () => {
      const meta = { userAgent: 'jest', ipAddress: '127.0.0.1' };

      await service.createSession(mockUser, mockRes as unknown as Response, meta);

      expect(entityManager.create).toHaveBeenCalledWith(
        AuthSession,
        expect.objectContaining({
          user: mockUser,
          userAgent: 'jest',
          ipAddress: '127.0.0.1',
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      );
      expect(entityManager.persistAndFlush).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith(
        SESSION_COOKIE_NAME,
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          maxAge: 3_600_000,
        }),
      );
    });
  });

  describe('validateSessionToken', () => {
    it('returns null for empty tokens', async () => {
      await expect(service.validateSessionToken('')).resolves.toBeNull();
      expect(entityManager.findOne).not.toHaveBeenCalled();
    });

    it('returns the user for a valid session', async () => {
      entityManager.findOne.mockResolvedValue({ user: mockUser });

      await expect(service.validateSessionToken('session-token')).resolves.toBe(mockUser);
      expect(entityManager.findOne).toHaveBeenCalledWith(
        AuthSession,
        expect.objectContaining({
          tokenHash: expect.any(String),
          revokedAt: null,
          expiresAt: expect.objectContaining({ $gt: expect.any(Date) }),
        }),
        { populate: ['user'] },
      );
    });
  });

  describe('revokeSession', () => {
    it('marks an active session as revoked', async () => {
      const session = { revokedAt: undefined };
      entityManager.findOne.mockResolvedValue(session);

      await service.revokeSession('session-token');

      expect(session.revokedAt).toBeInstanceOf(Date);
      expect(entityManager.flush).toHaveBeenCalled();
    });

    it('does nothing when no active session exists', async () => {
      entityManager.findOne.mockResolvedValue(null);

      await service.revokeSession('missing-token');

      expect(entityManager.flush).not.toHaveBeenCalled();
    });
  });

  describe('clearSessionCookie', () => {
    it('clears the session cookie with shared options', () => {
      service.clearSessionCookie(mockRes as unknown as Response);

      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        SESSION_COOKIE_NAME,
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });
});
