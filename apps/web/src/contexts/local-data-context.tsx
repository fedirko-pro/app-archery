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
  mergeServerEquipmentSets,
  mergeServerTrainingSessions,
} from '../utils/local-data-storage';
import type { LocalEquipmentSet, LocalTrainingSession } from '../utils/local-data-storage';
import {
  DEFAULT_ARROWS_PER_SET,
  finishOtherStartedSessions,
  sessionToDto,
} from '../utils/training-session-utils';
import { useAuth } from './auth-context';

export type {
  LocalEquipmentSet,
  LocalTrainingSession,
  CustomField,
} from '../utils/local-data-storage';

interface LocalDataContextType {
  equipmentSets: LocalEquipmentSet[];
  trainingSessions: LocalTrainingSession[];
  defaultEquipmentSetId: string | null;
  isSyncing: boolean;
  lastSyncError: string | null;
  unsyncedCount: number;
  hasPendingSync: boolean;
  hasUnsyncedData: boolean;
  addEquipmentSet: (
    data: Omit<LocalEquipmentSet, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
  ) => Promise<LocalEquipmentSet>;
  editEquipmentSet: (
    id: string,
    data: Partial<Omit<LocalEquipmentSet, 'id' | 'createdAt'>>,
  ) => void;
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
  const [defaultEquipmentSetIdRaw, setDefaultEquipmentSetIdRaw] = useState<string | null>(() =>
    getDefaultEquipmentSetId(),
  );
  const syncInProgress = useRef(false);

  const defaultEquipmentSetId = useMemo(
    () => resolveDefaultEquipmentSetId(equipmentSets),
    [equipmentSets, defaultEquipmentSetIdRaw],
  );

  const refresh = useCallback(() => {
    setEquipmentSets(getEquipmentSets());
    setTrainingSessions(getTrainingSessions());
  }, []);

  const shouldSync = isAuthenticated && user?.syncTrainingsAndEquipment === true;

  const pushSessionToServer = useCallback(async (session: LocalTrainingSession): Promise<void> => {
    const dto = sessionToDto(session);
    if (session.serverId) {
      await apiService.updateTrainingSession(session.serverId, dto);
      updateTrainingSession(session.id, { isSynced: true });
    } else {
      const created = await apiService.createTrainingSession(dto);
      updateTrainingSession(session.id, {
        serverId: created.id,
        isSynced: true,
      });
    }
  }, []);

  const unsyncedCount = useMemo(
    () =>
      equipmentSets.filter((s) => !s.isSynced).length +
      trainingSessions.filter((s) => !s.isSynced).length,
    [equipmentSets, trainingSessions],
  );

  const hasUnsyncedData = unsyncedCount > 0;

  const hasPendingSync = shouldSync && hasUnsyncedData && !isSyncing && !lastSyncError;

