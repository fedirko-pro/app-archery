import { describe, expect, it } from 'vitest';

import type { LocalTrainingSession } from './local-data-storage';
import { getStartedSession, isSessionFinished, sessionToDto } from './training-session-utils';

function session(overrides: Partial<LocalTrainingSession> = {}): LocalTrainingSession {
  return {
    id: '1',
    isSynced: false,
    date: '2026-06-15',
    createdAt: '2026-06-15T12:00:00.000Z',
    updatedAt: '2026-06-15T12:00:00.000Z',
    ...overrides,
  };
}

describe('isSessionFinished', () => {
  it('returns true for finished session', () => {
    expect(isSessionFinished(session({ status: 'finished' }))).toBe(true);
  });

  it('returns true when status is undefined (default is finished)', () => {
    expect(isSessionFinished(session({ status: undefined }))).toBe(true);
  });

  it('returns false for started session', () => {
    expect(isSessionFinished(session({ status: 'started' }))).toBe(false);
  });
});

describe('getStartedSession', () => {
  it('returns the started session', () => {
    const s1 = session({ id: '1', status: 'finished' });
    const s2 = session({ id: '2', status: 'started' });
    expect(getStartedSession([s1, s2])).toEqual(s2);
  });

  it('returns null when no started session', () => {
    const s1 = session({ status: 'finished' });
    expect(getStartedSession([s1])).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(getStartedSession([])).toBeNull();
  });

  it('returns first started session when multiple exist', () => {
    const s1 = session({ id: '1', status: 'started' });
    const s2 = session({ id: '2', status: 'started' });
    expect(getStartedSession([s1, s2])!.id).toBe('1');
  });
});

describe('sessionToDto', () => {
  it('converts local session to DTO', () => {
    const local = session({
      date: '2026-06-15',
      status: 'finished',
      shotsCount: 60,
      arrowsPerSet: 6,
      distance: '18',
      targetType: 'triple',
      equipmentSetId: 'eq1',
      scoreTotal: 450,
      notes: 'Good session',
      mood: 'good',
    });

    const dto = sessionToDto(local);
    expect(dto).toEqual({
      date: '2026-06-15',
      status: 'finished',
      shotsCount: 60,
      arrowsPerSet: 6,
      distance: '18',
      targetType: 'triple',
      equipmentSetId: 'eq1',
      scoreTotal: 450,
      notes: 'Good session',
      mood: 'good',
      customFields: undefined,
    });
  });

  it('defaults status to finished when undefined', () => {
    const local = session({ status: undefined });
    expect(sessionToDto(local).status).toBe('finished');
  });

  it('omits fields not present on local session', () => {
    const local = session();
    const dto = sessionToDto(local);
    expect(dto.shotsCount).toBeUndefined();
    expect(dto.scoreTotal).toBeUndefined();
  });
});
