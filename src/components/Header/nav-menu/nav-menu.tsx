import '../Header.scss';

import classNames from 'classnames';
import { useState } from 'react';

import { useAuth } from '../../../contexts/auth-context';
import Menu from '../Menu/Menu';

function NavMenu() {
  const [active, setActive] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  const clickHandler = () => {
    setActive(!active);
    if (!active) {
      document.body.classList.add('lock');
    } else {
      document.body.classList.remove('lock');
    }
  };

  const regularMenuItems = [
    // TODO: Implement My trainings
    // {
    //   link: '/trainings',
    //   label: 'My trainings',
    // },
    {
      link: '/tournaments',
      label: 'Tournaments',
    },
    {
      link: '/applications',
      label: 'My applications',
    },
    // TODO: Implement Competition (DEMO)
    // {
    //   link: '/Competition',
    //   label: 'Competition (DEMO)',
    // },
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
    // TODO: Implement Knowledge base
    // {
    //   link: '/encyclopedia',
    //   label: 'Knowledge base',
    // },
    {
      link: '/about',
      label: 'About',
    },
  ];

  const adminMenuItems = [
    {
      link: '/admin/users',
      label: 'Users',
    },
    {
      link: '/admin/applications',
      label: 'User applications',
    },
  ];

  const sections = [
    {
      items: regularMenuItems,
      isAdmin: false,
    },
  ];

  if (user?.role === 'admin') {
    sections.push({
      items: adminMenuItems,
      isAdmin: true,
    });
  }

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
        sections={sections}
        position={'left'}
        clickHandle={clickHandler}
      />
    </>
  );
}

export default NavMenu;
