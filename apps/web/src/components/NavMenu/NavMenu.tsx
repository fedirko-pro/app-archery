import './NavMenu.scss';

import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ADMIN_NAV_ITEMS,
  canSeeAdminNavSection,
  canSeeOrganizerTools,
  FIELD_GUIDE_NAV_ITEMS,
  ORGANIZER_NAV_ITEMS,
  PUBLIC_DEMO_NAV_ITEMS,
} from '../../config/roles';
import { useAuth } from '../../contexts/auth-context';
import { useBodyScrollLock } from '../../hooks/use-body-scroll-lock';
import Menu from '../Menu/Menu';
import type { MenuSection } from '../Menu/types';

function NavMenu() {
  const { t } = useTranslation('common');
  const [active, setActive] = useState(false);
  const { user, initializing } = useAuth();

  useBodyScrollLock(active);

  if (initializing) {
    return null;
  }

  const toggleMenu = () => setActive((prev) => !prev);
  const closeMenu = () => setActive(false);

  const mainMenuItems = [
    { link: '/tournaments', label: t('nav.tournaments') },
    { link: '/clubs', label: t('nav.clubs', 'Clubs') },
  ];

  const fieldGuideItems = FIELD_GUIDE_NAV_ITEMS.map((item) => ({
    link: item.link,
    label: t(item.labelKey),
  }));

  const demoMenuItems = PUBLIC_DEMO_NAV_ITEMS.map((item) => ({
    link: item.link,
    label: t(item.labelKey),
  }));

  const sections: MenuSection[] = [{ items: mainMenuItems }];

  sections.push({
    items: fieldGuideItems,
    isCollapsible: true,
    sectionLabelKey: 'nav.fieldGuide',
  });

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
      <div className={classNames('hamburger', { hidden_smooth: active })} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <Menu active={active} sections={sections} position={'left'} clickHandle={closeMenu} />
    </>
  );
}

export default NavMenu;
