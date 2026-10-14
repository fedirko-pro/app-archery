import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import SafeDialog from '../../components/SafeDialog/SafeDialog';

interface ConfirmDeleteSessionDialogProps {
  open: boolean;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteSessionDialog: React.FC<ConfirmDeleteSessionDialogProps> = ({
  open,
  deleting = false,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation('common');

  return (
    <SafeDialog open={open} onClose={deleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('trainings.deleteQ')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('trainings.deleteConfirm')}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={deleting}>
          {t('common.cancel')}
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={deleting} autoFocus>
          {deleting ? t('common.deleting') : t('common.delete')}
        </Button>
      </DialogActions>
    </SafeDialog>
  );
};

export default ConfirmDeleteSessionDialog;
