import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';
import type { TournamentDto } from '../../../services/types';
import { getDefaultAppLang, normalizeAppLang } from '../../../utils/i18n-lang';
import TournamentApplicationForm from '../tournament-application-form/tournament-application-form';

const PublicApplication: React.FC = () => {
  const { tournamentId, lang } = useParams<{ tournamentId: string; lang?: string }>();
  const navigate = useNavigate();
  const appLang = normalizeAppLang(lang || getDefaultAppLang());
  const { t } = useTranslation('common');

  const { user, loading: authLoading } = useAuth();

  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
    }
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTournament(tournamentId!);
      setTournament(data);
    } catch (error) {
      setError(t('pages.publicApplication.notFound'));
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    const pendingData = {
      tournamentId,
      redirectTo: `/apply/${tournamentId}`,
    };
    sessionStorage.setItem('pendingApplication', JSON.stringify(pendingData));
    navigate('/signup');
  };

  const handleSignIn = () => {
    const pendingData = {
      tournamentId,
      redirectTo: `/apply/${tournamentId}`,
    };
    sessionStorage.setItem('pendingApplication', JSON.stringify(pendingData));

    navigate('/signin', {
      state: { fromApplication: true, tournamentId, pendingData },
    });
  };

  const handleApplicationSuccess = () => {
    sessionStorage.removeItem('pendingApplication');
    navigate(`/${appLang}/applications`, {
      state: { message: t('pages.publicApplication.applicationSubmitted') },
    });
  };

  if (authLoading || loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tournament) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">{error || t('pages.publicApplication.notFound')}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate(-1)}
        >
          {t('common.back')}
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {t('pages.publicApplication.applyFor', { title: tournament.title })}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('pages.publicApplication.signInPrompt')}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSignUp}
              >
                {t('auth.signUp')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleSignIn}
              >
                {t('auth.signIn')}
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('pages.publicApplication.redirectInfo')}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <TournamentApplicationForm
        tournamentId={tournamentId!}
        tournamentTitle={tournament.title}
        tournamentRuleCode={tournament.ruleCode}
        onSuccess={handleApplicationSuccess}
        onCancel={() => navigate(`/${appLang}/tournaments`)}
      />
    </Box>
  );
};

export default PublicApplication;
