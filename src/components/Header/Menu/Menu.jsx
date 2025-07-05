import React from 'react';
import './Menu.scss';
import NavLink from './NavLink.jsx';
import classNames from 'classnames';

const Menu = (props) => {
  const { active, items, position, onLogout } = props;

  const handleMenuClick = (e) => {
    if (e.target.closest('button')) {
      return;
    }
    props.clickHandle();
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
            clickHandle={props.clickHandle}
            onClick={item.onClick}
          >
            {item.label}
          </NavLink>
        ))}
        {onLogout && (
          <li style={{ pointerEvents: 'auto' }}>
            <button 
              onClick={(e) => {
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
