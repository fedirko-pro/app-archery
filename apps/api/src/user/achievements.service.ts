import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  ACHIEVEMENT_CATALOG,
  AchievementStatsSnapshot,
  evaluateComputedProgress,
  isValidAchievementId,
  summarizeCompletion,
} from '@sokil/shared-types';
import { UserAchievement } from './entity/user-achievement.entity';
import { User } from './entity/user.entity';
import { TrainingService } from '../training/training.service';
import { EquipmentService } from '../equipment/equipment.service';
import { TrainingSession } from '../training/training-session.entity';
import { AchievementProgressDto, AchievementsListDto } from './dto/achievement-progress.dto';
import { PublicProgressShareDto } from './dto/public-progress-share.dto';

@Injectable()
export class AchievementsService {
  constructor(
    private readonly em: EntityManager,
    private readonly trainingService: TrainingService,
    private readonly equipmentService: EquipmentService,
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
    let scoredSessions = 0;

    for (const s of finishedSessions) {
      if (s.distance) distanceSet.add(s.distance);
      if (s.targetType) targetTypeSet.add(s.targetType);
      if (s.equipmentSetId) equipmentSetIds.add(s.equipmentSetId);
      if (s.scoreTotal !== undefined && s.scoreTotal !== null) scoredSessions++;
    }

    const equipmentSets = await this.equipmentService.findAllForUser(userId);
    const equipmentCount = Math.max(equipmentSets.length, equipmentSetIds.size);

    const profileComplete =
      !!user.onboardingCompletedAt ||
      (!!user.firstName && (!!user.location || !!user.club || !!user.bio || !!user.picture));

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
      if (def.type !== 'computed' || !def.criteria) continue;
      if (existingIds.has(def.id)) continue;

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
    return true;
  }

  async getForUser(userId: string, syncFirst = false): Promise<AchievementsListDto> {
    if (syncFirst) {
      await this.syncComputed(userId);
    }

    const snapshot = await this.buildSnapshot(userId);
    const earnedRows = await this.getEarnedRows(userId);
    const earnedMap = new Map(earnedRows.map((r) => [r.achievementId, r]));

    const achievements: AchievementProgressDto[] = ACHIEVEMENT_CATALOG.map((def) => {
      const row = earnedMap.get(def.id);
      const earned = !!row;

      if (earned) {
        return {
          id: def.id,
          category: def.category,
          rarity: def.rarity,
          icon: def.icon,
          titleKey: def.titleKey,
          descriptionKey: def.descriptionKey,
          type: def.type,
          earned: true,
          progress: 100,
          current: def.criteria?.threshold,
          threshold: def.criteria?.threshold,
          earnedAt: row!.earnedAt.toISOString(),
          source: row!.source,
        };
      }

      const evalResult =
        def.type === 'computed'
          ? evaluateComputedProgress(def, snapshot)
          : { earned: false, progress: 0, current: 0, threshold: 0 };

      return {
        id: def.id,
        category: def.category,
        rarity: def.rarity,
        icon: def.icon,
        titleKey: def.titleKey,
        descriptionKey: def.descriptionKey,
        type: def.type,
        earned: false,
        progress: evalResult.progress,
        current: evalResult.current,
        threshold: evalResult.threshold || def.criteria?.threshold,
        earnedAt: null,
      };
    });

    const earnedIds = new Set(earnedRows.map((r) => r.achievementId));
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
}
