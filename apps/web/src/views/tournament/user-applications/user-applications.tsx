import { Delete, Visibility } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';

import apiService from '../../../services/api';
import type { TournamentApplicationDto, TournamentDto } from '../../../services/types';
import { formatDate } from '../../../utils/date-utils';
import { resolveTournamentBanner } from '../../../utils/placeholder-images';

const UserApplications: React.FC = () => {
  const location = useLocation();
  const { lang } = useParams();
  const { t } = useTranslation('common');
  const [applications, setApplications] = useState<TournamentApplicationDto[]>([]);
  const [tournamentsById, setTournamentsById] = useState<Map<string, TournamentDto>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.message || null,
  );
  const [withdrawDialog, setWithdrawDialog] = useState<{
    open: boolean;
    applicationId: string | null;
    reason: string;
  }>({ open: false, applicationId: null, reason: '' });

  useEffect(() => {
    void fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const [apps, tournaments] = await Promise.all([
        apiService.getMyApplications(),
        apiService.getAllTournaments().catch(() => [] as TournamentDto[]),
      ]);
      setApplications(apps);
      setTournamentsById(new Map(tournaments.map((tournament) => [tournament.id, tournament])));
    } catch (err) {
      setError(t('pages.applications.fetchError'));
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedApplications = useMemo(
    () =>
      [...applications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [applications],
  );

  const handleWithdraw = async () => {
    if (!withdrawDialog.applicationId) return;
    const reason = withdrawDialog.reason.trim();
    if (!reason) {
      setError(t('pages.applications.withdrawReasonRequired', 'A withdrawal reason is required'));
      return;
    }

    try {
      await apiService.withdrawApplication(withdrawDialog.applicationId, reason);
      setWithdrawDialog({ open: false, applicationId: null, reason: '' });
      void fetchApplications();
    } catch (err) {
      setError(t('pages.applications.withdrawFailed', 'Failed to withdraw application'));
      console.error('Error withdrawing application:', err);
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'default' | 'warning' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'withdrawn':
        return 'default';
      default:
        return 'warning';
    }
  };

  const categoryLabel = (application: TournamentApplicationDto) => {
    if (application.bowCategory && typeof application.bowCategory === 'object') {
      return application.bowCategory.name;
    }
    return application.category;
  };

  const divisionLabel = (application: TournamentApplicationDto) => {
    if (!application.division) return null;
    return typeof application.division === 'object'
      ? application.division.name
      : application.division;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('pages.applications.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {sortedApplications.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {t('pages.applications.empty')}
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to={`/${lang}/tournaments`}
                sx={{ mt: 1.5 }}
              >
                {t('pages.applications.findNextTournament')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          {sortedApplications.map((application) => {
            const full = tournamentsById.get(application.tournament.id);
            const banner = resolveTournamentBanner(full?.banner);
            const address = full?.address;
            const ruleLabel = full?.rule?.ruleName || full?.ruleCode;
            const category = categoryLabel(application);
            const division = divisionLabel(application);

            return (
              <Card key={application.id}>
                <CardMedia
                  component="img"
                  height="140"
                  image={banner}
                  alt={application.tournament.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component={Link}
                      to={`/${lang}/tournaments/${application.tournament.id}`}
                      sx={{
                        color: 'inherit',
                        textDecoration: 'none',
                        minWidth: 0,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {application.tournament.title}
                    </Typography>
                    <Chip
                      label={t(`pages.adminApplications.status.${application.status}`)}
                      color={getStatusColor(application.status)}
                      size="small"
                      sx={{ flexShrink: 0 }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>{t('pages.tournaments.rules', 'Rules')}:</strong>{' '}
                    {ruleLabel ? (
                      ruleLabel
                    ) : (
                      <em style={{ color: 'var(--text-disabled)' }}>
                        {t('pages.tournaments.noRulesAssigned', 'Not specified')}
                      </em>
                    )}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t('pages.tournaments.start')}:</strong>{' '}
                    {formatDate(application.tournament.startDate)}
                  </Typography>
                  {address && (
                    <Typography variant="body2">
                      <strong>{t('pages.tournaments.location')}:</strong> {address}
                    </Typography>
                  )}
                  {category && (
                    <Typography variant="body2">
                      <strong>{t('pages.applications.category')}:</strong> {category}
                      {division ? ` · ${division}` : ''}
                    </Typography>
                  )}
                  {!category && division && (
                    <Typography variant="body2">
                      <strong>{t('pages.applications.division')}:</strong> {division}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <strong>{t('pages.applications.appliedOn')}:</strong>{' '}
                    {formatDate(application.createdAt)}
                  </Typography>

                  {application.rejectionReason && (
                    <Alert
                      severity={application.status === 'withdrawn' ? 'warning' : 'error'}
                      sx={{ mt: 1.5 }}
                    >
                      <strong>
                        {application.status === 'withdrawn'
                          ? t('pages.applications.withdrawReason', 'Withdrawal reason')
                          : t('pages.applications.rejectionReason')}
                        :{' '}
                      </strong>
                      {application.rejectionReason}
                    </Alert>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      component={Link}
                      to={`/${lang}/tournaments/${application.tournament.id}`}
                      sx={{ flex: '1 1 calc(50% - 4px)', minWidth: 0, justifyContent: 'center' }}
                    >
                      {t('pages.tournaments.viewDetails', 'View Details')}
                    </Button>
                    {application.status === 'pending' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() =>
                          setWithdrawDialog({
                            open: true,
                            applicationId: application.id,
                            reason: '',
                          })
                        }
                        sx={{ flex: '1 1 calc(50% - 4px)', minWidth: 0, justifyContent: 'center' }}
                      >
                        {t('pages.applications.withdraw')}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Dialog
        open={withdrawDialog.open}
        onClose={() => setWithdrawDialog({ open: false, applicationId: null, reason: '' })}
      >
        <DialogTitle>{t('pages.applications.withdrawTitle')}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>{t('pages.applications.withdrawConfirm')}</Typography>
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label={t('pages.applications.withdrawReason', 'Withdrawal reason')}
            value={withdrawDialog.reason}
            onChange={(e) =>
              setWithdrawDialog((prev) => ({
                ...prev,
                reason: e.target.value,
              }))
            }
            placeholder={t(
              'pages.applications.withdrawReasonPlaceholder',
              'Please provide a reason for withdrawing...',
            )}
            error={!withdrawDialog.reason.trim()}
            helperText={
              !withdrawDialog.reason.trim()
                ? t('pages.applications.withdrawReasonRequired', 'A withdrawal reason is required')
                : undefined
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setWithdrawDialog({ open: false, applicationId: null, reason: '' })}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => void handleWithdraw()}
            color="error"
            variant="contained"
            disabled={!withdrawDialog.reason.trim()}
          >
            {t('pages.applications.withdraw')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserApplications;
