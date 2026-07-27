import { createTheme } from '@mui/material/styles';

import type { ColorMode } from '../contexts/color-mode-context';
import { COLORS } from './colors';

const sharedTypography = {
  fontFamily: '"Montserrat", Arial, Helvetica, sans-serif',
} as const;

export function createAppTheme(mode: ColorMode) {
  const isDark = mode === 'dark';

  return createTheme({
    typography: sharedTypography,
    palette: {
      mode,
      primary: {
        // Gold reads clearly on dark surfaces for outlined/text buttons.
        main: isDark ? COLORS.secondary : COLORS.primary,
        ...(isDark
          ? {
              light: '#ffe066',
              dark: '#c9a000',
              contrastText: COLORS.secondaryContrastText,
            }
          : {}),
      },
      secondary: {
        main: COLORS.secondary,
        contrastText: COLORS.secondaryContrastText,
      },
      ...(isDark
        ? {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#e0e0e0',
              secondary: '#aaaaaa',
              disabled: '#777777',
            },
          }
        : {
            background: {
              default: COLORS.white,
              paper: COLORS.white,
            },
            text: {
              primary: COLORS.textBody,
              secondary: COLORS.textSecondary,
              disabled: COLORS.textDisabled,
            },
          }),
    },
  });
}
