import '../header.scss';
import classNames from 'classnames';
import Menu from '../menu/menu.tsx';
import { useState } from 'react';
import { useAuth } from '../../../contexts/auth-context.tsx';

function NavMenu() {
  const [active, setActive] = useState(false);
  const { user } = useAuth();

  const clickHandler = () => {
    setActive(!active);
    if (!active) {
      document.body.classList.add('lock');
    } else {
      document.body.classList.remove('lock');
    }
  };

  const baseMenuItems = [
    {
      link: '/trainings',
      label: 'My trainings',
    },
    {
      link: '/tournaments',
      label: 'Tournaments',
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

  const menuItems = user?.role === 'admin' 
    ? [
        {
          link: '/admin',
          label: 'Users',
        },
        ...baseMenuItems,
      ]
    : baseMenuItems;

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
