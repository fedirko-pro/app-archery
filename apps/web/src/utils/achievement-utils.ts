import type { AchievementProgressDto } from '../services/types';

/** Most recently earned achievement (by earnedAt), or null if none. */
export function getLatestEarnedAchievement(
  achievements: AchievementProgressDto[],
): AchievementProgressDto | null {
  const earned = achievements.filter((a) => a.earned && a.earnedAt);
  if (earned.length === 0) return null;
  return [...earned].sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? ''))[0];
}
