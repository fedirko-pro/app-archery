'use client';

import { useTranslation } from 'react-i18next';

import { openConsentSettings } from './consent';
import { isConsentRequired } from './gtag';

interface CookieSettingsLinkProps {
  className?: string;
}

/** Re-opens the cookie banner. Renders nothing when no analytics is configured. */
export function CookieSettingsLink({ className }: CookieSettingsLinkProps) {
  const { t } = useTranslation('common');

  if (!isConsentRequired) {
    return null;
  }

  return (
    <button type="button" className={className} onClick={openConsentSettings}>
      {t('cookieConsent.settings')}
    </button>
  );
}
