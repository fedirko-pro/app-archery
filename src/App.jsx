import React from 'react';
import './sass/main.scss';
import Header from './components/Header/Header.jsx';

import { BrowserRouter as Router } from 'react-router-dom';
import Footer from './components/Footer/Footer.jsx';
import Content from './components/Content/Content.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import EnvError from './components/EnvError/EnvError.jsx';

function App() {
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
}

export default App;
