import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (isProcessing) {
        return;
      }

      setIsProcessing(true);

      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          setError('Google authentication failed');
          setTimeout(() => (window.location.href = '/signin'), 3000);
          return;
        }

        if (token) {
          localStorage.setItem('authToken', token);
          await handleGoogleAuth();
        } else {
          window.location.href = '/signin';
        }
      } catch {
        setError('Authentication failed');
        setTimeout(() => (window.location.href = '/signin'), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, handleGoogleAuth, isProcessing]);

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
