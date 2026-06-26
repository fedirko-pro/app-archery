import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { isTournamentFeedbackWindowOpen } from './tournament-feedback-utils';

describe('isTournamentFeedbackWindowOpen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true when tournament ended before today', () => {
    vi.setSystemTime(new Date('2026-06-15T12:00:00'));
    expect(isTournamentFeedbackWindowOpen({ startDate: '2026-06-01', endDate: '2026-06-10' })).toBe(
      true,
    );
  });

  it('returns false when tournament ends today', () => {
    vi.setSystemTime(new Date('2026-06-10T12:00:00'));
    expect(isTournamentFeedbackWindowOpen({ startDate: '2026-06-01', endDate: '2026-06-10' })).toBe(
      false,
    );
  });

  it('returns false when tournament is in the future', () => {
    vi.setSystemTime(new Date('2026-06-01T12:00:00'));
    expect(isTournamentFeedbackWindowOpen({ startDate: '2026-06-10', endDate: '2026-06-15' })).toBe(
      false,
    );
  });

  it('uses startDate when endDate is null', () => {
    vi.setSystemTime(new Date('2026-06-15T12:00:00'));
    expect(isTournamentFeedbackWindowOpen({ startDate: '2026-06-01', endDate: null })).toBe(true);
  });

  it('uses startDate when endDate is undefined', () => {
    vi.setSystemTime(new Date('2026-06-15T12:00:00'));
    expect(isTournamentFeedbackWindowOpen({ startDate: '2026-06-01' })).toBe(true);
  });
});
