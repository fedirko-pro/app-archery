import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getTrainingSessions,
  incrementTrainingSessionShots,
  saveTrainingSession,
  StorageWriteError,
  updateTrainingSession,
} from './local-data-storage';

const TRAININGS_KEY = 'sokil_trainings';

describe('incrementTrainingSessionShots', () => {
  beforeEach(() => {
    localStorage.clear();
    saveTrainingSession({
      date: '2026-07-13',
      status: 'started',
      shotsCount: 0,
    });
    updateTrainingSession(getTrainingSessions()[0].id, { isSynced: true });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('increments shots atomically', () => {
    const session = getTrainingSessions()[0];
    const updated = incrementTrainingSessionShots(session.id, 1);
    expect(updated?.shotsCount).toBe(1);
    expect(getTrainingSessions()[0].shotsCount).toBe(1);
  });

  it('applies ten sequential increments correctly', () => {
    const session = getTrainingSessions()[0];
    for (let i = 0; i < 10; i += 1) {
      incrementTrainingSessionShots(session.id, 1);
    }
    expect(getTrainingSessions()[0].shotsCount).toBe(10);
  });

  it('updates arrowsPerSet when provided', () => {
    const session = getTrainingSessions()[0];
    incrementTrainingSessionShots(session.id, 6, { arrowsPerSet: 6 });
    const stored = getTrainingSessions()[0];
    expect(stored.shotsCount).toBe(6);
    expect(stored.arrowsPerSet).toBe(6);
  });

  it('marks session as unsynced after increment', () => {
    const session = getTrainingSessions()[0];
    updateTrainingSession(session.id, { isSynced: true });
    incrementTrainingSessionShots(session.id, 1);
    expect(getTrainingSessions()[0].isSynced).toBe(false);
  });

  it('returns null for unknown session id', () => {
    expect(incrementTrainingSessionShots('missing', 1)).toBeNull();
  });

  it('clamps shot count at zero when decrementing', () => {
    const session = getTrainingSessions()[0];
    incrementTrainingSessionShots(session.id, 2);
    incrementTrainingSessionShots(session.id, -1);
    expect(getTrainingSessions()[0].shotsCount).toBe(1);
    incrementTrainingSessionShots(session.id, -5);
    expect(getTrainingSessions()[0].shotsCount).toBe(0);
  });
});

describe('writeStorage failures', () => {
  beforeEach(() => {
    localStorage.clear();
    saveTrainingSession({
      date: '2026-07-13',
      status: 'started',
      shotsCount: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('throws StorageWriteError when localStorage quota is exceeded', () => {
    const session = getTrainingSessions()[0];
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const error = new DOMException('Quota exceeded', 'QuotaExceededError');
      throw error;
    });

    expect(() => incrementTrainingSessionShots(session.id, 1)).toThrow(StorageWriteError);
    try {
      incrementTrainingSessionShots(session.id, 1);
    } catch (error) {
      expect(error).toBeInstanceOf(StorageWriteError);
      expect((error as StorageWriteError).reason).toBe('quota');
    }
  });

  it('preserves existing data when write fails', () => {
    const session = getTrainingSessions()[0];
    updateTrainingSession(session.id, { shotsCount: 5, isSynced: true });

    let shouldFail = true;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      if (shouldFail && key === TRAININGS_KEY) {
        shouldFail = false;
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
      localStorage.setItem(key, value);
    });

    expect(() => incrementTrainingSessionShots(session.id, 1)).toThrow(StorageWriteError);
    expect(getTrainingSessions()[0].shotsCount).toBe(5);
  });
});
