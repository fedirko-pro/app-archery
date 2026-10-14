import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import SafeDialog from '../../components/SafeDialog/SafeDialog';

interface ConfirmFinishSessionDialogProps {
  open: boolean;
  finishing?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmFinishSessionDialog: React.FC<ConfirmFinishSessionDialogProps> = ({
  open,
  finishing = false,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation('common');

  return (
    <SafeDialog open={open} onClose={finishing ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('trainings.finishQ')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('trainings.finishConfirm')}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={finishing}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={finishing} autoFocus>
          {finishing ? t('common.saving') : t('trainings.finishSession')}
        </Button>
      </DialogActions>
    </SafeDialog>
  );
};

export default ConfirmFinishSessionDialog;
