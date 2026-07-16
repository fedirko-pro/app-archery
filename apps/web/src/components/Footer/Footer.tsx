import './Footer.scss';

import { useTranslation } from 'react-i18next';
import { Link, NavLink, useParams } from 'react-router-dom';

import { normalizeAppLang } from '../../utils/i18n-lang';

const appBuildId = process.env.NEXT_PUBLIC_APP_BUILD_ID ?? 'unknown';
const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown';
const displayVersion = appBuildId === 'dev' ? appVersion : appBuildId;

const Footer = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const currentLang = normalizeAppLang(lang);
  return (
    <footer className="app-footer">
      <span className="footer_side">
        <span className="footer_side__version">v.{displayVersion}</span>
        <span className="footer_side__credit">
          ©{' '}
          <a href="https://fedirko.pro" target="_blank" rel="noopener noreferrer">
            FEDIRKO.PRO
          </a>
        </span>
      </span>
      <Link to={`/${currentLang}`} target="_self" className="central_button" />
      <NavLink to={`/${currentLang}/about`}>{t('footer.about')}</NavLink>
    </footer>
  );
};

export default Footer;
