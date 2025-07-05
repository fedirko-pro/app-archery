import '../header.scss';
import classNames from 'classnames';
import Menu from '../menu/menu.tsx';
import { useState } from 'react';

function NavMenu() {
  const [active, setActive] = useState(false);

  const clickHandler = () => {
    setActive(!active);
    if (!active) {
      document.body.classList.add('lock');
    } else {
      document.body.classList.remove('lock');
    }
  };

  const menuItems = [
    {
      link: '/trainings',
      label: 'My trainings',
    },
    {
      link: '/Competitions',
      label: 'Competitions',
    },
    {
      link: '/Competition',
      label: 'Competition (DEMO)',
    },
    {
      link: '/Competition/patrols',
      label: 'Patrols list (DEMO)',
    },
    {
      link: '/Competition/patrols',
      label: 'Patrol (DEMO)',
    },
    {
      link: '/Competition/user',
      label: 'User card (demo)',
    },
    {
      link: '/converter',
      label: 'Converter',
    },
    {
      link: '/encyclopedia',
      label: 'Knowledge base',
    },
    {
      link: '/about',
      label: 'About',
    },
  ];

  return (
    <>
      <div
        className={classNames('hamburger', { hidden_smooth: active })}
        onClick={clickHandler}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      <Menu
        active={active}
        items={menuItems}
        position={'left'}
        clickHandle={clickHandler}
      />
    </>
  );
}

export default NavMenu;
