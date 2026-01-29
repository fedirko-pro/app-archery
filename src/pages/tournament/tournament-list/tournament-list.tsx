import { Add, Edit, Delete, Send, Visibility } from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Alert,
  CircularProgress,
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../../../contexts/auth-context';
import defaultBanner from '../../../img/default_turnament_bg.png';
import apiService from '../../../services/api';
import type { TournamentDto, TournamentApplicationDto } from '../../../services/types';
import { formatDate } from '../../../utils/date-utils';

const TournamentList: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useParams();
  const { t } = useTranslation('common');
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [userApplications, setUserApplications] = useState<
    TournamentApplicationDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllTournaments();
      setTournaments(data);
    } catch (error) {
      setError(t('pages.tournaments.fetchError'));
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchUserApplications = useCallback(async () => {
    try {
      const data = await apiService.getMyApplications();
      setUserApplications(data);
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
    if (user) {
      fetchUserApplications();
    }
  }, [user, fetchTournaments, fetchUserApplications]);

  const hasApplicationForTournament = (tournamentId: string) => {
    return userApplications.some(
      (app: TournamentApplicationDto) => app.tournament.id === tournamentId,
    );
  };

  const getApplicationCountForTournament = (tournamentId: string) => {
    return userApplications.filter((app) => app.tournament.id === tournamentId)
      .length;
  };

  const handleDeleteTournament = async (id: string) => {
    if (window.confirm(t('pages.tournaments.deleteConfirm'))) {
      try {
        await apiService.deleteTournament(id);
        fetchTournaments();
      } catch (error: unknown) {
        setError(t('pages.tournaments.deleteError'));
        const err = error instanceof Error ? error : new Error(String(error));
        if (import.meta.env.DEV) {
          console.error('Error deleting tournament:', err.message);
        }
      }
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">{t('pages.tournaments.title')}</Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            to={`/${lang}/tournaments/create`}
            sx={{
              '& .MuiButton-startIcon': {
                margin: { xs: 0, sm: '0 8px 0 -4px' },
              },
              minWidth: { xs: 'auto', sm: '64px' },
              padding: { xs: '8px 12px', sm: '8px 16px' },
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: 'none', sm: 'inline' } }}
            >
              {t('pages.tournaments.create')}
            </Box>
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 3,
        }}
      >
        {tournaments.map((tournament) => (
          <Box key={tournament.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={tournament.banner || defaultBanner}
                alt={tournament.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {tournament.title}
                </Typography>
                {tournament.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {tournament.description}
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>{t('pages.tournaments.start')}:</strong> {formatDate(tournament.startDate)}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('pages.tournaments.end')}:</strong> {formatDate(tournament.endDate)}
                </Typography>
                {tournament.address && (
                  <Typography variant="body2">
                    <strong>{t('pages.tournaments.location')}:</strong> {tournament.address}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  <strong>{t('pages.tournaments.multipleApplications')}:</strong>{' '}
                  {tournament.allowMultipleApplications
                    ? t('pages.tournaments.multipleAllowed')
                    : t('pages.tournaments.multipleNotAllowed')}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    component={Link}
                    to={`/${lang}/tournaments/${tournament.id}`}
                  >
                    {t('pages.tournaments.viewDetails', 'View Details')}
                  </Button>
                  {hasApplicationForTournament(tournament.id) && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      component={Link}
                      to={`/${lang}/applications`}
                    >
                      {t('pages.tournaments.viewApplications')} (
                      {getApplicationCountForTournament(tournament.id)})
                    </Button>
                  )}
                  {(tournament.allowMultipleApplications ||
                    !hasApplicationForTournament(tournament.id)) && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Send />}
                        component={Link}
                        to={`/${lang}/apply/${tournament.id}`}
                      >
                        {t('pages.tournaments.apply')}
                      </Button>
                    )}
                  {user?.role === 'admin' && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        component={Link}
                        to={`/${lang}/tournaments/${tournament.id}/edit`}
                      >
                        {t('pages.tournaments.edit')}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteTournament(tournament.id)}
                      >
                        {t('pages.tournaments.delete')}
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TournamentList;
