import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';
import { OAuthExchangeCode } from './entity/oauth-exchange-code.entity';
import { User } from '../user/entity/user.entity';
import { generateSecureToken, hashToken } from './utils/token-hash';

@Injectable()
export class OAuthExchangeService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  private getCodeTtlMs(): number {
    const seconds = Number(this.configService.get<string>('OAUTH_CODE_TTL_SECONDS') ?? 120);
    return seconds * 1000;
  }

  async createExchangeCode(user: User): Promise<string> {
    const code = generateSecureToken(24);
    const exchange = this.entityManager.create(OAuthExchangeCode, {
      user,
      codeHash: hashToken(code),
      expiresAt: new Date(Date.now() + this.getCodeTtlMs()),
      createdAt: new Date(),
    });
    await this.entityManager.persistAndFlush(exchange);
    return code;
  }

  async consumeExchangeCode(code: string): Promise<User> {
    const exchange = await this.entityManager.findOne(
      OAuthExchangeCode,
      {
        codeHash: hashToken(code),
        usedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { populate: ['user'] },
    );

    if (!exchange) {
      throw new BadRequestException('Invalid or expired OAuth exchange code');
    }

    exchange.usedAt = new Date();
    await this.entityManager.flush();
    return exchange.user;
  }
}
