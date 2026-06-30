import './public-profile.scss';

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
import { useParams } from 'react-router-dom';

import ShareMenu from '@/components/share/ShareMenu';
import { useAuth } from '@/contexts/auth-context';
import apiService from '@/services/api';
import type { PublicProfileDto } from '@/services/types';
import { getAvatarInitials, resolveUserAvatarWithCacheBust } from '@/utils/placeholder-images';
import { displayName, getOrigin } from '@/utils/user-display';

const PublicProfilePage: React.FC = () => {
  const { t } = useTranslation('common');
  const { userId, lang } = useParams();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<PublicProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await apiService.getPublicProfile(userId);
        setProfile(data);
      } catch {
        if (isAuthenticated) {
          try {
            const data = await apiService.getLimitedProfile(userId);
            setProfile(data);
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

  if (notFound || !profile) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>
          {t('publicProfile.notFoundTitle')}
        </Typography>
        <Typography color="text.secondary">{t('publicProfile.notFoundMessage')}</Typography>
      </Container>
    );
  }

  const name = displayName(profile);
  const shareUrl = `${getOrigin()}/${lang}/archers/${profile.id}`;
  const progress = profile.progress;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
            <Avatar
              src={resolveUserAvatarWithCacheBust(profile.picture)}
              sx={{ width: 96, height: 96 }}
            >
              {getAvatarInitials(name)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" gutterBottom>
                {name}
              </Typography>
              {profile.club?.name && <Chip label={profile.club.name} size="small" sx={{ mb: 1 }} />}
              {profile.location && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {profile.location}
                </Typography>
              )}
              {profile.bio && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {profile.bio}
                </Typography>
              )}
            </Box>
            <ShareMenu
              url={shareUrl}
              title={name}
              text={profile.bio || t('publicProfile.shareText', { name })}
              imageUrl={profile.picture}
              buttonLabel={t('pages.tournaments.share', 'Share')}
            />
          </Stack>

          {progress && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                {t('publicProfile.progressTitle')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      {t('publicProfile.weeklyArrows')}
                    </Typography>
                    <Typography variant="h4">{progress.shotsThisWeek}</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      {t('publicProfile.streak')}
                    </Typography>
                    <Typography variant="h4">
                      {t('publicProfile.streakWeeks', { count: progress.currentStreakWeeks })}
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      {t('publicProfile.totalArrows')}
                    </Typography>
                    <Typography variant="h4">{progress.shotsTotal}</Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PublicProfilePage;
