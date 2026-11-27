export type AchievementBranch = 'onboarding' | 'discipline' | 'endurance' | 'fieldcraft' | 'arena';

export type EnduranceSubtrack = 'arrows' | 'sessions' | 'distance' | 'weight';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type EvaluationMode = 'client_offline' | 'server_verified';

export type AchievementMetric =
  | 'sessionsTotal'
  | 'streakWeeksBest'
  | 'shotsTotal'
  | 'distinctDistances'
  | 'distinctTargetTypes'
  | 'applicationsSubmitted'
  | 'applicationsApproved'
  | 'scoredSessions'
  | 'equipmentSetsUsed'
  | 'profileComplete'
  | 'metersTraveledTotal'
  | 'kilogramsLifted'
  | 'distinctEquipmentSets'
  | 'distinctBowStyles'
  | 'fieldOr3dSessions'
  | 'maxScoringRingEnds';

export interface AchievementCriteria {
  metric: AchievementMetric;
  target: number;
}

export interface AchievementAssets {
  badge512: string;
  thumb256: string;
  ogCard1200: string;
}

export interface AchievementDefinition {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  branch: AchievementBranch;
  subtrack?: EnduranceSubtrack;
  tier: number;
  parentIds: string[];
  rarity: AchievementRarity;
  rarityHex: string;
  evaluationMode: EvaluationMode;
  criteria: AchievementCriteria;
  assets: AchievementAssets;
}

export interface AchievementStatsSnapshot {
  sessionsTotal: number;
  streakWeeksBest: number;
  shotsTotal: number;
  distinctDistances: number;
  distinctTargetTypes: number;
  applicationsSubmitted: number;
  applicationsApproved: number;
  scoredSessions: number;
  equipmentSetsUsed: number;
  profileComplete: boolean;
  metersTraveledTotal: number;
  kilogramsLifted: number;
  distinctEquipmentSets: number;
  distinctBowStyles: number;
  fieldOr3dSessions: number;
  maxScoringRingEnds: number;
}

/** Pounds to kilograms conversion factor. */
export const LB_TO_KG = 0.45359237;

/** Convert a draw weight in pounds to kilograms. Returns 0 when undefined. */
export function lbsToKg(lbs?: number | null): number {
  return typeof lbs === 'number' && Number.isFinite(lbs) ? lbs * LB_TO_KG : 0;
}

// Rarity color mapping (matches design spec)
const RARITY_HEX: Record<AchievementRarity, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

/**
 * Generates a placeholder image URL for an achievement.
 * Uses local asset paths in production, placehold.co for development.
 */
function generateAssetUrl(
  id: string,
  size: '512' | '256' | 'og',
  rarity: AchievementRarity,
): string {
  // In production, these would be local assets: /assets/achievements/{id}_{size}.png
  // For now, use placehold.co with rarity color
  const color = RARITY_HEX[rarity].slice(1); // remove #
  const encodedId = encodeURIComponent(id);
  if (size === 'og') {
    return `https://placehold.co/1200x630/${color}/FFFFFF?text=${encodedId}&font=roboto`;
  }
  const dim = size === '512' ? '512x512' : '256x256';
  return `https://placehold.co/${dim}/${color}/FFFFFF?text=${encodedId}&font=roboto`;
}

