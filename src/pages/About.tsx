import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation('common');
  return (
    <section>
      <div className="container">
        <h2>{t('pages.about.title')}</h2>
        <p>{t('pages.about.intro')}</p>
        <p>{t('pages.about.currentTitle')}</p>
        <ul>
          <li>{t('pages.about.current.tournaments')}</li>
          <li>{t('pages.about.current.applications')}</li>
          <li>{t('pages.about.current.patrols')}</li>
          <li>{t('pages.about.current.users')}</li>
          <li>{t('pages.about.current.rules')}</li>
          <li>{t('pages.about.current.converter')}</li>
          <li>{t('pages.about.current.aboutPage')}</li>
        </ul>
        <p>{t('pages.about.plannedTitle')}</p>
        <ul>
          <li>{t('pages.about.planned.trainingLog')}</li>
          <li>{t('pages.about.planned.profile')}</li>
          <li>{t('pages.about.planned.shareProfile')}</li>
          <li>{t('pages.about.planned.localCompetition')}</li>
          <li>{t('pages.about.planned.globalCompetition')}</li>
          <li>{t('pages.about.planned.duels')}</li>
          <li>{t('pages.about.planned.news')}</li>
          <li>{t('pages.about.planned.calendar')}</li>
          <li>{t('pages.about.planned.knowledgeBase')}</li>
          <li>{t('pages.about.planned.more')}</li>
        </ul>
        <hr />
        <p>
          {t('pages.about.contact')}{' '}
          <Link to="mailto:serhii.fedirko@gmail.com">serhii.fedirko@gmail.com</Link>
        </p>
        <hr />
        <p>
          {t('pages.about.copyrightPrefix')}{' '}
          <Link to="https://fedirko.pro" target="_blank">FEDIRKO.PRO</Link>
          {t('pages.about.copyrightSuffix')}
        </p>
      </div>
    </section>
  );
};

export default About;
