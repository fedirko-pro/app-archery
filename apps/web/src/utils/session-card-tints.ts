import { alpha, type Theme } from '@mui/material/styles';

export interface SessionCardTint {
  bgcolor: string;
  borderColor: string;
}

const TINT_COUNT = 3;

export function getSessionCardTint(theme: Theme, index: number): SessionCardTint {
  const isDark = theme.palette.mode === 'dark';
  const tints: SessionCardTint[] = [
    {
      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
      borderColor: alpha(theme.palette.primary.main, 0.35),
    },
    {
      bgcolor: alpha(theme.palette.success.main, isDark ? 0.12 : 0.07),
      borderColor: alpha(theme.palette.success.main, 0.3),
    },
    {
      bgcolor: alpha(theme.palette.info.main, isDark ? 0.12 : 0.07),
      borderColor: alpha(theme.palette.info.main, 0.3),
    },
  ];
  return tints[index % TINT_COUNT];
}
