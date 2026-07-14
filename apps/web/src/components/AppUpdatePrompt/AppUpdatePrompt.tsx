'use client';

import { Button, Snackbar } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export function AppUpdatePrompt() {
  const { t } = useTranslation('common');
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const checkForUpdate = useCallback(async () => {
    const clientBuildId = process.env.NEXT_PUBLIC_APP_BUILD_ID;
    if (!clientBuildId || clientBuildId === 'dev') {
      return;
    }

    try {
      const response = await fetch('/api/app-version', { cache: 'no-store' });
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { buildId?: string };
      if (data.buildId && data.buildId !== clientBuildId) {
        setUpdateAvailable(true);
      }
    } catch {
      // Ignore network errors during background checks.
    }
  }, []);

  useEffect(() => {
    void checkForUpdate();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdate();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    const intervalId = window.setInterval(() => {
      void checkForUpdate();
    }, CHECK_INTERVAL_MS);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [checkForUpdate]);

  if (!updateAvailable) {
    return null;
  }

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      message={t('pwa.updateAvailable')}
      action={
        <Button color="secondary" size="small" onClick={() => window.location.reload()}>
          {t('pwa.updateReload')}
        </Button>
      }
    />
  );
}
