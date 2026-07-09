import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { useLocalData } from '@/contexts/local-data-context';
import apiService from '@/services/api';
import type { AchievementProgressDto, AchievementsListDto } from '@/services/types';
import { computeLocalAchievements } from '@/utils/achievements-local';

const SEEN_IDS_KEY = 'achievements:seenIds';

function readSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_IDS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeSeenIds(ids: Set<string>): void {
  try {
    localStorage.setItem(SEEN_IDS_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

export interface UseAchievementsResult {
  achievements: AchievementProgressDto[];
  earned: AchievementProgressDto[];
  locked: AchievementProgressDto[];
  earnedCount: number;
  totalCount: number;
  percent: number;
  byRarity: AchievementsListDto['byRarity'];
  loading: boolean;
  error: string | null;
  isGuest: boolean;
  refetch: () => Promise<void>;
  syncAndCelebrate: () => Promise<string[]>;
  markSeen: (ids: string[]) => void;
  unseenEarnedIds: string[];
  isNewAchievement: (id: string, earnedAt?: string | null) => boolean;
}

export interface UseAchievementsOptions {
  /** When false, returns an inert result without fetching or computing. Default true. */
  enabled?: boolean;
  /** When false, uses locally computed achievements only (no API call). Default true. */
  serverFetch?: boolean;
}

const EMPTY_ACHIEVEMENTS: AchievementsListDto = {
  achievements: [],
  earnedCount: 0,
  totalCount: 0,
  percent: 0,
  byRarity: { common: 0, rare: 0, epic: 0, legendary: 0 },
};

export function useAchievements(options?: UseAchievementsOptions): UseAchievementsResult {
  const enabled = options?.enabled ?? true;
  const serverFetch = options?.serverFetch ?? true;
  const { isAuthenticated, user } = useAuth();
  const { trainingSessions, equipmentSets } = useLocalData();
  const [serverData, setServerData] = useState<AchievementsListDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => readSeenIds());
  const initialLoadDone = useRef(false);

  const localData = useMemo(
    () =>
      computeLocalAchievements(trainingSessions, equipmentSets, null, {
        firstName: user?.firstName,
        location: user?.location,
        bio: user?.bio,
        picture: user?.picture,
        clubId: user?.clubId,
        onboardingCompletedAt: user?.onboardingCompletedAt ?? null,
      }),
    [trainingSessions, equipmentSets, user],
  );

  const fetchServer = useCallback(async () => {
    if (!enabled || !serverFetch || !isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getMyAchievements();
      setServerData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [enabled, serverFetch, isAuthenticated]);

  useEffect(() => {
    if (!enabled || !serverFetch || !isAuthenticated) {
      setServerData(null);
      setLoading(false);
      return;
    }
    void fetchServer();
  }, [enabled, serverFetch, isAuthenticated, fetchServer]);

  const data = !enabled
    ? EMPTY_ACHIEVEMENTS
    : isAuthenticated && serverFetch && serverData
      ? serverData
      : localData;

  const earned = useMemo(() => data.achievements.filter((a) => a.earned), [data.achievements]);

  const locked = useMemo(() => data.achievements.filter((a) => !a.earned), [data.achievements]);

  const syncAndCelebrate = useCallback(async (): Promise<string[]> => {
    if (!isAuthenticated) {
      const prevSeen = readSeenIds();
      const newlyEarned = localData.achievements
        .filter((a) => a.earned && !prevSeen.has(a.id))
        .map((a) => a.id);
      return newlyEarned;
    }

    try {
      const result = await apiService.syncAchievements();
      await fetchServer();
      return result.newlyUnlocked;
    } catch {
      return [];
    }
  }, [isAuthenticated, localData.achievements, fetchServer]);

  const markSeen = useCallback((ids: string[]) => {
    setSeenIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      writeSeenIds(next);
      return next;
    });
  }, []);

  const isNewAchievement = useCallback(
    (id: string, earnedAt?: string | null): boolean => {
      if (seenIds.has(id)) return false;
      if (!earnedAt) return false;
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return new Date(earnedAt).getTime() > weekAgo;
    },
    [seenIds],
  );

  const unseenEarnedIds = useMemo(
    () => earned.filter((a) => !seenIds.has(a.id)).map((a) => a.id),
    [earned, seenIds],
  );

  useEffect(() => {
    if (initialLoadDone.current || loading) return;
    initialLoadDone.current = true;
  }, [loading]);

  return {
    achievements: data.achievements,
    earned,
    locked,
    earnedCount: data.earnedCount,
    totalCount: data.totalCount,
    percent: data.percent,
    byRarity: data.byRarity,
    loading,
    error,
    isGuest: !isAuthenticated,
    refetch: fetchServer,
    syncAndCelebrate,
    markSeen,
    unseenEarnedIds,
    isNewAchievement,
  };
}
