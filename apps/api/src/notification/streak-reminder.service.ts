import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationTypes } from '@sokil/shared-types';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';
import {
  getIsoWeekString,
  getStartOfIsoWeek,
  getStreakAtRiskState,
  sessionInstant,
} from './streak-weeks';

@Injectable()
export class StreakReminderService {
  private readonly logger = new Logger(StreakReminderService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 18 * * *', { timeZone: 'Europe/Lisbon' })
  async remindAtRiskStreaks(): Promise<void> {
    try {
      const now = new Date();
      const weekKey = getIsoWeekString(now);
      const rows = await this.em
        .getConnection()
        .execute<Array<{ user_id: string; date: string | Date }>>(
          'select "user_id", "date" from "training_session"',
        );
      const weeksByUser = new Map<string, Set<string>>();
      for (const row of rows) {
        const week = getIsoWeekString(sessionInstant(row.date));
        const weeks = weeksByUser.get(row.user_id) ?? new Set<string>();
        weeks.add(week);
        weeksByUser.set(row.user_id, weeks);
      }

      const alreadySent = await this.em.find(
        Notification,
        {
          type: NotificationTypes.TrainingStreakAtRisk,
          createdAt: { $gte: getStartOfIsoWeek(now) },
        },
        { fields: ['user'] },
      );
      const sentUserIds = new Set(alreadySent.map((row) => row.user.id));

      let created = 0;
      for (const [userId, weeks] of weeksByUser) {
        if (sentUserIds.has(userId)) continue;
        const state = getStreakAtRiskState(weeks, now);
        if (!state.isAtRisk) continue;
        const notification = await this.notificationsService.create({
          userId,
          type: NotificationTypes.TrainingStreakAtRisk,
          params: { priorStreakWeeks: state.priorStreakWeeks, weekKey },
          link: '/trainings',
        });
        if (notification) created++;
      }

      if (created > 0) {
        this.logger.log(`Created ${created} training streak reminders for week ${weekKey}`);
      }
    } catch (err) {
      this.logger.error(
        `Streak reminder job failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
