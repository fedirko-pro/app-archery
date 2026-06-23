import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import { getDefaultAppLang } from '../../utils/i18n-lang';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleGoogleAuth } = useAuth();
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
        const token = searchParams.get('token');
        const authError = searchParams.get('error');

        if (authError) {
          setError('Google authentication failed');
          setTimeout(() => {
            window.location.href = signInPath;
          }, 3000);
          return;
        }

        if (token) {
          localStorage.setItem('authToken', token);
        }

        // Proceed regardless of token to support cookie-based auth
        await handleGoogleAuth();
      } catch {
        setError('Authentication failed');
        setTimeout(() => {
          window.location.href = signInPath;
        }, 3000);
      }
    };

    void handleGoogleCallback();
  }, [handleGoogleAuth, searchParams, signInPath]);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
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
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="h6">Completing Google authentication...</Typography>
    </Box>
  );
};

export default GoogleCallback;
