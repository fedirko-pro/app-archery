import { AchievementCategory, AchievementRarity } from '@sokil/shared-types';

export class AchievementProgressDto {
  id: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  type: 'computed' | 'event';
  earned: boolean;
  progress: number;
  current?: number;
  threshold?: number;
  earnedAt?: string | null;
  source?: 'computed' | 'granted';
}

export class AchievementsListDto {
  achievements: AchievementProgressDto[];
  earnedCount: number;
  totalCount: number;
  percent: number;
  byRarity: Record<AchievementRarity, number>;
}

export class AchievementSyncResultDto {
  newlyUnlocked: string[];
}