function assetsFor(id: string, rarity: AchievementRarity): AchievementAssets {
  return {
    badge512: generateAssetUrl(id, '512', rarity),
    thumb256: generateAssetUrl(id, '256', rarity),
    ogCard1200: generateAssetUrl(id, 'og', rarity),
  };
}

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  // ============================================================
  // ONBOARDING (tier 1-4)
  // ============================================================
  {
    id: 'first-session',
    titleKey: 'achievements.firstSession.title',
    descriptionKey: 'achievements.firstSession.description',
    icon: '🏹',
    branch: 'onboarding',
    tier: 1,
    parentIds: [],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'sessionsTotal', target: 1 },
    assets: assetsFor('first-session', 'common'),
  },
  {
    id: 'first-equipment',
    titleKey: 'achievements.firstEquipment.title',
    descriptionKey: 'achievements.firstEquipment.description',
    icon: '🎯',
    branch: 'onboarding',
    tier: 2,
    parentIds: [],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'equipmentSetsUsed', target: 1 },
    assets: assetsFor('first-equipment', 'common'),
  },
  {
    id: 'profile-complete',
    titleKey: 'achievements.profileComplete.title',
    descriptionKey: 'achievements.profileComplete.description',
    icon: '👤',
    branch: 'onboarding',
    tier: 3,
    parentIds: [],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'profileComplete', target: 1 },
    assets: assetsFor('profile-complete', 'common'),
  },
  {
    id: 'offline-session',
    titleKey: 'achievements.offlineSession.title',
    descriptionKey: 'achievements.offlineSession.description',
    icon: '📱',
    branch: 'onboarding',
    tier: 4,
    parentIds: ['first-session'],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'sessionsTotal', target: 1 },
    assets: assetsFor('offline-session', 'common'),
  },

  // ============================================================
  // DISCIPLINE — Consistency Streaks (tier 1-5)
  // ============================================================
  {
    id: 'streak-2-weeks',
    titleKey: 'achievements.streak2Weeks.title',
    descriptionKey: 'achievements.streak2Weeks.description',
    icon: '🔥',
    branch: 'discipline',
    tier: 1,
    parentIds: [],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'streakWeeksBest', target: 2 },
    assets: assetsFor('streak-2-weeks', 'common'),
  },
  {
    id: 'streak-4-weeks',
    titleKey: 'achievements.streak4Weeks.title',
    descriptionKey: 'achievements.streak4Weeks.description',
    icon: '🔥',
    branch: 'discipline',
    tier: 2,
    parentIds: ['streak-2-weeks'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'streakWeeksBest', target: 4 },
    assets: assetsFor('streak-4-weeks', 'rare'),
  },
  {
    id: 'streak-12-weeks',
    titleKey: 'achievements.streak12Weeks.title',
    descriptionKey: 'achievements.streak12Weeks.description',
    icon: '🔥',
    branch: 'discipline',
    tier: 3,
    parentIds: ['streak-4-weeks'],
    rarity: 'epic',
    rarityHex: RARITY_HEX.epic,
    evaluationMode: 'client_offline',
    criteria: { metric: 'streakWeeksBest', target: 12 },
    assets: assetsFor('streak-12-weeks', 'epic'),
  },
  {
    id: 'streak-26-weeks',
    titleKey: 'achievements.streak26Weeks.title',
    descriptionKey: 'achievements.streak26Weeks.description',
    icon: '🔥',
    branch: 'discipline',
    tier: 4,
    parentIds: ['streak-12-weeks'],
    rarity: 'epic',
    rarityHex: RARITY_HEX.epic,
    evaluationMode: 'client_offline',
    criteria: { metric: 'streakWeeksBest', target: 26 },
    assets: assetsFor('streak-26-weeks', 'epic'),
  },
  {
    id: 'streak-52-weeks',
    titleKey: 'achievements.streak52Weeks.title',
    descriptionKey: 'achievements.streak52Weeks.description',
    icon: '🔥',
    branch: 'discipline',
    tier: 5,
    parentIds: ['streak-26-weeks'],
    rarity: 'legendary',
    rarityHex: RARITY_HEX.legendary,
    evaluationMode: 'client_offline',
    criteria: { metric: 'streakWeeksBest', target: 52 },
    assets: assetsFor('streak-52-weeks', 'legendary'),
  },

  // ============================================================
  // ENDURANCE — Arrows (tier 1-4)
  // ============================================================
  {
    id: 'arrows-500',
    titleKey: 'achievements.arrows500.title',
    descriptionKey: 'achievements.arrows500.description',
    icon: '➡️',
    branch: 'endurance',
    subtrack: 'arrows',
    tier: 1,
    parentIds: [],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'shotsTotal', target: 500 },
    assets: assetsFor('arrows-500', 'common'),
  },
  {
    id: 'arrows-2500',
    titleKey: 'achievements.arrows2500.title',
    descriptionKey: 'achievements.arrows2500.description',
    icon: '➡️',
    branch: 'endurance',
    subtrack: 'arrows',
    tier: 2,
    parentIds: ['arrows-500'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'shotsTotal', target: 2500 },
    assets: assetsFor('arrows-2500', 'rare'),
  },
  {
    id: 'arrows-10000',
    titleKey: 'achievements.arrows10000.title',
    descriptionKey: 'achievements.arrows10000.description',
    icon: '➡️',
    branch: 'endurance',
    subtrack: 'arrows',
    tier: 3,
    parentIds: ['arrows-2500'],
    rarity: 'epic',
    rarityHex: RARITY_HEX.epic,
    evaluationMode: 'client_offline',
    criteria: { metric: 'shotsTotal', target: 10000 },
    assets: assetsFor('arrows-10000', 'epic'),
  },
  {
    id: 'arrows-25000',
    titleKey: 'achievements.arrows25000.title',
    descriptionKey: 'achievements.arrows25000.description',
    icon: '➡️',
    branch: 'endurance',
    subtrack: 'arrows',
    tier: 4,
    parentIds: ['arrows-10000'],
    rarity: 'legendary',
    rarityHex: RARITY_HEX.legendary,
    evaluationMode: 'client_offline',
    criteria: { metric: 'shotsTotal', target: 25000 },
    assets: assetsFor('arrows-25000', 'legendary'),
  },

  // ============================================================
  // ENDURANCE — Sessions (tier 1-4)
  // ============================================================
  {
    id: 'sessions-10',
    titleKey: 'achievements.sessions10.title',
    descriptionKey: 'achievements.sessions10.description',
    icon: '📅',
    branch: 'endurance',
    subtrack: 'sessions',
    tier: 1,
    parentIds: [],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'sessionsTotal', target: 10 },
    assets: assetsFor('sessions-10', 'common'),
  },
  {
    id: 'sessions-50',
    titleKey: 'achievements.sessions50.title',
    descriptionKey: 'achievements.sessions50.description',
    icon: '📅',
    branch: 'endurance',
    subtrack: 'sessions',
    tier: 2,
    parentIds: ['sessions-10'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'sessionsTotal', target: 50 },
    assets: assetsFor('sessions-50', 'rare'),
  },
  {
    id: 'sessions-150',
    titleKey: 'achievements.sessions150.title',
    descriptionKey: 'achievements.sessions150.description',
    icon: '📅',
    branch: 'endurance',
    subtrack: 'sessions',
    tier: 3,
    parentIds: ['sessions-50'],
    rarity: 'epic',
    rarityHex: RARITY_HEX.epic,
    evaluationMode: 'client_offline',
    criteria: { metric: 'sessionsTotal', target: 150 },
    assets: assetsFor('sessions-150', 'epic'),
  },
  {
    id: 'sessions-500',
    titleKey: 'achievements.sessions500.title',
    descriptionKey: 'achievements.sessions500.description',
    icon: '📅',
    branch: 'endurance',
    subtrack: 'sessions',
    tier: 4,
    parentIds: ['sessions-150'],
    rarity: 'legendary',
    rarityHex: RARITY_HEX.legendary,
    evaluationMode: 'client_offline',
    criteria: { metric: 'sessionsTotal', target: 500 },
    assets: assetsFor('sessions-500', 'legendary'),
  },

  // ============================================================
  // ENDURANCE — Distance (tier 1-7)
  // ============================================================
  {
    id: 'distance-10km',
    titleKey: 'achievements.distance10km.title',
    descriptionKey: 'achievements.distance10km.description',
    icon: '🥾',
    branch: 'endurance',
    subtrack: 'distance',
    tier: 1,
    parentIds: [],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'metersTraveledTotal', target: 10000 },
    assets: assetsFor('distance-10km', 'common'),
  },
  {
    id: 'distance-marathon',
    titleKey: 'achievements.distanceMarathon.title',
    descriptionKey: 'achievements.distanceMarathon.description',
    icon: '🥾',
    branch: 'endurance',
    subtrack: 'distance',
    tier: 2,
    parentIds: ['distance-10km'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'metersTraveledTotal', target: 42195 },
    assets: assetsFor('distance-marathon', 'rare'),
  },
  {
    id: 'distance-100km',
    titleKey: 'achievements.distance100km.title',
    descriptionKey: 'achievements.distance100km.description',
    icon: '🥾',
    branch: 'endurance',
    subtrack: 'distance',
    tier: 3,
    parentIds: ['distance-marathon'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'metersTraveledTotal', target: 100000 },
    assets: assetsFor('distance-100km', 'rare'),
  },
  {
    id: 'distance-250km',
    titleKey: 'achievements.distance250km.title',
    descriptionKey: 'achievements.distance250km.description',
    icon: '🥾',
    branch: 'endurance',
    subtrack: 'distance',
    tier: 4,
    parentIds: ['distance-100km'],
    rarity: 'epic',
    rarityHex: RARITY_HEX.epic,
    evaluationMode: 'client_offline',
    criteria: { metric: 'metersTraveledTotal', target: 250000 },
    assets: assetsFor('distance-250km', 'epic'),
  },
  {
    id: 'distance-500km',
    titleKey: 'achievements.distance500km.title',
    descriptionKey: 'achievements.distance500km.description',
    icon: '🥾',
    branch: 'endurance',
    subtrack: 'distance',
    tier: 5,
    parentIds: ['distance-250km'],
    rarity: 'epic',
    rarityHex: RARITY_HEX.epic,
    evaluationMode: 'client_offline',
    criteria: { metric: 'metersTraveledTotal', target: 500000 },
    assets: assetsFor('distance-500km', 'epic'),
  },
  {
    id: 'distance-1000km',
    titleKey: 'achievements.distance1000km.title',
    descriptionKey: 'achievements.distance1000km.description',
    icon: '🥾',
    branch: 'endurance',
    subtrack: 'distance',
    tier: 6,
    parentIds: ['distance-500km'],
    rarity: 'epic',
    rarityHex: RARITY_HEX.epic,
    evaluationMode: 'client_offline',
    criteria: { metric: 'metersTraveledTotal', target: 1000000 },
    assets: assetsFor('distance-1000km', 'epic'),
  },
  {
    id: 'distance-there-and-back',
    titleKey: 'achievements.distanceThereAndBack.title',
    descriptionKey: 'achievements.distanceThereAndBack.description',
    icon: '🗺️',
    branch: 'endurance',
    subtrack: 'distance',
    tier: 7,
    parentIds: ['distance-1000km'],
    rarity: 'legendary',
    rarityHex: RARITY_HEX.legendary,
    evaluationMode: 'client_offline',
    criteria: { metric: 'metersTraveledTotal', target: 3000000 },
    assets: assetsFor('distance-there-and-back', 'legendary'),
  },

  // ============================================================
  // ENDURANCE — Weight (tier 1-4)
  // ============================================================
  {
    id: 'lift-1t',
    titleKey: 'achievements.lift1t.title',
    descriptionKey: 'achievements.lift1t.description',
    icon: '🏋️',
    branch: 'endurance',
    subtrack: 'weight',
    tier: 1,
    parentIds: [],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'kilogramsLifted', target: 1000 },
    assets: assetsFor('lift-1t', 'common'),
  },
  {
    id: 'lift-elephant',
    titleKey: 'achievements.liftElephant.title',
    descriptionKey: 'achievements.liftElephant.description',
    icon: '🐘',
    branch: 'endurance',
    subtrack: 'weight',
    tier: 2,
    parentIds: ['lift-1t'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'kilogramsLifted', target: 6000 },
    assets: assetsFor('lift-elephant', 'rare'),
  },
  {
    id: 'lift-blue-whale',
    titleKey: 'achievements.liftBlueWhale.title',
    descriptionKey: 'achievements.liftBlueWhale.description',
    icon: '🐋',
    branch: 'endurance',
    subtrack: 'weight',
    tier: 3,
    parentIds: ['lift-elephant'],
    rarity: 'epic',
    rarityHex: RARITY_HEX.epic,
    evaluationMode: 'client_offline',
    criteria: { metric: 'kilogramsLifted', target: 150000 },
    assets: assetsFor('lift-blue-whale', 'epic'),
  },
  {
    id: 'lift-kiloton',
    titleKey: 'achievements.liftKiloton.title',
    descriptionKey: 'achievements.liftKiloton.description',
    icon: '🏋️',
    branch: 'endurance',
    subtrack: 'weight',
    tier: 4,
    parentIds: ['lift-blue-whale'],
    rarity: 'legendary',
    rarityHex: RARITY_HEX.legendary,
    evaluationMode: 'client_offline',
    criteria: { metric: 'kilogramsLifted', target: 1000000 },
    assets: assetsFor('lift-kiloton', 'legendary'),
  },

  // ============================================================
  // FIELDCRAFT — Exploration (tier 1-6)
  // ============================================================
  {
    id: 'distances-3',
    titleKey: 'achievements.distances3.title',
    descriptionKey: 'achievements.distances3.description',
    icon: '📏',
    branch: 'fieldcraft',
    tier: 1,
    parentIds: [],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'distinctDistances', target: 3 },
    assets: assetsFor('distances-3', 'common'),
  },
  {
    id: 'distances-5',
    titleKey: 'achievements.distances5.title',
    descriptionKey: 'achievements.distances5.description',
    icon: '📏',
    branch: 'fieldcraft',
    tier: 2,
    parentIds: ['distances-3'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'distinctDistances', target: 5 },
    assets: assetsFor('distances-5', 'rare'),
  },
  {
    id: 'target-types-3',
    titleKey: 'achievements.targetTypes3.title',
    descriptionKey: 'achievements.targetTypes3.description',
    icon: '🎯',
    branch: 'fieldcraft',
    tier: 3,
    parentIds: [],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'distinctTargetTypes', target: 3 },
    assets: assetsFor('target-types-3', 'common'),
  },
  {
    id: 'field-or-3d',
    titleKey: 'achievements.fieldOr3d.title',
    descriptionKey: 'achievements.fieldOr3d.description',
    icon: '🌲',
    branch: 'fieldcraft',
    tier: 4,
    parentIds: ['target-types-3'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'fieldOr3dSessions', target: 1 },
    assets: assetsFor('field-or-3d', 'rare'),
  },
  {
    id: 'bow-switch',
    titleKey: 'achievements.bowSwitch.title',
    descriptionKey: 'achievements.bowSwitch.description',
    icon: '🏹',
    branch: 'fieldcraft',
    tier: 5,
    parentIds: ['first-equipment'],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'distinctEquipmentSets', target: 2 },
    assets: assetsFor('bow-switch', 'common'),
  },
  {
    id: 'style-versatility',
    titleKey: 'achievements.styleVersatility.title',
    descriptionKey: 'achievements.styleVersatility.description',
    icon: '🎯',
    branch: 'fieldcraft',
    tier: 6,
    parentIds: ['bow-switch'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'distinctBowStyles', target: 2 },
    assets: assetsFor('style-versatility', 'rare'),
  },

  // ============================================================
  // ARENA — Tournaments & Mastery (tier 1-7)
  // ============================================================
  {
    id: 'first-application',
    titleKey: 'achievements.firstApplication.title',
    descriptionKey: 'achievements.firstApplication.description',
    icon: '📝',
    branch: 'arena',
    tier: 1,
    parentIds: ['profile-complete'],
    rarity: 'common',
    rarityHex: RARITY_HEX.common,
    evaluationMode: 'client_offline',
    criteria: { metric: 'applicationsSubmitted', target: 1 },
    assets: assetsFor('first-application', 'common'),
  },
  {
    id: 'competitor',
    titleKey: 'achievements.competitor.title',
    descriptionKey: 'achievements.competitor.description',
    icon: '🏅',
    branch: 'arena',
    tier: 2,
    parentIds: ['first-application'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'server_verified',
    criteria: { metric: 'applicationsApproved', target: 1 },
    assets: assetsFor('competitor', 'rare'),
  },
  {
    id: 'seasoned-competitor',
    titleKey: 'achievements.seasonedCompetitor.title',
    descriptionKey: 'achievements.seasonedCompetitor.description',
    icon: '🏅',
    branch: 'arena',
    tier: 3,
    parentIds: ['competitor'],
    rarity: 'epic',
    rarityHex: RARITY_HEX.epic,
    evaluationMode: 'server_verified',
    criteria: { metric: 'applicationsApproved', target: 5 },
    assets: assetsFor('seasoned-competitor', 'epic'),
  },
  {
    id: 'tournament-champion',
    titleKey: 'achievements.tournamentChampion.title',
    descriptionKey: 'achievements.tournamentChampion.description',
    icon: '🏆',
    branch: 'arena',
    tier: 4,
    parentIds: ['seasoned-competitor'],
    rarity: 'legendary',
    rarityHex: RARITY_HEX.legendary,
    evaluationMode: 'server_verified',
    criteria: { metric: 'applicationsApproved', target: 1 },
    assets: assetsFor('tournament-champion', 'legendary'),
  },
  {
    id: 'scored-sessions-5',
    titleKey: 'achievements.scoredSessions5.title',
    descriptionKey: 'achievements.scoredSessions5.description',
    icon: '💯',
    branch: 'arena',
    tier: 5,
    parentIds: [],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'scoredSessions', target: 5 },
    assets: assetsFor('scored-sessions-5', 'rare'),
  },
  {
    id: 'clean-end',
    titleKey: 'achievements.cleanEnd.title',
    descriptionKey: 'achievements.cleanEnd.description',
    icon: '🎯',
    branch: 'arena',
    tier: 6,
    parentIds: ['scored-sessions-5'],
    rarity: 'rare',
    rarityHex: RARITY_HEX.rare,
    evaluationMode: 'client_offline',
    criteria: { metric: 'maxScoringRingEnds', target: 1 },
    assets: assetsFor('clean-end', 'rare'),
  },
  {
    id: 'personal-best',
    titleKey: 'achievements.personalBest.title',
    descriptionKey: 'achievements.personalBest.description',
    icon: '⭐',
    branch: 'arena',
    tier: 7,
    parentIds: ['scored-sessions-5'],
    rarity: 'epic',
    rarityHex: RARITY_HEX.epic,
    evaluationMode: 'server_verified',
    criteria: { metric: 'scoredSessions', target: 1 },
    assets: assetsFor('personal-best', 'epic'),
  },
];

