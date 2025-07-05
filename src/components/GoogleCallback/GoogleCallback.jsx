import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          setError('Google authentication failed');
          setTimeout(() => navigate('/signin'), 3000);
          return;
        }

        if (token) {
          localStorage.setItem('authToken', token);
          navigate('/profile');
        } else {
          navigate('/signin');
        }
      } catch (error) {
        setError('Authentication failed');
        setTimeout(() => navigate('/signin'), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, login]);

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
        <Typography variant="body2">
          Redirecting to sign in page...
        </Typography>
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
      <Typography variant="h6">
        Completing Google authentication...
      </Typography>
    </Box>
  );
};

export default GoogleCallback; 