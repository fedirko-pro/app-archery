import './sass/main.scss';

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n';

import Content from './components/Content/Content';
import EnvError from './components/env-error/env-error';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import { AuthProvider } from './contexts/auth-context';
import I18nDevOverlay from './components/dev/I18nDevOverlay';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <EnvError />
        <Header />
        <Content />
        {!import.meta.env.PROD && <I18nDevOverlay />}
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default App;
