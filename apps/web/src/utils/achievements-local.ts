import {
  ACHIEVEMENT_CATALOG,
  type AchievementDefinition,
  type AchievementStatsSnapshot,
  arePrerequisitesMet,
  evaluateComputedProgress,
  summarizeCompletion,
} from '@sokil/shared-types';
import type {
  AchievementProgressDto,
  AchievementsListDto,
  ApplicationStatsForUser,
} from '../services/types';
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
  const bowStyleSet = new Set<string>();
  let scoredSessions = 0;
  let fieldOr3dSessions = 0;
  let maxScoringRingEnds = 0;

  for (const s of finishedSessions) {
    if (s.distance) distanceSet.add(s.distance);
    if (s.targetType) targetTypeSet.add(s.targetType);
    if (s.equipmentSetId) equipmentSetIds.add(s.equipmentSetId);
    if (s.scoreTotal !== undefined && s.scoreTotal !== null) scoredSessions++;
    // Check for field or 3D target types
    if (
      s.targetType &&
      (s.targetType.toLowerCase().includes('field') || s.targetType.toLowerCase().includes('3d'))
    ) {
      fieldOr3dSessions++;
    }
    // Check for perfect end (all arrows in max scoring ring)
    if (s.scoreTotal !== undefined && s.scoreTotal !== null && s.shotsCount) {
      const maxPossibleScore = s.shotsCount * 10; // Assuming 10-ring target
      if (s.scoreTotal === maxPossibleScore && s.shotsCount >= 3) {
        maxScoringRingEnds++;
      }
    }
  }

  const equipmentCount = Math.max(equipmentSets.length, equipmentSetIds.size);

  // Count distinct bow styles from equipment sets
  for (const set of equipmentSets) {
    if (set.bowType) bowStyleSet.add(set.bowType);
  }

  const profileComplete =
    !!userContext?.onboardingCompletedAt ||
    (!!userContext?.firstName &&
      !!userContext?.picture &&
      (!!userContext.location || !!userContext.clubId || !!userContext.bio));

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
    distinctEquipmentSets: equipmentSetIds.size,
    distinctBowStyles: bowStyleSet.size,
    fieldOr3dSessions,
    maxScoringRingEnds,
  };
}

export function computeLocalAchievements(
  sessions: LocalTrainingSession[],
  equipmentSets: LocalEquipmentSet[],
  appStats: ApplicationStatsForUser | null = null,
  userContext?: LocalAchievementUserContext,
): AchievementsListDto {
  const snapshot = buildLocalSnapshot(sessions, equipmentSets, appStats, userContext);

  // First pass: compute earned status for all achievements
  const earnedMap = new Map<string, boolean>();
  for (const def of ACHIEVEMENT_CATALOG) {
    if (def.evaluationMode === 'server_verified') {
      earnedMap.set(def.id, false);
      continue;
    }
    const evalResult = evaluateComputedProgress(def, snapshot);
    earnedMap.set(def.id, evalResult.earned);
  }

  // Second pass: build DTOs with prerequisite checks
  const earnedIds = new Set([...earnedMap.entries()].filter(([, v]) => v).map(([k]) => k));
  const achievements: AchievementProgressDto[] = ACHIEVEMENT_CATALOG.map(
    (def: AchievementDefinition) => {
      const prerequisitesMet = arePrerequisitesMet(def, earnedIds);

      if (def.evaluationMode === 'server_verified') {
        return {
          id: def.id,
          branch: def.branch,
          subtrack: def.subtrack,
          tier: def.tier,
          parentIds: def.parentIds,
          rarity: def.rarity,
          rarityHex: def.rarityHex,
          evaluationMode: def.evaluationMode,
          icon: def.icon,
          shareImage: def.assets.ogCard1200,
          titleKey: def.titleKey,
          descriptionKey: def.descriptionKey,
          earned: false,
          progress: 0,
          current: 0,
          threshold: def.criteria.target,
          earnedAt: null,
          prerequisitesMet,
          badge512: def.assets.badge512,
          thumb256: def.assets.thumb256,
          ogCard1200: def.assets.ogCard1200,
        };
      }

      const evalResult = evaluateComputedProgress(def, snapshot);
      const earned = evalResult.earned && prerequisitesMet;

      return {
        id: def.id,
        branch: def.branch,
        subtrack: def.subtrack,
        tier: def.tier,
        parentIds: def.parentIds,
        rarity: def.rarity,
        rarityHex: def.rarityHex,
        evaluationMode: def.evaluationMode,
        icon: def.icon,
        shareImage: def.assets.ogCard1200,
        titleKey: def.titleKey,
        descriptionKey: def.descriptionKey,
        earned,
        progress: evalResult.progress,
        current: evalResult.current,
        threshold: evalResult.target,
        earnedAt: earned ? new Date().toISOString() : null,
        prerequisitesMet,
        badge512: def.assets.badge512,
        thumb256: def.assets.thumb256,
        ogCard1200: def.assets.ogCard1200,
      };
    },
  );

  const completion = summarizeCompletion(earnedIds);

  return {
    achievements,
    ...completion,
  };
}
