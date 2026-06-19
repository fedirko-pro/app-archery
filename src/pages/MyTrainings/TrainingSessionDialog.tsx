import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { LocalTrainingSession } from '../../utils/local-data-storage';
import TrainingSessionForm from './TrainingSessionForm';

const FORM_ID = 'training-session-form';

interface TrainingSessionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initial?: Partial<LocalTrainingSession>;
  formKey: number;
  onSubmit: (
    data: Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
  ) => void;
  submitting?: boolean;
}

const TrainingSessionDialog: React.FC<TrainingSessionDialogProps> = ({
  open,
  onClose,
  title,
  initial,
  formKey,
  onSubmit,
  submitting = false,
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ pb: fullScreen ? 0 : undefined }}>
        <Box sx={{ pt: 1 }}>
          <TrainingSessionForm
            key={formKey}
            formId={FORM_ID}
            showActions={false}
            initial={initial}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          ...(fullScreen && {
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }),
        }}
      >
        <Button onClick={onClose} disabled={submitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" form={FORM_ID} variant="contained" disabled={submitting}>
          {submitting ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrainingSessionDialog;
