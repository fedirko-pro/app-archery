import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalData, type LocalTrainingSession } from '../../contexts/local-data-context';
import type { TrainingMood } from '../../utils/local-data-storage';
import { TRAINING_MOODS } from '../../utils/training-session-utils';

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
      const parsedScore = scoreTotal ? Number.parseInt(scoreTotal, 10) : undefined;
      await editTrainingSession(session.id, {
        status: 'finished',
        scoreTotal:
          parsedScore !== undefined && !Number.isNaN(parsedScore) ? parsedScore : undefined,
        notes: notes.trim() || undefined,
        mood: mood || undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      <DialogTitle>{t('trainings.finishSession')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label={t('trainings.scoreTotal')}
            type="number"
            value={scoreTotal}
            onChange={(e) => setScoreTotal(e.target.value)}
            fullWidth
            inputProps={{ min: 0 }}
          />
          <TextField
            label={t('trainings.notes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            select
            label={t('trainings.mood')}
            value={mood}
            onChange={(e) => setMood(e.target.value as TrainingMood | '')}
            fullWidth
          >
            <MenuItem value="">&mdash;</MenuItem>
            {TRAINING_MOODS.map((m) => (
              <MenuItem key={m} value={m}>
                {t(`trainings.moodOptions.${m}`)}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" onClick={() => void handleFinish()} disabled={submitting}>
          {submitting ? t('common.saving') : t('trainings.finishSession')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinishSessionDialog;
