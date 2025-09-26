import './Header.scss';

import React from 'react';
import { NavLink } from 'react-router-dom';

import NavMenu from '@/components/Header/nav-menu/nav-menu';
import UserMenu from '@/components/Header/user-menu/user-menu';

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
