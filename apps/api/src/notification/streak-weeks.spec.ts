import { getIsoWeekString, getStreakAtRiskState } from './streak-weeks';

describe('streak weeks', () => {
  it('flags a streak with no session in the current week', () => {
    const now = new Date('2026-09-29T12:00:00');
    const lastWeek = getIsoWeekString(new Date('2026-09-22T12:00:00'));
    const weekBefore = getIsoWeekString(new Date('2026-09-15T12:00:00'));
    const state = getStreakAtRiskState(new Set([lastWeek, weekBefore]), now);
    expect(state.isAtRisk).toBe(true);
    expect(state.priorStreakWeeks).toBe(2);
  });

  it('does not flag a streak that already has a session this week', () => {
    const now = new Date('2026-09-29T12:00:00');
    const thisWeek = getIsoWeekString(now);
    const lastWeek = getIsoWeekString(new Date('2026-09-22T12:00:00'));
    const state = getStreakAtRiskState(new Set([thisWeek, lastWeek]), now);
    expect(state.isAtRisk).toBe(false);
  });
});
