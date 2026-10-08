import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import SafeDialog from '../SafeDialog/SafeDialog';

interface ApplicationDeadlineDialogProps {
  open: boolean;
  onClose: () => void;
}

const ApplicationDeadlineDialog: React.FC<ApplicationDeadlineDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation('common');

  return (
    <SafeDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('pages.tournaments.applicationDeadlinePassedTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('pages.tournaments.applicationDeadlinePassedMessage')}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" autoFocus>
          {t('common.close')}
        </Button>
      </DialogActions>
    </SafeDialog>
  );
};

export default ApplicationDeadlineDialog;
