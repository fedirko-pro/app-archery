import './ThemeSwitcher.scss';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import Switch from '@mui/material/Switch';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import { useColorMode } from '../../contexts/color-mode-context';

const ThemeSwitcher: React.FC = () => {
  const { mode, setMode } = useColorMode();
  const { t } = useTranslation('common');
  const isDark = mode === 'dark';

  return (
    <div className="theme_switcher">
      <LightModeOutlinedIcon
        className={`theme_switcher__icon${isDark ? '' : ' theme_switcher__icon--active'}`}
        fontSize="small"
        aria-hidden
      />
      <Switch
        className="theme_switcher__switch"
        checked={isDark}
        onChange={(_, checked) => setMode(checked ? 'dark' : 'light')}
        aria-label={isDark ? t('themeSwitcher.toLight') : t('themeSwitcher.toDark')}
        size="small"
        color="warning"
      />
      <DarkModeOutlinedIcon
        className={`theme_switcher__icon${isDark ? ' theme_switcher__icon--active' : ''}`}
        fontSize="small"
        aria-hidden
      />
    </div>
  );
};

export default ThemeSwitcher;
