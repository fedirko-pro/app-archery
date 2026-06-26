import { describe, expect, it } from 'vitest';

import type { TournamentDto } from '../services/types';
import {
  filterTournamentsClient,
  isPastTournament,
  isUpcomingTournament,
} from './tournament-filters';

function tournament(overrides: Partial<TournamentDto> = {}): TournamentDto {
  return {
    id: '1',
    title: 'Test',
    startDate: '2026-01-15',
    endDate: '2026-01-17',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

describe('isPastTournament', () => {
  it('returns true when endDate is before today', () => {
    expect(isPastTournament({ startDate: '2020-01-01', endDate: '2020-01-05' })).toBe(true);
  });

  it('returns false when endDate is in the future', () => {
    expect(
      isPastTournament({
        startDate: '2099-01-01',
        endDate: '2099-01-05',
      }),
    ).toBe(false);
  });

  it('uses startDate when endDate is not provided', () => {
    expect(isPastTournament({ startDate: '2020-06-01' })).toBe(true);
  });

  it('returns false when startDate is today (end of day)', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(isPastTournament({ startDate: today })).toBe(false);
  });
});

describe('isUpcomingTournament', () => {
  it('is the inverse of isPastTournament', () => {
    const past = { startDate: '2020-01-01', endDate: '2020-01-05' };
    const future = { startDate: '2099-01-01', endDate: '2099-01-05' };

    expect(isUpcomingTournament(past)).toBe(false);
    expect(isUpcomingTournament(future)).toBe(true);
  });
});

describe('filterTournamentsClient', () => {
  const t1 = tournament({ id: '1', country: 'UA', startDate: '2020-01-01', endDate: '2020-01-05' });
  const t2 = tournament({ id: '2', country: 'UA', startDate: '2099-01-01', endDate: '2099-01-05' });
  const t3 = tournament({ id: '3', country: 'PL', startDate: '2020-06-01', endDate: '2020-06-05' });

  it('returns all tournaments without params', () => {
    expect(filterTournamentsClient([t1, t2, t3])).toHaveLength(3);
  });

  it('filters by country', () => {
    const result = filterTournamentsClient([t1, t2, t3], { country: 'UA' });
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.country === 'UA')).toBe(true);
  });

  it('filters upcoming only', () => {
    const result = filterTournamentsClient([t1, t2, t3], { upcoming: true });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters past only', () => {
    const result = filterTournamentsClient([t1, t2, t3], { upcoming: false });
    expect(result).toHaveLength(2);
  });

  it('combines country and upcoming filters', () => {
    const result = filterTournamentsClient([t1, t2, t3], { country: 'UA', upcoming: true });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});
