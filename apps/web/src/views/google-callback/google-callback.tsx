import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import apiService from '../../services/api';
import { getDefaultAppLang } from '../../utils/i18n-lang';
import { resolvePostAuthPath } from '../../utils/post-auth-redirect';

const GoogleCallback = () => {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const signInPath = `/${getDefaultAppLang()}/signin`;

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const authError = searchParams.get('error');

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
        window.location.href = resolvePostAuthPath(getDefaultAppLang(), userData);
      } catch {
        setError(t('auth.googleAuthFailed'));
        setTimeout(() => {
          window.location.href = signInPath;
        }, 3000);
      }
    };

    void handleGoogleCallback();
  }, [searchParams, signInPath, t]);

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
};

export default GoogleCallback;
