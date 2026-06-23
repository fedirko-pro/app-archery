import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';

import AvatarUploader from '../../components/AvatarUploader/AvatarUploader';

export interface ProfileDraft {
  firstName: string;
  lastName: string;
  bio: string;
  picture: string;
}

interface ProfileStepProps {
  userId: string;
  value: ProfileDraft;
  onChange: (value: ProfileDraft) => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ userId, value, onChange }) => {
  const { t } = useTranslation('common');

  const update = (patch: Partial<ProfileDraft>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {t('onboarding.steps.profileExplanation')}
      </Typography>

      <AvatarUploader
        value={value.picture}
        userId={userId}
        size={180}
        onChange={(url) => update({ picture: url ?? '' })}
      />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label={t('forms.firstName')}
          value={value.firstName}
          onChange={(e) => update({ firstName: e.target.value })}
          fullWidth
          sx={{ flex: '1 1 200px' }}
        />
        <TextField
          label={t('forms.lastName')}
          value={value.lastName}
          onChange={(e) => update({ lastName: e.target.value })}
          fullWidth
          sx={{ flex: '1 1 200px' }}
        />
      </Box>

      <TextField
        label={t('onboarding.aboutYou')}
        value={value.bio}
        onChange={(e) => update({ bio: e.target.value })}
        fullWidth
        multiline
        rows={3}
        placeholder={t('profile.bioPlaceholder', 'Tell us about yourself...')}
      />
    </Box>
  );
};

export default ProfileStep;
