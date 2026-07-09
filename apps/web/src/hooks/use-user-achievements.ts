import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import apiService from '@/services/api';
import type { AchievementsListDto } from '@/services/types';

export interface UseUserAchievementsResult {
  data: AchievementsListDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Load another archer's achievements (public or limited visibility).
 * Tries public endpoint first, then limited when the viewer is authenticated.
 */
export function useUserAchievements(userId: string | undefined): UseUserAchievementsResult {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<AchievementsListDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getUserAchievements(userId);
      setData(result);
    } catch {
      if (isAuthenticated) {
        try {
          const result = await apiService.getLimitedUserAchievements(userId);
          setData(result);
          return;
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load achievements');
          setData(null);
        }
      } else {
        setError('Achievements not found');
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
