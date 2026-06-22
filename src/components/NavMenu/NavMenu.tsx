import './NavMenu.scss';

import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ADMIN_NAV_ITEMS,
  canSeeAdminNavSection,
  canSeeOrganizerTools,
  ORGANIZER_NAV_ITEMS,
  PUBLIC_DEMO_NAV_ITEMS,
} from '../../config/roles';
import { useAuth } from '../../contexts/auth-context';
import Menu from '../Menu/Menu';
import type { MenuSection } from '../Menu/types';

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

  const mainMenuItems = [
    { link: '/tournaments', label: t('nav.tournaments') },
    { link: '/clubs', label: t('nav.clubs', 'Clubs') },
    { link: '/rules', label: t('nav.rules') },
    { link: '/divisions', label: t('nav.divisions', 'Divisions') },
    { link: '/categories', label: t('nav.categories') },
    { link: '/converter', label: t('nav.converter') },
  ];

  const demoMenuItems = PUBLIC_DEMO_NAV_ITEMS.map((item) => ({
    link: item.link,
    label: t(item.labelKey),
  }));

  const sections: MenuSection[] = [{ items: mainMenuItems }];

  if (user && canSeeOrganizerTools(user.role)) {
    sections.push({
      items: ORGANIZER_NAV_ITEMS.map((item) => ({
        link: item.link,
        label: t(item.labelKey),
      })),
      isCollapsible: true,
      sectionLabelKey: 'menu.organizerTools',
    });
  }

  if (user && canSeeAdminNavSection(user.role)) {
    sections.push({
      items: ADMIN_NAV_ITEMS.map((item) => ({
        link: item.link,
        label: t(item.labelKey),
      })),
      isCollapsible: true,
      sectionLabelKey: 'menu.admin',
    });
  }

  sections.push({
    divider: true,
    items: [{ link: '/about', label: t('nav.about') }],
  });

  if (demoMenuItems.length > 0) {
    sections.push({
      divider: true,
      items: demoMenuItems,
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
