import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthSession } from './entity/auth-session.entity';
import { User } from '../user/entity/user.entity';
import { SESSION_COOKIE_NAME, getSessionCookieOptions } from './utils/cookie-options';
import { generateSecureToken, hashToken } from './utils/token-hash';

@Injectable()
export class SessionService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  private getSessionTtlMs(): number {
    const seconds = Number(this.configService.get<string>('SESSION_TTL_SECONDS') ?? 604800);
    return seconds * 1000;
  }

  async createSession(
    user: User,
    res: Response,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<void> {
    const token = generateSecureToken();
    const session = this.entityManager.create(AuthSession, {
      user,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + this.getSessionTtlMs()),
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      createdAt: new Date(),
    });
    await this.entityManager.persistAndFlush(session);

    res.cookie(SESSION_COOKIE_NAME, token, {
      ...getSessionCookieOptions(this.configService),
      maxAge: this.getSessionTtlMs(),
    });
  }

  async validateSessionToken(token: string): Promise<User | null> {
    if (!token) return null;

    const session = await this.entityManager.findOne(
      AuthSession,
      {
        tokenHash: hashToken(token),
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { populate: ['user'] },
    );

    return session?.user ?? null;
  }

  async revokeSession(token: string): Promise<void> {
    if (!token) return;

    const session = await this.entityManager.findOne(AuthSession, {
      tokenHash: hashToken(token),
      revokedAt: null,
    });

    if (session) {
      session.revokedAt = new Date();
      await this.entityManager.flush();
    }
  }

  clearSessionCookie(res: Response): void {
    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions(this.configService));
  }
}
