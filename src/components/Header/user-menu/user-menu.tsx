import React, { useState } from 'react';
import '../header.scss';
import Menu from '../menu/menu';
import Avatar from '@mui/material/Avatar';
import { useAuth } from '../../../contexts/auth-context';
import type { MenuItem } from '../menu/types';

const UserMenu: React.FC = () => {
  const [active, setActive] = useState<boolean>(false);
  const { user, isAuthenticated, logout } = useAuth();

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

  const menuItems: MenuItem[] = isAuthenticated 
    ? [
        {
          link: '/profile',
          label: 'My profile',
        },
        {
          link: '/achievements',
          label: 'My achievements',
        },
        // TODO: Settings temporarily disabled - functionality moved to Profile
        // {
        //   link: '/settings',
        //   label: 'Settings',
        // },
      ]
    : [
        {
          link: '/signin',
          label: 'Sign In',
        },
        {
          link: '/signup',
          label: 'Sign Up',
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
        items={menuItems}
        position={'right'}
        clickHandle={hamburgerClick}
        onLogout={isAuthenticated ? handleLogout : null}
      />
    </>
  );
};

export default UserMenu; 