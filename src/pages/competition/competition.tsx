import './competition.scss';

import { useTranslation } from 'react-i18next';

export default function Competition() {
  const { t } = useTranslation('common');
  return <div className="user_card">{t('competition.title')}</div>;
}
