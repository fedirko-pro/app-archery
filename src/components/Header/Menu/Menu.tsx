import React from 'react';
import './menu.scss';
import NavLink from './nav-link';
import classNames from 'classnames';
import type { MenuProps } from '../../../types';

export const Menu: React.FC<MenuProps> = ({ active, items, position, clickHandle, onLogout }) => {
  const handleMenuClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if ((e.target as Element).closest('button')) {
      return;
    }
    clickHandle();
  };

  return (
    <div
      className={classNames('header_menu', { active: active }, position)}
      onClick={handleMenuClick}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      <ul className="menu_list" style={{ pointerEvents: 'auto' }}>
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.link}
            clickHandle={clickHandle}
            onClick={item.onClick}
          >
            {item.label}
          </NavLink>
        ))}
        {onLogout && (
          <li style={{ pointerEvents: 'auto' }}>
            <button 
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                e.stopPropagation();
                onLogout();
              }}
              style={{
                background: 'none',
                border: 'none',
                font: 'inherit',
                cursor: 'pointer',
                padding: '16px 32px',
                width: '100%',
                textAlign: 'left',
                fontSize: '20px',
                color: '#ffd700',
                pointerEvents: 'auto'
              }}
            >
              Log out
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Menu; 