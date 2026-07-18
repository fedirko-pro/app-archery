import './Header.scss';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useParams } from 'react-router-dom';

import { fromI18nLang, getCurrentI18nLang, normalizeAppLang } from '../../utils/i18n-lang';
import NavMenu from '../NavMenu/NavMenu';
import UserMenu from '../UserMenu/UserMenu';

const Header: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const location = useLocation();
  // Use URL param first, then fallback to pathname, then i18n, then default to 'pt'
  const inferredLang = fromI18nLang(getCurrentI18nLang());
  const currentLang = normalizeAppLang(lang || location.pathname.split('/')[1] || inferredLang);
  return (
    <header className="app-header">
      <NavMenu />

      <div className="header_logo">
        <NavLink to={`/${currentLang}`} aria-label={t('header.home')} />
      </div>

      <UserMenu />
    </header>
  );
};

export default Header;
