import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { ACHIEVEMENT_CATALOG } from '@sokil/shared-types';
import React from 'react';
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
}: AchievementLockedDialogProps): React.ReactElement | null {
  const { t } = useTranslation('common');

  if (!achievement) return null;

  const style = getRarityStyle(achievement.rarity);
  const definition = ACHIEVEMENT_CATALOG.find((a) => a.id === achievement.id);

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
          {t(`achievements.categories.${achievement.branch}`)} ·{' '}
          {t(`achievements.rarity.${achievement.rarity}`)}
          {achievement.subtrack && (
            <span> · {t(`achievements.subtracks.${achievement.subtrack}`)}</span>
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" paragraph>
          {t(achievement.descriptionKey)}
        </Typography>

        {definition?.parentIds.length && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('achievements.prerequisites')}
            </Typography>
            <Stack spacing={1} sx={{ ml: 1 }}>
              {definition.parentIds.map((parentId) => {
                const parent = ACHIEVEMENT_CATALOG.find((a) => a.id === parentId);
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
                      icon={parent ? <span>{parent.icon}</span> : <span>🔒</span>}
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

        {achievement.evaluationMode === 'client_offline' &&
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

        {achievement.evaluationMode === 'server_verified' && (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
            {t('achievements.serverVerifiedHint')}
          </Typography>
        )}

        {!achievement.earned && achievement.prerequisitesMet === false && (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
            {t('achievements.prerequisitesNotMet')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
