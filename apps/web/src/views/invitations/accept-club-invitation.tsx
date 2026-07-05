import { Box, Button, CircularProgress, Typography, Alert } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import apiService from '../../services/api';

const AcceptClubInvitation: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang, token } = useParams<{ lang: string; token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(t('invitations.invalidToken', 'Invalid invitation link'));
      setLoading(false);
      return;
    }

    const accept = async () => {
      try {
        await apiService.acceptClubInvitation(token);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('invitations.acceptError', 'Failed to accept invitation'),
        );
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      void accept();
    } else {
      setLoading(false);
    }
  }, [token, isAuthenticated, t]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {t('invitations.loginRequired', 'Login Required')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t('invitations.loginToAccept', 'Please sign in to accept this club invitation.')}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(`/${lang}/signin`, { state: { from: window.location.pathname } })}
        >
          {t('auth.signIn', 'Sign In')}
        </Button>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
      <Alert severity="success" sx={{ mb: 2 }}>
        {t('invitations.accepted', 'You have joined the club!')}
      </Alert>
      <Button variant="contained" onClick={() => navigate(`/${lang}/profile`)}>
        {t('invitations.goToProfile', 'Go to Profile')}
      </Button>
    </Box>
  );
};

export default AcceptClubInvitation;
