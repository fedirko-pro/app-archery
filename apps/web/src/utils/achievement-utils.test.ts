import { describe, expect, it } from 'vitest';

import type { AchievementProgressDto } from '../services/types';
import { getLatestEarnedAchievement } from './achievement-utils';

function achievement(id: string, earned: boolean, earnedAt?: string): AchievementProgressDto {
  return {
    id,
    category: 'volume',
    rarity: 'common',
    icon: '🏹',
    titleKey: `achievements.${id}.title`,
    descriptionKey: `achievements.${id}.description`,
    type: 'computed',
    earned,
    progress: earned ? 100 : 0,
    earnedAt: earnedAt ?? null,
  };
}

describe('getLatestEarnedAchievement', () => {
  it('returns null when nothing is earned', () => {
    expect(getLatestEarnedAchievement([achievement('a', false)])).toBeNull();
  });

  it('returns the most recently earned achievement', () => {
    const list = [
      achievement('old', true, '2026-01-01T00:00:00.000Z'),
      achievement('new', true, '2026-06-15T00:00:00.000Z'),
    ];
    expect(getLatestEarnedAchievement(list)?.id).toBe('new');
  });
});
