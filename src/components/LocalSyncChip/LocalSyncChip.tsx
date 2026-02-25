import SyncIcon from '@mui/icons-material/Sync';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import { useLocalData } from '../../contexts/local-data-context';
import apiService from '../../services/api';

/**
 * Shows a "Local data on device" chip plus a small sync icon button.
 * Rendered on every unsynced card item.
 */
const LocalSyncChip: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser } = useAuth();
  const { syncNow } = useLocalData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSyncClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setDialogOpen(true);
      return;
    }

    // Authenticated: enable sync toggle if not already on, then trigger sync
    setSyncing(true);
    try {
      if (!user?.syncTrainingsAndEquipment) {
        const updated = await apiService.updateProfile({
          syncTrainingsAndEquipment: true,
        });
        updateUser(updated);
      }
      await syncNow();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Chip
        label={t('localData.localStorageBadge')}
        size="small"
        variant="outlined"
        color="warning"
      />
      <Tooltip title={t('localData.syncButton')}>
        <span>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={handleSyncClick}
            disabled={syncing}
            sx={{ minWidth: 0, width: 28, height: 28, p: 0, borderRadius: '50%' }}
          >
            {syncing ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SyncIcon sx={{ fontSize: 16 }} />
            )}
          </Button>
        </span>
      </Tooltip>

      {/* Dialog for unauthenticated users */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
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
};

export default LocalSyncChip;
