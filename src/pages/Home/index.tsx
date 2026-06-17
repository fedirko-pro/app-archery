import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { format, isBefore, parseISO, startOfDay } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import LocalDataBanner from '../../components/LocalDataBanner/LocalDataBanner';
import StatCard from '../../components/StatCard/StatCard';
import { useAuth } from '../../contexts/auth-context';
import { useLocalData, type LocalTrainingSession } from '../../contexts/local-data-context';
import apiService from '../../services/api';
import type { TournamentApplicationDto } from '../../services/types';
import { computeLocalStats, getMostRecentSession } from '../../utils/training-stats';
import TrainingSessionForm from '../MyTrainings/TrainingSessionForm';

function isPastTournament(tournament: { endDate?: string; startDate: string }): boolean {
  const today = startOfDay(new Date());
  const tournamentEndDate = tournament.endDate
    ? parseISO(tournament.endDate)
    : parseISO(tournament.startDate);
  return isBefore(startOfDay(tournamentEndDate), today);
}

const HomePage: React.FC = () => {
  const { t } = useTranslation('common');
  const { isAuthenticated } = useAuth();
  const { trainingSessions, addTrainingSession } = useLocalData();
  const navigate = useNavigate();
  const { lang } = useParams();

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upcomingApps, setUpcomingApps] = useState<TournamentApplicationDto[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);

  const stats = useMemo(() => computeLocalStats(trainingSessions), [trainingSessions]);
  const lastSession = useMemo(() => getMostRecentSession(trainingSessions), [trainingSessions]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setAppsLoading(true);
    setAppsError(null);
    apiService
      .getMyApplications()
      .then((apps) => {
        const upcoming = apps
          .filter((app) => !isPastTournament(app.tournament))
          .sort(
            (a, b) =>
              parseISO(a.tournament.startDate).getTime() -
              parseISO(b.tournament.startDate).getTime(),
          );
        setUpcomingApps(upcoming);
      })
      .catch((err: Error) => setAppsError(err.message))
      .finally(() => setAppsLoading(false));
  }, [isAuthenticated]);

  const handleOpenAdd = () => setFormOpen(true);
  const handleClose = () => setFormOpen(false);

  const handleSubmit = async (
    data: Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
  ) => {
    setSubmitting(true);
    try {
      await addTrainingSession(data);
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const formatSessionDate = (dateStr: string): string => {
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTournamentDates = (startDate: string, endDate?: string): string => {
    try {
      const start = format(parseISO(startDate), 'dd MMM yyyy');
      if (!endDate || endDate === startDate) return start;
      return `${start} – ${format(parseISO(endDate), 'dd MMM yyyy')}`;
    } catch {
      return startDate;
    }
  };

  const fmt = (n: number): string => n.toLocaleString();

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('dashboard.title')}
      </Typography>

      <LocalDataBanner showSyncStatus />

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard label={t('dashboard.thisWeekArrows')} value={fmt(stats.shots.thisWeek)} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard
            label={t('dashboard.currentStreak')}
            value={fmt(stats.currentStreakWeeks)}
            subtitle={t('statistics.weeks')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ width: '100%' }}>
              <Button variant="contained" fullWidth startIcon={<AddIcon />} onClick={handleOpenAdd}>
                {t('dashboard.logTraining')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" fontWeight={600} color="text.secondary" sx={{ mt: 3, mb: 1 }}>
        {t('dashboard.lastSession')}
      </Typography>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          {lastSession ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <TrackChangesIcon color="primary" sx={{ mt: 0.25 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatSessionDate(lastSession.date)}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                  {lastSession.shotsCount !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      {t('trainings.shotsCount')}:{' '}
                      <Box component="span" fontWeight="bold">
                        {lastSession.shotsCount}
                      </Box>
                    </Typography>
                  )}
                  {lastSession.distance && (
                    <Typography variant="body2" color="text.secondary">
                      {t('trainings.distance')}:{' '}
                      <Box component="span" fontWeight="bold">
                        {Number.parseFloat(lastSession.distance).toFixed(1)}m
                      </Box>
                    </Typography>
                  )}
                  {lastSession.targetType && (
                    <Typography variant="body2" color="text.secondary">
                      {t('trainings.targetType')}:{' '}
                      <Box component="span" fontWeight="bold">
                        {lastSession.targetType}
                      </Box>
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  sx={{ mt: 1, px: 0 }}
                  onClick={() => navigate(`/${lang}/trainings`)}
                >
                  {t('dashboard.viewAllTrainings')}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography color="text.secondary" gutterBottom>
                {t('dashboard.noSessions')}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
              >
                {t('dashboard.logTraining')}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {isAuthenticated && (appsLoading || appsError || upcomingApps.length > 0) && (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
              {t('dashboard.upcomingTournaments')}
            </Typography>
            {upcomingApps.length > 0 && (
              <Button
                component={Link}
                to={`/${lang}/applications`}
                size="small"
                endIcon={<ChevronRightIcon />}
              >
                {t('dashboard.viewAllApplications')}
              </Button>
            )}
          </Box>

          {appsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t('pages.applications.fetchError')}
            </Alert>
          )}

          {appsLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {upcomingApps.slice(0, 3).map((app) => (
                <Card
                  key={app.id}
                  variant="outlined"
                  component={Link}
                  to={`/${lang}/tournaments/${app.tournament.id}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.2s',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {app.tournament.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTournamentDates(app.tournament.startDate, app.tournament.endDate)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {t(`pages.adminApplications.status.${app.status}`)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button component={Link} to={`/${lang}/statistics`} size="small">
          {t('dashboard.viewStatistics')}
        </Button>
      </Box>

      <Dialog open={formOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('trainings.add')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TrainingSessionForm
              onSubmit={handleSubmit}
              onCancel={handleClose}
              submitting={submitting}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default HomePage;
