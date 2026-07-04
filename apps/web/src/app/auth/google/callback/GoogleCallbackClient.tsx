'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { ClientOnly } from '@/components/ClientOnly/ClientOnly';
import apiService from '@/services/api';
import { getDefaultAppLang } from '@/utils/i18n-lang';
import { needsOnboarding } from '@/utils/onboarding-utils';

export default function GoogleCallbackClient() {
  return (
    <ClientOnly>
      <GoogleCallbackInner />
    </ClientOnly>
  );
}

function GoogleCallbackInner() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lang = getDefaultAppLang();
    const signInPath = `/${lang}/signin`;

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const authError = params.get('error');

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

        if (!apiService.isAuthenticated()) {
          window.location.href = signInPath;
          return;
        }

        const userData = await apiService.getProfile();

        if (needsOnboarding(userData)) {
          window.location.href = `/${lang}/onboarding`;
          return;
        }

        if (userData.role === 'general_admin' || userData.role === 'federation_admin') {
          window.location.href = `/${lang}/tournaments`;
          return;
        }

        window.location.href = `/${lang}/home`;
      } catch {
        setError('Authentication failed');
        setTimeout(() => {
          window.location.href = `/${getDefaultAppLang()}/signin`;
        }, 3000);
      }
    };

    void run();
  }, []);

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
}
