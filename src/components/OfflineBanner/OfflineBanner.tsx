import './OfflineBanner.scss';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { wasLastServedFromCache, OFFLINE_CACHE_USED_EVENT } from '../../utils/offline-cache';

const OfflineBanner: React.FC = () => {
  const { t } = useTranslation('common');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showCachedHint, setShowCachedHint] = useState(wasLastServedFromCache());

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowCachedHint(false);
    };
    const handleOffline = () => setIsOffline(true);
    const handleCacheUsed = () => setShowCachedHint(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(OFFLINE_CACHE_USED_EVENT, handleCacheUsed);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(OFFLINE_CACHE_USED_EVENT, handleCacheUsed);
    };
  }, []);

  if (!isOffline && !showCachedHint) return null;

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      {isOffline ? t('pwa.workingOffline') : null}
      {showCachedHint ? (
        <span>{isOffline ? ' — ' : ''}{t('pwa.showingCachedData')}</span>
      ) : null}
    </div>
  );
};

export default OfflineBanner;
