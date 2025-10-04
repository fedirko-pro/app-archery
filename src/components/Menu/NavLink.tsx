import React from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { normalizeAppLang } from '../../utils/i18n-lang';

import type { NavLinkProps } from './types';

const NavLink: React.FC<NavLinkProps> = ({ to, children, clickHandle, onClick, className }) => {
  const { lang } = useParams();
  const currentLang = normalizeAppLang(lang);
  const match = useMatch(`/${currentLang}${to}`);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();

    if (onClick) {
      onClick(e);
      return;
    }

    navigate(`/${currentLang}${to}`);

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
