import React from 'react';
import './sass/main.scss';
import Header from './components/Header/Header';
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import Content from './components/Content/Content';
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
