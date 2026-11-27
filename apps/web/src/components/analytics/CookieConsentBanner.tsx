'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiLink from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { type KeyboardEvent, useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useAthleteTabBarVisible } from '../../hooks/use-athlete-tab-bar-visible';
import { useCurrentLang } from '../../hooks/use-current-lang';
import { closeConsentSettings } from './consent';
import { isConsentRequired, setAnalyticsConsent } from './gtag';
import { useConsentSettingsOpen, useConsentState } from './useCookieConsent';

const TAB_BAR_HEIGHT = '56px';

export function CookieConsentBanner() {
  const { t } = useTranslation('common');
  const lang = useCurrentLang();
  const tabBarVisible = useAthleteTabBarVisible();
  const consent = useConsentState();
  const settingsOpen = useConsentSettingsOpen();
  const titleId = useId();
  const textId = useId();
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  const visible = isConsentRequired && consent !== null && (consent === 'unknown' || settingsOpen);

  useEffect(() => {
    if (visible && settingsOpen) {
      firstButtonRef.current?.focus();
    }
  }, [visible, settingsOpen]);

  if (!visible) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && settingsOpen && consent !== 'unknown') {
      closeConsentSettings();
    }
  };

  const bottomOffset = tabBarVisible
    ? `calc(${TAB_BAR_HEIGHT} + env(safe-area-inset-bottom, 0px) + 8px)`
    : 'calc(env(safe-area-inset-bottom, 0px) + 16px)';

  return (
    <Paper
      component="section"
      role="region"
      aria-labelledby={titleId}
      aria-describedby={textId}
      elevation={6}
      onKeyDown={handleKeyDown}
      className="cookie-consent"
      sx={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: bottomOffset,
        zIndex: (theme) => theme.zIndex.snackbar - 1,
        maxWidth: 560,
        mx: 'auto',
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography id={titleId} component="h2" variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
        {t('cookieConsent.title')}
      </Typography>
      <Typography id={textId} variant="body2" color="text.secondary">
        {t('cookieConsent.message')}{' '}
        <MuiLink component={Link} to={`/${lang}/privacy`} underline="always">
          {t('cookieConsent.privacyLink')}
        </MuiLink>
      </Typography>
      {settingsOpen && consent !== 'unknown' && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {consent === 'granted'
            ? t('cookieConsent.currentGranted')
            : t('cookieConsent.currentDenied')}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          mt: 1.5,
        }}
      >
        <Button
          ref={firstButtonRef}
          variant="contained"
          color="primary"
          onClick={() => setAnalyticsConsent('denied')}
        >
          {t('cookieConsent.reject')}
        </Button>
        <Button variant="contained" color="primary" onClick={() => setAnalyticsConsent('granted')}>
          {t('cookieConsent.accept')}
        </Button>
      </Box>
    </Paper>
  );
}
