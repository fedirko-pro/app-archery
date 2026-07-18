import { describe, expect, it, vi, afterEach } from 'vitest';

import type { LocalTrainingSession } from './local-data-storage';
import {
  buildWeekSetFromSessions,
  computeLocalStats,
  computePriorMonthSummary,
  computeStreakAsOf,
  getIsoWeekString,
  formatTrainingSessionDateTime,
  getLastLoggedSession,
  getMostRecentSession,
  getRecentTrainingSessions,
  getStartOfWeek,
  getStreakAtRiskState,
  hasSessionInIsoWeek,
  sortTrainingSessionsNewestFirst,
  toSessionFormDefaults,
} from './training-stats';

function session(date: string): LocalTrainingSession {
  return {
    id: date,
    isSynced: false,
    date,
    createdAt: `${date}T12:00:00.000Z`,
    updatedAt: `${date}T12:00:00.000Z`,
  };
}

describe('getStreakAtRiskState', () => {
  const referenceDate = new Date('2026-06-18T12:00:00');

  it('returns not at risk when current week has a session', () => {
    const weekSet = buildWeekSetFromSessions([
      session('2026-06-16'),
      session('2026-06-09'),
      session('2026-06-02'),
    ]);
    expect(getStreakAtRiskState(weekSet, referenceDate)).toEqual({
      isAtRisk: false,
      priorStreakWeeks: 2,
    });
  });

  it('returns at risk when only prior weeks have sessions', () => {
    const weekSet = buildWeekSetFromSessions([session('2026-06-09'), session('2026-06-02')]);
    expect(getStreakAtRiskState(weekSet, referenceDate)).toEqual({
      isAtRisk: true,
      priorStreakWeeks: 2,
    });
  });

  it('returns not at risk with no sessions ever', () => {
    const weekSet = buildWeekSetFromSessions([]);
    expect(getStreakAtRiskState(weekSet, referenceDate)).toEqual({
      isAtRisk: false,
      priorStreakWeeks: 0,
    });
  });
});

describe('hasSessionInIsoWeek', () => {
  it('detects sessions in the ISO week containing the date', () => {
    const weekSet = new Set([getIsoWeekString(new Date('2026-06-09T12:00:00'))]);
    expect(hasSessionInIsoWeek(weekSet, new Date('2026-06-11T12:00:00'))).toBe(true);
    expect(hasSessionInIsoWeek(weekSet, new Date('2026-06-18T12:00:00'))).toBe(false);
  });
});

describe('computeStreakAsOf', () => {
  it('counts consecutive ISO weeks backward from the given date', () => {
    const weekSet = buildWeekSetFromSessions([
      session('2026-06-09'),
      session('2026-06-02'),
      session('2026-05-26'),
    ]);
    expect(computeStreakAsOf(weekSet, new Date('2026-06-11T12:00:00'))).toBe(3);
    expect(computeStreakAsOf(weekSet, new Date('2026-06-18T12:00:00'))).toBe(0);
  });
});

describe('computePriorMonthSummary', () => {
  it('returns null when prior month has no sessions', () => {
    const result = computePriorMonthSummary(
      [session('2026-06-05')],
      new Date('2026-06-10T12:00:00'),
    );
    expect(result).toBeNull();
  });

  it('aggregates prior month sessions and shots', () => {
    const result = computePriorMonthSummary(
      [
        session('2026-05-10'),
        { ...session('2026-05-20'), shotsCount: 60, distance: '18' },
        { ...session('2026-05-25'), shotsCount: 40, distance: '18' },
      ],
      new Date('2026-06-10T12:00:00'),
    );
    expect(result).toEqual({
      monthKey: '2026-05',
      sessions: 3,
      shots: 100,
      mostUsedDistance: '18',
    });
  });
});

