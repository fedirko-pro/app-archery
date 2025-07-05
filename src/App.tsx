import React from 'react';
import './sass/main.scss';
import Header from './components/Header/Header';
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import Content from './components/Content/Content';
import { AuthProvider } from './contexts/AuthContext';
import EnvError from './components/EnvError/EnvError';

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