import type { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type {
  NotificationDto,
  NotificationsListDto,
  NotificationType,
  NotificationUnreadCountDto,
} from '@sokil/shared-types';
import { AuthSession } from '../auth/entity/auth-session.entity';
import { User } from '../user/entity/user.entity';
import { Notification } from './notification.entity';
import {
  getNotificationBodyKey,
  getNotificationTitleKey,
  resolveImportant,
} from './notification-meta';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  params?: Record<string, unknown>;
  link?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly em: EntityManager) {}

  async create(input: CreateNotificationInput): Promise<Notification | null> {
    try {
      const user = await this.em.findOne(User, { id: input.userId });
      if (!user) {
        this.logger.warn(`Cannot create notification: user ${input.userId} not found`);
        return null;
      }

      const notification = this.em.create(Notification, {
        user,
        type: input.type,
        titleKey: getNotificationTitleKey(input.type),
        bodyKey: getNotificationBodyKey(input.type),
        params: input.params,
        link: input.link,
        important: resolveImportant(input.type),
        createdAt: new Date(),
      });

      await this.em.persistAndFlush(notification);
      return notification;
    } catch (err) {
      this.logger.error(
        `Failed to create notification (${input.type}) for ${input.userId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return null;
    }
  }

  /** Fire-and-forget wrapper so callers never block on notification writes. */
  createSafe(input: CreateNotificationInput): void {
    void this.create(input).catch((err) => {
      this.logger.error(`createSafe failed: ${err instanceof Error ? err.message : String(err)}`);
    });
  }

  async listForUser(
    userId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<NotificationsListDto> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    const [rows, total] = await this.em.findAndCount(
      Notification,
      { user: { id: userId } },
      {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      },
    );

    const lastLoginAt = await this.getPreviousLoginAt(userId);

    return {
      items: rows.map((row) => this.toDto(row)),
      total,
      lastLoginAt: lastLoginAt?.toISOString() ?? null,
    };
  }

  async getUnreadImportantCount(userId: string): Promise<NotificationUnreadCountDto> {
    try {
      const count = await this.em.count(Notification, {
        user: { id: userId },
        important: true,
        readAt: null,
      });
      return { count };
    } catch (err) {
      this.logger.error(
        `Failed to get unread count for ${userId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return { count: 0 };
    }
  }

  async markRead(userId: string, notificationId: string): Promise<NotificationDto> {
    const notification = await this.em.findOne(Notification, {
      id: notificationId,
      user: { id: userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.em.flush();
    }

    return this.toDto(notification);
  }

  async markAllRead(userId: string): Promise<{ marked: number }> {
    const unread = await this.em.find(Notification, {
      user: { id: userId },
      readAt: null,
    });

    if (unread.length === 0) {
      return { marked: 0 };
    }

    const now = new Date();
    for (const row of unread) {
      row.readAt = now;
    }
    await this.em.flush();
    return { marked: unread.length };
  }

  /**
   * Previous session (not the current/most recent one).
   * Returns null when the user has only ever had one session.
   */
  private async getPreviousLoginAt(userId: string): Promise<Date | null> {
    const sessions = await this.em.find(
      AuthSession,
      { user: { id: userId } },
      {
        orderBy: { createdAt: 'DESC' },
        limit: 2,
        fields: ['id', 'createdAt'],
      },
    );

    if (sessions.length < 2) {
      return null;
    }

    return sessions[1].createdAt;
  }

  private toDto(row: Notification): NotificationDto {
    return {
      id: row.id,
      type: row.type,
      titleKey: row.titleKey,
      bodyKey: row.bodyKey,
      params: row.params ?? null,
      link: row.link ?? null,
      important: row.important,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
