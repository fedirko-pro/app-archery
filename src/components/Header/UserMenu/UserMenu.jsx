import React, { useState } from 'react';
import '../Header.scss';
import Menu from '../Menu/Menu.jsx';
import Avatar from '@mui/material/Avatar';

function UserMenu() {
  const [active, setActive] = useState(false);

  const hamburgerClick = () => {
    setActive(!active);
    if (!active) {
      document.body.classList.add('lock');
    } else {
      document.body.classList.remove('lock');
    }
  };

  const menuItems = [
    {
      link: '/signin',
      label: 'Sign In',
    },
    {
      link: '/signup',
      label: 'Sign Up',
    },
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
    {
      link: '/logout',
      label: 'Log out',
    },
  ];

  return (
    <>
      <Avatar
        onClick={hamburgerClick}
        sx={{
          marginRight: '16px',
        }}
      />
      <Menu
        active={active}
        items={menuItems}
        position={'right'}
        clickHandle={hamburgerClick}
      />
    </>
  );
}

export default UserMenu;
