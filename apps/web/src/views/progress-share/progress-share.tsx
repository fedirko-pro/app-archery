import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import AchievementMedallion from '@/components/achievements/AchievementMedallion';
import ShareMenu from '@/components/share/ShareMenu';
import { useAuth } from '@/contexts/auth-context';
import apiService from '@/services/api';
import type { PublicProgressShareDto } from '@/services/types';
import { getAvatarInitials, resolveUserAvatarWithCacheBust } from '@/utils/placeholder-images';
import { displayName, getOrigin } from '@/utils/user-display';

const ProgressSharePage: React.FC = () => {
  const { t } = useTranslation('common');
  const { userId, lang } = useParams();
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<PublicProgressShareDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await apiService.getPublicProgressShare(userId);
        setProgress(data);
      } catch {
        if (isAuthenticated) {
          try {
            const data = await apiService.getLimitedProgressShare(userId);
            setProgress(data);
            return;
          } catch {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userId, isAuthenticated, lang]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (notFound || !progress) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>
          {t('progressShare.notFoundTitle')}
        </Typography>
        <Typography color="text.secondary">{t('progressShare.notFoundMessage')}</Typography>
      </Container>
    );
  }

  const name = displayName(progress.owner);
  const shareUrl = `${getOrigin()}/${lang}/archers/${progress.owner.id}/progress`;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="overline" color="text.secondary">
              {t('progressShare.badge')}
            </Typography>
            <Typography variant="h4">{t('progressShare.title')}</Typography>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {t('achievements.progress', {
                    earned: progress.earnedCount,
                    total: progress.totalCount,
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {progress.percent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress.percent}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            {progress.topAchievements.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('progressShare.topBadges')}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {progress.topAchievements.map((badge) => (
                    <Box key={badge.id} sx={{ textAlign: 'center' }}>
                      <AchievementMedallion
                        icon={badge.icon}
                        rarity={badge.rarity as 'common' | 'rare' | 'epic' | 'legendary'}
                        size={56}
                        showGlow
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, maxWidth: 80 }}>
                        {badge.title.startsWith('achievements.') ? t(badge.title) : badge.title}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Avatar src={resolveUserAvatarWithCacheBust(progress.owner.picture)}>
                {getAvatarInitials(name)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  {t('progressShare.by')}
                </Typography>
                <Typography
                  component={Link}
                  to={`/${lang}/archers/${progress.owner.id}`}
                  variant="subtitle1"
                  sx={{ textDecoration: 'none', color: 'primary.main' }}
                >
                  {name}
                </Typography>
              </Box>
              <ShareMenu
                url={shareUrl}
                title={t('progressShare.shareTitle', { name })}
                text={t('progressShare.shareText', {
                  earned: progress.earnedCount,
                  total: progress.totalCount,
                })}
                imageUrl={progress.owner.picture}
                size="small"
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProgressSharePage;
