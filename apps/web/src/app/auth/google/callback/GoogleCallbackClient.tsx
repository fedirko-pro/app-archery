'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClientOnly } from '@/components/ClientOnly/ClientOnly';
import apiService from '@/services/api';
import { getDefaultAppLang } from '@/utils/i18n-lang';
import { resolvePostAuthPath } from '@/utils/post-auth-redirect';

export default function GoogleCallbackClient() {
  return (
    <ClientOnly>
      <GoogleCallbackInner />
    </ClientOnly>
  );
}

function GoogleCallbackInner() {
  const { t } = useTranslation('common');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lang = getDefaultAppLang();
    const signInPath = `/${lang}/signin`;

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const authError = params.get('error');

        if (authError) {
          setError(t('auth.googleFailed'));
          setTimeout(() => {
            window.location.href = signInPath;
          }, 3000);
          return;
        }

        if (!code) {
          window.location.href = signInPath;
          return;
        }

        await apiService.exchangeOAuthCode(code);
        const userData = await apiService.getProfile();
        window.location.href = resolvePostAuthPath(lang, userData);
      } catch {
        setError(t('auth.googleAuthFailed'));
        setTimeout(() => {
          window.location.href = `/${getDefaultAppLang()}/signin`;
        }, 3000);
      }
    };

    void run();
  }, [t]);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100dvh"
        gap={2}
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Typography variant="body2">{t('auth.googleRedirecting')}</Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100dvh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="h6">{t('auth.googleCompleting')}</Typography>
    </Box>
  );
}
