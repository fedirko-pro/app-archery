import React, { useState } from 'react';
import '../Header.scss';
import Menu from '../Menu/Menu.jsx';
import Avatar from '@mui/material/Avatar';
import { useAuth } from '../../../contexts/AuthContext';

function UserMenu() {
  const [active, setActive] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const hamburgerClick = () => {
    setActive(!active);
    if (!active) {
      document.body.classList.add('lock');
    } else {
      document.body.classList.remove('lock');
    }
  };

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      setActive(false);
      document.body.classList.remove('lock');
    }, 100);
  };

  const menuItems = isAuthenticated 
    ? [
        {
          link: '/profile',
          label: 'My profile',
        },
        {
          link: '/achievements',
          label: 'My achievements',
        },
        {
          link: '/settings',
          label: 'Settings',
        },
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
}

export default UserMenu;
