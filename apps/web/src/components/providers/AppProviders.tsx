'use client';

import '../../i18n';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { isProd } from '../../config/env';
import { AchievementCelebrationProvider } from '../../contexts/achievement-celebration-context';
import { AuthProvider } from '../../contexts/auth-context';
import { ErrorFeedbackProvider } from '../../contexts/error-feedback-context';
import { LocalDataProvider } from '../../contexts/local-data-context';
import { COLORS } from '../../theme/colors';
import AppBottomChrome from '../AppBottomChrome/AppBottomChrome';
import AppStatusBar from '../AppStatusBar';
import { AppUpdatePrompt } from '../AppUpdatePrompt';
import I18nDevOverlay from '../dev/I18nDevOverlay';
import EnvError from '../env-error/env-error';
import { ErrorBoundary } from '../ErrorBoundary';
import Header from '../Header/Header';
import { ScrollToTop } from '../ScrollToTop/ScrollToTop';

const theme = createTheme({
  typography: {
    fontFamily: '"Montserrat", Arial, Helvetica, sans-serif',
  },
  palette: {
    primary: {
      main: COLORS.primary,
    },
    secondary: {
      main: COLORS.secondary,
      contrastText: COLORS.secondaryContrastText,
    },
  },
});

interface RootProvidersProps {
  children: ReactNode;
}

export function RootProviders({ children }: RootProvidersProps) {
  return (
    <ErrorBoundary>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <ErrorFeedbackProvider>
            <EnvError />
            <AppStatusBar />
            <AppUpdatePrompt />
            {children}
          </ErrorFeedbackProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </ErrorBoundary>
  );
}

interface RouterShellProps {
  children: ReactNode;
}

export function RouterShell({ children }: RouterShellProps) {
  return (
    <AuthProvider>
      <LocalDataProvider>
        <AchievementCelebrationProvider>
          <ScrollToTop />
          <Header />
          {children}
          {!isProd && <I18nDevOverlay />}
          <AppBottomChrome />
        </AchievementCelebrationProvider>
      </LocalDataProvider>
    </AuthProvider>
  );
}
