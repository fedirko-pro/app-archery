import '../Header/Header.scss';

import Avatar from '@mui/material/Avatar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import { normalizeAppLang } from '../../utils/i18n-lang';
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
    return null;
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
    {
      link: '/trainings',
      label: t('nav.myTrainings'),
    },
    {
      link: '/equipment',
      label: t('nav.myEquipment'),
    },
    {
      link: '/statistics',
      label: t('nav.myStatistics'),
    },
    {
      link: '/applications',
      label: t('nav.myApplications'),
    },
    {
      link: '/achievements',
      label: t('nav.myAchievements'),
    },
  ];

  const unauthenticatedSections: MenuSection[] = [
    {
      items: [
        { link: '/trainings', label: t('nav.myTrainings') },
        { link: '/equipment', label: t('nav.myEquipment') },
        { link: '/statistics', label: t('nav.myStatistics') },
      ],
    },
    {
      divider: true,
      items: [
        { link: '/signin', label: t('auth.signIn') },
        { link: '/signup', label: t('auth.signUp') },
      ],
    },
  ];

  const sections: MenuSection[] = isAuthenticated
    ? [{ items: authenticatedMenuItems }]
    : unauthenticatedSections;

  return (
    <>
      <Avatar
        onClick={menuClick}
        sx={{
          marginRight: '16px',
          cursor: 'pointer',
        }}
        src={
          user?.picture
            ? user.picture.startsWith('data:')
              ? user.picture
              : `${user.picture}${user.picture.includes('?') ? '&' : '?'}t=${user.updatedAt || ''}`
            : undefined
        }
        alt={user?.firstName || 'User'}
        imgProps={{
          onError: (e) => {
            if (import.meta.env.DEV) {
              console.error('Avatar image failed to load:', user?.picture);
            }
            e.currentTarget.style.display = 'none';
          },
        }}
      >
        {!user?.picture && user?.firstName ? user.firstName[0].toUpperCase() : null}
      </Avatar>
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