export const ACHIEVEMENT_CATALOG_BY_ID: Record<string, AchievementDefinition> = Object.fromEntries(
  ACHIEVEMENT_CATALOG.map((a) => [a.id, a]),
);

export const BRANCH_ORDER: AchievementBranch[] = [
  'onboarding',
  'discipline',
  'endurance',
  'fieldcraft',
  'arena',
];
export const ENDURANCE_SUBTRACK_ORDER: EnduranceSubtrack[] = [
  'arrows',
  'sessions',
  'distance',
  'weight',
];

export const RARITY_ORDER: Record<AchievementRarity, number> = {
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 1,
};

export function isValidAchievementId(id: string): boolean {
  return id in ACHIEVEMENT_CATALOG_BY_ID;
}

function getMetricValue(snapshot: AchievementStatsSnapshot, metric: AchievementMetric): number {
  switch (metric) {
    case 'sessionsTotal':
      return snapshot.sessionsTotal;
    case 'streakWeeksBest':
      return snapshot.streakWeeksBest;
    case 'shotsTotal':
      return snapshot.shotsTotal;
    case 'distinctDistances':
      return snapshot.distinctDistances;
    case 'distinctTargetTypes':
      return snapshot.distinctTargetTypes;
    case 'applicationsSubmitted':
      return snapshot.applicationsSubmitted;
    case 'applicationsApproved':
      return snapshot.applicationsApproved;
    case 'scoredSessions':
      return snapshot.scoredSessions;
    case 'equipmentSetsUsed':
      return snapshot.equipmentSetsUsed;
    case 'profileComplete':
      return snapshot.profileComplete ? 1 : 0;
    case 'metersTraveledTotal':
      return snapshot.metersTraveledTotal;
    case 'kilogramsLifted':
      return snapshot.kilogramsLifted;
    case 'distinctEquipmentSets':
      return snapshot.distinctEquipmentSets;
    case 'distinctBowStyles':
      return snapshot.distinctBowStyles;
    case 'fieldOr3dSessions':
      return snapshot.fieldOr3dSessions;
    case 'maxScoringRingEnds':
      return snapshot.maxScoringRingEnds;
    default:
      return 0;
  }
}

