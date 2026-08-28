import { useLocation, useParams } from 'react-router';

import {
  type AppLanguage,
  fromI18nLang,
  getCurrentI18nLang,
  normalizeAppLang,
} from '../utils/i18n-lang';

/**
 * Current app language for components that may render outside the `:lang` route
 * (the app shell in `RouterShell`), where `useParams().lang` is undefined.
 */
export function useCurrentLang(): AppLanguage {
  const { lang } = useParams();
  const location = useLocation();
  const inferredLang = fromI18nLang(getCurrentI18nLang());

  return normalizeAppLang(lang || location.pathname.split('/')[1] || inferredLang);
}
