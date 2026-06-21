import { describe, expect, it } from 'vitest';

import type { LocalTrainingSession } from './local-data-storage';
import {
  buildWeekSetFromSessions,
  computePriorMonthSummary,
  computeStreakAsOf,
  getIsoWeekString,
  getStreakAtRiskState,
  hasSessionInIsoWeek,
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
