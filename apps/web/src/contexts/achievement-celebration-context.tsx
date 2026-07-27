import { NotificationTypes } from '@sokil/shared-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useNotifications } from './notifications-context';
import AchievementUnlockedDialog from '@/components/achievements/AchievementUnlockedDialog';
import { useAchievements } from '@/hooks/use-achievements';
import apiService from '@/services/api';

interface AchievementCelebrationContextValue {
  enqueueCelebration: (ids: string[]) => void;
  /** Sync achievements (API or local) and enqueue any newly unlocked ids. */
  celebrateAfterSync: () => Promise<string[]>;
}

const AchievementCelebrationContext = createContext<AchievementCelebrationContextValue | undefined>(
  undefined,
);

export function useAchievementCelebration(): AchievementCelebrationContextValue {
  const context = useContext(AchievementCelebrationContext);
  if (!context) {
    throw new Error(
      'useAchievementCelebration must be used within an AchievementCelebrationProvider',
    );
  }
  return context;
}

interface AchievementCelebrationProviderProps {
  children: ReactNode;
}

function achievementIdsFromNotifications(
  items: Array<{ type: string; readAt: string | null; params?: Record<string, unknown> | null }>,
): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.type !== NotificationTypes.AchievementUnlocked) continue;
    if (item.readAt) continue;
    const achievementId = item.params?.achievementId;
    if (typeof achievementId === 'string' && achievementId) {
      ids.push(achievementId);
    }
  }
  return ids;
}

export function AchievementCelebrationProvider({
  children,
}: AchievementCelebrationProviderProps): React.ReactElement {
  const {
    earned,
    loading,
    markSeen,
    hasSeenAchievement,
    isNewAchievement,
    syncAndCelebrate,
    refetch,
  } = useAchievements();
  const { unreadImportantCount } = useNotifications();

  const [queue, setQueue] = useState<string[]>([]);
  const queuedOrShownRef = useRef<Set<string>>(new Set());
  const prevUnreadRef = useRef<number | null>(null);

  const enqueueCelebration = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      setQueue((prev) => {
        const next = [...prev];
        for (const id of ids) {
          if (hasSeenAchievement(id)) continue;
          if (queuedOrShownRef.current.has(id)) continue;
          queuedOrShownRef.current.add(id);
          next.push(id);
        }
        return next;
      });
    },
    [hasSeenAchievement],
  );

  const celebrateAfterSync = useCallback(async (): Promise<string[]> => {
    const ids = await syncAndCelebrate();
    enqueueCelebration(ids);
    return ids;
  }, [syncAndCelebrate, enqueueCelebration]);

  const celebrateFromUnreadNotifications = useCallback(async () => {
    try {
      const data = await apiService.getNotifications({ limit: 30 });
      const ids = achievementIdsFromNotifications(data.items);
      if (ids.length === 0) return;
      enqueueCelebration(ids);
      await refetch();
    } catch {
      // Non-blocking
    }
  }, [enqueueCelebration, refetch]);

  // When new important notifications arrive (e.g. achievement unlocked server-side),
  // pick up achievement unlocks and show confetti without a full page refresh.
  useEffect(() => {
    if (prevUnreadRef.current === null) {
      prevUnreadRef.current = unreadImportantCount;
      if (unreadImportantCount > 0) {
        void celebrateFromUnreadNotifications();
      }
      return;
    }

    if (unreadImportantCount > prevUnreadRef.current) {
      void celebrateFromUnreadNotifications();
    }
    prevUnreadRef.current = unreadImportantCount;
  }, [unreadImportantCount, celebrateFromUnreadNotifications]);

  // Catch-up when returning to the tab after an unlock elsewhere.
  useEffect(() => {
    const onFocus = () => {
      void refetch();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

  // Catch-up for silent unlocks (GET / training sync) and later refetches:
  // celebrate any earned id that is still unseen and recent.
  useEffect(() => {
    if (loading) return;

    const recentUnseen = earned.filter((a) => isNewAchievement(a.id, a.earnedAt)).map((a) => a.id);

    enqueueCelebration(recentUnseen);
  }, [loading, earned, isNewAchievement, enqueueCelebration]);

  const currentId = queue[0] ?? null;
  const currentAchievement = currentId ? (earned.find((a) => a.id === currentId) ?? null) : null;

  // Sync ahead of refetch: wait for achievement DTO before showing the dialog.
  useEffect(() => {
    if (!currentId || currentAchievement || loading) return;
    void refetch();
  }, [currentId, currentAchievement, loading, refetch]);

  const handleClose = useCallback(() => {
    if (currentId) {
      markSeen([currentId]);
    }
    setQueue((prev) => prev.slice(1));
  }, [currentId, markSeen]);

  const value = useMemo(
    () => ({ enqueueCelebration, celebrateAfterSync }),
    [enqueueCelebration, celebrateAfterSync],
  );

  return (
    <AchievementCelebrationContext.Provider value={value}>
      {children}
      <AchievementUnlockedDialog
        achievement={currentAchievement}
        open={!!currentAchievement}
        onClose={handleClose}
      />
    </AchievementCelebrationContext.Provider>
  );
}
