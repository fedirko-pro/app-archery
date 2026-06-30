import './Menu.scss';

import classNames from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { COLORS } from '../../theme/colors';
import { normalizeAppLang } from '../../utils/i18n-lang';
import NavLink from './NavLink';
import type { MenuProps, MenuSection } from './types';

function isCollapsibleSection(section: MenuSection): boolean {
  return section.isCollapsible ?? section.isAdmin ?? false;
}

function getSectionLabelKey(section: MenuSection): string {
  if (section.sectionLabelKey) {
    return section.sectionLabelKey;
  }
  if (section.isAdmin) {
    return 'menu.admin';
  }
  return 'menu.admin';
}

export const Menu: React.FC<MenuProps> = ({
  active,
  sections,
  position,
  clickHandle,
  onLogout,
  footer,
}) => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  normalizeAppLang(lang);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  const handleMenuClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if ((e.target as Element).closest('button')) {
      return;
    }
    clickHandle();
  };

  const toggleSection = (sectionIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenSections((prev) => ({ ...prev, [sectionIndex]: !prev[sectionIndex] }));
  };

  return (
    <div
      className={classNames('menu', { active: active }, position)}
      onClick={handleMenuClick}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      <div className="menu_container">
        <ul className="menu_list" style={{ pointerEvents: 'auto' }}>
          {sections.map((section, sectionIndex) => {
            const collapsible = isCollapsibleSection(section);
            const sectionOpen = openSections[sectionIndex] ?? false;

            return (
              <React.Fragment key={sectionIndex}>
                {section.divider && !collapsible && (
                  <li className="menu_separator" style={{ pointerEvents: 'auto' }}>
                    <hr
                      style={{
                        border: 'none',
                        height: '1px',
                        backgroundColor: COLORS.dividerOnDark,
                        margin: '8px 32px',
                      }}
                    />
                  </li>
                )}
                {collapsible && (
                  <>
                    <li className="menu_separator" style={{ pointerEvents: 'auto' }}>
                      <hr
                        style={{
                          border: 'none',
                          height: '1px',
                          backgroundColor: COLORS.dividerOnDark,
                          margin: '8px 32px',
                        }}
                      />
                    </li>
                    <li style={{ pointerEvents: 'auto' }}>
                      <button
                        onClick={(e) => toggleSection(sectionIndex, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          font: 'inherit',
                          cursor: 'pointer',
                          padding: '16px 32px',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '20px',
                          color: COLORS.secondary,
                          pointerEvents: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {t(getSectionLabelKey(section))}
                        <span
                          style={{
                            transform: sectionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          ▼
                        </span>
                      </button>
                    </li>
                  </>
                )}
                {(!collapsible || sectionOpen) &&
                  section.items.map((item) => (
                    <NavLink
                      key={item.label}
                      to={item.link}
                      clickHandle={clickHandle}
                      onClick={item.onClick}
                      className={collapsible ? 'admin-menu-item' : ''}
                    >
                      {item.label}
                    </NavLink>
                  ))}
              </React.Fragment>
            );
          })}
          {onLogout && (
            <>
              <li className="menu_separator" style={{ pointerEvents: 'auto' }}>
                <hr
                  style={{
                    border: 'none',
                    height: '1px',
                    backgroundColor: COLORS.dividerOnDark,
                    margin: '8px 32px',
                  }}
                />
              </li>
              <li style={{ pointerEvents: 'auto' }}>
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLogout();
                  }}
                >
                  {t('auth.logout')}
                </button>
              </li>
            </>
          )}
        </ul>
        {footer && <div className="menu_footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Menu;
