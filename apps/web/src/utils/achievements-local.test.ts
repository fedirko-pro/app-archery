import { lbsToKg } from '@sokil/shared-types';
import { describe, expect, it } from 'vitest';

import { computeLocalAchievements } from './achievements-local';
import type { LocalEquipmentSet, LocalTrainingSession } from './local-data-storage';

function session(overrides: Partial<LocalTrainingSession>): LocalTrainingSession {
  const date = overrides.date ?? '2026-06-15';
  return {
    id: overrides.id ?? date,
    isSynced: false,
    date,
    status: 'finished',
    createdAt: `${date}T12:00:00.000Z`,
    updatedAt: `${date}T12:00:00.000Z`,
    ...overrides,
  };
}

const bow: LocalEquipmentSet = {
  id: 'eq1',
  isSynced: false,
  name: '40lb Recurve',
  drawWeight: 40,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

function earned(sessions: LocalTrainingSession[], equipment: LocalEquipmentSet[], id: string) {
  const list = computeLocalAchievements(sessions, equipment);
  return list.achievements.find((a) => a.id === id)?.earned ?? false;
}

describe('lbsToKg', () => {
  it('converts pounds to kilograms', () => {
    expect(lbsToKg(40)).toBeCloseTo(18.1437, 3);
  });

  it('returns 0 for undefined / non-finite input', () => {
    expect(lbsToKg(undefined)).toBe(0);
    expect(lbsToKg(Number.NaN)).toBe(0);
  });
});

describe('meters traveled achievements', () => {
  it('unlocks the marathon badge once enough meters are walked', () => {
    // meters = shots * distance * 2 => 400 * 70 * 2 = 56000 >= 42195
    const sessions = [session({ shotsCount: 400, distance: '70' })];
    expect(earned(sessions, [], 'distance-marathon')).toBe(true);
    expect(earned(sessions, [], 'distance-there-and-back')).toBe(false);
  });

  it('does not unlock the marathon badge below the threshold', () => {
    // 100 * 18 * 2 = 3600 < 42195
    const sessions = [session({ shotsCount: 100, distance: '18' })];
    expect(earned(sessions, [], 'distance-marathon')).toBe(false);
  });
});

describe('kilograms lifted achievements', () => {
  it('unlocks Lift the Elephant once the cumulative draw weight crosses 6000 kg', () => {
    // 340 shots * 40 lbs * 0.45359 = ~6169 kg >= 6000
    const sessions = [session({ shotsCount: 340, equipmentSetId: 'eq1' })];
    expect(earned(sessions, [bow], 'lift-elephant')).toBe(true);
    expect(earned(sessions, [bow], 'lift-blue-whale')).toBe(false);
  });

  it('does not count kilograms for sessions without a draw weight', () => {
    const noWeightBow: LocalEquipmentSet = { ...bow, drawWeight: undefined };
    const sessions = [session({ shotsCount: 1000, equipmentSetId: 'eq1' })];
    expect(earned(sessions, [noWeightBow], 'lift-1t')).toBe(false);
  });
});