  const syncNow = useCallback(async () => {
    if (!shouldSync || syncInProgress.current) return;
    if (!navigator.onLine) return;

    syncInProgress.current = true;
    setIsSyncing(true);
    setLastSyncError(null);

    try {
      // 1. Fetch server data and merge into local
      const [serverSets, serverSessions] = await Promise.all([
        apiService.getEquipmentSets(),
        apiService.getTrainingSessions(),
      ]);

      mergeServerEquipmentSets(serverSets);
      mergeServerTrainingSessions(serverSessions);

      // 2. Push unsynced local items to server
      const localSets = getEquipmentSets();
      const unsyncedSets = localSets.filter((s) => !s.isSynced);

      for (const set of unsyncedSets) {
        try {
          const created = await apiService.createEquipmentSet({
            name: set.name,
            bowType: set.bowType,
            manufacturer: set.manufacturer,
            model: set.model,
            drawWeight: set.drawWeight,
            arrowLength: set.arrowLength,
            arrowSpine: set.arrowSpine,
            arrowWeight: set.arrowWeight,
            arrowMaterial: set.arrowMaterial,
            customFields: set.customFields,
          });
          updateEquipmentSet(set.id, { serverId: created.id, isSynced: true });
        } catch {
          // skip and retry on next sync
        }
      }

      const localSessions = getTrainingSessions();
      const unsyncedSessions = localSessions.filter((s) => !s.isSynced);

      for (const session of unsyncedSessions) {
        try {
          await pushSessionToServer(session);
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
  }, [shouldSync, refresh, pushSessionToServer]);

  // Sync on login and when sync setting changes to true
  useEffect(() => {
    if (shouldSync) {
      syncNow();
    }
  }, [shouldSync, syncNow]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (shouldSync) {
        syncNow();
      }
    };
    globalThis.addEventListener('online', handleOnline);
    return () => globalThis.removeEventListener('online', handleOnline);
  }, [shouldSync, syncNow]);

  const addEquipmentSet = useCallback(
    async (
      data: Omit<LocalEquipmentSet, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
    ): Promise<LocalEquipmentSet> => {
      const newSet = saveEquipmentSet(data);

      if (shouldSync && navigator.onLine) {
        try {
          const created = await apiService.createEquipmentSet({
            name: newSet.name,
            bowType: newSet.bowType,
            manufacturer: newSet.manufacturer,
            model: newSet.model,
            drawWeight: newSet.drawWeight,
            arrowLength: newSet.arrowLength,
            arrowSpine: newSet.arrowSpine,
            arrowWeight: newSet.arrowWeight,
            arrowMaterial: newSet.arrowMaterial,
            customFields: newSet.customFields,
          });
          updateEquipmentSet(newSet.id, {
            serverId: created.id,
            isSynced: true,
          });
        } catch {
          // will sync next time
        }
      }

      refresh();
      return newSet;
    },
    [shouldSync, refresh],
  );

  const editEquipmentSet = useCallback(
    (id: string, data: Partial<Omit<LocalEquipmentSet, 'id' | 'createdAt'>>) => {
      updateEquipmentSet(id, data);
      refresh();
    },
    [refresh],
  );

  const removeEquipmentSet = useCallback(
    async (id: string) => {
      const set = getEquipmentSets().find((s) => s.id === id);
      deleteEquipmentSet(id);

      if (set?.serverId && shouldSync && navigator.onLine) {
        try {
          await apiService.deleteEquipmentSet(set.serverId);
        } catch {
          // server-side already gone or offline
        }
      }

      // Remove references in training sessions
      const sessions = getTrainingSessions();
      sessions.forEach((session) => {
        if (session.equipmentSetId === id) {
          updateTrainingSession(session.id, {
            equipmentSetId: undefined,
            isSynced: false,
          });
        }
      });

      if (getDefaultEquipmentSetId() === id) {
        setDefaultEquipmentSetId(null);
        setDefaultEquipmentSetIdRaw(null);
      }

      refresh();
    },
    [shouldSync, refresh],
  );

  const addTrainingSession = useCallback(
    async (
      data: Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
    ): Promise<LocalTrainingSession> => {
      const newSession = saveTrainingSession(data);

      if (shouldSync && navigator.onLine) {
        try {
          await pushSessionToServer(newSession);
        } catch {
          // will sync next time
        }
      }

      refresh();
      return newSession;
    },
    [shouldSync, refresh, pushSessionToServer],
  );

  const startTrainingSession = useCallback(
    async (
      data: Partial<
        Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt' | 'status'>
      > = {},
    ): Promise<LocalTrainingSession> => {
      finishOtherStartedSessions();

      const today = new Date().toISOString().slice(0, 10);
      const newSession = saveTrainingSession({
        date: data.date ?? today,
        status: 'started',
        shotsCount: 0,
        arrowsPerSet: data.arrowsPerSet ?? DEFAULT_ARROWS_PER_SET,
        distance: data.distance,
        targetType: data.targetType,
        equipmentSetId: data.equipmentSetId,
        customFields: data.customFields,
      });

      if (shouldSync && navigator.onLine) {
        try {
          await pushSessionToServer(newSession);
        } catch {
          // will sync next time
        }
      }

      refresh();
      return getTrainingSessions().find((s) => s.id === newSession.id) ?? newSession;
    },
    [shouldSync, refresh, pushSessionToServer],
  );

  const editTrainingSession = useCallback(
    async (id: string, data: Partial<Omit<LocalTrainingSession, 'id' | 'createdAt'>>) => {
      updateTrainingSession(id, data);
      const updated = getTrainingSessions().find((s) => s.id === id);

      if (updated && shouldSync && navigator.onLine) {
        try {
          await pushSessionToServer(updated);
        } catch {
          // will sync next time
        }
      }

      refresh();
    },
    [shouldSync, refresh, pushSessionToServer],
  );

  const removeTrainingSession = useCallback(
    async (id: string) => {
      const session = getTrainingSessions().find((s) => s.id === id);
      deleteTrainingSession(id);

      if (session?.serverId && shouldSync && navigator.onLine) {
        try {
          await apiService.deleteTrainingSession(session.serverId);
        } catch {
          // server-side already gone or offline
        }
      }

      refresh();
    },
    [shouldSync, refresh],
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
      unsyncedCount,
      hasPendingSync,
      hasUnsyncedData,
      addEquipmentSet,
      editEquipmentSet,
      removeEquipmentSet,
      setDefaultEquipmentSet,
      addTrainingSession,
      startTrainingSession,
      editTrainingSession,
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
      unsyncedCount,
      hasPendingSync,
      hasUnsyncedData,
      addEquipmentSet,
      editEquipmentSet,
      removeEquipmentSet,
      setDefaultEquipmentSet,
      addTrainingSession,
      startTrainingSession,
      editTrainingSession,
      removeTrainingSession,
      syncNow,
      refresh,
    ],
  );

  return <LocalDataContext.Provider value={value}>{children}</LocalDataContext.Provider>;
};
