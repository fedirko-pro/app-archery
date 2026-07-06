import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
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
import type { PublicAchievementShareDto } from '@/services/types';
import { getAvatarInitials, resolveUserAvatarWithCacheBust } from '@/utils/placeholder-images';
import { displayName, getOrigin } from '@/utils/user-display';

const AchievementSharePage: React.FC = () => {
  const { t } = useTranslation('common');
  const { userId, achievementId, lang } = useParams();
  const { isAuthenticated } = useAuth();
  const [achievement, setAchievement] = useState<PublicAchievementShareDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId || !achievementId) return;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await apiService.getPublicAchievementShare(userId, achievementId);
        setAchievement(data);
      } catch {
        if (isAuthenticated) {
          try {
            const data = await apiService.getLimitedAchievement(userId, achievementId);
            setAchievement(data);
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
  }, [userId, achievementId, isAuthenticated, lang]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (notFound || !achievement) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>
          {t('achievementShare.notFoundTitle')}
        </Typography>
        <Typography color="text.secondary">{t('achievementShare.notFoundMessage')}</Typography>
      </Container>
    );
  }

  const name = displayName(achievement.owner);
  const shareUrl = `${getOrigin()}/${lang}/archers/${achievement.owner.id}/achievements/${achievement.id}`;
  const title = t(achievement.titleKey);
  const description = t(achievement.descriptionKey);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="overline" color="text.secondary">
              {t('achievementShare.badge')}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <AchievementMedallion
                icon={achievement.icon}
                rarity={achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary'}
                size={96}
                showGlow
              />
            </Box>
            <Typography variant="h4" textAlign="center">
              {title}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Chip label={t(`achievements.rarity.${achievement.rarity}`)} size="small" />
            </Box>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              {description}
            </Typography>
            {achievement.earnedDate && (
              <Typography variant="caption" color="success.main" textAlign="center">
                {t('achievements.earnedOn', {
                  date: new Date(achievement.earnedDate).toLocaleDateString(),
                })}
              </Typography>
            )}

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Avatar src={resolveUserAvatarWithCacheBust(achievement.owner.picture)}>
                {getAvatarInitials(name)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  {t('achievementShare.earnedBy')}
                </Typography>
                <Typography
                  component={Link}
                  to={`/${lang}/archers/${achievement.owner.id}`}
                  variant="subtitle1"
                  sx={{ textDecoration: 'none', color: 'primary.main' }}
                >
                  {name}
                </Typography>
              </Box>
              <ShareMenu
                url={shareUrl}
                title={title}
                text={description}
                imageUrl={achievement.owner.picture}
                size="small"
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AchievementSharePage;