export function evaluateComputedProgress(
  def: AchievementDefinition,
  snapshot: AchievementStatsSnapshot,
): { earned: boolean; progress: number; current: number; target: number } {
  if (def.evaluationMode === 'server_verified' || !def.criteria) {
    return { earned: false, progress: 0, current: 0, target: 0 };
  }

  const current = getMetricValue(snapshot, def.criteria.metric);
  const target = def.criteria.target;
  const earned = current >= target;
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return { earned, progress, current, target };
}

export interface AchievementCompletionSummary {
  earnedCount: number;
  totalCount: number;
  percent: number;
  byRarity: Record<AchievementRarity, number>;
}

export function summarizeCompletion(
  earnedIds: Set<string>,
  catalog: AchievementDefinition[] = ACHIEVEMENT_CATALOG,
): AchievementCompletionSummary {
  const activeCatalog = catalog.filter((a) => ACHIEVEMENT_CATALOG_BY_ID[a.id]);
  const earnedInCatalog = [...earnedIds].filter((id) => isValidAchievementId(id));
  const earnedCount = earnedInCatalog.length;
  const totalCount = activeCatalog.length;
  const percent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const byRarity: Record<AchievementRarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  for (const id of earnedInCatalog) {
    const def = ACHIEVEMENT_CATALOG_BY_ID[id];
    if (def) byRarity[def.rarity]++;
  }

  return { earnedCount, totalCount, percent, byRarity };
}

