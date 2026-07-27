import React from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';

import { fromI18nLang, getCurrentI18nLang, normalizeAppLang } from '../../utils/i18n-lang';
import type { NavLinkProps } from './types';

const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  clickHandle,
  onClick,
  className,
  badgeCount,
}) => {
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
    // Close immediately (setActive(false)), not a delayed toggle — avoids reopening the menu
    // and leaving the overlay covering the newly navigated page.
    clickHandle?.();
  };

  const showBadge = typeof badgeCount === 'number' && badgeCount > 0;

  return (
    <li className={match ? 'current-menu-item' : ''}>
      <button type="button" onClick={handleClick} className={className}>
        <span className="menu_link_label">{children}</span>
        {showBadge && (
          <span className="menu_badge" aria-label={`${badgeCount} unread`}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </button>
    </li>
  );
};

export default NavLink;
