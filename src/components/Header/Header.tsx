import './Header.scss';

import React from 'react';
import { NavLink } from 'react-router-dom';

import NavMenu from '../NavMenu/NavMenu';
import UserMenu from '../UserMenu/UserMenu';

const Header: React.FC = () => {
  return (
    <header>
      <NavMenu />

      <div className="header_logo">
        <NavLink to="/" />
      </div>

      <UserMenu />
    </header>
  );
};

export default Header;
