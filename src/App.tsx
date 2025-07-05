import React from 'react';
import './sass/main.scss';
import Header from './components/header/header';
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from './components/footer/footer';
import Content from './components/content/content';
import { AuthProvider } from './contexts/auth-context';
import EnvError from './components/env-error/env-error';

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