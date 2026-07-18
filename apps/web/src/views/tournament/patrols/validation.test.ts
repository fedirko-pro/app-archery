import { describe, expect, it } from 'vitest';

import type { Participant, Patrol } from './types';
import { canDropMember } from './validation';

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
    members: ['p1', 'p2', 'p3', 'p4'],
    leaderId: null,
    judgeIds: [],
    ...overrides,
  };
}

function buildMap(participants: Participant[]): Map<string, Participant> {
  return new Map(participants.map((p) => [p.id, p]));
}

describe('canDropMember', () => {
  describe('invalid inputs', () => {
    it('returns disallowed when source patrol not found', () => {
      const result = canDropMember('p1', 'missing', 'patrol2', [patrol()], new Map());
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('pages.patrols.validation.invalid');
    });

    it('returns disallowed when target patrol not found', () => {
      const result = canDropMember('p1', 'patrol1', 'missing', [patrol()], new Map());
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('pages.patrols.validation.invalid');
    });

    it('returns disallowed when member not found', () => {
      const result = canDropMember('missing', 'patrol1', 'patrol2', [patrol()], new Map());
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('pages.patrols.validation.invalid');
    });
  });

  describe('hard constraint: minimum 3 members', () => {
    it('blocks move when source has exactly 3 members', () => {
      const src = patrol({ id: 'src', members: ['p1', 'p2', 'p3'] });
      const tgt = patrol({ id: 'tgt', members: ['p4', 'p5'] });
      const members = [
        participant({ id: 'p1' }),
        participant({ id: 'p2' }),
        participant({ id: 'p3' }),
        participant({ id: 'p4' }),
        participant({ id: 'p5' }),
      ];

      const result = canDropMember('p1', 'src', 'tgt', [src, tgt], buildMap(members));
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('pages.patrols.validation.sourceTooSmall');
    });

    it('allows move when source has more than 3 members', () => {
      const src = patrol({ id: 'src', members: ['p1', 'p2', 'p3', 'p4'] });
      const tgt = patrol({ id: 'tgt', members: ['p5'] });
      const members = [
        participant({ id: 'p1' }),
        participant({ id: 'p2' }),
        participant({ id: 'p3' }),
        participant({ id: 'p4' }),
        participant({ id: 'p5' }),
      ];

      const result = canDropMember('p1', 'src', 'tgt', [src, tgt], buildMap(members));
      expect(result.allowed).toBe(true);
    });
  });

  describe('soft constraints: warnings', () => {
    it('warns when member division differs from target dominant division', () => {
      const src = patrol({ id: 'src', members: ['p1', 'p2', 'p3', 'p4'] });
      const tgt = patrol({ id: 'tgt', members: ['p5', 'p6', 'p7'] });
      const members = [
        participant({ id: 'p1', division: 'Junior Male' }),
        participant({ id: 'p2', division: 'Junior Male' }),
        participant({ id: 'p3', division: 'Junior Male' }),
        participant({ id: 'p4', division: 'Junior Male' }),
        participant({ id: 'p5', division: 'Adult Male' }),
        participant({ id: 'p6', division: 'Adult Male' }),
        participant({ id: 'p7', division: 'Adult Male' }),
      ];

      const result = canDropMember('p1', 'src', 'tgt', [src, tgt], buildMap(members));
      expect(result.allowed).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('division')]),
      );
    });

    it('warns when member gender differs from target dominant gender', () => {
      const src = patrol({ id: 'src', members: ['p1', 'p2', 'p3', 'p4'] });
      const tgt = patrol({ id: 'tgt', members: ['p5', 'p6', 'p7'] });
      const members = [
        participant({ id: 'p1', gender: 'M' }),
        participant({ id: 'p2', gender: 'M' }),
        participant({ id: 'p3', gender: 'M' }),
        participant({ id: 'p4', gender: 'M' }),
        participant({ id: 'p5', gender: 'F' }),
        participant({ id: 'p6', gender: 'F' }),
        participant({ id: 'p7', gender: 'F' }),
      ];

      const result = canDropMember('p1', 'src', 'tgt', [src, tgt], buildMap(members));
      expect(result.allowed).toBe(true);
      expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining('gender')]));
    });

    it('returns no warnings when member matches target demographics', () => {
      const src = patrol({ id: 'src', members: ['p1', 'p2', 'p3', 'p4'] });
      const tgt = patrol({ id: 'tgt', members: ['p5', 'p6', 'p7'] });
      const members = [
        participant({ id: 'p1', division: 'Adult Male', gender: 'M' }),
        participant({ id: 'p2', division: 'Adult Male', gender: 'M' }),
        participant({ id: 'p3', division: 'Adult Male', gender: 'M' }),
        participant({ id: 'p4', division: 'Adult Male', gender: 'M' }),
        participant({ id: 'p5', division: 'Adult Male', gender: 'M' }),
        participant({ id: 'p6', division: 'Adult Male', gender: 'M' }),
        participant({ id: 'p7', division: 'Adult Male', gender: 'M' }),
      ];

      const result = canDropMember('p1', 'src', 'tgt', [src, tgt], buildMap(members));
      expect(result.allowed).toBe(true);
      expect(result.warnings).toEqual([]);
    });

    it('returns no warnings when target patrol is empty', () => {
      const src = patrol({ id: 'src', members: ['p1', 'p2', 'p3', 'p4'] });
      const tgt = patrol({ id: 'tgt', members: [] });
      const members = [
        participant({ id: 'p1' }),
        participant({ id: 'p2' }),
        participant({ id: 'p3' }),
        participant({ id: 'p4' }),
      ];

      const result = canDropMember('p1', 'src', 'tgt', [src, tgt], buildMap(members));
      expect(result.allowed).toBe(true);
      expect(result.warnings).toEqual([]);
    });

    it('returns multiple warnings when both division and gender differ', () => {
      const src = patrol({ id: 'src', members: ['p1', 'p2', 'p3', 'p4'] });
      const tgt = patrol({ id: 'tgt', members: ['p5', 'p6', 'p7'] });
      const members = [
        participant({ id: 'p1', division: 'Junior Male', gender: 'M' }),
        participant({ id: 'p2', division: 'Junior Male', gender: 'M' }),
        participant({ id: 'p3', division: 'Junior Male', gender: 'M' }),
        participant({ id: 'p4', division: 'Junior Male', gender: 'M' }),
        participant({ id: 'p5', division: 'Adult Female', gender: 'F' }),
        participant({ id: 'p6', division: 'Adult Female', gender: 'F' }),
        participant({ id: 'p7', division: 'Adult Female', gender: 'F' }),
      ];

      const result = canDropMember('p1', 'src', 'tgt', [src, tgt], buildMap(members));
      expect(result.allowed).toBe(true);
      expect(result.warnings).toHaveLength(2);
    });
  });
});
