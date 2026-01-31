import './OfflineBanner.scss';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const OfflineBanner: React.FC = () => {
  const { t } = useTranslation('common');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      {t('pwa.workingOffline')}
    </div>
  );
};

export default OfflineBanner;
