import { useCallback, useEffect, useState } from 'react';

import { OFFLINE_CACHE_USED_EVENT, wasLastServedFromCache } from '../utils/offline-cache';

export const FRESH_DATA_EVENT = 'sokil-fresh-data';

export function useStaleCacheHint(): { showStaleHint: boolean; dismiss: () => void } {
  const [showStaleHint, setShowStaleHint] = useState(() => wasLastServedFromCache());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleStale = () => setShowStaleHint(true);
    const handleFresh = () => {
      setShowStaleHint(false);
      setDismissed(false);
    };

    window.addEventListener(OFFLINE_CACHE_USED_EVENT, handleStale);
    window.addEventListener(FRESH_DATA_EVENT, handleFresh);
    return () => {
      window.removeEventListener(OFFLINE_CACHE_USED_EVENT, handleStale);
      window.removeEventListener(FRESH_DATA_EVENT, handleFresh);
    };
  }, []);

  const dismiss = useCallback(() => setDismissed(true), []);

  return {
    showStaleHint: showStaleHint && !dismissed,
    dismiss,
  };
}
