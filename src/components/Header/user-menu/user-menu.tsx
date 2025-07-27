import React, { useState } from 'react';
import '../header.scss';
import Menu from '../menu/menu';
import Avatar from '@mui/material/Avatar';
import { useAuth } from '../../../contexts/auth-context';
import type { MenuSection } from '../menu/types';

const UserMenu: React.FC = () => {
  const [active, setActive] = useState<boolean>(false);
  const { user, isAuthenticated, logout, loading } = useAuth();

  if (loading) {
    return null; // або показати loading spinner
  }

  const hamburgerClick = (): void => {
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

  const authenticatedMenuItems = [
    {
      link: '/profile',
      label: 'My profile',
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
      label: 'Sign In',
    },
    {
      link: '/signup',
      label: 'Sign Up',
    },
  ];

  const sections: MenuSection[] = [
    {
      items: isAuthenticated
        ? authenticatedMenuItems
        : unauthenticatedMenuItems,
      isAdmin: false,
    },
  ];

  return (
    <>
      <Avatar
        onClick={hamburgerClick}
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
        clickHandle={hamburgerClick}
        onLogout={isAuthenticated ? handleLogout : null}
      />
    </>
  );
};

export default UserMenu;
