import { ArrowBack, Star } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { canEditTournament } from '../../../config/roles';
import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';
import type { TournamentDto, TournamentFeedbackListDto } from '../../../services/types';
import { formatDate } from '../../../utils/date-utils';

const TournamentFeedbackAdmin: React.FC = () => {
  const { tournamentId, lang } = useParams<{ tournamentId: string; lang: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation('common');

  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [feedback, setFeedback] = useState<TournamentFeedbackListDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!tournamentId) return;
      try {
        setLoading(true);
        const tournamentData = await apiService.getTournament(tournamentId);
        setTournament(tournamentData);

        if (user && canEditTournament(user.role, tournamentData.createdBy?.id ?? '', user.id)) {
          const feedbackData = await apiService.getTournamentFeedback(tournamentId);
          setFeedback(feedbackData);
        } else {
          setError(t('pages.tournaments.feedback.admin.noPermission'));
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : t('pages.tournaments.feedback.admin.loadError'),
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tournamentId, user, t]);

  const formatUserName = (firstName?: string, lastName?: string, email?: string): string => {
    const name = `${firstName ?? ''} ${lastName ?? ''}`.trim();
    return name || email || t('pages.tournaments.feedback.admin.unknownUser');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!tournament) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t('pages.tournaments.notFound')}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/${lang}/tournaments/${tournamentId}`)}
        sx={{ mb: 2 }}
      >
        {t('pages.tournaments.backToList')}
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('pages.tournaments.feedback.admin.title', { title: tournament.title })}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {feedback && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {t('pages.tournaments.feedback.admin.averageRating')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="h4" fontWeight={700}>
                      {feedback.summary.averageRating !== null
                        ? feedback.summary.averageRating.toFixed(1)
                        : '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / 5
                    </Typography>
                    {feedback.summary.averageRating !== null && (
                      <Rating
                        value={feedback.summary.averageRating}
                        readOnly
                        precision={0.1}
                        icon={<Star fontSize="inherit" />}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {t('pages.tournaments.feedback.admin.totalFeedbacks')}
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                    {feedback.summary.totalCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {feedback.items.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {t('pages.tournaments.feedback.admin.empty')}
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('pages.tournaments.feedback.admin.participant')}</TableCell>
                    <TableCell>{t('pages.tournaments.feedback.admin.rating')}</TableCell>
                    <TableCell>{t('pages.tournaments.feedback.admin.comment')}</TableCell>
                    <TableCell>{t('pages.tournaments.feedback.admin.date')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedback.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {formatUserName(item.user.firstName, item.user.lastName, item.user.email)}
                      </TableCell>
                      <TableCell>
                        <Rating
                          value={item.rating}
                          readOnly
                          size="small"
                          icon={<Star fontSize="inherit" />}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>{item.comment || '—'}</TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
};

export default TournamentFeedbackAdmin;
