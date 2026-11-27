import './achievements.scss';

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  ACHIEVEMENT_CATALOG,
  type AchievementBranch,
  type AchievementDefinition,
  BRANCH_ORDER,
  ENDURANCE_SUBTRACK_ORDER,
  type EnduranceSubtrack,
  getAchievementsByBranch,
  getEnduranceBySubtrack,
} from '@sokil/shared-types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import PrivacyAwareShareMenu from '@/components/share/PrivacyAwareShareMenu';
import { useAuth } from '@/contexts/auth-context';
import { useAchievements } from '@/hooks/use-achievements';
import type { AchievementProgressDto } from '@/services/types';
import { getRarityStyle, RARITY_ICON_COLORS } from '@/theme/achievementTokens';

const BRANCH_LABELS: Record<AchievementBranch, string> = {
  onboarding: 'achievements.categories.onboarding',
  discipline: 'achievements.categories.discipline',
  endurance: 'achievements.categories.endurance',
  fieldcraft: 'achievements.categories.fieldcraft',
  arena: 'achievements.categories.arena',
};

const SUBTRACK_LABELS: Record<EnduranceSubtrack, string> = {
  arrows: 'achievements.subtracks.arrows',
  sessions: 'achievements.subtracks.sessions',
  distance: 'achievements.subtracks.distance',
  weight: 'achievements.subtracks.weight',
};

const getRarityIcon = (rarity: AchievementProgressDto['rarity']) => {
  switch (rarity) {
    case 'legendary':
      return (
        <Box
          sx={{
            fontSize: 16,
            color: RARITY_ICON_COLORS.legendary,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          🏆
        </Box>
      );
    case 'epic':
      return (
        <Box
          sx={{
            fontSize: 16,
            color: RARITY_ICON_COLORS.epic,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          ⭐
        </Box>
      );
    case 'rare':
      return (
        <Box
          sx={{
            fontSize: 16,
            color: RARITY_ICON_COLORS.rare,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          💎
        </Box>
      );
    default:
      return (
        <Box
          sx={{
            fontSize: 16,
            color: RARITY_ICON_COLORS.common,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          ⚪
        </Box>
      );
  }
};

interface AchievementNodeProps {
  achievement: AchievementProgressDto;
  isNextInTrack: boolean;
  index: number;
  total: number;
  onClick: () => void;
  origin: string;
  lang: string;
  userId?: string;
}

function AchievementNode({
  achievement,
  isNextInTrack,
  index,
  total,
  onClick,
  origin,
  lang,
  userId,
}: AchievementNodeProps) {
  const { t } = useTranslation('common');
  const style = getRarityStyle(achievement.rarity);
  const isLast = index === total - 1;
  const isEarned = achievement.earned;
  const isLocked = !achievement.earned && !isNextInTrack;
  const showProgress = !isEarned && (isNextInTrack || achievement.prerequisitesMet);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        gap: 2,
        px: 1,
        py: 1.5,
        minHeight: 96,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 36,
          top: index === 0 ? 48 : 0,
          bottom: isLast ? 48 : 0,
          width: 2,
          background: isEarned ? achievement.rarityHex : 'rgba(0,0,0,0.12)',
          borderStyle: isEarned ? 'solid' : 'dashed',
          zIndex: 0,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 72,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isEarned
              ? style.bgGradient
              : isLocked
                ? 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'
                : `linear-gradient(135deg, ${style.color}20 0%, ${style.color}40 100%)`,
            border: isNextInTrack ? `3px solid ${style.color}` : 'none',
            boxShadow: isEarned
              ? `0 0 16px ${style.glow}`
              : isNextInTrack
                ? `0 0 12px ${style.color}60`
                : 1,
            filter: isLocked ? 'grayscale(85%)' : 'none',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={onClick}
        >
          <Box
            sx={{
              fontSize: isEarned ? 28 : 24,
              filter: isLocked ? 'grayscale(1)' : 'none',
            }}
          >
            {achievement.icon}
          </Box>
          {isEarned && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: achievement.rarityHex,
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ fontSize: 10, color: 'white', fontWeight: 'bold' }}>✓</Box>
            </Box>
          )}
        </Box>
        {isNextInTrack && (
          <Chip
            label={t('achievements.inProgress')}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mt: 1, fontSize: '0.65rem', maxWidth: 80 }}
          />
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minWidth: 0,
          cursor: isEarned || isNextInTrack || achievement.prerequisitesMet ? 'pointer' : 'default',
        }}
        onClick={onClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              color: isLocked ? 'text.disabled' : 'text.primary',
              opacity: isLocked ? 0.6 : 1,
            }}
          >
            {t(achievement.titleKey)}
          </Typography>
          {isEarned && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getRarityIcon(achievement.rarity)}
              <Chip
                label={t(`achievements.rarity.${achievement.rarity}`)}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            </Box>
          )}
        </Box>

        <Typography
          variant="body2"
          color={isLocked ? 'text.disabled' : 'text.secondary'}
          sx={{
            opacity: isLocked ? 0.6 : 1,
            mb: 1,
            lineHeight: 1.4,
          }}
        >
          {t(achievement.descriptionKey)}
        </Typography>

        {showProgress && achievement.threshold && achievement.threshold > 0 && (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {t('achievements.progressLabel')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {achievement.current ?? 0} / {achievement.threshold}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={achievement.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'rgba(0,0,0,0.08)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: achievement.rarityHex,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {isEarned && achievement.earnedAt && (
          <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
            {t('achievements.earnedOn', {
              date: new Date(achievement.earnedAt).toLocaleDateString(),
            })}
          </Typography>
        )}

        {!isEarned && !showProgress && achievement.prerequisitesMet === false && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
            {t('achievements.prerequisitesNotMet')}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          minWidth: 48,
          px: 1,
        }}
      >
        {isEarned && (
          <PrivacyAwareShareMenu
            url={
              userId
                ? `${origin}/${lang}/archers/${userId}/achievements/${achievement.id}`
                : `${origin}/${lang}/achievements`
            }
            title={t('achievementShare.shareTitle', { title: t(achievement.titleKey) })}
            text={t(achievement.descriptionKey)}
            variant="icon"
            size="small"
            canShare
          />
        )}
      </Box>
    </Box>
  );
}

