import './LanguageToggler.scss';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import i18n from 'i18next';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import type { AppLanguageCode } from '../../contexts/types';
import { normalizeAppLang, toI18nLang } from '../../utils/i18n-lang';

const LanguageToggler: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const currentLang = normalizeAppLang(
    params.lang ??
      user?.appLanguage ??
      user?.app_language ??
      user?.language ??
      'pt',
  );
  const [language, setLanguage] = React.useState<string>(currentLang);

  const options: Array<{ value: string; code: string; flag: string }> = [
    { value: 'pt', code: 'PT', flag: '🇵🇹' },
    { value: 'en', code: 'EN', flag: '🇬🇧' },
    { value: 'it', code: 'IT', flag: '🇮🇹' },
    { value: 'es', code: 'ES', flag: '🇪🇸' },
    { value: 'ua', code: 'UA', flag: '🇺🇦' },
  ];

  const handleChange = async (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    if (!value) return;
    setLanguage(value);
    // Preserve current subpath when switching language
    const segments = location.pathname.split('/');
    if (segments.length > 1) {
      segments[1] = value;
    }
    const newPath = segments.join('/') || `/${value}`;
    navigate(newPath, { replace: true });
    await i18n.changeLanguage(toI18nLang(value as AppLanguageCode));
  };

  return (
    <Box className="language_select">
      <Select
        value={language}
        onChange={handleChange}
        size="small"
        aria-label="language"
        className="language_select__control"
        MenuProps={{
          PaperProps: { className: 'language_select__menuPaper' },
          MenuListProps: { className: 'language_select__menuList' },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} className="language_select__option">
            <span aria-hidden className="language_select__flag">{opt.flag}</span>
            <span className="language_select__code">{opt.code}</span>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default LanguageToggler;
