import React from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import type { NavLinkProps } from './types';

const NavLink: React.FC<NavLinkProps> = ({ to, children, clickHandle, onClick, className }) => {
  const match = useMatch(to);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();

    if (onClick) {
      onClick(e);
      return;
    }

    navigate(to);

    setTimeout(() => {
      if (clickHandle) {
        clickHandle();
      }
    }, 300);
  };

  return (
    <li className={match ? 'current-menu-item' : ''}>
      <button onClick={handleClick} className={className}>
        {children}
      </button>
    </li>
  );
};

export default NavLink;
