import './LanguageToggler.scss';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import i18n from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import type { AppLanguageCode } from '../../contexts/types';
import flagEn from '../../img/flags/en.svg';
import flagEs from '../../img/flags/es.svg';
import flagIt from '../../img/flags/it.svg';
import flagPt from '../../img/flags/pt.svg';
import flagUa from '../../img/flags/ua.svg';
import {
  fromI18nLang,
  getAppLanguageFromUser,
  normalizeAppLang,
  toI18nLang,
} from '../../utils/i18n-lang';

const options: Array<{ value: string; code: string; flagSrc: string }> = [
  { value: 'pt', code: 'PT', flagSrc: flagPt },
  { value: 'en', code: 'EN', flagSrc: flagEn },
  { value: 'it', code: 'IT', flagSrc: flagIt },
  { value: 'es', code: 'ES', flagSrc: flagEs },
  { value: 'ua', code: 'UA', flagSrc: flagUa },
];

const LanguageToggler: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { i18n: i18nInstance } = useTranslation();

  // Always derive current language from URL, then i18n, then user prefs – no local state
  const currentLang = normalizeAppLang(
    params.lang ??
      (i18nInstance.language ? fromI18nLang(i18nInstance.language) : undefined) ??
      getAppLanguageFromUser(user),
  );

  const handleChange = async (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    if (!value) return;
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
        value={currentLang}
        onChange={handleChange}
        size="small"
        aria-label="language"
        className="language_select__control"
        renderValue={(value) => {
          const opt = options.find((o) => o.value === value);
          if (!opt) return value;
          return (
            <>
              <img src={opt.flagSrc} alt="" className="language_select__flag" aria-hidden />
              <span className="language_select__code">{opt.code}</span>
            </>
          );
        }}
        MenuProps={{
          PaperProps: { className: 'language_select__menuPaper' },
          MenuListProps: { className: 'language_select__menuList' },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} className="language_select__option">
            <img src={opt.flagSrc} alt="" className="language_select__flag" aria-hidden />
            <span className="language_select__code">{opt.code}</span>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default LanguageToggler;
