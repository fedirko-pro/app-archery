import './Menu.scss';

import classNames from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { normalizeAppLang } from '../../utils/i18n-lang';
import NavLink from './NavLink';
import type { MenuProps } from './types';

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
  const [adminSectionOpen, setAdminSectionOpen] = useState(false);

  const handleMenuClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if ((e.target as Element).closest('button')) {
      return;
    }
    clickHandle();
  };

  const toggleAdminSection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdminSectionOpen(!adminSectionOpen);
  };

  return (
    <div
      className={classNames('menu', { active: active }, position)}
      onClick={handleMenuClick}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      <div className="menu_container">
        <ul className="menu_list" style={{ pointerEvents: 'auto' }}>
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              {section.isAdmin && (
                <>
                  <li className="menu_separator" style={{ pointerEvents: 'auto' }}>
                    <hr
                      style={{
                        border: 'none',
                        height: '1px',
                        backgroundColor: '#333',
                        margin: '8px 32px',
                      }}
                    />
                  </li>
                  <li style={{ pointerEvents: 'auto' }}>
                    <button
                      onClick={toggleAdminSection}
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
                        pointerEvents: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {t('menu.admin')}
                      <span
                        style={{
                          transform: adminSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        ▼
                      </span>
                    </button>
                  </li>
                </>
              )}
              {(!section.isAdmin || adminSectionOpen) &&
                section.items.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.link}
                    clickHandle={clickHandle}
                    onClick={item.onClick}
                    className={section.isAdmin ? 'admin-menu-item' : ''}
                  >
                    {item.label}
                  </NavLink>
                ))}
            </React.Fragment>
          ))}
          {onLogout && (
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
          )}
        </ul>
        {footer && <div className="menu_footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Menu;
