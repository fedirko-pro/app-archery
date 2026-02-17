import './NavMenu.scss';

import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { canAccessAdminSection } from '../../config/roles';
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
    { link: '/clubs', label: t('nav.clubs', 'Clubs') },
    { link: '/rules', label: t('nav.rules') },
    { link: '/divisions', label: t('nav.divisions', 'Divisions') },
    { link: '/categories', label: t('nav.categories') },
    { link: '/converter', label: t('nav.converter') },
    { link: '/about', label: t('nav.about') },
    { link: '/competition/user', label: t('nav.scoringDemo', 'Scoring Card (Demo)') },
  ];

  const adminMenuItems = [
    { link: '/admin/users', label: t('nav.users') },
    { link: '/admin/applications', label: t('nav.userApplications') },
    { link: '/admin/access-control', label: t('nav.accessControl', 'Access Control') },
  ];

  const sections = [
    {
      items: regularMenuItems,
      isAdmin: false,
    },
  ];

  if (user && canAccessAdminSection(user.role)) {
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
