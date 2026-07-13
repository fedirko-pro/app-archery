import '../Header/Header.scss';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Avatar from '@mui/material/Avatar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { isDev } from '../../config/env';
import { USER_DEMO_NAV_ITEMS, isClubAdmin, isFederationAdmin } from '../../config/roles';
import { useAuth } from '../../contexts/auth-context';
import { useBodyScrollLock } from '../../hooks/use-body-scroll-lock';
import { normalizeAppLang } from '../../utils/i18n-lang';
import { resolveUserAvatarWithCacheBust, getAvatarInitials } from '../../utils/placeholder-images';
import LanguageToggler from '../LanguageToggler/LanguageToggler';
import Menu from '../Menu/Menu';
import type { MenuSection } from '../Menu/types';

const UserMenu: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  normalizeAppLang(lang);
  const [active, setActive] = useState<boolean>(false);

  const { user, isAuthenticated, logout, initializing } = useAuth();

  useBodyScrollLock(active);

  if (initializing) {
    return null;
  }

  const menuClick = (): void => {
    setActive(!active);
  };

  const handleLogout = (): void => {
    logout();
    setTimeout(() => {
      setActive(false);
    }, 100);
  };

  const demoMenuItems = USER_DEMO_NAV_ITEMS.map((item) => ({
    link: item.link,
    label: t(item.labelKey),
  }));

  const authenticatedMenuItems = [
    { link: '/home', label: t('dashboard.title') },
    { link: '/trainings', label: t('nav.myTrainings') },
    { link: '/statistics', label: t('nav.myStatistics') },
    { link: '/applications', label: t('nav.myApplications') },
    { link: '/equipment', label: t('nav.myEquipment') },
    { link: '/achievements', label: t('nav.myAchievements') },
    {
      link: '/profile',
      label: t('menu.myProfile', { name: (user?.firstName || '') + ' ' + (user?.lastName || '') }),
    },
    ...(user && isClubAdmin(user.role)
      ? [{ link: '/my-club', label: t('nav.myClub', 'My Club') }]
      : []),
    ...(user && isFederationAdmin(user.role)
      ? [{ link: '/my-federation', label: t('nav.myFederation', 'My Federation') }]
      : []),
    ...demoMenuItems,
  ];

  const unauthenticatedSections: MenuSection[] = [
    {
      items: [
        { link: '/home', label: t('dashboard.title') },
        { link: '/trainings', label: t('nav.myTrainings') },
        { link: '/statistics', label: t('nav.myStatistics') },
        { link: '/equipment', label: t('nav.myEquipment') },
        { link: '/achievements', label: t('nav.myAchievements') },
        ...demoMenuItems,
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

  const avatarSrc =
    isAuthenticated && user?.picture
      ? resolveUserAvatarWithCacheBust(user.picture, user.updatedAt)
      : undefined;

  const avatarFallback = !isAuthenticated ? (
    <PersonOutlineIcon fontSize="small" />
  ) : !avatarSrc ? (
    getAvatarInitials(user?.firstName, user?.lastName)
  ) : null;

  return (
    <>
      <Avatar
        onClick={menuClick}
        sx={{
          marginRight: '16px',
          cursor: 'pointer',
          width: 44,
          height: 44,
        }}
        src={avatarSrc}
        alt={user?.firstName || 'User'}
        imgProps={{
          referrerPolicy: 'no-referrer',
          onError: (e) => {
            if (isDev) {
              console.error('Avatar image failed to load:', user?.picture);
            }
            e.currentTarget.style.display = 'none';
          },
        }}
      >
        {avatarFallback}
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
