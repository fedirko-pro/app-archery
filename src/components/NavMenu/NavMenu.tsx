import './NavMenu.scss';

import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../contexts/auth-context';
import Menu from '../Menu/Menu';

function NavMenu() {
  const { t } = useTranslation('common');
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
    { link: '/tournaments', label: t('nav.tournaments') },
    ...(user ? [{ link: '/applications', label: t('nav.myApplications') }] : []),
    { link: '/converter', label: t('nav.converter') },
    { link: '/competition/user', label: 'User card (demo)' },
    { link: '/categories', label: t('nav.categories') },
    { link: '/clubs', label: t('nav.clubs', 'Clubs') },
    { link: '/divisions', label: t('nav.divisions', 'Divisions') },
    { link: '/rules', label: t('nav.rules') },
    { link: '/about', label: t('nav.about') },
  ];

  const adminMenuItems = [
    { link: '/admin/users', label: t('nav.users') },
    { link: '/admin/applications', label: t('nav.userApplications') },
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
      <div className={classNames('hamburger', { hidden_smooth: active })} onClick={clickHandler}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <Menu active={active} sections={sections} position={'left'} clickHandle={clickHandler} />
    </>
  );
}

export default NavMenu;
