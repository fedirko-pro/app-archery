import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PROFILE_VISIBILITY_OPTIONS, type ProfileVisibility } from '@/types/profile-visibility';

interface ProfileVisibilitySelectProps {
  value: ProfileVisibility;
  onChange: (value: ProfileVisibility) => void;
}

export default function ProfileVisibilitySelect({ value, onChange }: ProfileVisibilitySelectProps) {
  const { t } = useTranslation('common');

  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel component="legend">{t('privacy.visibility.title')}</FormLabel>
      <RadioGroup value={value} onChange={(e) => onChange(e.target.value as ProfileVisibility)}>
        {PROFILE_VISIBILITY_OPTIONS.map((option) => (
          <FormControlLabel
            key={option}
            value={option}
            control={<Radio />}
            label={
              <span>
                <Typography component="span" variant="body2">
                  {t(`privacy.visibility.${option}.label`)}
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t(`privacy.visibility.${option}.helper`)}
                </Typography>
              </span>
            }
            sx={{ alignItems: 'flex-start', mb: 1 }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
