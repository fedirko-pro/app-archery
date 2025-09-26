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
import { useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';
import TournamentApplicationForm from '../tournament-application-form/tournament-application-form';

const PublicApplication: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [tournament, setTournament] = useState<any>(null);
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
      setError('Tournament not found');
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
    navigate('/applications', {
      state: { message: 'Application submitted successfully!' },
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
        <Alert severity="error">{error || 'Tournament not found'}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/tournaments')}
        >
          Back to Tournaments
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
              Apply for {tournament.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              To submit your application for this tournament, you need to create
              an account or sign in to your existing account.
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
                Create Account
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              After registration or sign in, you'll be redirected back to this
              application form.
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
        onSuccess={handleApplicationSuccess}
        onCancel={() => navigate('/tournaments')}
      />
    </Box>
  );
};

export default PublicApplication;
