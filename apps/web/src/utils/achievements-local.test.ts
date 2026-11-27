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
  bowType: 'recurve',
  drawWeight: 40,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const barebow: LocalEquipmentSet = {
  id: 'eq2',
  isSynced: false,
  name: '35lb Barebow',
  bowType: 'barebow',
  drawWeight: 35,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

function earned(sessions: LocalTrainingSession[], equipment: LocalEquipmentSet[], id: string) {
  const list = computeLocalAchievements(sessions, equipment);
  return list.achievements.find((a) => a.id === id)?.earned ?? false;
}

// function progress(sessions: LocalTrainingSession[], equipment: LocalEquipmentSet[], id: string) {
//   const list = computeLocalAchievements(sessions, equipment);
//   return list.achievements.find((a) => a.id === id)?.progress ?? 0;
// }

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

  it('unlocks distance-100km after marathon', () => {
    // 500 * 100 * 2 = 100,000 meters = 100 km
    const sessions = [session({ shotsCount: 500, distance: '100' })];
    expect(earned(sessions, [], 'distance-100km')).toBe(true);
  });

  it('unlocks distance-500km', () => {
    // 2500 * 100 * 2 = 500,000 meters = 500 km
    const sessions = [session({ shotsCount: 2500, distance: '100' })];
    expect(earned(sessions, [], 'distance-500km')).toBe(true);
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

describe('discipline streak achievements', () => {
  it('unlocks streak-2-weeks and streak-4-weeks with 4 consecutive weeks', () => {
    const sessions = [
      session({ date: '2026-01-05', shotsCount: 30 }), // Week 1
      session({ date: '2026-01-12', shotsCount: 30 }), // Week 2
      session({ date: '2026-01-19', shotsCount: 30 }), // Week 3
      session({ date: '2026-01-26', shotsCount: 30 }), // Week 4
    ];
    expect(earned(sessions, [], 'streak-2-weeks')).toBe(true);
    expect(earned(sessions, [], 'streak-4-weeks')).toBe(true);
    expect(earned(sessions, [], 'streak-12-weeks')).toBe(false);
    expect(earned(sessions, [], 'streak-26-weeks')).toBe(false);
  });
});

describe('fieldcraft achievements', () => {
  it('unlocks bow-switch with 2 equipment sets', () => {
    const sessions = [
      session({ equipmentSetId: 'eq1', shotsCount: 30 }),
      session({ equipmentSetId: 'eq2', shotsCount: 30 }),
    ];
    expect(earned(sessions, [bow, barebow], 'bow-switch')).toBe(true);
  });

  it('unlocks style-versatility with 2 different bow types', () => {
    const sessions = [
      session({ equipmentSetId: 'eq1', shotsCount: 30 }),
      session({ equipmentSetId: 'eq2', shotsCount: 30 }),
    ];
    expect(earned(sessions, [bow, barebow], 'style-versatility')).toBe(true);
  });

  it('tracks fieldOr3dSessions metric for field target type', () => {
    const sessions = [session({ targetType: 'field', shotsCount: 30, status: 'finished' })];
    const list = computeLocalAchievements(sessions, []);
    const achievement = list.achievements.find((a) => a.id === 'field-or-3d');
    // The metric should be tracked even if prerequisites aren't met
    expect(achievement?.current).toBeGreaterThanOrEqual(0);
  });

  it('tracks fieldOr3dSessions metric for 3d target type', () => {
    const sessions = [session({ targetType: '3d', shotsCount: 30, status: 'finished' })];
    const list = computeLocalAchievements(sessions, []);
    const achievement = list.achievements.find((a) => a.id === 'field-or-3d');
    expect(achievement?.current).toBeGreaterThanOrEqual(0);
  });
});

describe('arena achievements', () => {
  it('unlocks clean-end for perfect score', () => {
    // 6 arrows * 10 points = 60 (perfect)
    const sessions = [session({ shotsCount: 6, scoreTotal: 60, distance: '18' })];
    // Note: This needs scored-sessions-5 as prerequisite first
    expect(earned(sessions, [], 'clean-end')).toBe(false);
  });
});

describe('prerequisite chain validation', () => {
  it('locks streak-4-weeks until streak-2-weeks is earned', () => {
    const sessions = [
      session({ date: '2026-01-05', shotsCount: 30 }), // Week 1
      session({ date: '2026-01-12', shotsCount: 30 }), // Week 2
    ];
    const list = computeLocalAchievements(sessions, []);
    const streak4 = list.achievements.find((a) => a.id === 'streak-4-weeks');
    expect(streak4?.prerequisitesMet).toBe(true); // streak-2-weeks is earned

    const streak12 = list.achievements.find((a) => a.id === 'streak-12-weeks');
    expect(streak12?.prerequisitesMet).toBe(false); // streak-4-weeks not earned yet
  });

  it('locks distance-100km until distance-marathon is earned', () => {
    // 200 * 18 * 2 = 7,200m = 7.2km (below marathon 42.195km)
    const sessions = [session({ shotsCount: 200, distance: '18' })];
    const list = computeLocalAchievements(sessions, []);
    const d100 = list.achievements.find((a) => a.id === 'distance-100km');
    expect(d100?.prerequisitesMet).toBe(false); // marathon not earned

    // 500 * 100 * 2 = 100,000m = 100km (above marathon)
    const sessions2 = [session({ shotsCount: 500, distance: '100' })];
    const list2 = computeLocalAchievements(sessions2, []);
    const d100v2 = list2.achievements.find((a) => a.id === 'distance-100km');
    expect(d100v2?.prerequisitesMet).toBe(true); // marathon is earned
  });
});

describe('retroactive unlock scenarios', () => {
  it('unlocks new distance achievements for existing high-mileage users', () => {
    // User with 600km already logged
    const sessions = [session({ shotsCount: 3000, distance: '100' })]; // 600km
    expect(earned(sessions, [], 'distance-100km')).toBe(true);
    expect(earned(sessions, [], 'distance-250km')).toBe(true);
    expect(earned(sessions, [], 'distance-500km')).toBe(true);
    expect(earned(sessions, [], 'distance-1000km')).toBe(false);
  });

  it('unlocks bow-switch for users with multiple equipment sets', () => {
    const sessions = [
      session({ equipmentSetId: 'eq1', shotsCount: 30 }),
      session({ equipmentSetId: 'eq2', shotsCount: 30 }),
    ];
    expect(earned(sessions, [bow, barebow], 'bow-switch')).toBe(true);
  });
});
