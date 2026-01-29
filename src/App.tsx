import './sass/main.scss';
import './i18n';

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Content from './components/Content/Content';
import I18nDevOverlay from './components/dev/I18nDevOverlay';
import EnvError from './components/env-error/env-error';
import { ErrorBoundary } from './components/ErrorBoundary';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import { AuthProvider } from './contexts/auth-context';
import { ErrorFeedbackProvider } from './contexts/error-feedback-context';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <ErrorFeedbackProvider>
          <AuthProvider>
            <EnvError />
            <Header />
            <Content />
            {!import.meta.env.PROD && <I18nDevOverlay />}
            <Footer />
          </AuthProvider>
        </ErrorFeedbackProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
