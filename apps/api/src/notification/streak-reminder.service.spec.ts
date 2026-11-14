import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { SCHEDULE_CRON_OPTIONS } from '@nestjs/schedule/dist/schedule.constants';
import { NotificationsService } from './notifications.service';
import { StreakReminderService } from './streak-reminder.service';

describe('StreakReminderService', () => {
  let em: EntityManager;
  let fork: { name: string; getConnection: jest.Mock; find: jest.Mock };
  let contextEms: Array<EntityManager | undefined>;
  let service: StreakReminderService;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    contextEms = [];
    fork = {
      name: 'default',
      getConnection: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    };
    em = Object.create(EntityManager.prototype) as EntityManager;
    Object.assign(em, {
      name: 'default',
      fork: jest.fn(() => fork),
      getConnection: jest.fn(() => ({
        execute: jest.fn(async () => {
          contextEms.push(RequestContext.getEntityManager());
          return [];
        }),
      })),
      find: jest.fn(async () => {
        contextEms.push(RequestContext.getEntityManager());
        return [];
      }),
    });
    service = new StreakReminderService(em, {} as NotificationsService);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it.each(['remindDormantSessions', 'remindAtRiskStreaks'] as const)(
    'runs %s inside its own request context',
    async (method) => {
      expect(RequestContext.getEntityManager()).toBeUndefined();

      await service[method]();

      expect(em.fork).toHaveBeenCalledWith(expect.objectContaining({ useContext: true }));
      expect(contextEms.length).toBeGreaterThan(0);
      for (const contextEm of contextEms) {
        expect(contextEm).toBe(fork);
      }
      expect(errorSpy).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['remindDormantSessions', '0 8 * * *'],
    ['remindAtRiskStreaks', '0 18 * * *'],
  ] as const)('keeps the cron schedule on %s', (method, cronTime) => {
    const options = Reflect.getMetadata(
      SCHEDULE_CRON_OPTIONS,
      StreakReminderService.prototype[method],
    );
    expect(options).toEqual(expect.objectContaining({ cronTime, timeZone: 'Europe/Lisbon' }));
  });
});
