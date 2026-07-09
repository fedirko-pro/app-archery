import {
  ACHIEVEMENT_CATALOG,
  evaluateComputedProgress,
  summarizeCompletion,
  type AchievementStatsSnapshot,
} from '@sokil/shared-types';

import type { AchievementProgressDto, AchievementsListDto } from '../services/types';
import type { ApplicationStatsForUser } from '../services/types';
import type { LocalEquipmentSet, LocalTrainingSession } from './local-data-storage';
import { isSessionFinished } from './training-session-utils';
import { computeLocalStats } from './training-stats';

export interface LocalAchievementUserContext {
  firstName?: string | null;
  location?: string | null;
  bio?: string | null;
  picture?: string | null;
  clubId?: string | null;
  onboardingCompletedAt?: string | null;
}

function buildLocalSnapshot(
  sessions: LocalTrainingSession[],
  equipmentSets: LocalEquipmentSet[],
  appStats: ApplicationStatsForUser | null,
  userContext?: LocalAchievementUserContext,
): AchievementStatsSnapshot {
  const stats = computeLocalStats(sessions, equipmentSets);
  const finishedSessions = sessions.filter(isSessionFinished);

  const distanceSet = new Set<string>();
  const targetTypeSet = new Set<string>();
  const equipmentSetIds = new Set<string>();
  let scoredSessions = 0;

  for (const s of finishedSessions) {
    if (s.distance) distanceSet.add(s.distance);
    if (s.targetType) targetTypeSet.add(s.targetType);
    if (s.equipmentSetId) equipmentSetIds.add(s.equipmentSetId);
    if (s.scoreTotal !== undefined && s.scoreTotal !== null) scoredSessions++;
  }

  const equipmentCount = Math.max(equipmentSets.length, equipmentSetIds.size);

  const profileComplete =
    !!userContext?.onboardingCompletedAt ||
    (!!userContext?.firstName &&
      (!!userContext.location ||
        !!userContext.clubId ||
        !!userContext.bio ||
        !!userContext.picture));

  return {
    sessionsTotal: stats.totalSessions,
    streakWeeksBest: stats.bestStreakWeeks,
    shotsTotal: stats.shots.total,
    distinctDistances: distanceSet.size,
    distinctTargetTypes: targetTypeSet.size,
    applicationsSubmitted: appStats?.total ?? 0,
    applicationsApproved: appStats?.approved ?? 0,
    scoredSessions,
    equipmentSetsUsed: equipmentCount,
    profileComplete,
    metersTraveledTotal: stats.metersTraveled.total,
    kilogramsLifted: stats.kilogramsLifted,
  };
}

export function computeLocalAchievements(
  sessions: LocalTrainingSession[],
  equipmentSets: LocalEquipmentSet[],
  appStats: ApplicationStatsForUser | null = null,
  userContext?: LocalAchievementUserContext,
): AchievementsListDto {
  const snapshot = buildLocalSnapshot(sessions, equipmentSets, appStats, userContext);

  const achievements: AchievementProgressDto[] = ACHIEVEMENT_CATALOG.map((def) => {
    if (def.type === 'event') {
      return {
        id: def.id,
        category: def.category,
        rarity: def.rarity,
        icon: def.icon,
        titleKey: def.titleKey,
        descriptionKey: def.descriptionKey,
        type: def.type,
        earned: false,
        progress: 0,
        earnedAt: null,
      };
    }

    const evalResult = evaluateComputedProgress(def, snapshot);
    return {
      id: def.id,
      category: def.category,
      rarity: def.rarity,
      icon: def.icon,
      titleKey: def.titleKey,
      descriptionKey: def.descriptionKey,
      type: def.type,
      earned: evalResult.earned,
      progress: evalResult.progress,
      current: evalResult.current,
      threshold: evalResult.threshold,
      earnedAt: evalResult.earned ? new Date().toISOString() : null,
    };
  });

  const earnedIds = new Set(achievements.filter((a) => a.earned).map((a) => a.id));
  const completion = summarizeCompletion(earnedIds);

  return {
    achievements,
    ...completion,
  };
}
