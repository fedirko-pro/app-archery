import SyncIcon from '@mui/icons-material/Sync';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import { useEnableSync } from '../../hooks/use-enable-sync';
import SafeDialog from '../SafeDialog/SafeDialog';

/**
 * Shows a "Local data on device" chip plus a small sync icon button.
 * Rendered on every unsynced card item.
 */
const LocalSyncChip: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { enableSyncAndSync, enabling } = useEnableSync();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSyncClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setDialogOpen(true);
      return;
    }

    await enableSyncAndSync();
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
            disabled={enabling}
            sx={{ minWidth: 0, width: 28, height: 28, p: 0, borderRadius: '50%' }}
          >
            {enabling ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SyncIcon sx={{ fontSize: 16 }} />
            )}
          </Button>
        </span>
      </Tooltip>

      {/* Dialog for unauthenticated users */}
      <SafeDialog
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
      </SafeDialog>
    </>
  );
};

export default LocalSyncChip;
