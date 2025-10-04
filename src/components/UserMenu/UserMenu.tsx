import '../Header/Header.scss';

import Avatar from '@mui/material/Avatar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { normalizeAppLang } from '../../utils/i18n-lang';

import { useAuth } from '../../contexts/auth-context';
import LanguageToggler from '../LanguageToggler/LanguageToggler';
import Menu from '../Menu/Menu';
import type { MenuSection } from '../Menu/types';

const UserMenu: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  normalizeAppLang(lang);
  const [active, setActive] = useState<boolean>(false);
  // Reserved for future integration with app-wide i18n if needed
  // const [language, setLanguage] = useState<string>('en');

  const { user, isAuthenticated, logout, loading } = useAuth();

  if (loading) {
    return null; // або показати loading spinner
  }

  const menuClick = (): void => {
    setActive(!active);
    if (!active) {
      document.body.classList.add('lock');
    } else {
      document.body.classList.remove('lock');
    }
  };

  const handleLogout = (): void => {
    logout();
    setTimeout(() => {
      setActive(false);
      document.body.classList.remove('lock');
    }, 100);
  };

  // const handleLanguageChange = (_lang: string) => setLanguage(_lang);

  const authenticatedMenuItems = [
    {
      link: '/profile',
      label: t('menu.myProfile', { name: (user?.firstName || '') + ' ' + (user?.lastName || '') }),
    },
    // TODO: Implement My achievements
    // {
    //   link: '/achievements',
    //   label: 'My achievements',
    // },
    // TODO: Settings temporarily disabled - functionality moved to Profile
    // {
    //   link: '/settings',
    //   label: 'Settings',
    // },
  ];

  const unauthenticatedMenuItems = [
    {
      link: '/signin',
      label: t('auth.signIn'),
    },
    {
      link: '/signup',
      label: t('auth.signUp'),
    },
  ];

  const sections: MenuSection[] = [
    {
      items: isAuthenticated ? authenticatedMenuItems : unauthenticatedMenuItems,
      isAdmin: false,
    },
  ];

  return (
    <>
      <Avatar
        onClick={menuClick}
        sx={{
          marginRight: '16px',
          cursor: 'pointer',
        }}
        src={user?.picture}
        alt={user?.firstName || 'User'}
      />
      <Menu
        active={active}
        sections={sections}
        position={'right'}
        clickHandle={menuClick}
        onLogout={isAuthenticated ? handleLogout : null}
        footer={<LanguageToggler />}
      />
    </>
  );
};

export default UserMenu;
