import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationTypes } from '@sokil/shared-types';
import { subDays } from 'date-fns';
import { User } from '../user/entity/user.entity';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';
import {
  getDaysSinceSession,
  getIsoWeekString,
  getStartOfIsoWeek,
  getStreakAtRiskState,
  sessionInstant,
} from './streak-weeks';

const STREAK_REMINDER_DAYS = 6;

@Injectable()
export class StreakReminderService {
  private readonly logger = new Logger(StreakReminderService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Morning nudge for users who have not recorded a training session for
   * 6 or more consecutive days (respects the per-user streak reminder setting).
   */
  @Cron('0 8 * * *', { timeZone: 'Europe/Lisbon' })
  async remindDormantSessions(): Promise<void> {
    try {
      const now = new Date();
      const rows = await this.em
        .getConnection()
        .execute<Array<{ user_id: string; last_date: string | Date }>>(
          'select "user_id", max("date") as last_date from "training_session" group by "user_id"',
        );

      const dormantDaysByUser = new Map<string, number>();
      for (const row of rows) {
        const days = getDaysSinceSession(row.last_date, now);
        if (days >= STREAK_REMINDER_DAYS) {
          dormantDaysByUser.set(row.user_id, days);
        }
      }
      if (dormantDaysByUser.size === 0) return;

      const users = await this.em.find(
        User,
        { id: { $in: [...dormantDaysByUser.keys()] }, notifyStreakReminder: true },
        { fields: ['id'] },
      );
      if (users.length === 0) return;

      const alreadySent = await this.em.find(
        Notification,
        {
          type: NotificationTypes.TrainingStreakReminder,
          user: { id: { $in: users.map((user) => user.id) } },
          createdAt: { $gte: subDays(now, STREAK_REMINDER_DAYS) },
        },
        { fields: ['user'] },
      );
      const sentUserIds = new Set(alreadySent.map((row) => row.user.id));

      let created = 0;
      for (const user of users) {
        if (sentUserIds.has(user.id)) continue;
        const notification = await this.notificationsService.create({
          userId: user.id,
          type: NotificationTypes.TrainingStreakReminder,
          params: { days: dormantDaysByUser.get(user.id) },
          link: '/trainings',
        });
        if (notification) created++;
      }

      if (created > 0) {
        this.logger.log(`Created ${created} dormant training streak reminders`);
      }
    } catch (err) {
      this.logger.error(
        `Dormant streak reminder job failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

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
