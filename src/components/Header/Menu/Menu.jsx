import React from 'react';
import './Menu.scss';
import NavLink from './NavLink.jsx';
import classNames from 'classnames';

const Menu = (props) => {
  const { active, items, position } = props;

  return (
    <div
      className={classNames('header_menu', { active: active }, position)}
      onClick={props.clickHandle}
    >
      <ul className="menu_list">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.link}
            clickHandle={props.clickHandle}
          >
            {item.label}
          </NavLink>
        ))}
      </ul>
    </div>
  );
};

export default Menu;
