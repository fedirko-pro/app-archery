import './Footer.scss';

import { useTranslation } from 'react-i18next';
import { Link, NavLink, useParams } from 'react-router-dom';

import { normalizeAppLang } from '../../utils/i18n-lang';

const Footer = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const currentLang = normalizeAppLang(lang);
  return (
    <footer>
      <NavLink to={`/${currentLang}/converter`}>v.1.0.2 &copy; FEDIRKO.PRO</NavLink>
      <Link to={`/${currentLang}`} target="_self" className="central_button" />
      <NavLink to={`/${currentLang}/about`}>{t('footer.about')}</NavLink>
    </footer>
  );
};

export default Footer;