interface AchievementDetailDialogProps {
  achievement: AchievementProgressDto | null;
  open: boolean;
  onClose: () => void;
  origin: string;
  lang: string;
  userId?: string;
}

function AchievementDetailDialog({
  achievement,
  open,
  onClose,
  origin,
  lang,
  userId,
}: AchievementDetailDialogProps) {
  const { t } = useTranslation('common');

  if (!achievement) return null;

  const style = getRarityStyle(achievement.rarity);
  const definition = ACHIEVEMENT_CATALOG.find(
    (a: AchievementDefinition) => a.id === achievement.id,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ '& .MuiDialog-paper': { maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: achievement.earned
                ? style.bgGradient
                : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: achievement.earned ? `0 0 24px ${style.glow}` : 2,
              filter: achievement.earned ? 'none' : 'grayscale(85%)',
            }}
          >
            <Box sx={{ fontSize: 36 }}>{achievement.icon}</Box>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h5" gutterBottom>
              {t(achievement.titleKey)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={t(BRANCH_LABELS[achievement.branch] ?? achievement.branch)}
                size="small"
                variant="outlined"
                color="primary"
              />
              <Chip
                label={t(`achievements.rarity.${achievement.rarity}`)}
                size="small"
                variant="outlined"
                sx={{
                  background: `${achievement.rarityHex}15`,
                  borderColor: achievement.rarityHex,
                }}
              />
              {achievement.subtrack && (
                <Chip
                  label={t(SUBTRACK_LABELS[achievement.subtrack] ?? achievement.subtrack)}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: '60vh', overflow: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary" paragraph>
          {t(achievement.descriptionKey)}
        </Typography>

        {definition?.parentIds.length && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('achievements.prerequisites')}
            </Typography>
            <Stack spacing={1} sx={{ ml: 1 }}>
              {definition.parentIds.map((parentId) => {
                const parent = ACHIEVEMENT_CATALOG.find(
                  (a: AchievementDefinition) => a.id === parentId,
                );
                const isParentEarned = parent ? true : false;
                return (
                  <Box
                    key={parentId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      opacity: isParentEarned ? 1 : 0.5,
                    }}
                  >
                    <Chip
                      icon={parent ? <Box>{parent.icon}</Box> : <Box>🔒</Box>}
                      label={parent ? t(parent.titleKey) : parentId}
                      size="small"
                      variant={isParentEarned ? 'filled' : 'outlined'}
                      color={isParentEarned ? 'success' : 'default'}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {!achievement.earned &&
          achievement.threshold &&
          achievement.threshold > 0 &&
          achievement.evaluationMode === 'client_offline' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('achievements.progressLabel')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {t(achievement.titleKey)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {achievement.current ?? 0} / {achievement.threshold}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={achievement.progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: style.color,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          )}

        {achievement.evaluationMode === 'server_verified' && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            {t('achievements.serverVerifiedHint')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 1 }}>
        {achievement.earned && (
          <PrivacyAwareShareMenu
            url={
              userId
                ? `${origin}/${lang}/archers/${userId}/achievements/${achievement.id}`
                : `${origin}/${lang}/achievements`
            }
            title={t('achievementShare.shareTitle', { title: t(achievement.titleKey) })}
            text={t(achievement.descriptionKey)}
            variant="button"
            size="small"
            canShare
          />
        )}
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

const Achievements = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { lang } = useParams();
  const { earned, locked, earnedCount, totalCount, percent, byRarity, loading, error, isGuest } =
    useAchievements();

  const [activeBranch, setActiveBranch] = useState<AchievementBranch>('onboarding');
  const [activeSubtrack, setActiveSubtrack] = useState<EnduranceSubtrack>('arrows');
  const [detailAchievement, setDetailAchievement] = useState<AchievementProgressDto | null>(null);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // Filter achievements by active branch/subtrack
  const trackAchievements = useMemo(() => {
    if (activeBranch === 'endurance') {
      return getEnduranceBySubtrack(activeSubtrack);
    }
    return getAchievementsByBranch(activeBranch);
  }, [activeBranch, activeSubtrack]);

  // Merge with earned/locked data from hook
  const allAchievementsMap = new Map([...earned, ...locked].map((a) => [a.id, a]));
  const mergedTrack = trackAchievements.map(
    (def) =>
      allAchievementsMap.get(def.id) ??
      ({
        ...def,
        earned: false,
        progress: 0,
        current: 0,
        threshold: def.criteria.target,
        earnedAt: null,
        prerequisitesMet: false,
        badge512: def.assets.badge512,
        thumb256: def.assets.thumb256,
        ogCard1200: def.assets.ogCard1200,
      } as AchievementProgressDto),
  );

  const nextInTrack = mergedTrack.find((a) => !a.earned && a.prerequisitesMet !== false);

  const rarityBreakdown = (['legendary', 'epic', 'rare', 'common'] as const)
    .filter((r) => byRarity[r] > 0)
    .map((r) => `${byRarity[r]} ${t(`achievements.rarity.${r}`).toLowerCase()}`)
    .join(' · ');

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
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header & Summary */}
      <Box sx={{ mb: 3 }}>
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
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            {rarityBreakdown}
          </Typography>
        )}

        {isGuest && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('achievements.guestHint')}
          </Typography>
        )}
        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
      </Box>

      {/* Branch Navigation Bar */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={activeBranch}
          onChange={(_, value) => setActiveBranch(value as AchievementBranch)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 48 }}
          aria-label="Achievement branches"
        >
          {BRANCH_ORDER.map((branch) => (
            <Tab
              key={branch}
              value={branch}
              label={t(BRANCH_LABELS[branch])}
              disabled={branch === 'arena' && isGuest}
            />
          ))}
        </Tabs>
      </Box>

      {/* Endurance Sub-Track Switcher */}
      {activeBranch === 'endurance' && (
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={activeSubtrack}
            onChange={(_, value) => setActiveSubtrack(value as EnduranceSubtrack)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40 }}
            aria-label="Endurance subtracks"
          >
            {ENDURANCE_SUBTRACK_ORDER.map((subtrack) => (
              <Tab key={subtrack} value={subtrack} label={t(SUBTRACK_LABELS[subtrack])} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Vertical Spine List */}
      <Box sx={{ position: 'relative' }}>
        {mergedTrack.map((achievement, index) => (
          <AchievementNode
            key={achievement.id}
            achievement={achievement}
            isNextInTrack={achievement.id === nextInTrack?.id}
            index={index}
            total={mergedTrack.length}
            onClick={() => setDetailAchievement(achievement)}
            origin={origin}
            lang={lang as string}
            userId={user?.id}
          />
        ))}
      </Box>

      {/* Share Progress Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <PrivacyAwareShareMenu
          url={progressShareUrl}
          title={t('achievements.shareProgressTitle')}
          text={t('achievements.shareProgressText', { earned: earnedCount, total: totalCount })}
          buttonLabel={t('achievements.shareProgress')}
          variant="button"
          size="small"
          canShare={earnedCount > 0}
        />
      </Box>

      {/* Detail Dialog */}
      <AchievementDetailDialog
        achievement={detailAchievement}
        open={!!detailAchievement}
        onClose={() => setDetailAchievement(null)}
        origin={origin}
        lang={lang as string}
        userId={user?.id}
      />
    </Container>
  );
};

export default Achievements;
