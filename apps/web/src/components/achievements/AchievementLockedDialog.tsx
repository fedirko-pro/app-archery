import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import AchievementMedallion from '@/components/achievements/AchievementMedallion';
import type { AchievementProgressDto } from '@/services/types';
import { getRarityStyle } from '@/theme/achievementTokens';

interface AchievementLockedDialogProps {
  achievement: AchievementProgressDto | null;
  open: boolean;
  onClose: () => void;
}

export default function AchievementLockedDialog({
  achievement,
  open,
  onClose,
}: AchievementLockedDialogProps) {
  const { t } = useTranslation('common');

  if (!achievement) return null;

  const style = getRarityStyle(achievement.rarity);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <AchievementMedallion
            icon={achievement.icon}
            rarity={achievement.rarity}
            locked
            size={72}
          />
        </Box>
        {t(achievement.titleKey)}
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="center"
          gutterBottom
        >
          {t(`achievements.categories.${achievement.category}`)} ·{' '}
          {t(`achievements.rarity.${achievement.rarity}`)}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" paragraph>
          {t(achievement.descriptionKey)}
        </Typography>
        {achievement.type === 'computed' &&
          achievement.threshold !== undefined &&
          achievement.threshold > 0 && (
            <Box sx={{ mt: 2 }}>
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
        {achievement.type === 'event' && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t('achievements.locked.eventHint')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
}
