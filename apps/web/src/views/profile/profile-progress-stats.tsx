import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { format, parseISO } from 'date-fns';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import StatCard from '../../components/StatCard/StatCard';
import { useLocalData } from '../../contexts/local-data-context';
import type { User } from '../../contexts/types';
import { computeLocalStats } from '../../utils/training-stats';

const DASH = '—';

interface ProfileProgressStatsProps {
  user: User;
  isAdminView?: boolean;
  embedded?: boolean;
}

const ProfileProgressStats: React.FC<ProfileProgressStatsProps> = ({
  user,
  isAdminView = false,
  embedded = false,
}) => {
  const { t } = useTranslation('common');
  const { trainingSessions, equipmentSets } = useLocalData();

  const stats = useMemo(
    () => computeLocalStats(trainingSessions, equipmentSets),
    [trainingSessions, equipmentSets],
  );

  if (isAdminView) return null;

  const memberSince = (): string => {
    if (!user.createdAt) return DASH;
    try {
      return format(parseISO(user.createdAt), 'dd MMM yyyy');
    } catch {
      return DASH;
    }
  };

  const fmt = (n: number) => n.toLocaleString();

  return (
    <Grid container spacing={2} sx={{ width: '100%', ...(embedded ? {} : { mt: 2 }) }}>
      {!embedded && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
            {t('profile.progressTitle')}
          </Typography>
        </Grid>
      )}
      <Grid size={{ xs: 6, sm: 4 }}>
        <StatCard
          label={t('statistics.currentStreak')}
          value={fmt(stats.currentStreakWeeks)}
          subtitle={t('statistics.weeks')}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <StatCard label={t('publicProfile.totalArrows')} value={fmt(stats.shots.total)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard label={t('statistics.memberSince')} value={memberSince()} />
      </Grid>
    </Grid>
  );
};

export default ProfileProgressStats;
