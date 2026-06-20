import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface SettingsDraft {
  syncEnabled: boolean;
  sharingEnabled: boolean;
}

interface SessionAndSettingsStepProps {
  settings: SettingsDraft;
  submitting: boolean;
  onSettingsChange: (value: SettingsDraft) => void;
  onCreateFirstTrainingSession: () => void;
}

const SessionAndSettingsStep: React.FC<SessionAndSettingsStepProps> = ({
  settings,
  submitting,
  onSettingsChange,
  onCreateFirstTrainingSession,
}) => {
  const { t } = useTranslation('common');

  const updateSettings = (patch: Partial<SettingsDraft>) => {
    onSettingsChange({ ...settings, ...patch });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {t('onboarding.steps.getStartedExplanation')}
      </Typography>

      <Typography variant="subtitle2">{t('onboarding.preferences')}</Typography>

      <FormControlLabel
        control={
          <Switch
            checked={settings.syncEnabled}
            onChange={(e) => updateSettings({ syncEnabled: e.target.checked })}
          />
        }
        label={t('localData.syncToggleLabel')}
      />
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1 }}>
        {t('onboarding.syncHelper')}
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={settings.sharingEnabled}
            onChange={(e) => updateSettings({ sharingEnabled: e.target.checked })}
          />
        }
        label={t('onboarding.shareToggleLabel')}
      />
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1 }}>
        {t('onboarding.shareHelper')}
      </Typography>

      <Divider />

      <Typography variant="body2" color="text.secondary">
        {t('onboarding.readyForFirstSession')}
      </Typography>
      <Button
        variant="outlined"
        onClick={onCreateFirstTrainingSession}
        disabled={submitting}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('onboarding.createFirstTrainingSession')}
      </Button>
    </Box>
  );
};

export default SessionAndSettingsStep;
