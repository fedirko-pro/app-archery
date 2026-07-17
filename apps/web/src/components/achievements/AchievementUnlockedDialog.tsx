import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import type { AchievementRarity } from '@sokil/shared-types';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import AchievementMedallion from '@/components/achievements/AchievementMedallion';
import PrivacyAwareShareMenu from '@/components/share/PrivacyAwareShareMenu';
import { useAuth } from '@/contexts/auth-context';
import type { AchievementProgressDto } from '@/services/types';
import { getRarityStyle, RARITY_COLORS } from '@/theme/achievementTokens';

interface AchievementUnlockedDialogProps {
  achievement: AchievementProgressDto | null;
  open: boolean;
  onClose: () => void;
}

const CONFETTI_BY_RARITY: Record<AchievementRarity, { particleCount: number; colors: string[] }> = {
  common: {
    particleCount: 40,
    colors: [RARITY_COLORS.common.color, '#BDBDBD', '#FFF'],
  },
  rare: {
    particleCount: 55,
    colors: [RARITY_COLORS.rare.color, '#03A9F4', '#FFF'],
  },
  epic: {
    particleCount: 80,
    colors: [RARITY_COLORS.epic.color, '#E040FB', '#FFF'],
  },
  legendary: {
    particleCount: 120,
    colors: [RARITY_COLORS.legendary.color, '#FF9800', '#FFF'],
  },
};

function fireConfetti(rarity: AchievementProgressDto['rarity']): void {
  const { particleCount, colors } = CONFETTI_BY_RARITY[rarity] ?? CONFETTI_BY_RARITY.common;
  void confetti({
    particleCount,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });
}

export default function AchievementUnlockedDialog({
  achievement,
  open,
  onClose,
}: AchievementUnlockedDialogProps) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { lang } = useParams();

  useEffect(() => {
    if (open && achievement) {
      fireConfetti(achievement.rarity);
    }
  }, [open, achievement]);

  if (!achievement) return null;

  const style = getRarityStyle(achievement.rarity);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = user
    ? `${origin}/${lang}/archers/${user.id}/achievements/${achievement.id}`
    : `${origin}/${lang}/achievements`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          overflow: 'visible',
          textAlign: 'center',
        },
      }}
    >
      <DialogContent sx={{ pt: 4, pb: 2 }}>
        <Typography variant="overline" color="primary" fontWeight={700} gutterBottom>
          {t('achievements.unlocked.title')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            my: 2,
            animation: 'achievementPop 0.5s ease-out',
            '@keyframes achievementPop': {
              '0%': { transform: 'scale(0.5)', opacity: 0 },
              '70%': { transform: 'scale(1.08)' },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <AchievementMedallion
            icon={achievement.icon}
            rarity={achievement.rarity}
            size={96}
            showGlow
          />
        </Box>
        <Typography
          variant="caption"
          sx={{ color: style.color, fontWeight: 700, textTransform: 'uppercase' }}
        >
          {t(`achievements.rarity.${achievement.rarity}`)}
        </Typography>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t(achievement.titleKey)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(achievement.descriptionKey)}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
        <PrivacyAwareShareMenu
          url={shareUrl}
          title={t(achievement.titleKey)}
          text={t(achievement.descriptionKey)}
          buttonLabel={t('achievements.share')}
          variant="button"
          size="small"
          canShare
        />
        <Button variant="contained" onClick={onClose}>
          {t('achievements.unlocked.nice')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
