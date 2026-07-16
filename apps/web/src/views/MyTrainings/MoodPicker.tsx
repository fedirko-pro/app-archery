import type { SvgIconComponent } from '@mui/icons-material';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { TrainingMood } from '../../utils/local-data-storage';
import { TRAINING_MOODS } from '../../utils/training-session-utils';

export const MOOD_ICONS: Record<TrainingMood, SvgIconComponent> = {
  bad: SentimentVeryDissatisfiedIcon,
  normal: SentimentNeutralIcon,
  good: SentimentSatisfiedIcon,
  amazing: SentimentSatisfiedAltIcon,
};

export const MOOD_COLORS: Record<TrainingMood, string> = {
  bad: '#e53935',
  normal: '#fb8c00',
  good: '#fdd835',
  amazing: '#43a047',
};

interface MoodIconProps {
  mood: TrainingMood;
  fontSize?: number;
}

/** Read-only colored mood face for lists and summaries. */
export function MoodIcon({ mood, fontSize = 28 }: MoodIconProps) {
  const { t } = useTranslation('common');
  const Icon = MOOD_ICONS[mood];

  return (
    <Tooltip title={t(`trainings.moodOptions.${mood}`)}>
      <Icon
        sx={{ fontSize, color: MOOD_COLORS[mood] }}
        aria-label={t(`trainings.moodOptions.${mood}`)}
      />
    </Tooltip>
  );
}

interface MoodPickerProps {
  value: TrainingMood | '';
  onChange: (mood: TrainingMood | '') => void;
}

const MoodPicker: React.FC<MoodPickerProps> = ({ value, onChange }) => {
  const { t } = useTranslation('common');

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
        {t('trainings.mood')}
      </Typography>
      <Box
        role="radiogroup"
        aria-label={t('trainings.mood')}
        sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.5 }}
      >
        {TRAINING_MOODS.map((mood) => {
          const Icon = MOOD_ICONS[mood];
          const selected = value === mood;

          return (
            <IconButton
              key={mood}
              role="radio"
              aria-checked={selected}
              aria-label={t(`trainings.moodOptions.${mood}`)}
              onClick={() => onChange(selected ? '' : mood)}
              sx={{
                flex: 1,
                py: 1,
                borderRadius: 2,
                color: selected ? MOOD_COLORS[mood] : 'action.disabled',
                transition: 'color 0.15s ease, transform 0.15s ease',
                transform: selected ? 'scale(1.08)' : 'scale(1)',
                '&:hover': {
                  color: selected ? MOOD_COLORS[mood] : 'action.active',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Icon sx={{ fontSize: 52 }} />
            </IconButton>
          );
        })}
      </Box>
    </Box>
  );
};

export default MoodPicker;
