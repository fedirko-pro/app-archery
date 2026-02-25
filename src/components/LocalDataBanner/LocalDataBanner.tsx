import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import { useLocalData } from '../../contexts/local-data-context';

interface LocalDataBannerProps {
  /** When true, shows sync-in-progress state for authenticated users */
  showSyncStatus?: boolean;
}

const LocalDataBanner: React.FC<LocalDataBannerProps> = ({ showSyncStatus = false }) => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isSyncing, lastSyncError, syncNow } = useLocalData();
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

  // For authenticated users with sync enabled: show sync status if requested
  if (isAuthenticated && isSyncEnabled && showSyncStatus) {
    return (
      <>
        {showCachedHint && (
          <Alert severity="warning" sx={{ mb: 1 }} onClose={() => setCachedDismissed(true)}>
            {t('pwa.showingCachedData')}
          </Alert>
        )}
        {(isSyncing || lastSyncError) && (
          <Alert
            severity={lastSyncError ? 'error' : 'info'}
            icon={<SyncIcon />}
            sx={{ mb: 2 }}
            action={
              lastSyncError ? (
                <Button size="small" onClick={syncNow}>
                  {t('trainings.syncing')}
                </Button>
              ) : undefined
            }
          >
            {lastSyncError ?? t('trainings.syncing')}
          </Alert>
        )}
      </>
    );
  }

  // For unauthenticated users: dismissable cached-data hint + local data badge + sync dialog
  if (!isAuthenticated) {
    return (
      <>
        {showCachedHint && (
          <Alert severity="warning" sx={{ mb: 1 }} onClose={() => setCachedDismissed(true)}>
            {t('pwa.showingCachedData')}
          </Alert>
        )}

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

  // Authenticated without sync: still show cached hint if offline
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
