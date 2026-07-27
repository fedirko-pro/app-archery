import '../Header/Header.scss';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { isDev } from '../../config/env';
import { USER_DEMO_NAV_ITEMS, isClubAdmin, isFederationAdmin } from '../../config/roles';
import { useAuth } from '../../contexts/auth-context';
import { useNotifications } from '../../contexts/notifications-context';
import { ATHLETE_TAB_BAR_MQ } from '../../hooks/use-athlete-tab-bar-visible';
import { useBodyScrollLock } from '../../hooks/use-body-scroll-lock';
import { normalizeAppLang } from '../../utils/i18n-lang';
import { resolveUserAvatarWithCacheBust } from '../../utils/placeholder-images';
import LanguageToggler from '../LanguageToggler/LanguageToggler';
import Menu from '../Menu/Menu';
import type { MenuItem, MenuSection } from '../Menu/types';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';

const appBuildId = process.env.NEXT_PUBLIC_APP_BUILD_ID ?? 'unknown';
const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown';
const displayVersion = appBuildId === 'dev' ? appVersion : appBuildId;

const TAB_PATHS = new Set(['/home', '/trainings', '/statistics', '/equipment', '/achievements']);

const UserMenu: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  normalizeAppLang(lang);
  const [active, setActive] = useState<boolean>(false);
  const isMobile = useMediaQuery(ATHLETE_TAB_BAR_MQ);

  const { user, isAuthenticated, logout, initializing } = useAuth();
  const { unreadImportantCount, refreshUnreadCount } = useNotifications();

  useBodyScrollLock(active);

  const demoMenuItems = useMemo(
    () =>
      USER_DEMO_NAV_ITEMS.map((item) => ({
        link: item.link,
        label: t(item.labelKey),
      })),
    [t],
  );

  if (initializing) {
    return null;
  }

  const toggleMenu = (): void => {
    setActive((prev) => {
      const next = !prev;
      if (next && isAuthenticated) {
        void refreshUnreadCount();
      }
      return next;
    });
  };

  const closeMenu = (): void => {
    setActive(false);
  };

  const handleLogout = (): void => {
    logout();
    setActive(false);
  };

  const filterTabDuplicates = (items: MenuItem[]): MenuItem[] =>
    isMobile ? items.filter((item) => !TAB_PATHS.has(item.link)) : items;

  // About lives in the left Field Guide / nav menu — keep it out of the user menu.
  const authenticatedMenuItems = filterTabDuplicates([
    { link: '/home', label: t('dashboard.title') },
    {
      link: '/notifications',
      label: t('nav.notifications'),
      badgeCount: unreadImportantCount > 0 ? unreadImportantCount : undefined,
    },
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
  ]);

  const unauthenticatedPrimary = filterTabDuplicates([
    { link: '/home', label: t('dashboard.title') },
    { link: '/trainings', label: t('nav.myTrainings') },
    { link: '/statistics', label: t('nav.myStatistics') },
    { link: '/equipment', label: t('nav.myEquipment') },
    { link: '/achievements', label: t('nav.myAchievements') },
    ...demoMenuItems,
  ]);

  const unauthenticatedSections: MenuSection[] = [
    { items: unauthenticatedPrimary },
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

  return (
    <>
      <Badge
        color="error"
        badgeContent={isAuthenticated ? unreadImportantCount : 0}
        overlap="circular"
        max={99}
        invisible={!isAuthenticated || unreadImportantCount < 1}
        sx={{
          marginRight: { xs: '8px', sm: '16px' },
          '& .MuiBadge-badge': {
            top: 6,
            right: 6,
            border: '2px solid',
            borderColor: 'background.paper',
            minWidth: 18,
            height: 18,
            fontSize: '0.7rem',
            padding: '0 4px',
          },
        }}
      >
        <Avatar
          onClick={toggleMenu}
          sx={{
            cursor: 'pointer',
            width: 44,
            height: 44,
            flexShrink: 0,
            '& .MuiSvgIcon-root': {
              width: '80%',
              height: '80%',
            },
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
          <PersonOutlineIcon />
        </Avatar>
      </Badge>
      <Menu
        active={active}
        sections={sections}
        position={'right'}
        clickHandle={closeMenu}
        onLogout={isAuthenticated ? handleLogout : null}
        footer={
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'stretch' }}>
            <Box sx={{ mb: 2 }}>
              <ThemeSwitcher />
            </Box>
            <LanguageToggler onLanguageChange={() => setActive(false)} />
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', px: 1 }}
            >
              v.{displayVersion}
            </Typography>
          </Box>
        }
      />
    </>
  );
};

export default UserMenu;
