import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import apiService from '../../services/api';
import { getDefaultAppLang } from '../../utils/i18n-lang';
import { resolvePostAuthPath } from '../../utils/post-auth-redirect';

const GoogleCallback = () => {
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
          setError('Google authentication failed');
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
        setError('Authentication failed');
        setTimeout(() => {
          window.location.href = signInPath;
        }, 3000);
      }
    };

    void handleGoogleCallback();
  }, [searchParams, signInPath]);

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
        <Typography variant="body2">Redirecting to sign in page...</Typography>
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
      <Typography variant="h6">Completing Google authentication...</Typography>
    </Box>
  );
};

export default GoogleCallback;