describe('getStartOfWeek', () => {
  it('returns Monday for a weekday', () => {
    const result = getStartOfWeek(new Date('2026-06-17T14:00:00'));
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(15);
  });

  it('returns Monday for a Sunday', () => {
    const result = getStartOfWeek(new Date('2026-06-14T14:00:00'));
    expect(result.getDay()).toBe(1);
  });

  it('zeroes out time', () => {
    const result = getStartOfWeek(new Date('2026-06-17T14:30:45'));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('getMostRecentSession', () => {
  it('returns null for empty array', () => {
    expect(getMostRecentSession([])).toBeNull();
  });

  it('returns the most recent session by date', () => {
    const s1 = session('2026-06-01');
    const s2 = session('2026-06-15');
    expect(getMostRecentSession([s1, s2])!.id).toBe('2026-06-15');
  });

  it('breaks date ties by createdAt', () => {
    const s1 = {
      ...session('2026-06-15'),
      id: 'morning',
      createdAt: '2026-06-15T08:00:00.000Z',
    };
    const s2 = {
      ...session('2026-06-15'),
      id: 'evening',
      createdAt: '2026-06-15T14:00:00.000Z',
    };
    expect(getMostRecentSession([s1, s2])!.id).toBe('evening');
  });
});

describe('sortTrainingSessionsNewestFirst', () => {
  it('orders by date desc then createdAt desc', () => {
    const olderDay = session('2026-06-01');
    const morning = {
      ...session('2026-06-15'),
      id: 'morning',
      createdAt: '2026-06-15T08:00:00.000Z',
    };
    const evening = {
      ...session('2026-06-15'),
      id: 'evening',
      createdAt: '2026-06-15T14:00:00.000Z',
    };
    expect(sortTrainingSessionsNewestFirst([olderDay, morning, evening]).map((s) => s.id)).toEqual([
      'evening',
      'morning',
      '2026-06-01',
    ]);
  });
});

describe('formatTrainingSessionDateTime', () => {
  it('includes date and time from createdAt', () => {
    expect(
      formatTrainingSessionDateTime({
        date: '2026-06-15',
        createdAt: '2026-06-15T14:30:00.000Z',
      }),
    ).toMatch(/^15 Jun 2026, \d{2}:\d{2}$/);
  });
});

describe('getRecentTrainingSessions', () => {
  it('returns empty array for empty input', () => {
    expect(getRecentTrainingSessions([])).toEqual([]);
  });

  it('returns up to limit (default 3)', () => {
    const sessions = [
      session('2026-06-01'),
      session('2026-06-05'),
      session('2026-06-10'),
      session('2026-06-15'),
    ];
    const result = getRecentTrainingSessions(sessions);
    expect(result).toHaveLength(3);
    expect(result[0].date).toBe('2026-06-15');
  });

  it('respects custom limit', () => {
    const sessions = [session('2026-06-01'), session('2026-06-05'), session('2026-06-10')];
    const result = getRecentTrainingSessions(sessions, 1);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-06-10');
  });
});

describe('getLastLoggedSession', () => {
  it('returns null for empty array', () => {
    expect(getLastLoggedSession([])).toBeNull();
  });

  it('returns session with most recent createdAt', () => {
    const s1 = { ...session('2026-06-01'), createdAt: '2026-06-01T08:00:00.000Z' };
    const s2 = { ...session('2026-06-01'), createdAt: '2026-06-01T14:00:00.000Z' };
    expect(getLastLoggedSession([s1, s2])!.createdAt).toBe('2026-06-01T14:00:00.000Z');
  });
});

describe('toSessionFormDefaults', () => {
  it('copies distance, targetType, equipmentSetId from session', () => {
    const s = {
      ...session('2026-06-15'),
      distance: '18',
      targetType: 'triple',
      equipmentSetId: 'eq1',
    };
    const result = toSessionFormDefaults(s);
    expect(result.distance).toBe('18');
    expect(result.targetType).toBe('triple');
    expect(result.equipmentSetId).toBe('eq1');
  });

  it('uses defaultEquipmentSetId when session has none', () => {
    const s = session('2026-06-15');
    const result = toSessionFormDefaults(s, 'default-eq');
    expect(result.equipmentSetId).toBe('default-eq');
  });

  it('prefers session equipmentSetId over default', () => {
    const s = { ...session('2026-06-15'), equipmentSetId: 'session-eq' };
    const result = toSessionFormDefaults(s, 'default-eq');
    expect(result.equipmentSetId).toBe('session-eq');
  });

  it('sets date to today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T12:00:00'));
    const result = toSessionFormDefaults(session('2026-07-04'));
    expect(result.date).toBe('2026-07-04');
    vi.useRealTimers();
  });
});

describe('computeLocalStats', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns zeroed stats for empty sessions', () => {
    const stats = computeLocalStats([]);
    expect(stats.totalSessions).toBe(0);
    expect(stats.shots.total).toBe(0);
    expect(stats.avgShotsPerSession).toBe(0);
    expect(stats.mostUsedDistance).toBeNull();
    expect(stats.scoring.avgScore).toBeNull();
  });

  it('filters out unfinished sessions', () => {
    const s1 = { ...session('2026-06-15'), status: 'started' as const };
    const s2 = { ...session('2026-06-16'), status: 'finished' as const };
    const stats = computeLocalStats([s1, s2]);
    expect(stats.totalSessions).toBe(1);
  });

  it('counts total shots correctly', () => {
    const s1 = { ...session('2026-06-15'), shotsCount: 60 };
    const s2 = { ...session('2026-06-16'), shotsCount: 40 };
    const stats = computeLocalStats([s1, s2]);
    expect(stats.shots.total).toBe(100);
  });

  it('computes avgShotsPerSession', () => {
    const s1 = { ...session('2026-06-15'), shotsCount: 60 };
    const s2 = { ...session('2026-06-16'), shotsCount: 40 };
    const stats = computeLocalStats([s1, s2]);
    expect(stats.avgShotsPerSession).toBe(50);
  });

  it('computes scoring stats when sessions have scores', () => {
    const s1 = { ...session('2026-06-15'), scoreTotal: 100, distance: '18' };
    const s2 = { ...session('2026-06-16'), scoreTotal: 200, distance: '30' };
    const stats = computeLocalStats([s1, s2]);
    expect(stats.scoring.avgScore).toBe(150);
    expect(stats.scoring.bestSession?.score).toBe(200);
    expect(stats.scoring.avgScoreByDistance).toHaveLength(2);
  });

  it('computes equipment stats', () => {
    const s1 = { ...session('2026-06-15'), equipmentSetId: 'eq1', shotsCount: 60 };
    const s2 = { ...session('2026-06-16'), equipmentSetId: 'eq1', shotsCount: 40 };
    const equipmentSets = [
      {
        id: 'eq1',
        isSynced: false,
        name: 'My Bow',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];
    const stats = computeLocalStats([s1, s2], equipmentSets);
    expect(stats.byEquipment).toHaveLength(1);
    expect(stats.byEquipment[0].name).toBe('My Bow');
    expect(stats.byEquipment[0].shots).toBe(100);
    expect(stats.mostUsedEquipment).toBe('My Bow');
  });

  it('computes kilograms lifted from draw weight (pounds -> kg)', () => {
    const s1 = { ...session('2026-06-15'), equipmentSetId: 'eq1', shotsCount: 100 };
    const equipmentSets = [
      {
        id: 'eq1',
        isSynced: false,
        name: '40lb Recurve',
        drawWeight: 40,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];
    // 100 shots * 40 lbs * 0.45359237 kg/lb = 1814.37 -> 1814
    const stats = computeLocalStats([s1], equipmentSets);
    expect(stats.kilogramsLifted).toBe(1814);
  });

  it('counts zero kilograms lifted without an equipment set or draw weight', () => {
    const noSet = { ...session('2026-06-15'), shotsCount: 100 };
    const setNoWeight = { ...session('2026-06-16'), equipmentSetId: 'eq1', shotsCount: 100 };
    const equipmentSets = [
      {
        id: 'eq1',
        isSynced: false,
        name: 'No weight set',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];
    expect(computeLocalStats([noSet], equipmentSets).kilogramsLifted).toBe(0);
    expect(computeLocalStats([setNoWeight], equipmentSets).kilogramsLifted).toBe(0);
  });
});
