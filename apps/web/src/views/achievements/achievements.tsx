import './achievements.scss';

import { EmojiEvents, MilitaryTech, Star, WorkspacePremium } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import AchievementLockedDialog from '@/components/achievements/AchievementLockedDialog';
import AchievementMedallion from '@/components/achievements/AchievementMedallion';
import PrivacyAwareShareMenu from '@/components/share/PrivacyAwareShareMenu';
import { useAuth } from '@/contexts/auth-context';
import { useAchievements } from '@/hooks/use-achievements';
import type { AchievementProgressDto } from '@/services/types';
import { RARITY_ICON_COLORS } from '@/theme/achievementTokens';

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

const Achievements = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { lang } = useParams();
  const {
    earned,
    locked,
    earnedCount,
    totalCount,
    percent,
    byRarity,
    loading,
    error,
    isGuest,
    isNewAchievement,
  } = useAchievements();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [lockedDialog, setLockedDialog] = useState<AchievementProgressDto | null>(null);

  const filterByCategory = useCallback(
    (items: AchievementProgressDto[]) =>
      categoryFilter === 'all' ? items : items.filter((a) => a.category === categoryFilter),
    [categoryFilter],
  );

  const filteredEarned = useMemo(() => filterByCategory(earned), [earned, filterByCategory]);
  const filteredLocked = useMemo(() => filterByCategory(locked), [locked, filterByCategory]);

  const sortedEarned = useMemo(
    () =>
      [...filteredEarned].sort((a, b) => {
        const dateA = a.earnedAt ?? '';
        const dateB = b.earnedAt ?? '';
        return dateB.localeCompare(dateA);
      }),
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

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const progressShareUrl = user
    ? `${origin}/${lang}/archers/${user.id}/progress`
    : `${origin}/${lang}/achievements`;

  if (loading && earnedCount === 0 && locked.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('achievements.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('achievements.subtitle')}
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

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
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
          <Box sx={{ ml: 'auto' }}>
            <PrivacyAwareShareMenu
              url={progressShareUrl}
              title={t('achievements.shareProgressTitle')}
              text={t('achievements.shareProgressText', {
                earned: earnedCount,
                total: totalCount,
              })}
              buttonLabel={t('achievements.shareProgress')}
              variant="button"
              size="small"
              canShare={earnedCount > 0}
            />
          </Box>
        </Box>

        {isGuest && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {t('achievements.guestHint')}
          </Typography>
        )}
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>

      {sortedEarned.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {t('achievements.sections.unlocked')}
          </Typography>
          <Box className="achievements-grid">
            {sortedEarned.map((achievement) => (
              <Card key={achievement.id} className="achievement-card achievement-card--earned">
                {isNewAchievement(achievement.id, achievement.earnedAt) && (
                  <Chip
                    label={t('achievements.new')}
                    size="small"
                    color="success"
                    className="achievement-card__new-badge"
                  />
                )}
                <Box className="achievement-card__medallion-wrap">
                  <AchievementMedallion
                    icon={achievement.icon}
                    rarity={achievement.rarity}
                    fluid
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
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <PrivacyAwareShareMenu
                      url={
                        user
                          ? `${origin}/${lang}/archers/${user.id}/achievements/${achievement.id}`
                          : `${origin}/${lang}/achievements`
                      }
                      title={t(achievement.titleKey)}
                      text={t(achievement.descriptionKey)}
                      variant="icon"
                      size="small"
                      canShare
                    />
                  </Box>
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
                    fluid
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

export default Achievements;
