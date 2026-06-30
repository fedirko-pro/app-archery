import { describe, expect, it } from 'vitest';

import { getTournamentIdFromPath } from './tournament-route';

describe('getTournamentIdFromPath', () => {
  it('returns null for undefined', () => {
    expect(getTournamentIdFromPath(undefined)).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(getTournamentIdFromPath([])).toBeNull();
  });

  it('returns null when first segment is not "tournaments"', () => {
    expect(getTournamentIdFromPath(['archers', '123'])).toBeNull();
  });

  it('returns null when path has more than 2 segments', () => {
    expect(getTournamentIdFromPath(['tournaments', '123', 'edit'])).toBeNull();
  });

  it('returns null when only "tournaments" (no id)', () => {
    expect(getTournamentIdFromPath(['tournaments'])).toBeNull();
  });

  it('returns null when id is "create"', () => {
    expect(getTournamentIdFromPath(['tournaments', 'create'])).toBeNull();
  });

  it('returns tournament id for valid path', () => {
    expect(getTournamentIdFromPath(['tournaments', 'abc123'])).toBe('abc123');
  });

  it('returns null when id is empty string', () => {
    expect(getTournamentIdFromPath(['tournaments', ''])).toBeNull();
  });
});
