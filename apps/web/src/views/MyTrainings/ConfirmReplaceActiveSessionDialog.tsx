import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import { useTranslation } from 'react-i18next';

import SafeDialog from '../../components/SafeDialog/SafeDialog';

interface ConfirmReplaceActiveSessionDialogProps {
  open: boolean;
  submitting?: boolean;
  onEditCurrent: () => void;
  onStartNew: () => void;
}

const ConfirmReplaceActiveSessionDialog: React.FC<ConfirmReplaceActiveSessionDialogProps> = ({
  open,
  submitting = false,
  onEditCurrent,
  onStartNew,
}) => {
  const { t } = useTranslation('common');

  return (
    <SafeDialog open={open} onClose={onEditCurrent} maxWidth="xs" fullWidth>
      <DialogTitle>{t('trainings.replaceActiveSession.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('trainings.replaceActiveSession.message')}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onEditCurrent} disabled={submitting}>
          {t('trainings.replaceActiveSession.editCurrent')}
        </Button>
        <Button variant="contained" onClick={onStartNew} disabled={submitting} autoFocus>
          {t('trainings.replaceActiveSession.startNew')}
        </Button>
      </DialogActions>
    </SafeDialog>
  );
};

export default ConfirmReplaceActiveSessionDialog;
