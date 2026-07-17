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

import AchievementUnlockedDialog from '@/components/achievements/AchievementUnlockedDialog';
import { useAchievements } from '@/hooks/use-achievements';

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

export function AchievementCelebrationProvider({
  children,
}: AchievementCelebrationProviderProps): React.ReactElement {
  const { earned, loading, markSeen, isNewAchievement, syncAndCelebrate, refetch } =
    useAchievements();

  const [queue, setQueue] = useState<string[]>([]);
  const queuedOrShownRef = useRef<Set<string>>(new Set());

  const enqueueCelebration = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setQueue((prev) => {
      const next = [...prev];
      for (const id of ids) {
        if (queuedOrShownRef.current.has(id)) continue;
        queuedOrShownRef.current.add(id);
        next.push(id);
      }
      return next;
    });
  }, []);

  const celebrateAfterSync = useCallback(async (): Promise<string[]> => {
    const ids = await syncAndCelebrate();
    enqueueCelebration(ids);
    return ids;
  }, [syncAndCelebrate, enqueueCelebration]);

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
