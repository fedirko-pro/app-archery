import './InstallPrompt.scss';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { setInstallDismissed, usePWAInstall } from '../../hooks/usePwaInstall';

const InstallPrompt: React.FC = () => {
  const { t } = useTranslation('common');
  const { canInstall, isInstalled, dismissedRecently, prompt } = usePWAInstall();
  const [visible, setVisible] = useState(true);
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const accepted = await prompt();
      if (accepted) setVisible(false);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setInstallDismissed();
    setVisible(false);
  };

  const show = visible && canInstall && !isInstalled && !dismissedRecently;
  if (!show) return null;

  return (
    <div className="install-prompt" role="region" aria-label={t('pwa.installAria')}>
      <p className="install-prompt__text">{t('pwa.installPrompt')}</p>
      <div className="install-prompt__actions">
        <button
          type="button"
          className="install-prompt__btn install-prompt__btn--install"
          onClick={handleInstall}
          disabled={installing}
        >
          {installing ? t('pwa.installing') : t('pwa.install')}
        </button>
        <button
          type="button"
          className="install-prompt__btn install-prompt__btn--dismiss"
          onClick={handleDismiss}
        >
          {t('pwa.dismiss')}
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
