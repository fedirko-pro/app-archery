import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';

import apiService from '../services/api';
import {
  getDefaultEquipmentSetId,
  resolveDefaultEquipmentSetId,
  setDefaultEquipmentSetId,
} from '../utils/equipment-utils';
import { runLocalDataMigrations } from '../utils/local-data-migrations';
import {
  getEquipmentSets,
  saveEquipmentSet,
  updateEquipmentSet,
  deleteEquipmentSet,
  getTrainingSessions,
  saveTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
  incrementTrainingSessionShots,
  StorageWriteError,
} from '../utils/local-data-storage';
import type { LocalEquipmentSet, LocalTrainingSession } from '../utils/local-data-storage';
import {
  addTombstone,
  clearTombstone,
  mergeServerEquipmentSets,
  mergeServerTrainingSessions,
  processTombstones,
  pushEquipmentSetToServer,
  pushSessionToServer,
} from '../utils/local-data-sync';
import {
  DEFAULT_ARROWS_PER_SET,
  finishOtherStartedSessions,
} from '../utils/training-session-utils';
import { useAuth } from './auth-context';

export type {
  LocalEquipmentSet,
  LocalTrainingSession,
  CustomField,
} from '../utils/local-data-storage';

const SESSION_PUSH_DEBOUNCE_MS = 400;

function storageErrorMessage(error: StorageWriteError): string {
  if (error.reason === 'quota') {
    return 'Storage is full. Free up space to keep saving training data.';
  }
  if (error.reason === 'disabled') {
    return 'Local storage is disabled. Training data cannot be saved on this device.';
  }
  return 'Failed to save training data locally.';
}

interface LocalDataContextType {
  equipmentSets: LocalEquipmentSet[];
  trainingSessions: LocalTrainingSession[];
  defaultEquipmentSetId: string | null;
  isSyncing: boolean;
  lastSyncError: string | null;
  lastStorageError: string | null;
  unsyncedCount: number;
  hasPendingSync: boolean;
  hasUnsyncedData: boolean;
  isSessionPersisting: (id: string) => boolean;
  addEquipmentSet: (
    data: Omit<LocalEquipmentSet, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
  ) => Promise<LocalEquipmentSet>;
  editEquipmentSet: (
    id: string,
    data: Partial<Omit<LocalEquipmentSet, 'id' | 'createdAt'>>,
  ) => Promise<void>;
  removeEquipmentSet: (id: string) => Promise<void>;
  setDefaultEquipmentSet: (id: string | null) => void;
  addTrainingSession: (
    data: Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
  ) => Promise<LocalTrainingSession>;
  startTrainingSession: (
    data?: Partial<
      Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt' | 'status'>
    >,
  ) => Promise<LocalTrainingSession>;
  editTrainingSession: (
    id: string,
    data: Partial<Omit<LocalTrainingSession, 'id' | 'createdAt'>>,
  ) => Promise<void>;
  incrementSessionShots: (
    id: string,
    delta: number,
    options?: { arrowsPerSet?: number },
  ) => Promise<void>;
  removeTrainingSession: (id: string) => Promise<void>;
  syncNow: () => Promise<void>;
  refresh: () => void;
}

const LocalDataContext = createContext<LocalDataContextType | undefined>(undefined);

