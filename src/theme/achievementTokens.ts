/**
 * Achievement and rarity color palette.
 * These are decorative/gamification colors — intentionally distinct from brand tokens.
 * Centralized here so changes propagate to achievements.tsx without hunting for hex literals.
 */
export const ACHIEVEMENT_COLORS: Record<string, { color: string; bgGradient: string }> = {
  'first-bullseye': {
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  },
  'perfect-round': {
    color: '#9C27B0',
    bgGradient: 'linear-gradient(135deg, #9C27B0 0%, #E040FB 100%)',
  },
  'tournament-winner': {
    color: '#F44336',
    bgGradient: 'linear-gradient(135deg, #F44336 0%, #FF9800 100%)',
  },
  'consistent-archer': {
    color: '#2196F3',
    bgGradient: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)',
  },
  'long-distance': {
    color: '#4CAF50',
    bgGradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
  },
  'team-spirit': {
    color: '#00BCD4',
    bgGradient: 'linear-gradient(135deg, #00BCD4 0%, #26C6DA 100%)',
  },
  'precision-master': {
    color: '#673AB7',
    bgGradient: 'linear-gradient(135deg, #673AB7 0%, #9575CD 100%)',
  },
};

export const RARITY_ICON_COLORS: Record<string, string> = {
  legendary: '#FFD700',
  epic: '#9C27B0',
  rare: '#2196F3',
  common: '#9E9E9E',
};
