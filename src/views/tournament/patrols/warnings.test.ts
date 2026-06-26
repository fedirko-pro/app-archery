import { describe, expect, it } from 'vitest';

import type { Participant, Patrol } from './types';
import { recalculateWarnings } from './warnings';

function participant(overrides: Partial<Participant> = {}): Participant {
  return {
    id: 'p1',
    name: 'Archer',
    club: 'Club A',
    division: 'Adult Male',
    bowCategory: 'RC',
    gender: 'M',
    ...overrides,
  };
}

function patrol(overrides: Partial<Patrol> = {}): Patrol {
  return {
    id: 'patrol1',
    targetNumber: 1,
    members: ['p1', 'p2', 'p3'],
    leaderId: 'p1',
    judgeIds: [],
    ...overrides,
  };
}

function buildMap(participants: Participant[]): Map<string, Participant> {
  return new Map(participants.map((p) => [p.id, p]));
}

describe('recalculateWarnings', () => {
  it('returns empty warnings for a well-configured patrol', () => {
    const p1 = participant({ id: 'p1', club: 'Club A' });
    const p2 = participant({ id: 'p2', club: 'Club B' });
    const p3 = participant({ id: 'p3', club: 'Club C' });
    const j1 = participant({ id: 'j1', club: 'Club D', name: 'Judge 1' });
    const j2 = participant({ id: 'j2', club: 'Club E', name: 'Judge 2' });

    const patrols = [
      patrol({
        members: ['p1', 'p2', 'p3'],
        leaderId: 'p1',
        judgeIds: ['j1', 'j2'],
      }),
    ];

    const warnings = recalculateWarnings(patrols, buildMap([p1, p2, p3, j1, j2]));
    expect(warnings).toEqual([]);
  });

  describe('same-club judges', () => {
    it('warns when both judges are from the same club', () => {
      const j1 = participant({ id: 'j1', club: 'Club A', name: 'Judge 1' });
      const j2 = participant({ id: 'j2', club: 'Club A', name: 'Judge 2' });
      const p1 = participant({ id: 'p1' });

      const patrols = [patrol({ members: ['p1'], leaderId: 'p1', judgeIds: ['j1', 'j2'] })];
      const warnings = recalculateWarnings(patrols, buildMap([p1, j1, j2]));

      expect(warnings).toEqual([
        expect.objectContaining({ type: 'same-club-judges', severity: 'warning' }),
      ]);
    });

    it('does not warn when judges are from different clubs', () => {
      const j1 = participant({ id: 'j1', club: 'Club A', name: 'Judge 1' });
      const j2 = participant({ id: 'j2', club: 'Club B', name: 'Judge 2' });
      const p1 = participant({ id: 'p1' });

      const patrols = [patrol({ members: ['p1'], leaderId: 'p1', judgeIds: ['j1', 'j2'] })];
      const warnings = recalculateWarnings(patrols, buildMap([p1, j1, j2]));

      expect(warnings).toHaveLength(0);
    });
  });

  describe('missing judges', () => {
    it('warns when no judges assigned', () => {
      const p1 = participant({ id: 'p1' });
      const patrols = [patrol({ members: ['p1'], leaderId: 'p1', judgeIds: [] })];
      const warnings = recalculateWarnings(patrols, buildMap([p1]));

      expect(warnings).toEqual([
        expect.objectContaining({ type: 'missing-judges', severity: 'error' }),
      ]);
    });

    it('warns when only 1 judge assigned', () => {
      const j1 = participant({ id: 'j1', name: 'Judge 1' });
      const p1 = participant({ id: 'p1' });

      const patrols = [patrol({ members: ['p1'], leaderId: 'p1', judgeIds: ['j1'] })];
      const warnings = recalculateWarnings(patrols, buildMap([p1, j1]));

      expect(warnings).toEqual([
        expect.objectContaining({ type: 'missing-judges', severity: 'error' }),
      ]);
    });
  });

  describe('missing leader', () => {
    it('warns when no leader assigned', () => {
      const p1 = participant({ id: 'p1' });
      const j1 = participant({ id: 'j1', club: 'Club A', name: 'Judge 1' });
      const j2 = participant({ id: 'j2', club: 'Club B', name: 'Judge 2' });
      const patrols = [patrol({ members: ['p1'], leaderId: null, judgeIds: ['j1', 'j2'] })];
      const warnings = recalculateWarnings(patrols, buildMap([p1, j1, j2]));

      expect(warnings).toEqual([
        expect.objectContaining({ type: 'missing-leader', severity: 'error' }),
      ]);
    });
  });

  describe('mixed divisions', () => {
    it('warns when patrol has mixed divisions', () => {
      const p1 = participant({ id: 'p1', division: 'Adult Male' });
      const p2 = participant({ id: 'p2', division: 'Junior Male' });
      const j1 = participant({ id: 'j1', club: 'Club A', name: 'Judge 1' });
      const j2 = participant({ id: 'j2', club: 'Club B', name: 'Judge 2' });

      const patrols = [patrol({ members: ['p1', 'p2'], leaderId: 'p1', judgeIds: ['j1', 'j2'] })];
      const warnings = recalculateWarnings(patrols, buildMap([p1, p2, j1, j2]));

      expect(warnings).toEqual([
        expect.objectContaining({ type: 'mixed-divisions', severity: 'info' }),
      ]);
    });

    it('does not warn when all members have same division', () => {
      const p1 = participant({ id: 'p1', division: 'Adult Male' });
      const p2 = participant({ id: 'p2', division: 'Adult Male' });
      const j1 = participant({ id: 'j1', club: 'Club A', name: 'Judge 1' });
      const j2 = participant({ id: 'j2', club: 'Club B', name: 'Judge 2' });

      const patrols = [patrol({ members: ['p1', 'p2'], leaderId: 'p1', judgeIds: ['j1', 'j2'] })];
      const warnings = recalculateWarnings(patrols, buildMap([p1, p2, j1, j2]));

      expect(warnings.filter((w) => w.type === 'mixed-divisions')).toHaveLength(0);
    });
  });

  describe('mixed genders', () => {
    it('warns when patrol has mixed genders', () => {
      const p1 = participant({ id: 'p1', gender: 'M' });
      const p2 = participant({ id: 'p2', gender: 'F' });
      const j1 = participant({ id: 'j1', club: 'Club A', name: 'Judge 1' });
      const j2 = participant({ id: 'j2', club: 'Club B', name: 'Judge 2' });

      const patrols = [patrol({ members: ['p1', 'p2'], leaderId: 'p1', judgeIds: ['j1', 'j2'] })];
      const warnings = recalculateWarnings(patrols, buildMap([p1, p2, j1, j2]));

      expect(warnings).toEqual([
        expect.objectContaining({ type: 'mixed-genders', severity: 'info' }),
      ]);
    });
  });

  describe('size imbalance', () => {
    it('warns when patrol sizes differ by more than 2', () => {
      const p1 = participant({ id: 'p1' });
      const p2 = participant({ id: 'p2' });
      const p3 = participant({ id: 'p3' });
      const p4 = participant({ id: 'p4' });
      const p5 = participant({ id: 'p5' });
      const p6 = participant({ id: 'p6' });
      const p7 = participant({ id: 'p7' });
      const p8 = participant({ id: 'p8' });
      const j1 = participant({ id: 'j1', name: 'Judge 1' });
      const j2 = participant({ id: 'j2', name: 'Judge 2' });

      const patrols = [
        patrol({
          id: 'small',
          members: ['p1'],
          leaderId: 'p1',
          judgeIds: ['j1', 'j2'],
        }),
        patrol({
          id: 'large',
          members: ['p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'],
          leaderId: 'p2',
          judgeIds: ['j1', 'j2'],
        }),
      ];
      const warnings = recalculateWarnings(
        patrols,
        buildMap([p1, p2, p3, p4, p5, p6, p7, p8, j1, j2]),
      );

      const imbalanceWarnings = warnings.filter((w) => w.type === 'size-imbalance');
      expect(imbalanceWarnings.length).toBeGreaterThan(0);
    });

    it('does not warn when patrol sizes are balanced', () => {
      const p1 = participant({ id: 'p1' });
      const p2 = participant({ id: 'p2' });
      const p3 = participant({ id: 'p3' });
      const p4 = participant({ id: 'p4' });
      const j1 = participant({ id: 'j1', name: 'Judge 1' });
      const j2 = participant({ id: 'j2', name: 'Judge 2' });

      const patrols = [
        patrol({ id: 'a', members: ['p1', 'p2'], leaderId: 'p1', judgeIds: ['j1', 'j2'] }),
        patrol({ id: 'b', members: ['p3', 'p4'], leaderId: 'p3', judgeIds: ['j1', 'j2'] }),
      ];
      const warnings = recalculateWarnings(patrols, buildMap([p1, p2, p3, p4, j1, j2]));

      expect(warnings.filter((w) => w.type === 'size-imbalance')).toHaveLength(0);
    });
  });

  it('collects warnings from multiple patrols', () => {
    const j1 = participant({ id: 'j1', club: 'Club A', name: 'J1' });
    const j2 = participant({ id: 'j2', club: 'Club A', name: 'J2' });
    const p1 = participant({ id: 'p1', gender: 'M' });
    const p2 = participant({ id: 'p2', gender: 'F' });
    const p3 = participant({ id: 'p3', gender: 'M' });

    const patrols = [
      patrol({ id: 'patrol1', members: ['p1', 'p2'], leaderId: 'p1', judgeIds: ['j1', 'j2'] }),
      patrol({ id: 'patrol2', members: ['p3'], leaderId: 'p3', judgeIds: ['j1', 'j2'] }),
    ];
    const warnings = recalculateWarnings(patrols, buildMap([p1, p2, p3, j1, j2]));

    expect(warnings.length).toBeGreaterThanOrEqual(2);
    expect(warnings.map((w) => w.patrolId)).toContain('patrol1');
    expect(warnings.map((w) => w.patrolId)).toContain('patrol2');
  });
});
