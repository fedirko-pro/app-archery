import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import { useLocalData } from '../../contexts/local-data-context';
import { useEnableSync } from '../../hooks/use-enable-sync';
import { useStaleCacheHint } from '../../hooks/use-stale-cache-hint';
import SafeDialog from '../SafeDialog/SafeDialog';

interface LocalDataBannerProps {
  /** When true, shows sync-in-progress state for authenticated users */
  showSyncStatus?: boolean;
}

const LocalDataBanner: React.FC<LocalDataBannerProps> = ({ showSyncStatus = false }) => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isSyncing, lastSyncError, lastStorageError, syncNow, hasPendingSync, unsyncedCount } =
    useLocalData();
  const { enableSyncAndSync, enabling } = useEnableSync();
  const { showStaleHint, dismiss: dismissStaleHint } = useStaleCacheHint();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isSyncEnabled = user?.syncTrainingsAndEquipment === true;

  // Stale cache hint — when online but API served cached data.
  // When offline, AppStatusBar already shows "Working offline" globally.
  const showCachedHint = showStaleHint && !isOffline;

  const cachedHint = showCachedHint ? (
    <Alert severity="warning" sx={{ mb: 1 }} onClose={dismissStaleHint}>
      {t('pwa.showingCachedData')}
    </Alert>
  ) : null;

  const storageErrorAlert = lastStorageError ? (
    <Alert severity="error" icon={<StorageIcon />} sx={{ mb: 2 }}>
      {lastStorageError}
    </Alert>
  ) : null;

  // For authenticated users with sync enabled: show sync status if requested
  if (isAuthenticated && isSyncEnabled && showSyncStatus) {
    return (
      <>
        {cachedHint}
        {storageErrorAlert}
        {lastSyncError && (
          <Alert
            severity="error"
            icon={<SyncIcon />}
            sx={{ mb: 2 }}
            action={
              <Button size="small" onClick={syncNow}>
                {t('localData.syncNow')}
              </Button>
            }
          >
            {lastSyncError}
          </Alert>
        )}
        {!lastSyncError && isSyncing && (
          <Alert severity="info" icon={<CircularProgress size={16} />} sx={{ mb: 2 }}>
            {t('trainings.syncing')}
          </Alert>
        )}
        {!lastSyncError && !isSyncing && hasPendingSync && (
          <Alert
            severity="warning"
            icon={<SyncIcon />}
            sx={{ mb: 2 }}
            action={
              <Button size="small" onClick={syncNow}>
                {t('localData.syncNow')}
              </Button>
            }
          >
            {t('localData.pendingSyncBanner', { count: unsyncedCount })}
          </Alert>
        )}
      </>
    );
  }

  // For unauthenticated users: dismissable cached-data hint + local data badge + sync dialog
  if (!isAuthenticated) {
    return (
      <>
        {cachedHint}
        {storageErrorAlert}

        <Alert
          severity="info"
          icon={<StorageIcon />}
          sx={{ mb: 2 }}
          action={
            <Button
              size="small"
              startIcon={<SyncIcon />}
              onClick={() => setDialogOpen(true)}
              variant="outlined"
              color="inherit"
            >
              {t('localData.syncButton')}
            </Button>
          }
        >
          {t('localData.localStorageBadge')}
        </Alert>

        <SafeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>{t('localData.syncDialogTitle')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {t('localData.syncDialogText')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button
              variant="contained"
              onClick={() => {
                setDialogOpen(false);
                navigate(`/${lang}/signin`);
              }}
            >
              {t('localData.syncDialogAction')}
            </Button>
          </DialogActions>
        </SafeDialog>
      </>
    );
  }

  // Authenticated without sync: nudge to enable sync
  if (showSyncStatus) {
    return (
      <>
        {cachedHint}
        {storageErrorAlert}
        <Alert severity="info" icon={<StorageIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t('localData.syncOffBanner')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      void enableSyncAndSync();
                    }
                  }}
                  disabled={enabling}
                />
              }
              label={t('localData.syncToggleLabel')}
            />
            {enabling && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Box>
        </Alert>
      </>
    );
  }

  if (showStaleHint || lastStorageError) {
    return (
      <>
        {showStaleHint ? (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={dismissStaleHint}>
            {t('pwa.showingCachedData')}
          </Alert>
        ) : null}
        {storageErrorAlert}
      </>
    );
  }

  return null;
};

export default LocalDataBanner;
