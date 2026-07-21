import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import SafeDialog from '../../components/SafeDialog/SafeDialog';
import { useAchievementCelebration } from '../../contexts/achievement-celebration-context';
import { useLocalData, type LocalTrainingSession } from '../../contexts/local-data-context';
import type { TrainingMood } from '../../utils/local-data-storage';
import { isNonNegativeIntegerInput, parseNonNegativeInt } from '../../utils/non-negative-number';
import MoodPicker from './MoodPicker';

interface FinishSessionDialogProps {
  open: boolean;
  session: LocalTrainingSession | null;
  onClose: () => void;
}

const FinishSessionDialog: React.FC<FinishSessionDialogProps> = ({ open, session, onClose }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { editTrainingSession } = useLocalData();
  const { celebrateAfterSync } = useAchievementCelebration();

  const [scoreTotal, setScoreTotal] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<TrainingMood | ''>('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (open && session) {
      setScoreTotal(session.scoreTotal !== undefined ? String(session.scoreTotal) : '');
      setNotes(session.notes ?? '');
      setMood(session.mood ?? '');
    }
  }, [open, session]);

  const handleFinish = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      const parsedScore = parseNonNegativeInt(scoreTotal);
      await editTrainingSession(session.id, {
        status: 'finished',
        scoreTotal: parsedScore,
        notes: notes.trim() || undefined,
        mood: mood || undefined,
      });
      await celebrateAfterSync().catch(() => {
        /* non-blocking */
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeDialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      <DialogTitle>{t('trainings.finishSession')}</DialogTitle>
      <DialogContent sx={{ pb: fullScreen ? 0 : undefined }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label={t('trainings.scoreTotal')}
            type="number"
            value={scoreTotal}
            onChange={(e) => {
              const val = e.target.value;
              if (isNonNegativeIntegerInput(val)) setScoreTotal(val);
            }}
            fullWidth
            inputProps={{ min: 0, inputMode: 'numeric' }}
          />
          <TextField
            label={t('trainings.notes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <MoodPicker value={mood} onChange={setMood} />
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
            gap: 1,
          }),
        }}
      >
        <Button onClick={onClose} disabled={submitting} size={fullScreen ? 'large' : 'medium'}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleFinish()}
          disabled={submitting}
          size={fullScreen ? 'large' : 'medium'}
          sx={fullScreen ? { minHeight: 48 } : undefined}
        >
          {submitting ? t('common.saving') : t('trainings.finishSession')}
        </Button>
      </DialogActions>
    </SafeDialog>
  );
};

export default FinishSessionDialog;
