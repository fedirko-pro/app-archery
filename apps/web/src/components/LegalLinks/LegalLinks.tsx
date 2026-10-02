import './LegalLinks.scss';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useCurrentLang } from '../../hooks/use-current-lang';
import { LEGAL_LINKS, type LegalPageId } from './legal-pages';

const LegalLinks = ({ omit }: { omit?: LegalPageId }) => {
  const { t } = useTranslation('common');
  const lang = useCurrentLang();
  const links = omit ? LEGAL_LINKS.filter((link) => link.id !== omit) : LEGAL_LINKS;

  return (
    <nav className="legal-links" aria-label={t('legal.navLabel')}>
      {links.map((link) => (
        <Link key={link.id} to={`/${lang}${link.path}`}>
          {t(`legal.nav.${link.id}`)}
        </Link>
      ))}
    </nav>
  );
};

export default LegalLinks;
