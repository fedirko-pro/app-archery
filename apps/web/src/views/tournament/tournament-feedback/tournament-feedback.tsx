import { ArrowBack, Send, Star } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Rating,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import apiService from '../../../services/api';
import type { TournamentDto } from '../../../services/types';
import { isTournamentFeedbackWindowOpen } from '../../../utils/tournament-feedback-utils';

const TournamentFeedback: React.FC = () => {
  const { tournamentId, lang } = useParams<{ tournamentId: string; lang: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [notAvailableReason, setNotAvailableReason] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!tournamentId) return;
      try {
        setLoading(true);
        const [tournamentData, existing] = await Promise.all([
          apiService.getTournament(tournamentId),
          apiService.getMyTournamentFeedback(tournamentId),
        ]);
        setTournament(tournamentData);
        if (existing) {
          setSubmitted(true);
          setRating(existing.rating);
          setComment(existing.comment ?? '');
          return;
        }

        if (!tournamentData.collectFeedback) {
          setNotAvailableReason(t('pages.tournaments.feedback.notCollecting'));
          return;
        }

        if (!isTournamentFeedbackWindowOpen(tournamentData)) {
          setNotAvailableReason(t('pages.tournaments.feedback.notYetAvailable'));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t('pages.tournaments.feedback.loadError'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tournamentId, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournamentId || !rating || rating < 1) {
      setError(t('pages.tournaments.feedback.ratingRequired'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await apiService.submitTournamentFeedback({
        tournamentId,
        rating,
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('pages.tournaments.feedback.submitError'));
    } finally {
      setSubmitting(false);
    }
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
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">{t('pages.tournaments.notFound')}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/${lang}/tournaments`)}
          sx={{ mt: 2 }}
        >
          {t('pages.tournaments.backToList')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/${lang}/tournaments/${tournamentId}`)}
        sx={{ mb: 2 }}
      >
        {t('pages.tournaments.backToList')}
      </Button>

      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {submitted
              ? t('pages.tournaments.feedback.thankYouTitle')
              : t('pages.tournaments.feedback.title', { title: tournament.title })}
          </Typography>

          {!submitted && !notAvailableReason && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('pages.tournaments.feedback.subtitle')}
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {notAvailableReason && !submitted && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {notAvailableReason}
            </Alert>
          )}

          {submitted ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating value={rating} readOnly icon={<Star fontSize="inherit" />} />
              </Box>
              {comment && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {comment}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('pages.tournaments.feedback.thankYouMessage')}
              </Typography>
              <Button component={Link} to={`/${lang}`} variant="contained">
                {t('pages.tournaments.feedback.backToHome')}
              </Button>
            </Box>
          ) : notAvailableReason ? (
            <Button
              variant="contained"
              onClick={() => navigate(`/${lang}/tournaments/${tournamentId}`)}
              sx={{ mt: 2 }}
            >
              {t('pages.tournaments.backToList')}
            </Button>
          ) : (
            <Box component="form" onSubmit={(e) => void handleSubmit(e)}>
              <Typography component="legend" variant="subtitle2" sx={{ mb: 1 }}>
                {t('pages.tournaments.feedback.ratingLabel')}
              </Typography>
              <Rating
                value={rating}
                onChange={(_, value) => setRating(value)}
                size="large"
                icon={<Star fontSize="inherit" />}
              />

              <TextField
                label={t('pages.tournaments.feedback.commentLabel')}
                placeholder={t('pages.tournaments.feedback.commentPlaceholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                inputProps={{ maxLength: 2000 }}
                helperText={t('pages.tournaments.feedback.commentHelper')}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Send />}
                disabled={submitting || !rating}
                sx={{ mt: 2 }}
              >
                {submitting
                  ? t('pages.tournaments.feedback.submitting')
                  : t('pages.tournaments.feedback.submit')}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TournamentFeedback;
