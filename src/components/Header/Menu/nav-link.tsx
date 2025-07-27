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
      <button 
        onClick={handleClick}
        className={className}
        style={{
          background: 'none',
          border: 'none',
          color: '#ffd700',
          font: 'inherit',
          cursor: 'pointer',
          padding: '16px 32px',
          width: '100%',
          textAlign: 'left',
          fontSize: '20px',
          pointerEvents: 'auto'
        }}
      >
        {children}
      </button>
    </li>
  );
};

export default NavLink; 