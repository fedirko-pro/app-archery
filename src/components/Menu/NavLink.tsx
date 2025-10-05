import React from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import { fromI18nLang, getCurrentI18nLang, normalizeAppLang } from '../../utils/i18n-lang';

import type { NavLinkProps } from './types';

const NavLink: React.FC<NavLinkProps> = ({ to, children, clickHandle, onClick, className }) => {
  const location = useLocation();
  const inferredLang = fromI18nLang(getCurrentI18nLang());
  const currentLang = normalizeAppLang(location.pathname.split('/')[1] || inferredLang);
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
