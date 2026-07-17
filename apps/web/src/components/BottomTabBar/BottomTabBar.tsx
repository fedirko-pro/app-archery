import './BottomTabBar.scss';

import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useParams } from 'react-router-dom';

import { fromI18nLang, getCurrentI18nLang, normalizeAppLang } from '../../utils/i18n-lang';

/** Home stays in the center when there are 5 tabs. */
const TABS = [
  { path: 'trainings', labelKey: 'nav.myTrainings', Icon: TrackChangesIcon },
  { path: 'statistics', labelKey: 'nav.myStatistics', Icon: BarChartOutlinedIcon },
  { path: 'home', labelKey: 'dashboard.title', Icon: HomeOutlinedIcon },
  { path: 'equipment', labelKey: 'nav.myEquipment', Icon: ArchitectureOutlinedIcon },
  { path: 'achievements', labelKey: 'nav.myAchievements', Icon: EmojiEventsOutlinedIcon },
] as const;

const BottomTabBar: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const location = useLocation();
  // RouterShell sits outside the `:lang` route, so params.lang is often undefined.
  const inferredLang = fromI18nLang(getCurrentI18nLang());
  const currentLang = normalizeAppLang(lang || location.pathname.split('/')[1] || inferredLang);

  return (
    <nav className="bottom-tab-bar" aria-label={t('nav.athleteTabs')}>
      {TABS.map(({ path, labelKey, Icon }) => (
        <NavLink
          key={path}
          to={`/${currentLang}/${path}`}
          className={({ isActive }) =>
            classNames('bottom-tab-bar__link', {
              'bottom-tab-bar__link--active': isActive,
              'bottom-tab-bar__link--center': path === 'home',
            })
          }
        >
          <Icon className="bottom-tab-bar__icon" aria-hidden />
          <span className="bottom-tab-bar__label">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomTabBar;
