import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, Box } from '@mui/material';
import type { AchievementRarity } from '@sokil/shared-types';

import { getRarityStyle } from '@/theme/achievementTokens';

interface AchievementMedallionProps {
  icon: string;
  rarity: AchievementRarity;
  locked?: boolean;
  /** Fixed pixel diameter. Ignored when `fluid` is true. */
  size?: number;
  /**
   * Fill the parent width (square via aspect-ratio).
   * Use with a parent sized as a % of the card for responsive medallions.
   */
  fluid?: boolean;
  showGlow?: boolean;
}

export default function AchievementMedallion({
  icon,
  rarity,
  locked = false,
  size = 80,
  fluid = false,
  showGlow = false,
}: AchievementMedallionProps) {
  const style = getRarityStyle(rarity);

  return (
    <Box
      className="achievement-medallion"
      sx={{
        position: 'relative',
        display: 'inline-flex',
        width: fluid ? '100%' : 'auto',
        containerType: fluid ? 'inline-size' : undefined,
        filter: locked ? 'grayscale(85%)' : 'none',
      }}
    >
      <Box
        sx={{
          background: locked
            ? 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'
            : style.bgGradient,
          borderRadius: '50%',
          p: fluid ? '4%' : 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: fluid ? '100%' : 'auto',
          aspectRatio: fluid ? '1' : undefined,
          boxSizing: 'border-box',
          boxShadow: showGlow && !locked ? `0 0 24px ${style.glow}` : 2,
        }}
      >
        <Avatar
          sx={{
            width: fluid ? '100%' : size,
            height: fluid ? '100%' : size,
            aspectRatio: '1',
            fontSize: fluid ? '45cqw' : size * 0.45,
            bgcolor: 'rgba(255,255,255,0.95)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
        >
          {icon}
        </Avatar>
      </Box>
      {locked && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LockOutlinedIcon
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: fluid ? '35cqw' : size * 0.35,
            }}
          />
        </Box>
      )}
    </Box>
  );
}
