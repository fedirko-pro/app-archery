import { BadRequestException } from '@nestjs/common';
import { TOURNAMENT_SHORT_DESCRIPTION_MAX_LENGTH } from '@sokil/shared-types';

export function normalizeTournamentShortDescription(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException('Short description must be text');
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length > TOURNAMENT_SHORT_DESCRIPTION_MAX_LENGTH) {
    throw new BadRequestException(
      `Short description must be at most ${TOURNAMENT_SHORT_DESCRIPTION_MAX_LENGTH} characters`,
    );
  }

  return trimmed;
}