export const useLocalData = (): LocalDataContextType => {
  const context = useContext(LocalDataContext);
  if (!context) {
    throw new Error('useLocalData must be used within a LocalDataProvider');
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export const LocalDataProvider: React.FC<Props> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [equipmentSets, setEquipmentSets] = useState<LocalEquipmentSet[]>(() => {
    runLocalDataMigrations();
    return getEquipmentSets();
  });
  const [trainingSessions, setTrainingSessions] = useState<LocalTrainingSession[]>(() =>
    getTrainingSessions(),
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [lastStorageError, setLastStorageError] = useState<string | null>(null);
  const [persistingSessionIds, setPersistingSessionIds] = useState<Set<string>>(() => new Set());
  const [defaultEquipmentSetIdRaw, setDefaultEquipmentSetIdRaw] = useState<string | null>(() =>
    getDefaultEquipmentSetId(),
  );
  const syncInProgress = useRef(false);
  const sessionPushTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const defaultEquipmentSetId = useMemo(
    () => resolveDefaultEquipmentSetId(equipmentSets),
    [equipmentSets, defaultEquipmentSetIdRaw],
  );

  const refresh = useCallback(() => {
    setEquipmentSets(getEquipmentSets());
    setTrainingSessions(getTrainingSessions());
  }, []);

  const handleStorageError = useCallback((error: unknown) => {
    if (error instanceof StorageWriteError) {
      setLastStorageError(storageErrorMessage(error));
    }
    throw error;
  }, []);

  const setSessionPersisting = useCallback((id: string, persisting: boolean) => {
    setPersistingSessionIds((prev) => {
      const next = new Set(prev);
      if (persisting) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const isSessionPersisting = useCallback(
    (id: string) => persistingSessionIds.has(id),
    [persistingSessionIds],
  );

  const shouldSync = isAuthenticated && user?.syncTrainingsAndEquipment === true;

  const pushSession = useCallback(async (session: LocalTrainingSession): Promise<void> => {
    const equipmentSetsSnapshot = getEquipmentSets();
    const { serverId } = await pushSessionToServer(session, equipmentSetsSnapshot, apiService);
    updateTrainingSession(session.id, { serverId, isSynced: true });
  }, []);

  const scheduleSessionPush = useCallback(
    (sessionId: string) => {
      const timers = sessionPushTimers.current;
      const existing = timers.get(sessionId);
      if (existing) clearTimeout(existing);

      timers.set(
        sessionId,
        setTimeout(() => {
          timers.delete(sessionId);
          if (!shouldSync || !navigator.onLine) return;

          const session = getTrainingSessions().find((item) => item.id === sessionId);
          if (!session) return;

          setSessionPersisting(sessionId, true);
          void pushSession(session)
            .catch(() => {
              // will sync next time
            })
            .finally(() => {
              setSessionPersisting(sessionId, false);
              refresh();
            });
        }, SESSION_PUSH_DEBOUNCE_MS),
      );
    },
    [shouldSync, pushSession, refresh, setSessionPersisting],
  );

  // In-progress sessions sync quietly in the background; don't flash the pending-sync banner
  // on every shot increment.
  const unsyncedCount = useMemo(
    () =>
      equipmentSets.filter((s) => !s.isSynced).length +
      trainingSessions.filter((s) => !s.isSynced && s.status !== 'started').length,
    [equipmentSets, trainingSessions],
  );

  const hasUnsyncedData = useMemo(
    () => equipmentSets.some((s) => !s.isSynced) || trainingSessions.some((s) => !s.isSynced),
    [equipmentSets, trainingSessions],
  );

  const hasPendingSync = shouldSync && unsyncedCount > 0 && !isSyncing && !lastSyncError;

  const syncNow = useCallback(async () => {
    if (!shouldSync || syncInProgress.current) return;
    if (!navigator.onLine) return;

    syncInProgress.current = true;
    setIsSyncing(true);
    setLastSyncError(null);

    try {
      await processTombstones(apiService);

      const [serverSets, serverSessions] = await Promise.all([
        apiService.getEquipmentSets(),
        apiService.getTrainingSessions(),
      ]);

      mergeServerEquipmentSets(serverSets);
      mergeServerTrainingSessions(serverSessions);

      const localSets = getEquipmentSets();
      const unsyncedSets = localSets.filter((s) => !s.isSynced);

      for (const set of unsyncedSets) {
        try {
          const { serverId } = await pushEquipmentSetToServer(set, apiService);
          updateEquipmentSet(set.id, { serverId, isSynced: true });
        } catch {
          // skip and retry on next sync
        }
      }

      const localSessions = getTrainingSessions();
      const unsyncedSessions = localSessions.filter((s) => !s.isSynced);

      for (const session of unsyncedSessions) {
        try {
          await pushSession(session);
        } catch {
          // skip and retry on next sync
        }
      }
    } catch (err) {
      setLastSyncError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
      refresh();
    }
  }, [shouldSync, refresh, pushSession]);

  useEffect(() => {
    if (shouldSync) {
      syncNow();
    }
  }, [shouldSync, syncNow]);

  useEffect(() => {
    const handleOnline = () => {
      if (shouldSync) {
        syncNow();
      }
    };
    globalThis.addEventListener('online', handleOnline);
    return () => globalThis.removeEventListener('online', handleOnline);
  }, [shouldSync, syncNow]);

  useEffect(() => {
    const timers = sessionPushTimers.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const addEquipmentSet = useCallback(
    async (
      data: Omit<LocalEquipmentSet, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
    ): Promise<LocalEquipmentSet> => {
      let newSet: LocalEquipmentSet;
      try {
        newSet = saveEquipmentSet(data);
        setLastStorageError(null);
      } catch (error) {
        handleStorageError(error);
        throw error;
      }

      if (shouldSync && navigator.onLine) {
        try {
          const { serverId } = await pushEquipmentSetToServer(newSet, apiService);
          updateEquipmentSet(newSet.id, { serverId, isSynced: true });
        } catch {
          // will sync next time
        }
      }

      refresh();
      return newSet;
    },
    [shouldSync, refresh, handleStorageError],
  );

  const editEquipmentSet = useCallback(
    async (id: string, data: Partial<Omit<LocalEquipmentSet, 'id' | 'createdAt'>>) => {
      try {
        updateEquipmentSet(id, data);
        setLastStorageError(null);
      } catch (error) {
        handleStorageError(error);
        throw error;
      }

      const updated = getEquipmentSets().find((set) => set.id === id);
      if (updated && shouldSync && navigator.onLine) {
        try {
          const { serverId } = await pushEquipmentSetToServer(updated, apiService);
          updateEquipmentSet(id, { serverId, isSynced: true });
        } catch {
          // will sync next time
        }
      }

      refresh();
    },
    [shouldSync, refresh, handleStorageError],
  );

  const removeEquipmentSet = useCallback(
    async (id: string) => {
      const set = getEquipmentSets().find((s) => s.id === id);

      try {
        deleteEquipmentSet(id);
        setLastStorageError(null);
      } catch (error) {
        handleStorageError(error);
        throw error;
      }

      if (set?.serverId) {
        addTombstone('equipment', set.serverId);
        if (shouldSync && navigator.onLine) {
          try {
            await apiService.deleteEquipmentSet(set.serverId);
            clearTombstone('equipment', set.serverId);
          } catch {
            // tombstone remains for next sync
          }
        }
      }

      const sessions = getTrainingSessions();
      sessions.forEach((session) => {
        if (session.equipmentSetId === id) {
          try {
            updateTrainingSession(session.id, {
              equipmentSetId: undefined,
              isSynced: false,
            });
          } catch (error) {
            handleStorageError(error);
          }
        }
      });

      if (getDefaultEquipmentSetId() === id) {
        setDefaultEquipmentSetId(null);
        setDefaultEquipmentSetIdRaw(null);
      }

      refresh();
    },
    [shouldSync, refresh, handleStorageError],
  );

  const addTrainingSession = useCallback(
    async (
      data: Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
    ): Promise<LocalTrainingSession> => {
      let newSession: LocalTrainingSession;
      try {
        newSession = saveTrainingSession(data);
        setLastStorageError(null);
      } catch (error) {
        handleStorageError(error);
        throw error;
      }

      if (shouldSync && navigator.onLine) {
        try {
          await pushSession(newSession);
        } catch {
          // will sync next time
        }
      }

      refresh();
      return newSession;
    },
    [shouldSync, refresh, pushSession, handleStorageError],
  );

  const startTrainingSession = useCallback(
    async (
      data: Partial<
        Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt' | 'status'>
      > = {},
    ): Promise<LocalTrainingSession> => {
      try {
        finishOtherStartedSessions();
      } catch (error) {
        handleStorageError(error);
        throw error;
      }

      const today = new Date().toISOString().slice(0, 10);
      let newSession: LocalTrainingSession;
      try {
        newSession = saveTrainingSession({
          date: data.date ?? today,
          status: 'started',
          shotsCount: 0,
          arrowsPerSet: data.arrowsPerSet ?? DEFAULT_ARROWS_PER_SET,
          distance: data.distance,
          targetType: data.targetType,
          equipmentSetId: data.equipmentSetId,
          customFields: data.customFields,
        });
        setLastStorageError(null);
      } catch (error) {
        handleStorageError(error);
        throw error;
      }

      if (shouldSync && navigator.onLine) {
        try {
          await pushSession(newSession);
        } catch {
          // will sync next time
        }
      }

      refresh();
      return getTrainingSessions().find((s) => s.id === newSession.id) ?? newSession;
    },
    [shouldSync, refresh, pushSession, handleStorageError],
  );

  const editTrainingSession = useCallback(
    async (id: string, data: Partial<Omit<LocalTrainingSession, 'id' | 'createdAt'>>) => {
      try {
        updateTrainingSession(id, data);
        setLastStorageError(null);
      } catch (error) {
        handleStorageError(error);
        throw error;
      }

      const updated = getTrainingSessions().find((s) => s.id === id);
      if (updated && shouldSync && navigator.onLine) {
        try {
          await pushSession(updated);
        } catch {
          // will sync next time
        }
      }

      refresh();
    },
    [shouldSync, refresh, pushSession, handleStorageError],
  );

  const incrementSessionShots = useCallback(
    async (id: string, delta: number, options?: { arrowsPerSet?: number }) => {
      try {
        incrementTrainingSessionShots(id, delta, options);
        setLastStorageError(null);
      } catch (error) {
        handleStorageError(error);
        throw error;
      }

      refresh();
      scheduleSessionPush(id);
    },
    [refresh, scheduleSessionPush, handleStorageError],
  );

  const removeTrainingSession = useCallback(
    async (id: string) => {
      const session = getTrainingSessions().find((s) => s.id === id);

      try {
        deleteTrainingSession(id);
        setLastStorageError(null);
      } catch (error) {
        handleStorageError(error);
        throw error;
      }

      if (session?.serverId) {
        addTombstone('training', session.serverId);
        if (shouldSync && navigator.onLine) {
          try {
            await apiService.deleteTrainingSession(session.serverId);
            clearTombstone('training', session.serverId);
          } catch {
            // tombstone remains for next sync
          }
        }
      }

      refresh();
    },
    [shouldSync, refresh, handleStorageError],
  );

  const setDefaultEquipmentSet = useCallback((id: string | null) => {
    setDefaultEquipmentSetId(id);
    setDefaultEquipmentSetIdRaw(id);
  }, []);

  const value: LocalDataContextType = useMemo(
    () => ({
      equipmentSets,
      trainingSessions,
      defaultEquipmentSetId,
      isSyncing,
      lastSyncError,
      lastStorageError,
      unsyncedCount,
      hasPendingSync,
      hasUnsyncedData,
      isSessionPersisting,
      addEquipmentSet,
      editEquipmentSet,
      removeEquipmentSet,
      setDefaultEquipmentSet,
      addTrainingSession,
      startTrainingSession,
      editTrainingSession,
      incrementSessionShots,
      removeTrainingSession,
      syncNow,
      refresh,
    }),
    [
      equipmentSets,
      trainingSessions,
      defaultEquipmentSetId,
      isSyncing,
      lastSyncError,
      lastStorageError,
      unsyncedCount,
      hasPendingSync,
      hasUnsyncedData,
      isSessionPersisting,
      addEquipmentSet,
      editEquipmentSet,
      removeEquipmentSet,
      setDefaultEquipmentSet,
      addTrainingSession,
      startTrainingSession,
      editTrainingSession,
      incrementSessionShots,
      removeTrainingSession,
      syncNow,
      refresh,
    ],
  );

  return <LocalDataContext.Provider value={value}>{children}</LocalDataContext.Provider>;
};
