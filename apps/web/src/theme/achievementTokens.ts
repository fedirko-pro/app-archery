import type { AchievementRarity } from '@sokil/shared-types';

/**
 * Achievement and rarity color palette.
 * These are decorative/gamification colors — intentionally distinct from brand tokens.
 */
export const RARITY_COLORS: Record<
  AchievementRarity,
  { color: string; bgGradient: string; glow: string }
> = {
  common: {
    color: '#9E9E9E',
    bgGradient: 'linear-gradient(135deg, #BDBDBD 0%, #9E9E9E 100%)',
    glow: 'rgba(158, 158, 158, 0.4)',
  },
  rare: {
    color: '#2196F3',
    bgGradient: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)',
    glow: 'rgba(33, 150, 243, 0.45)',
  },
  epic: {
    color: '#9C27B0',
    bgGradient: 'linear-gradient(135deg, #9C27B0 0%, #E040FB 100%)',
    glow: 'rgba(156, 39, 176, 0.45)',
  },
  legendary: {
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FF9800 100%)',
    glow: 'rgba(255, 215, 0, 0.5)',
  },
};

export const RARITY_ICON_COLORS: Record<AchievementRarity, string> = {
  legendary: '#FFD700',
  epic: '#9C27B0',
  rare: '#2196F3',
  common: '#9E9E9E',
};

export function getRarityStyle(rarity: AchievementRarity) {
  return RARITY_COLORS[rarity] ?? RARITY_COLORS.common;
}

/** @deprecated legacy demo ids — use getRarityStyle instead */
export const ACHIEVEMENT_COLORS: Record<string, { color: string; bgGradient: string }> = {};
