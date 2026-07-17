import './About.scss';

import { useTranslation } from 'react-i18next';

const FeatureItem = ({ emoji, label }: { emoji?: string; label: string }) => {
  const dashIdx = label.indexOf(' - ');
  const prefix = emoji ? `${emoji} ` : '';
  if (dashIdx === -1)
    return (
      <strong>
        {prefix}
        {label}
      </strong>
    );
  return (
    <>
      <strong>
        {prefix}
        {label.slice(0, dashIdx)}
      </strong>
      {label.slice(dashIdx)}
    </>
  );
};

const About = () => {
  const { t } = useTranslation('common');
  const introParagraphs = t('pages.about.intro').split('\n\n');
  return (
    <section className="about-page">
      <div className="container">
        <h2>{t('pages.about.title')}</h2>
        <div className="about-intro">
          {introParagraphs.map((para, i) =>
            i === introParagraphs.length - 1 ? (
              <p key={i}>
                <strong>{para}</strong>
              </p>
            ) : (
              <p key={i}>{para}</p>
            ),
          )}
        </div>

        <div className="features-section">
          <h3>{t('pages.about.archerTitle')}</h3>
          <ul className="features-list">
            <li>
              <FeatureItem emoji="🏠" label={t('pages.about.current.home')} />
            </li>
            <li>
              <FeatureItem emoji="🏋️" label={t('pages.about.current.trainingLog')} />
            </li>
            <li>
              <FeatureItem emoji="🎽" label={t('pages.about.current.equipment')} />
            </li>
            <li>
              <FeatureItem emoji="📈" label={t('pages.about.current.statistics')} />
            </li>
            <li>
              <FeatureItem emoji="🏆" label={t('pages.about.current.achievements')} />
            </li>
            <li>
              <FeatureItem emoji="🎮" label={t('pages.about.current.gamification')} />
            </li>
            <li>
              <FeatureItem emoji="👤" label={t('pages.about.current.profiles')} />
            </li>
            <li>
              <FeatureItem emoji="🔗" label={t('pages.about.current.publicProfiles')} />
            </li>
            <li>
              <FeatureItem emoji="📊" label={t('pages.about.current.progressSnapshot')} />
            </li>
          </ul>
        </div>

        <div className="features-section">
          <h3>{t('pages.about.federationTitle')}</h3>
          <ul className="features-list">
            <li>
              <FeatureItem emoji="🏹" label={t('pages.about.current.tournaments')} />
            </li>
            <li>
              <FeatureItem emoji="📝" label={t('pages.about.current.applications')} />
            </li>
            <li>
              <FeatureItem emoji="👥" label={t('pages.about.current.patrols')} />
            </li>
            <li>
              <FeatureItem emoji="⭐" label={t('pages.about.current.tournamentFeedback')} />
            </li>
            <li>
              <FeatureItem emoji="⚙️" label={t('pages.about.current.admin')} />
            </li>
            <li>
              <FeatureItem emoji="🎯" label={t('pages.about.current.categories')} />
            </li>
            <li>
              <FeatureItem emoji="🏢" label={t('pages.about.current.clubs')} />
            </li>
            <li>
              <FeatureItem emoji="📋" label={t('pages.about.current.divisions')} />
            </li>
            <li>
              <FeatureItem emoji="📜" label={t('pages.about.current.rules')} />
            </li>
          </ul>
        </div>

        <div className="features-section">
          <h3>{t('pages.about.platformTitle')}</h3>
          <ul className="features-list">
            <li>
              <FeatureItem emoji="🔐" label={t('pages.about.current.auth')} />
            </li>
            <li>
              <FeatureItem emoji="🛡️" label={t('pages.about.current.security')} />
            </li>
            <li>
              <FeatureItem emoji="🚀" label={t('pages.about.current.onboarding')} />
            </li>
            <li>
              <FeatureItem emoji="📱" label={t('pages.about.current.pwa')} />
            </li>
            <li>
              <FeatureItem emoji="🌍" label={t('pages.about.current.multilang')} />
            </li>
            <li>
              <FeatureItem emoji="🔄" label={t('pages.about.current.converter')} />
            </li>
            <li>
              <FeatureItem emoji="🧮" label={t('pages.about.current.calculator')} />
            </li>
            <li>
              <FeatureItem emoji="📎" label={t('pages.about.current.uploads')} />
            </li>
          </ul>
        </div>

        <div className="features-section">
          <h3>{t('pages.about.plannedTitle')}</h3>
          <ul className="features-list">
            <li>
              <FeatureItem label={t('pages.about.planned.socialSharing')} />
            </li>
            <li>
              <FeatureItem label={t('pages.about.planned.duels')} />
            </li>
            <li>
              <FeatureItem label={t('pages.about.planned.knowledgeBase')} />
            </li>
            <li>
              <FeatureItem label={t('pages.about.planned.payments')} />
            </li>
            <li>
              <FeatureItem label={t('pages.about.planned.competitions')} />
            </li>
            <li>
              <FeatureItem label={t('pages.about.planned.news')} />
            </li>
            <li>
              <FeatureItem label={t('pages.about.planned.calendar')} />
            </li>
            <li>
              <FeatureItem label={t('pages.about.planned.more')} />
            </li>
          </ul>
        </div>

        <hr />
        <p className="contact-info">
          {t('pages.about.contact')} <a href="mailto:contact@fedirko.pro">contact@fedirko.pro</a>
        </p>
        <div className="authors-section">
          <h3>{t('pages.about.authorsTitle')}</h3>
          <ul className="authors-list">
            <li>
              <a
                href="https://www.linkedin.com/in/maryfedirko/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('pages.about.authorMariia')}
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/serhiifedirko/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('pages.about.authorSerhii')}
              </a>
            </li>
          </ul>
        </div>
        <p className="copyright">
          © {new Date().getFullYear()}
          {t('pages.about.copyrightSuffix')}
        </p>
      </div>
    </section>
  );
};

export default About;
