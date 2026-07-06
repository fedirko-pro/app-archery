export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type AchievementCategory =
  'onboarding' | 'consistency' | 'volume' | 'exploration' | 'tournaments' | 'mastery';

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
  | 'profileComplete';

export interface AchievementCriteria {
  metric: AchievementMetric;
  threshold: number;
}

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  type: 'computed' | 'event';
  criteria?: AchievementCriteria;
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
}

export const ACHIEVEMENT_CATALOG: AchievementDef[] = [
  // Onboarding
  {
    id: 'first-session',
    category: 'onboarding',
    rarity: 'common',
    icon: '🏹',
    titleKey: 'achievements.firstSession.title',
    descriptionKey: 'achievements.firstSession.description',
    type: 'computed',
    criteria: { metric: 'sessionsTotal', threshold: 1 },
  },
  {
    id: 'first-equipment',
    category: 'onboarding',
    rarity: 'common',
    icon: '🎯',
    titleKey: 'achievements.firstEquipment.title',
    descriptionKey: 'achievements.firstEquipment.description',
    type: 'computed',
    criteria: { metric: 'equipmentSetsUsed', threshold: 1 },
  },
  {
    id: 'profile-complete',
    category: 'onboarding',
    rarity: 'common',
    icon: '👤',
    titleKey: 'achievements.profileComplete.title',
    descriptionKey: 'achievements.profileComplete.description',
    type: 'computed',
    criteria: { metric: 'profileComplete', threshold: 1 },
  },
  // Consistency (best-ever streak weeks)
  {
    id: 'streak-2-weeks',
    category: 'consistency',
    rarity: 'common',
    icon: '🔥',
    titleKey: 'achievements.streak2Weeks.title',
    descriptionKey: 'achievements.streak2Weeks.description',
    type: 'computed',
    criteria: { metric: 'streakWeeksBest', threshold: 2 },
  },
  {
    id: 'streak-4-weeks',
    category: 'consistency',
    rarity: 'rare',
    icon: '🔥',
    titleKey: 'achievements.streak4Weeks.title',
    descriptionKey: 'achievements.streak4Weeks.description',
    type: 'computed',
    criteria: { metric: 'streakWeeksBest', threshold: 4 },
  },
  {
    id: 'streak-12-weeks',
    category: 'consistency',
    rarity: 'epic',
    icon: '🔥',
    titleKey: 'achievements.streak12Weeks.title',
    descriptionKey: 'achievements.streak12Weeks.description',
    type: 'computed',
    criteria: { metric: 'streakWeeksBest', threshold: 12 },
  },
  {
    id: 'streak-26-weeks',
    category: 'consistency',
    rarity: 'legendary',
    icon: '🔥',
    titleKey: 'achievements.streak26Weeks.title',
    descriptionKey: 'achievements.streak26Weeks.description',
    type: 'computed',
    criteria: { metric: 'streakWeeksBest', threshold: 26 },
  },
  // Volume — arrows
  {
    id: 'arrows-500',
    category: 'volume',
    rarity: 'common',
    icon: '➡️',
    titleKey: 'achievements.arrows500.title',
    descriptionKey: 'achievements.arrows500.description',
    type: 'computed',
    criteria: { metric: 'shotsTotal', threshold: 500 },
  },
  {
    id: 'arrows-2500',
    category: 'volume',
    rarity: 'rare',
    icon: '➡️',
    titleKey: 'achievements.arrows2500.title',
    descriptionKey: 'achievements.arrows2500.description',
    type: 'computed',
    criteria: { metric: 'shotsTotal', threshold: 2500 },
  },
  {
    id: 'arrows-10000',
    category: 'volume',
    rarity: 'epic',
    icon: '➡️',
    titleKey: 'achievements.arrows10000.title',
    descriptionKey: 'achievements.arrows10000.description',
    type: 'computed',
    criteria: { metric: 'shotsTotal', threshold: 10000 },
  },
  {
    id: 'arrows-25000',
    category: 'volume',
    rarity: 'legendary',
    icon: '➡️',
    titleKey: 'achievements.arrows25000.title',
    descriptionKey: 'achievements.arrows25000.description',
    type: 'computed',
    criteria: { metric: 'shotsTotal', threshold: 25000 },
  },
  // Volume — sessions
  {
    id: 'sessions-10',
    category: 'volume',
    rarity: 'common',
    icon: '📅',
    titleKey: 'achievements.sessions10.title',
    descriptionKey: 'achievements.sessions10.description',
    type: 'computed',
    criteria: { metric: 'sessionsTotal', threshold: 10 },
  },
  {
    id: 'sessions-50',
    category: 'volume',
    rarity: 'rare',
    icon: '📅',
    titleKey: 'achievements.sessions50.title',
    descriptionKey: 'achievements.sessions50.description',
    type: 'computed',
    criteria: { metric: 'sessionsTotal', threshold: 50 },
  },
  {
    id: 'sessions-150',
    category: 'volume',
    rarity: 'epic',
    icon: '📅',
    titleKey: 'achievements.sessions150.title',
    descriptionKey: 'achievements.sessions150.description',
    type: 'computed',
    criteria: { metric: 'sessionsTotal', threshold: 150 },
  },
  {
    id: 'sessions-500',
    category: 'volume',
    rarity: 'legendary',
    icon: '📅',
    titleKey: 'achievements.sessions500.title',
    descriptionKey: 'achievements.sessions500.description',
    type: 'computed',
    criteria: { metric: 'sessionsTotal', threshold: 500 },
  },
  // Exploration
  {
    id: 'distances-3',
    category: 'exploration',
    rarity: 'common',
    icon: '📏',
    titleKey: 'achievements.distances3.title',
    descriptionKey: 'achievements.distances3.description',
    type: 'computed',
    criteria: { metric: 'distinctDistances', threshold: 3 },
  },
  {
    id: 'distances-5',
    category: 'exploration',
    rarity: 'rare',
    icon: '📏',
    titleKey: 'achievements.distances5.title',
    descriptionKey: 'achievements.distances5.description',
    type: 'computed',
    criteria: { metric: 'distinctDistances', threshold: 5 },
  },
  {
    id: 'target-types-3',
    category: 'exploration',
    rarity: 'common',
    icon: '🎯',
    titleKey: 'achievements.targetTypes3.title',
    descriptionKey: 'achievements.targetTypes3.description',
    type: 'computed',
    criteria: { metric: 'distinctTargetTypes', threshold: 3 },
  },
  {
    id: 'scored-sessions-5',
    category: 'exploration',
    rarity: 'rare',
    icon: '💯',
    titleKey: 'achievements.scoredSessions5.title',
    descriptionKey: 'achievements.scoredSessions5.description',
    type: 'computed',
    criteria: { metric: 'scoredSessions', threshold: 5 },
  },
  // Tournaments
  {
    id: 'first-application',
    category: 'tournaments',
    rarity: 'common',
    icon: '📝',
    titleKey: 'achievements.firstApplication.title',
    descriptionKey: 'achievements.firstApplication.description',
    type: 'computed',
    criteria: { metric: 'applicationsSubmitted', threshold: 1 },
  },
  {
    id: 'competitor',
    category: 'tournaments',
    rarity: 'rare',
    icon: '🏅',
    titleKey: 'achievements.competitor.title',
    descriptionKey: 'achievements.competitor.description',
    type: 'event',
  },
  {
    id: 'seasoned-competitor',
    category: 'tournaments',
    rarity: 'epic',
    icon: '🏅',
    titleKey: 'achievements.seasonedCompetitor.title',
    descriptionKey: 'achievements.seasonedCompetitor.description',
    type: 'computed',
    criteria: { metric: 'applicationsApproved', threshold: 5 },
  },
  // Mastery — event-only (admin grant / future tournament results)
  {
    id: 'tournament-champion',
    category: 'mastery',
    rarity: 'legendary',
    icon: '🏆',
    titleKey: 'achievements.tournamentChampion.title',
    descriptionKey: 'achievements.tournamentChampion.description',
    type: 'event',
  },
  {
    id: 'personal-best',
    category: 'mastery',
    rarity: 'epic',
    icon: '⭐',
    titleKey: 'achievements.personalBest.title',
    descriptionKey: 'achievements.personalBest.description',
    type: 'event',
  },
];

export const ACHIEVEMENT_CATALOG_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENT_CATALOG.map((a) => [a.id, a]),
);

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
    default:
      return 0;
  }
}

export function evaluateComputedProgress(
  def: AchievementDef,
  snapshot: AchievementStatsSnapshot,
): { earned: boolean; progress: number; current: number; threshold: number } {
  if (def.type === 'event' || !def.criteria) {
    return { earned: false, progress: 0, current: 0, threshold: 0 };
  }

  const current = getMetricValue(snapshot, def.criteria.metric);
  const threshold = def.criteria.threshold;
  const earned = current >= threshold;
  const progress = threshold > 0 ? Math.min(100, Math.round((current / threshold) * 100)) : 0;

  return { earned, progress, current, threshold };
}

export interface AchievementCompletionSummary {
  earnedCount: number;
  totalCount: number;
  percent: number;
  byRarity: Record<AchievementRarity, number>;
}

export function summarizeCompletion(
  earnedIds: Set<string>,
  catalog: AchievementDef[] = ACHIEVEMENT_CATALOG,
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
