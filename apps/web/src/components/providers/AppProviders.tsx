'use client';

import '../../i18n';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { isProd } from '../../config/env';
import { AuthProvider } from '../../contexts/auth-context';
import { ErrorFeedbackProvider } from '../../contexts/error-feedback-context';
import { LocalDataProvider } from '../../contexts/local-data-context';
import { COLORS } from '../../theme/colors';
import I18nDevOverlay from '../dev/I18nDevOverlay';
import EnvError from '../env-error/env-error';
import { ErrorBoundary } from '../ErrorBoundary';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import InstallPrompt from '../InstallPrompt';
import OfflineBanner from '../OfflineBanner';
import { ServiceWorkerCleanup } from '../ServiceWorkerCleanup/ServiceWorkerCleanup';

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
          <ServiceWorkerCleanup />
          <ErrorFeedbackProvider>
            <EnvError />
            <OfflineBanner />
            <InstallPrompt />
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
        <Header />
        {children}
        {!isProd && <I18nDevOverlay />}
        <Footer />
      </LocalDataProvider>
    </AuthProvider>
  );
}
