import './Header.scss';

import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { fromI18nLang, getCurrentI18nLang, normalizeAppLang } from '../../utils/i18n-lang';

import NavMenu from '../NavMenu/NavMenu';
import UserMenu from '../UserMenu/UserMenu';

const Header: React.FC = () => {
  const { lang } = useParams();
  const location = useLocation();
  // Use URL param first, then fallback to pathname, then i18n, then default to 'pt'
  const inferredLang = fromI18nLang(getCurrentI18nLang());
  const currentLang = normalizeAppLang(lang || location.pathname.split('/')[1] || inferredLang);
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
