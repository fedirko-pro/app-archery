import './AppStatusBar.scss';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { setInstallDismissed, usePWAInstall } from '../../hooks/usePwaInstall';

const IOS_A2HS_DISMISS_KEY = 'pwa-ios-a2hs-dismissed';
const IOS_A2HS_DISMISS_DAYS = 7;

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isWebkit = /WebKit/.test(ua);
  const isChromeOrFirefox = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIOS && isWebkit && !isChromeOrFirefox;
}

function wasIosTipDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(IOS_A2HS_DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (Number.isNaN(ts)) return false;
    const days = (Date.now() - ts) / (24 * 60 * 60 * 1000);
    return days < IOS_A2HS_DISMISS_DAYS;
  } catch {
    return false;
  }
}

function setIosTipDismissed(): void {
  try {
    localStorage.setItem(IOS_A2HS_DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/**
 * Single global status strip: offline takes priority, then install / iOS A2HS tip.
 * Renders nothing until mounted to avoid SSR/client hydration mismatches
 * (navigator, localStorage, standalone display-mode).
 */
const AppStatusBar: React.FC = () => {
  const { t } = useTranslation('common');
  const { canInstall, isInstalled, dismissedRecently, prompt } = usePWAInstall();
  const [mounted, setMounted] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [installVisible, setInstallVisible] = useState(true);
  const [iosTipVisible, setIosTipVisible] = useState(true);
  const [showIosTip, setShowIosTip] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOffline(!navigator.onLine);
    setShowIosTip(isIosSafari() && !wasIosTipDismissedRecently());

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Match SSR: render nothing until after mount.
  if (!mounted) {
    return null;
  }

  if (isOffline) {
    return (
      <div className="app-status-bar app-status-bar--offline" role="status" aria-live="polite">
        {t('pwa.workingOffline')}
      </div>
    );
  }

  const showInstall = installVisible && canInstall && !isInstalled && !dismissedRecently;

  if (showInstall) {
    const handleInstall = async () => {
      setInstalling(true);
      try {
        const accepted = await prompt();
        if (accepted) setInstallVisible(false);
      } finally {
        setInstalling(false);
      }
    };

    const handleDismiss = () => {
      setInstallDismissed();
      setInstallVisible(false);
    };

    return (
      <div
        className="app-status-bar app-status-bar--install"
        role="region"
        aria-label={t('pwa.installAria')}
      >
        <p className="app-status-bar__text">{t('pwa.installPrompt')}</p>
        <div className="app-status-bar__actions">
          <button
            type="button"
            className="app-status-bar__btn app-status-bar__btn--primary"
            onClick={() => void handleInstall()}
            disabled={installing}
          >
            {installing ? t('pwa.installing') : t('pwa.install')}
          </button>
          <button
            type="button"
            className="app-status-bar__btn app-status-bar__btn--dismiss"
            onClick={handleDismiss}
          >
            {t('pwa.dismiss')}
          </button>
        </div>
      </div>
    );
  }

  if (iosTipVisible && !isInstalled && !canInstall && showIosTip) {
    return (
      <div
        className="app-status-bar app-status-bar--install"
        role="region"
        aria-label={t('pwa.iosInstallAria')}
      >
        <p className="app-status-bar__text">{t('pwa.iosInstallPrompt')}</p>
        <div className="app-status-bar__actions">
          <button
            type="button"
            className="app-status-bar__btn app-status-bar__btn--dismiss"
            onClick={() => {
              setIosTipDismissed();
              setIosTipVisible(false);
            }}
          >
            {t('pwa.dismiss')}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AppStatusBar;
