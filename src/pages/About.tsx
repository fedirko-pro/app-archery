import './About.scss';

import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation('common');
  return (
    <section className="about-page">
      <div className="container">
        <h2>{t('pages.about.title')}</h2>
        <p className="about-intro">{t('pages.about.intro')}</p>
        
        <div className="features-section">
          <h3>{t('pages.about.currentTitle')}</h3>
          <ul className="features-list">
            <li><strong>🔐 {t('pages.about.current.auth')}</strong></li>
            <li><strong>👤 {t('pages.about.current.profiles')}</strong></li>
            <li><strong>🏹 {t('pages.about.current.tournaments')}</strong></li>
            <li><strong>📝 {t('pages.about.current.applications')}</strong></li>
            <li><strong>👥 {t('pages.about.current.patrols')}</strong></li>
            <li><strong>⚙️ {t('pages.about.current.admin')}</strong></li>
            <li><strong>🎯 {t('pages.about.current.categories')}</strong></li>
            <li><strong>🏢 {t('pages.about.current.clubs')}</strong></li>
            <li><strong>📊 {t('pages.about.current.divisions')}</strong></li>
            <li><strong>📜 {t('pages.about.current.rules')}</strong></li>
            <li><strong>🔄 {t('pages.about.current.converter')}</strong></li>
            <li><strong>📎 {t('pages.about.current.uploads')}</strong></li>
            <li><strong>🌍 {t('pages.about.current.multilang')}</strong></li>
            <li><strong>📱 {t('pages.about.current.pwa')}</strong></li>
          </ul>
        </div>

        <div className="features-section">
          <h3>{t('pages.about.plannedTitle')}</h3>
          <ul className="features-list">
            <li>{t('pages.about.planned.trainingLog')}</li>
            <li>{t('pages.about.planned.achievements')}</li>
            <li>{t('pages.about.planned.competitions')}</li>
            <li>{t('pages.about.planned.duels')}</li>
            <li>{t('pages.about.planned.news')}</li>
            <li>{t('pages.about.planned.calendar')}</li>
            <li>{t('pages.about.planned.knowledgeBase')}</li>
            <li>{t('pages.about.planned.more')}</li>
          </ul>
        </div>

        <hr />
        <p className="contact-info">
          {t('pages.about.contact')}{' '}
          <a href="mailto:serhii.fedirko@gmail.com">serhii.fedirko@gmail.com</a>
        </p>
        <hr />
        <p className="copyright">
          {t('pages.about.copyrightPrefix')}{' '}
          <a href="https://fedirko.pro" target="_blank" rel="noopener noreferrer">FEDIRKO.PRO</a>
          {t('pages.about.copyrightSuffix')}
        </p>
      </div>
    </section>
  );
};

export default About;
