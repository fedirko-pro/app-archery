import './sass/main.scss';

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Content from './components/Content/Content';
import EnvError from './components/env-error/env-error';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import { AuthProvider } from './contexts/auth-context';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <EnvError />
        <Header />
        <Content />
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default App;
