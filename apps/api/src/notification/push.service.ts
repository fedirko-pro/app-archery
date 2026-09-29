import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isImportantNotificationType } from '@sokil/shared-types';
import webpush from 'web-push';
import { User } from '../user/entity/user.entity';
import { DeletePushSubscriptionDto, UpsertPushSubscriptionDto } from './dto/push-subscription.dto';
import { PushSubscription } from './push-subscription.entity';
import { PushContent, renderPushText } from './push-text';

const CHUNK_SIZE = 20;

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly publicKey: string | null;
  private readonly ready: boolean;

  constructor(
    private readonly em: EntityManager,
    configService: ConfigService,
  ) {
    this.publicKey = present(configService.get<string>('VAPID_PUBLIC_KEY'));
    const privateKey = present(configService.get<string>('VAPID_PRIVATE_KEY'));
    const subject =
      present(configService.get<string>('VAPID_SUBJECT')) ?? 'mailto:contact@sokil.app';
    if (this.publicKey && privateKey) {
      try {
        webpush.setVapidDetails(subject, this.publicKey, privateKey);
        this.ready = true;
      } catch (err) {
        this.ready = false;
        this.logger.error(`Web Push disabled: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      this.ready = false;
      this.logger.warn('Web Push is disabled: VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY is not set');
    }
  }

  getPublicKey(): string | null {
    return this.ready ? this.publicKey : null;
  }

  async upsert(userId: string, dto: UpsertPushSubscriptionDto, userAgent?: string): Promise<void> {
    const existing = await this.em.findOne(PushSubscription, { endpoint: dto.endpoint });
    if (existing) {
      existing.user = this.em.getReference(User, userId);
      existing.p256dh = dto.p256dh;
      existing.auth = dto.auth;
      existing.userAgent = userAgent;
      await this.em.flush();
      return;
    }

    this.em.create(PushSubscription, {
      user: this.em.getReference(User, userId),
      endpoint: dto.endpoint,
      p256dh: dto.p256dh,
      auth: dto.auth,
      userAgent,
      createdAt: new Date(),
    });
    await this.em.flush();
  }

  async remove(userId: string, dto: DeletePushSubscriptionDto): Promise<void> {
    const existing = await this.em.findOne(PushSubscription, {
      endpoint: dto.endpoint,
      user: { id: userId },
    });
    if (!existing) return;
    this.em.remove(existing);
    await this.em.flush();
  }

  async sendToUser(user: User, content: PushContent): Promise<void> {
    if (!this.ready || !isImportantNotificationType(content.type)) return;
    try {
      const subscriptions = await this.em.find(PushSubscription, { user: { id: user.id } });
      const payload = renderPushText(user.appLanguage, content);
      await this.dispatch(subscriptions, payload);
    } catch (err) {
      this.logger.error(
        `Failed to send push to ${user.id}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async sendToUsers(userIds: string[], content: PushContent): Promise<void> {
    if (!this.ready || !isImportantNotificationType(content.type) || userIds.length === 0) return;
    try {
      const users = await this.em.find(
        User,
        { id: { $in: userIds } },
        { fields: ['id', 'appLanguage'] },
      );
      const subscriptions = await this.em.find(PushSubscription, {
        user: { id: { $in: userIds } },
      });
      const byUser = new Map<string, PushSubscription[]>();
      for (const subscription of subscriptions) {
        const ownerId = subscription.user.id;
        const list = byUser.get(ownerId) ?? [];
        list.push(subscription);
        byUser.set(ownerId, list);
      }

      for (const user of users) {
        const payload = renderPushText(user.appLanguage, content);
        await this.dispatch(byUser.get(user.id) ?? [], payload);
      }
    } catch (err) {
      this.logger.error(
        `Failed to send push to ${userIds.length} users: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  private async dispatch(
    subscriptions: PushSubscription[],
    payload: { title: string; body: string; url: string },
  ): Promise<void> {
    const body = JSON.stringify(payload);
    for (let index = 0; index < subscriptions.length; index += CHUNK_SIZE) {
      const chunk = subscriptions.slice(index, index + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (subscription) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: { p256dh: subscription.p256dh, auth: subscription.auth },
              },
              body,
            );
          } catch (err) {
            if (isGone(err)) {
              this.em.remove(subscription);
              await this.em.flush();
              return;
            }
            this.logger.warn(
              `Push delivery failed: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }),
      );
    }
  }
}

function present(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isGone(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const status = (error as { statusCode?: number }).statusCode;
  return status === 404 || status === 410;
}
