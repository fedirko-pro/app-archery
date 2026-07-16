import { useCallback, useMemo, useRef, useState } from 'react';

import { useLocalData, type LocalTrainingSession } from '../contexts/local-data-context';
import { getStartedSession } from '../utils/training-session-utils';

type StartDefaults = Partial<
  Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt' | 'status'>
>;

interface UseGuardedStartTrainingOptions {
  onEditCurrent?: () => void;
  afterStart?: () => void;
}

export function useGuardedStartTraining(options: UseGuardedStartTrainingOptions = {}) {
  const { trainingSessions, startTrainingSession } = useLocalData();
  const activeSession = useMemo(() => getStartedSession(trainingSessions), [trainingSessions]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pendingDefaultsRef = useRef<StartDefaults | undefined>(undefined);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const startNow = useCallback(
    async (defaults?: StartDefaults) => {
      setSubmitting(true);
      try {
        await startTrainingSession(defaults);
        optionsRef.current.afterStart?.();
      } finally {
        setSubmitting(false);
      }
    },
    [startTrainingSession],
  );

  const requestStart = useCallback(
    async (defaults?: StartDefaults) => {
      if (activeSession) {
        pendingDefaultsRef.current = defaults;
        setDialogOpen(true);
        return;
      }
      await startNow(defaults);
    },
    [activeSession, startNow],
  );

  const confirmStartNew = useCallback(async () => {
    const defaults = pendingDefaultsRef.current;
    pendingDefaultsRef.current = undefined;
    setDialogOpen(false);
    await startNow(defaults);
  }, [startNow]);

  const editCurrent = useCallback(() => {
    pendingDefaultsRef.current = undefined;
    setDialogOpen(false);
    optionsRef.current.onEditCurrent?.();
  }, []);

  return {
    activeSession,
    dialogOpen,
    submitting,
    requestStart,
    confirmStartNew,
    editCurrent,
  };
}
