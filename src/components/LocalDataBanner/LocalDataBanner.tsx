import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
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

interface LocalDataBannerProps {
  /** When true, shows sync-in-progress state for authenticated users */
  showSyncStatus?: boolean;
}

const LocalDataBanner: React.FC<LocalDataBannerProps> = ({ showSyncStatus = false }) => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isSyncing, lastSyncError, syncNow, hasPendingSync, unsyncedCount } = useLocalData();
  const { enableSyncAndSync, enabling } = useEnableSync();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedDismissed, setCachedDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      setCachedDismissed(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isSyncEnabled = user?.syncTrainingsAndEquipment === true;

  // Dismissable "Showing last saved data" hint — shown only when offline and not yet dismissed
  const showCachedHint = isOffline && !cachedDismissed;

  const cachedHint = showCachedHint ? (
    <Alert severity="warning" sx={{ mb: 1 }} onClose={() => setCachedDismissed(true)}>
      {t('pwa.showingCachedData')}
    </Alert>
  ) : null;

  // For authenticated users with sync enabled: show sync status if requested
  if (isAuthenticated && isSyncEnabled && showSyncStatus) {
    return (
      <>
        {cachedHint}
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

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
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
        </Dialog>
      </>
    );
  }

  // Authenticated without sync: nudge to enable sync
  if (showSyncStatus) {
    return (
      <>
        {cachedHint}
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

  if (showCachedHint) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setCachedDismissed(true)}>
        {t('pwa.showingCachedData')}
      </Alert>
    );
  }

  return null;
};

export default LocalDataBanner;
