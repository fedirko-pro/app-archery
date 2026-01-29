import './Header.scss';

import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

import { normalizeAppLang } from '../../utils/i18n-lang';
import NavMenu from '../NavMenu/NavMenu';
import UserMenu from '../UserMenu/UserMenu';

const Header: React.FC = () => {
  const { lang } = useParams();
  const currentLang = normalizeAppLang(lang);
  return (
    <header>
      <NavMenu />

      <div className="header_logo">
        <NavLink to={`/${currentLang}`} />
      </div>

      <UserMenu />
    </header>
  );
};

export default Header;
