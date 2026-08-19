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
              <p key={`para-${para}`}>
                <strong>{para}</strong>
              </p>
            ) : (
              <p key={`para-${para}`}>{para}</p>
            ),
          )}
        </div>

        <div className="features-section">
          <h3>{t('pages.about.archerTitle')}</h3>
          <p className="section-intro">{t('pages.about.archerIntro')}</p>
          <ul className="features-list">
            <li>
              <FeatureItem emoji="🏠" label={t('pages.about.archers.home')} />
            </li>
            <li>
              <FeatureItem emoji="🏋️" label={t('pages.about.archers.trainingLog')} />
            </li>
            <li>
              <FeatureItem emoji="🎽" label={t('pages.about.archers.equipment')} />
            </li>
            <li>
              <FeatureItem emoji="📈" label={t('pages.about.archers.statistics')} />
            </li>
            <li>
              <FeatureItem emoji="🏆" label={t('pages.about.archers.achievements')} />
            </li>
            <li>
              <FeatureItem emoji="👤" label={t('pages.about.archers.profileSharing')} />
            </li>
            <li>
              <FeatureItem emoji="🔔" label={t('pages.about.archers.notifications')} />
            </li>
            <li>
              <FeatureItem emoji="📝" label={t('pages.about.archers.tournamentApplications')} />
            </li>
            <li>
              <FeatureItem emoji="🚀" label={t('pages.about.archers.onboarding')} />
            </li>
            <li>
              <FeatureItem emoji="📖" label={t('pages.about.archers.fieldGuide')} />
            </li>
          </ul>
        </div>

        <div className="features-section">
          <h3>{t('pages.about.clubTitle')}</h3>
          <p className="section-intro">{t('pages.about.clubIntro')}</p>
          <ul className="features-list">
            <li>
              <FeatureItem emoji="🏢" label={t('pages.about.clubs.publicProfiles')} />
            </li>
            <li>
              <FeatureItem emoji="🤝" label={t('pages.about.clubs.joinInvitations')} />
            </li>
            <li>
              <FeatureItem emoji="👥" label={t('pages.about.clubs.myClub')} />
            </li>
            <li>
              <FeatureItem emoji="🏹" label={t('pages.about.clubs.clubTournaments')} />
            </li>
            <li>
              <FeatureItem emoji="📣" label={t('pages.about.clubs.clubCommunications')} />
            </li>
          </ul>
        </div>

        <div className="features-section">
          <h3>{t('pages.about.federationTitle')}</h3>
          <p className="section-intro">{t('pages.about.federationIntro')}</p>
          <ul className="features-list">
            <li>
              <FeatureItem emoji="🏆" label={t('pages.about.federations.tournamentManagement')} />
            </li>
            <li>
              <FeatureItem emoji="📋" label={t('pages.about.federations.applicationsWorkflow')} />
            </li>
            <li>
              <FeatureItem emoji="👥" label={t('pages.about.federations.patrols')} />
            </li>
            <li>
              <FeatureItem emoji="⭐" label={t('pages.about.federations.tournamentFeedback')} />
            </li>
            <li>
              <FeatureItem emoji="📣" label={t('pages.about.federations.communications')} />
            </li>
            <li>
              <FeatureItem emoji="🔗" label={t('pages.about.federations.federationMembership')} />
            </li>
            <li>
              <FeatureItem emoji="📜" label={t('pages.about.federations.referenceData')} />
            </li>
            <li>
              <FeatureItem emoji="⚙️" label={t('pages.about.federations.adminTools')} />
            </li>
          </ul>
        </div>

        <div className="features-section">
          <h3>{t('pages.about.plannedTitle')}</h3>
          <p className="section-intro">{t('pages.about.plannedIntro')}</p>
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
              <FeatureItem label={t('pages.about.planned.paperlessScoring')} />
            </li>
            <li>
              <FeatureItem label={t('pages.about.planned.calendar')} />
            </li>
            <li>
              <FeatureItem label={t('pages.about.planned.newsFeed')} />
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
