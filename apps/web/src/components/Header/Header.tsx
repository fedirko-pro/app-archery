import './Header.scss';

import type React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import { env } from '../../config/env';
import { useCurrentLang } from '../../hooks/use-current-lang';
import NavMenu from '../NavMenu/NavMenu';
import UserMenu from '../UserMenu/UserMenu';

const Header: React.FC = () => {
  const { t } = useTranslation('common');
  const currentLang = useCurrentLang();
  const isTestSite = env.SITE_MODE === 'test';
  return (
    <header className="app-header">
      <NavMenu />

      <div className="header_logo">
        <NavLink to={`/${currentLang}`} aria-label={t('header.home')} />
        {isTestSite && <span className="header_logo_test-badge">{t('header.testSite')}</span>}
      </div>

      <UserMenu />
    </header>
  );
};

export default Header;
