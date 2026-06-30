import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';

import type { AlertDialogProps } from './types';

export default function AlertDialog(props: AlertDialogProps) {
  const { t } = useTranslation('common');

  return (
    <Dialog
      disableScrollLock
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{props.question}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.hint}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose}>{t('dialog.no', 'No')}</Button>
        <Button onClick={props.handleConfirm} autoFocus>
          {t('dialog.yes', 'Yes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
