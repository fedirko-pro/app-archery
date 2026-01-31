import './achievements.scss';

import { EmojiEvents, MilitaryTech, Share, Star, WorkspacePremium } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Achievement {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const achievements: Achievement[] = [
  {
    id: 'first-bullseye',
    titleKey: 'achievements.firstBullseye.title',
    descriptionKey: 'achievements.firstBullseye.description',
    icon: '🎯',
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    earned: true,
    earnedDate: '2024-03-15',
    rarity: 'common',
  },
  {
    id: 'perfect-round',
    titleKey: 'achievements.perfectRound.title',
    descriptionKey: 'achievements.perfectRound.description',
    icon: '⭐',
    color: '#9C27B0',
    bgGradient: 'linear-gradient(135deg, #9C27B0 0%, #E040FB 100%)',
    earned: true,
    earnedDate: '2024-05-20',
    rarity: 'epic',
  },
  {
    id: 'tournament-winner',
    titleKey: 'achievements.tournamentWinner.title',
    descriptionKey: 'achievements.tournamentWinner.description',
    icon: '🏆',
    color: '#F44336',
    bgGradient: 'linear-gradient(135deg, #F44336 0%, #FF9800 100%)',
    earned: true,
    earnedDate: '2024-07-10',
    rarity: 'legendary',
  },
  {
    id: 'consistent-archer',
    titleKey: 'achievements.consistentArcher.title',
    descriptionKey: 'achievements.consistentArcher.description',
    icon: '🏹',
    color: '#2196F3',
    bgGradient: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)',
    earned: true,
    earnedDate: '2024-04-01',
    rarity: 'rare',
  },
  {
    id: 'long-distance',
    titleKey: 'achievements.longDistance.title',
    descriptionKey: 'achievements.longDistance.description',
    icon: '🎖️',
    color: '#4CAF50',
    bgGradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
    earned: false,
    progress: 75,
    rarity: 'rare',
  },
  {
    id: 'team-spirit',
    titleKey: 'achievements.teamSpirit.title',
    descriptionKey: 'achievements.teamSpirit.description',
    icon: '🤝',
    color: '#00BCD4',
    bgGradient: 'linear-gradient(135deg, #00BCD4 0%, #26C6DA 100%)',
    earned: false,
    progress: 40,
    rarity: 'common',
  },
  {
    id: 'precision-master',
    titleKey: 'achievements.precisionMaster.title',
    descriptionKey: 'achievements.precisionMaster.description',
    icon: '💎',
    color: '#673AB7',
    bgGradient: 'linear-gradient(135deg, #673AB7 0%, #9575CD 100%)',
    earned: false,
    progress: 20,
    rarity: 'legendary',
  },
];

const getRarityIcon = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'legendary':
      return <EmojiEvents sx={{ fontSize: 16, color: '#FFD700' }} />;
    case 'epic':
      return <WorkspacePremium sx={{ fontSize: 16, color: '#9C27B0' }} />;
    case 'rare':
      return <MilitaryTech sx={{ fontSize: 16, color: '#2196F3' }} />;
    default:
      return <Star sx={{ fontSize: 16, color: '#9E9E9E' }} />;
  }
};

const getRarityLabel = (rarity: Achievement['rarity'], t: (key: string) => string) => {
  switch (rarity) {
    case 'legendary':
      return t('achievements.rarity.legendary');
    case 'epic':
      return t('achievements.rarity.epic');
    case 'rare':
      return t('achievements.rarity.rare');
    default:
      return t('achievements.rarity.common');
  }
};

const RARITY_ORDER: Record<Achievement['rarity'], number> = {
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 1,
};

const sortedAchievements = [...achievements].sort(
  (a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity],
);

const Achievements = () => {
  const { t } = useTranslation('common');

  const earnedCount = achievements.filter((a) => a.earned).length;

  const handleShare = (_achievementId: string) => {
    // TODO: share achievement functionality
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('achievements.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('achievements.subtitle')}
        </Typography>
        <Chip
          label={t('achievements.progress', { earned: earnedCount, total: achievements.length })}
          color="primary"
          sx={{ mt: 1 }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {sortedAchievements.map((achievement) => (
          <Card
            key={achievement.id}
            sx={{
              position: 'relative',
              overflow: 'visible',
              opacity: achievement.earned ? 1 : 0.7,
              filter: achievement.earned ? 'none' : 'grayscale(30%)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <Box
              sx={{
                background: achievement.bgGradient,
                p: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 120,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2.5rem',
                  bgcolor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                }}
              >
                {achievement.icon}
              </Avatar>
              {achievement.earned && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'success.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    boxShadow: 2,
                  }}
                >
                  ✓
                </Box>
              )}
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                {getRarityIcon(achievement.rarity)}
                <Typography variant="caption" color="text.secondary">
                  {getRarityLabel(achievement.rarity, t)}
                </Typography>
              </Box>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontSize: '1rem' }}>
                {t(achievement.titleKey)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 40 }}>
                {t(achievement.descriptionKey)}
              </Typography>
              {achievement.earned && achievement.earnedDate && (
                <Typography variant="caption" color="success.main" display="block">
                  {t('achievements.earnedOn', {
                    date: new Date(achievement.earnedDate).toLocaleDateString(),
                  })}
                </Typography>
              )}
              {!achievement.earned && achievement.progress !== undefined && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('achievements.progressLabel')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {achievement.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={achievement.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: achievement.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <IconButton
                  onClick={() => handleShare(achievement.id)}
                  size="small"
                  aria-label={t('achievements.share')}
                >
                  <Share fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {t('achievements.demoNotice')}
        </Typography>
      </Box>
    </Container>
  );
};

export default Achievements;
