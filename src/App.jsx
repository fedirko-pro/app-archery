import React from 'react';
import './sass/main.scss';
import Header from './components/Header/Header.jsx';

import { BrowserRouter as Router } from 'react-router-dom';
import Footer from './components/Footer/Footer.jsx';
import Content from './components/Content/Content.jsx';

function App() {
  return (
    <Router>
      <Header />
      <Content />
      <Footer />
    </Router>
  );
}

export default App;
