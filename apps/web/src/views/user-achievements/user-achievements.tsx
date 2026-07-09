import '../achievements/achievements.scss';

import { EmojiEvents, MilitaryTech, Star, WorkspacePremium } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import AchievementLockedDialog from '@/components/achievements/AchievementLockedDialog';
import AchievementMedallion from '@/components/achievements/AchievementMedallion';
import { useAuth } from '@/contexts/auth-context';
import { useUserAchievements } from '@/hooks/use-user-achievements';
import apiService from '@/services/api';
import type { AchievementProgressDto } from '@/services/types';
import { RARITY_ICON_COLORS } from '@/theme/achievementTokens';
import { displayName } from '@/utils/user-display';

type CategoryFilter = 'all' | AchievementProgressDto['category'];

const getRarityIcon = (rarity: AchievementProgressDto['rarity']) => {
  switch (rarity) {
    case 'legendary':
      return <EmojiEvents sx={{ fontSize: 16, color: RARITY_ICON_COLORS.legendary }} />;
    case 'epic':
      return <WorkspacePremium sx={{ fontSize: 16, color: RARITY_ICON_COLORS.epic }} />;
    case 'rare':
      return <MilitaryTech sx={{ fontSize: 16, color: RARITY_ICON_COLORS.rare }} />;
    default:
      return <Star sx={{ fontSize: 16, color: RARITY_ICON_COLORS.common }} />;
  }
};

const UserAchievementsPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { userId, lang } = useParams();
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useUserAchievements(userId);
  const [ownerName, setOwnerName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [lockedDialog, setLockedDialog] = useState<AchievementProgressDto | null>(null);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const profile = await apiService.getPublicProfile(userId);
        setOwnerName(displayName(profile));
      } catch {
        if (isAuthenticated) {
          try {
            const profile = await apiService.getLimitedProfile(userId);
            setOwnerName(displayName(profile));
          } catch {
            setOwnerName('');
          }
        }
      }
    };
    void load();
  }, [userId, isAuthenticated]);

  const achievements = data?.achievements ?? [];
  const earnedCount = data?.earnedCount ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const percent = data?.percent ?? 0;
  const byRarity = data?.byRarity ?? { common: 0, rare: 0, epic: 0, legendary: 0 };

  const earned = useMemo(() => achievements.filter((a) => a.earned), [achievements]);
  const locked = useMemo(() => achievements.filter((a) => !a.earned), [achievements]);

  const filterByCategory = useCallback(
    (items: AchievementProgressDto[]) =>
      categoryFilter === 'all' ? items : items.filter((a) => a.category === categoryFilter),
    [categoryFilter],
  );

  const filteredEarned = useMemo(() => filterByCategory(earned), [earned, filterByCategory]);
  const filteredLocked = useMemo(() => filterByCategory(locked), [locked, filterByCategory]);

  const sortedEarned = useMemo(
    () => [...filteredEarned].sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? '')),
    [filteredEarned],
  );

  const rarityBreakdown = (['legendary', 'epic', 'rare', 'common'] as const)
    .filter((r) => byRarity[r] > 0)
    .map((r) => `${byRarity[r]} ${t(`achievements.rarity.${r}`).toLowerCase()}`)
    .join(' · ');

  const categories: CategoryFilter[] = [
    'all',
    'onboarding',
    'consistency',
    'volume',
    'exploration',
    'tournaments',
    'mastery',
  ];

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>
          {t('publicProfile.notFoundTitle')}
        </Typography>
        <Typography color="text.secondary">{t('publicProfile.notFoundMessage')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        component={Link}
        to={`/${lang}/archers/${userId}`}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        {t('userAchievements.backToProfile')}
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('userAchievements.title', { name: ownerName || t('userAchievements.archer') })}
        </Typography>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>
              {t('achievements.progress', { earned: earnedCount, total: totalCount })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {percent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>

        {rarityBreakdown && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            {rarityBreakdown}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={
                cat === 'all'
                  ? t('achievements.categories.all')
                  : t(`achievements.categories.${cat}`)
              }
              onClick={() => setCategoryFilter(cat)}
              color={categoryFilter === cat ? 'primary' : 'default'}
              variant={categoryFilter === cat ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>
      </Box>

      {sortedEarned.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {t('achievements.sections.unlocked')}
          </Typography>
          <Box className="achievements-grid">
            {sortedEarned.map((achievement) => (
              <Card key={achievement.id} className="achievement-card achievement-card--earned">
                <Box className="achievement-card__medallion-wrap">
                  <AchievementMedallion
                    icon={achievement.icon}
                    rarity={achievement.rarity}
                    showGlow
                  />
                </Box>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    {getRarityIcon(achievement.rarity)}
                    <Typography variant="caption" color="text.secondary">
                      {t(`achievements.rarity.${achievement.rarity}`)}
                    </Typography>
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ fontSize: '1rem' }} gutterBottom>
                    {t(achievement.titleKey)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 40 }}>
                    {t(achievement.descriptionKey)}
                  </Typography>
                  {achievement.earnedAt && (
                    <Typography variant="caption" color="success.main" display="block">
                      {t('achievements.earnedOn', {
                        date: new Date(achievement.earnedAt).toLocaleDateString(),
                      })}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {filteredLocked.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            {t('achievements.sections.locked')}
          </Typography>
          <Box className="achievements-grid achievements-grid--locked">
            {filteredLocked.map((achievement) => (
              <Card
                key={achievement.id}
                className="achievement-card achievement-card--locked"
                onClick={() => setLockedDialog(achievement)}
                sx={{ cursor: 'pointer' }}
              >
                <Box className="achievement-card__medallion-wrap achievement-card__medallion-wrap--compact">
                  <AchievementMedallion
                    icon={achievement.icon}
                    rarity={achievement.rarity}
                    locked
                    size={64}
                  />
                </Box>
                <CardContent sx={{ textAlign: 'center', pt: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {t(achievement.titleKey)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      <AchievementLockedDialog
        achievement={lockedDialog}
        open={!!lockedDialog}
        onClose={() => setLockedDialog(null)}
      />
    </Container>
  );
};

export default UserAchievementsPage;
