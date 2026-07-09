import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { User } from '../../contexts/types';
import ProfileAchievementsPreview from './profile-achievements-preview';
import ProfileProgressStats from './profile-progress-stats';

interface ProfileProgressSnapshotProps {
  user: User;
  isAdminView?: boolean;
}

const ProfileProgressSnapshot: React.FC<ProfileProgressSnapshotProps> = ({
  user,
  isAdminView = false,
}) => {
  const { t } = useTranslation('common');

  if (isAdminView) return null;

  return (
    <Paper variant="outlined" sx={{ width: '100%', mt: 2, p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
        {t('profile.progressTitle')}
      </Typography>
      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 8 }}>
          <ProfileProgressStats user={user} embedded />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ProfileAchievementsPreview mode="own" userId={user.id} embedded />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProfileProgressSnapshot;
