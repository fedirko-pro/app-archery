import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import AchievementMedallion from '@/components/achievements/AchievementMedallion';
import { useAchievements } from '@/hooks/use-achievements';
import { useUserAchievements } from '@/hooks/use-user-achievements';
import { getLatestEarnedAchievement } from '@/utils/achievement-utils';

interface ProfileAchievementsPreviewProps {
  mode: 'own' | 'public';
  userId: string;
  embedded?: boolean;
}

const ProfileAchievementsPreview: React.FC<ProfileAchievementsPreviewProps> = ({
  mode,
  userId,
  embedded = false,
}) => {
  const { t } = useTranslation('common');
  const { lang } = useParams();

  const own = useAchievements({
    enabled: mode === 'own',
    serverFetch: mode === 'own' && !embedded,
  });
  const publicData = useUserAchievements(mode === 'public' ? userId : undefined);

  const loading = mode === 'own' ? own.loading : publicData.loading;
  const earnedCount = mode === 'own' ? own.earnedCount : (publicData.data?.earnedCount ?? 0);
  const totalCount = mode === 'own' ? own.totalCount : (publicData.data?.totalCount ?? 0);

  const latest = useMemo(() => {
    if (mode === 'own') {
      return getLatestEarnedAchievement(own.achievements);
    }
    return getLatestEarnedAchievement(publicData.data?.achievements ?? []);
  }, [mode, own.achievements, publicData.data?.achievements]);

  const achievementsHref =
    mode === 'own' ? `/${lang}/achievements` : `/${lang}/archers/${userId}/achievements`;

  const sectionLabel =
    mode === 'own' ? t('profile.latestAchievement') : t('publicProfile.latestAchievement');

  const linkLabel =
    mode === 'own'
      ? t('profile.viewAllAchievements', { earned: earnedCount, total: totalCount })
      : t('publicProfile.viewAchievements');

  if (loading && earnedCount === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          ...(embedded ? {} : { mt: 2 }),
          display: 'flex',
          justifyContent: 'center',
          py: embedded ? 1 : 2,
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  const content = (
    <>
      <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
        {sectionLabel}
      </Typography>

      {latest ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: embedded ? 1.5 : 2,
            mb: embedded ? 1.5 : 2,
          }}
        >
          <AchievementMedallion
            icon={latest.icon}
            rarity={latest.rarity}
            showGlow
            size={embedded ? 48 : 56}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant={embedded ? 'body2' : 'subtitle1'} fontWeight={600} noWrap>
              {t(latest.titleKey)}
            </Typography>
            {latest.earnedAt && (
              <Typography variant="caption" color="text.secondary">
                {t('achievements.earnedOn', {
                  date: format(new Date(latest.earnedAt), 'dd MMM yyyy'),
                })}
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: embedded ? 1.5 : 2 }}>
          {t('profile.noAchievementsYet')}
        </Typography>
      )}

      <Button
        component={Link}
        to={achievementsHref}
        variant="outlined"
        size="small"
        endIcon={<ArrowForwardIcon />}
        fullWidth={embedded}
      >
        {linkLabel}
      </Button>
    </>
  );

  if (embedded) {
    return <Box sx={{ width: '100%', height: '100%' }}>{content}</Box>;
  }

  return (
    <Paper variant="outlined" sx={{ width: '100%', mt: 2, p: 2 }}>
      {content}
    </Paper>
  );
};

export default ProfileAchievementsPreview;
