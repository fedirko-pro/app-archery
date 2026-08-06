'use client';

import '../../i18n';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { type ReactNode, useMemo } from 'react';

import { isProd } from '../../config/env';
import { AchievementCelebrationProvider } from '../../contexts/achievement-celebration-context';
import { AuthProvider } from '../../contexts/auth-context';
import { ColorModeProvider, useColorMode } from '../../contexts/color-mode-context';
import { ErrorFeedbackProvider } from '../../contexts/error-feedback-context';
import { LocalDataProvider } from '../../contexts/local-data-context';
import { NotificationsProvider } from '../../contexts/notifications-context';
import { createAppTheme } from '../../theme/create-app-theme';
import AppBottomChrome from '../AppBottomChrome/AppBottomChrome';
import AppStatusBar from '../AppStatusBar';
import { AppUpdatePrompt } from '../AppUpdatePrompt';
import I18nDevOverlay from '../dev/I18nDevOverlay';
import { ErrorBoundary } from '../ErrorBoundary';
import EnvError from '../env-error/env-error';
import Header from '../Header/Header';
import { ScrollToTop } from '../ScrollToTop/ScrollToTop';

function ThemedApp({ children }: { children: ReactNode }) {
  const { mode } = useColorMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorFeedbackProvider>
        <EnvError />
        <AppStatusBar />
        <AppUpdatePrompt />
        {children}
      </ErrorFeedbackProvider>
    </ThemeProvider>
  );
}

interface RootProvidersProps {
  children: ReactNode;
}

export function RootProviders({ children }: RootProvidersProps) {
  return (
    <ErrorBoundary>
      <AppRouterCacheProvider>
        <ColorModeProvider>
          <ThemedApp>{children}</ThemedApp>
        </ColorModeProvider>
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
      <NotificationsProvider>
        <LocalDataProvider>
          <AchievementCelebrationProvider>
            <ScrollToTop />
            <Header />
            {children}
            {!isProd && <I18nDevOverlay />}
            <AppBottomChrome />
          </AchievementCelebrationProvider>
        </LocalDataProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
