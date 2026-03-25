import './sass/main.scss';
import './i18n';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Content from './components/Content/Content';
import I18nDevOverlay from './components/dev/I18nDevOverlay';
import EnvError from './components/env-error/env-error';
import { ErrorBoundary } from './components/ErrorBoundary';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import InstallPrompt from './components/InstallPrompt';
import OfflineBanner from './components/OfflineBanner';
import { AuthProvider } from './contexts/auth-context';
import { ErrorFeedbackProvider } from './contexts/error-feedback-context';
import { LocalDataProvider } from './contexts/local-data-context';

const theme = createTheme({
  typography: {
    // MUI defaults to Roboto; we override to match the rest of the app.
    fontFamily: '"Montserrat", Arial, Helvetica, sans-serif',
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <Router>
          <ErrorFeedbackProvider>
            <AuthProvider>
              <LocalDataProvider>
                <EnvError />
                <OfflineBanner />
                <InstallPrompt />
                <Header />
                <Content />
                {!import.meta.env.PROD && <I18nDevOverlay />}
                <Footer />
              </LocalDataProvider>
            </AuthProvider>
          </ErrorFeedbackProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
