import {
  AchievementBranch,
  AchievementRarity,
  EnduranceSubtrack,
  EvaluationMode,
} from '@sokil/shared-types';

export class AchievementProgressDto {
  id: string;
  branch: AchievementBranch;
  subtrack?: EnduranceSubtrack;
  tier: number;
  parentIds: string[];
  rarity: AchievementRarity;
  rarityHex: string;
  evaluationMode: EvaluationMode;
  icon: string;
  shareImage?: string;
  titleKey: string;
  descriptionKey: string;
  earned: boolean;
  progress: number;
  current?: number;
  threshold?: number;
  earnedAt?: string | null;
  source?: 'computed' | 'granted';
  prerequisitesMet?: boolean;
  // Asset URLs
  badge512?: string;
  thumb256?: string;
  ogCard1200?: string;
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