export function sortAchievements<
  T extends { id: string; rarity: AchievementRarity; earnedAt?: string | null },
>(items: T[], earnedFirst = false): T[] {
  return [...items].sort((a, b) => {
    if (earnedFirst) {
      const aEarned = a.earnedAt ? 1 : 0;
      const bEarned = b.earnedAt ? 1 : 0;
      if (aEarned !== bEarned) return bEarned - aEarned;
      if (a.earnedAt && b.earnedAt) {
        return b.earnedAt.localeCompare(a.earnedAt);
      }
    }
    return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
  });
}

// Helper to get achievements in branch/track order for UI rendering
export function getAchievementsByBranch(branch: AchievementBranch): AchievementDefinition[] {
  return ACHIEVEMENT_CATALOG.filter((a) => a.branch === branch).sort((a, b) => a.tier - b.tier);
}

export function getEnduranceBySubtrack(subtrack: EnduranceSubtrack): AchievementDefinition[] {
  return ACHIEVEMENT_CATALOG.filter(
    (a) => a.branch === 'endurance' && a.subtrack === subtrack,
  ).sort((a, b) => a.tier - b.tier);
}

export function getAllEndurance(): AchievementDefinition[] {
  return ACHIEVEMENT_CATALOG.filter((a) => a.branch === 'endurance').sort((a, b) => {
    const subOrder = { arrows: 0, sessions: 1, distance: 2, weight: 3 };
    const aSub = subOrder[a.subtrack ?? 'arrows'];
    const bSub = subOrder[b.subtrack ?? 'arrows'];
    if (aSub !== bSub) return aSub - bSub;
    return a.tier - b.tier;
  });
}

// Check if all parent achievements are earned
export function arePrerequisitesMet(def: AchievementDefinition, earnedIds: Set<string>): boolean {
  return def.parentIds.every((parentId) => earnedIds.has(parentId));
}

// Get the next locked achievement in a track (for in-progress highlighting)
export function getNextInTrack(
  branch: AchievementBranch,
  subtrack: EnduranceSubtrack | undefined,
  earnedIds: Set<string>,
): AchievementDefinition | null {
  let track: AchievementDefinition[];
  if (branch === 'endurance' && subtrack) {
    track = getEnduranceBySubtrack(subtrack);
  } else {
    track = getAchievementsByBranch(branch);
  }
  return track.find((a) => !earnedIds.has(a.id)) ?? null;
}
