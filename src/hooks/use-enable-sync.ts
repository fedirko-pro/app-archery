import { useCallback, useState } from 'react';

import { useAuth } from '../contexts/auth-context';
import { useLocalData } from '../contexts/local-data-context';
import apiService from '../services/api';

export function useEnableSync() {
  const { user, updateUser } = useAuth();
  const { syncNow } = useLocalData();
  const [enabling, setEnabling] = useState(false);

  const enableSyncAndSync = useCallback(async () => {
    setEnabling(true);
    try {
      if (!user?.syncTrainingsAndEquipment) {
        const updated = await apiService.updateProfile({ syncTrainingsAndEquipment: true });
        updateUser(updated);
      }
      await syncNow();
    } finally {
      setEnabling(false);
    }
  }, [user?.syncTrainingsAndEquipment, updateUser, syncNow]);

  return { enableSyncAndSync, enabling };
}
