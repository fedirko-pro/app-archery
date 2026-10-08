import { BadRequestException } from '@nestjs/common';
import { TOURNAMENT_SHORT_DESCRIPTION_MAX_LENGTH } from '@sokil/shared-types';

import { normalizeTournamentShortDescription } from './short-description';

describe('normalizeTournamentShortDescription', () => {
  it('trims text and treats blank values as empty', () => {
    expect(normalizeTournamentShortDescription('  Historical tournament  ')).toBe(
      'Historical tournament',
    );
    expect(normalizeTournamentShortDescription('   ')).toBeNull();
    expect(normalizeTournamentShortDescription(null)).toBeNull();
    expect(normalizeTournamentShortDescription(undefined)).toBeNull();
  });

  it('rejects values that are not text', () => {
    expect(() => normalizeTournamentShortDescription(12)).toThrow(BadRequestException);
  });

  it('rejects text longer than the share limit', () => {
    const tooLong = 'a'.repeat(TOURNAMENT_SHORT_DESCRIPTION_MAX_LENGTH + 1);
    expect(() => normalizeTournamentShortDescription(tooLong)).toThrow(BadRequestException);
    expect(
      normalizeTournamentShortDescription('a'.repeat(TOURNAMENT_SHORT_DESCRIPTION_MAX_LENGTH)),
    ).toHaveLength(TOURNAMENT_SHORT_DESCRIPTION_MAX_LENGTH);
  });
});
