import { EntityManager } from '@mikro-orm/core';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_CATALOG_BY_ID,
  AchievementStatsSnapshot,
  arePrerequisitesMet,
  evaluateComputedProgress,
  isValidAchievementId,
  lbsToKg,
  NotificationTypes,
  summarizeCompletion,
} from '@sokil/shared-types';
import { EquipmentService } from '../equipment/equipment.service';
import { NotificationsService } from '../notification/notifications.service';
import { TrainingService } from '../training/training.service';
import { TrainingSession } from '../training/training-session.entity';
import { AchievementProgressDto, AchievementsListDto } from './dto/achievement-progress.dto';
import { PublicProgressShareDto } from './dto/public-progress-share.dto';
import { User } from './entity/user.entity';
import { UserAchievement } from './entity/user-achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(
    private readonly em: EntityManager,
    private readonly trainingService: TrainingService,
    private readonly equipmentService: EquipmentService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async buildSnapshot(userId: string): Promise<AchievementStatsSnapshot> {
    const user = await this.em.findOne(User, { id: userId }, { populate: ['club'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stats = await this.trainingService.getStats(userId);
    const sessions = await this.em.find(TrainingSession, { user: { id: userId } });
    const finishedSessions = sessions.filter((s) => !s.status || s.status === 'finished');

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
      // This would need more detailed score data; placeholder for now
      if (s.scoreTotal !== undefined && s.scoreTotal !== null && s.shotsCount) {
        const maxPossibleScore = s.shotsCount * 10; // Assuming 10-ring target
        if (s.scoreTotal === maxPossibleScore && s.shotsCount >= 3) {
          maxScoringRingEnds++;
        }
      }
    }

    const equipmentSets = await this.equipmentService.findAllForUser(userId);
    const equipmentCount = Math.max(equipmentSets.length, equipmentSetIds.size);

    // Count distinct bow styles from equipment sets
    for (const set of equipmentSets) {
      if (set.bowType) bowStyleSet.add(set.bowType);
    }

    const drawWeightById = new Map(equipmentSets.map((set) => [set.id, set.drawWeight]));
    let kilogramsLifted = 0;
    for (const s of finishedSessions) {
      const shots = s.shotsCount ?? 0;
      if (shots <= 0 || !s.equipmentSetId) continue;
      const rawWeight = drawWeightById.get(s.equipmentSetId);
      const kg = lbsToKg(rawWeight == null ? undefined : Number(rawWeight));
      if (kg > 0) kilogramsLifted += shots * kg;
    }

    const profileComplete =
      !!user.onboardingCompletedAt ||
      (!!user.firstName && !!user.picture && (!!user.location || !!user.club || !!user.bio));

    return {
      sessionsTotal: stats.totalSessions,
      streakWeeksBest: stats.bestStreakWeeks,
      shotsTotal: stats.shots.total,
      distinctDistances: distanceSet.size,
      distinctTargetTypes: targetTypeSet.size,
      applicationsSubmitted: stats.tournamentApplications.total,
      applicationsApproved: stats.tournamentApplications.approved,
      scoredSessions,
      equipmentSetsUsed: equipmentCount,
      profileComplete,
      metersTraveledTotal: stats.metersTraveled.total,
      kilogramsLifted: Math.round(kilogramsLifted),
      distinctEquipmentSets: equipmentSetIds.size,
      distinctBowStyles: bowStyleSet.size,
      fieldOr3dSessions,
      maxScoringRingEnds,
    };
  }

  async getEarnedRows(userId: string): Promise<UserAchievement[]> {
    const rows = await this.em.find(UserAchievement, { user: { id: userId } });
    return rows.filter((r) => isValidAchievementId(r.achievementId));
  }

  async syncComputed(userId: string): Promise<string[]> {
    const snapshot = await this.buildSnapshot(userId);
    const user = this.em.getReference(User, userId);
    const existing = await this.getEarnedRows(userId);
    const existingIds = new Set(existing.map((r) => r.achievementId));
    const newlyUnlocked: string[] = [];

    for (const def of ACHIEVEMENT_CATALOG) {
      if (def.evaluationMode !== 'client_offline' || !def.criteria) continue;
      if (existingIds.has(def.id)) continue;

      // Check prerequisites
      if (!arePrerequisitesMet(def, existingIds)) continue;

      const { earned } = evaluateComputedProgress(def, snapshot);
      if (!earned) continue;

      const row = new UserAchievement();
      row.user = user;
      row.achievementId = def.id;
      row.source = 'computed';
      this.em.persist(row);
      newlyUnlocked.push(def.id);
      existingIds.add(def.id);
    }

    if (newlyUnlocked.length > 0) {
      await this.em.flush();
      for (const achievementId of newlyUnlocked) {
        this.notifyAchievementUnlocked(userId, achievementId);
      }
    }

    return newlyUnlocked;
  }

  async grant(
    userId: string,
    achievementId: string,
    metadata?: Record<string, unknown>,
    source: 'computed' | 'granted' = 'granted',
  ): Promise<boolean> {
    if (!isValidAchievementId(achievementId)) {
      throw new BadRequestException('Invalid achievement id');
    }

    const existing = await this.em.findOne(UserAchievement, {
      user: { id: userId },
      achievementId,
    });
    if (existing) return false;

    const user = this.em.getReference(User, userId);
    const row = new UserAchievement();
    row.user = user;
    row.achievementId = achievementId;
    row.source = source;
    if (metadata) row.metadata = metadata;
    await this.em.persistAndFlush(row);
    this.notifyAchievementUnlocked(userId, achievementId);
    return true;
  }

  private notifyAchievementUnlocked(userId: string, achievementId: string): void {
    const def = ACHIEVEMENT_CATALOG_BY_ID[achievementId];
    this.notificationsService.createSafe({
      userId,
      type: NotificationTypes.AchievementUnlocked,
      params: {
        achievementId,
        achievementTitleKey: def?.titleKey ?? achievementId,
      },
      link: '/achievements',
    });
  }

  async getForUser(userId: string, syncFirst = false): Promise<AchievementsListDto> {
    if (syncFirst) {
      await this.syncComputed(userId);
    }

    const snapshot = await this.buildSnapshot(userId);
    const earnedRows = await this.getEarnedRows(userId);
    const earnedMap = new Map(earnedRows.map((r) => [r.achievementId, r]));
    const earnedIds = new Set(earnedRows.map((r) => r.achievementId));

    const achievements: AchievementProgressDto[] = ACHIEVEMENT_CATALOG.map((def) => {
      const row = earnedMap.get(def.id);
      const earned = !!row;

      if (earned) {
        return {
          id: def.id,
          branch: def.branch,
          subtrack: def.subtrack,
          tier: def.tier,
          parentIds: def.parentIds,
          rarity: def.rarity,
          rarityHex: def.rarityHex,
          evaluationMode: def.evaluationMode,
          icon: def.icon, // Keep for backward compat
          shareImage: def.assets.ogCard1200,
          titleKey: def.titleKey,
          descriptionKey: def.descriptionKey,
          earned: true,
          progress: 100,
          current: def.criteria.target,
          threshold: def.criteria.target,
          earnedAt: row!.earnedAt.toISOString(),
          source: row!.source,
        };
      }

      // Check if prerequisites are met for locked achievements
      const prerequisitesMet = arePrerequisitesMet(def, earnedIds);

      const evalResult =
        def.evaluationMode === 'client_offline' && def.criteria
          ? evaluateComputedProgress(def, snapshot)
          : { earned: false, progress: 0, current: 0, target: 0 };

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
        progress: evalResult.progress,
        current: evalResult.current,
        threshold: evalResult.target || def.criteria?.target,
        earnedAt: null,
        prerequisitesMet,
        // Include assets for UI
        badge512: def.assets.badge512,
        thumb256: def.assets.thumb256,
        ogCard1200: def.assets.ogCard1200,
      };
    });

    const completion = summarizeCompletion(earnedIds);

    return {
      achievements,
      ...completion,
    };
  }

  async hasEarned(userId: string, achievementId: string): Promise<UserAchievement | null> {
    if (!isValidAchievementId(achievementId)) return null;
    return this.em.findOne(UserAchievement, {
      user: { id: userId },
      achievementId,
    });
  }

  async getPublicProgressShare(userId: string): Promise<PublicProgressShareDto> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    const data = await this.getForUser(userId, false);
    const earned = data.achievements.filter((a) => a.earned);
    const topAchievements = [...earned]
      .sort((a, b) => {
        const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      })
      .slice(0, 3)
      .map((a) => ({
        id: a.id,
        title: a.titleKey,
        rarity: a.rarity,
        icon: a.icon,
      }));

    return {
      id: user.id,
      earnedCount: data.earnedCount,
      totalCount: data.totalCount,
      percent: data.percent,
      topAchievements,
      owner: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }

  // Retroactive unlock check for login/migration
  async runRetroactiveUnlockCheck(userId: string): Promise<string[]> {
    // This re-runs syncComputed which already checks all criteria against current snapshot
    // and unlocks any newly eligible achievements
    return this.syncComputed(userId);
  }
}
