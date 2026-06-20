import AddIcon from '@mui/icons-material/Add';
import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
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
import {
  dismissBowSetupPrompt,
  getEquipmentSetName,
  isBowSetupPromptDismissed,
} from '../../utils/equipment-utils';
import { getSessionCardTint } from '../../utils/session-card-tints';
import {
  computeLocalStats,
  getLastLoggedSession,
  getRecentTrainingSessions,
  toSessionFormDefaults,
} from '../../utils/training-stats';
import TrainingSessionDialog from '../MyTrainings/TrainingSessionDialog';

function isPastTournament(tournament: { endDate?: string; startDate: string }): boolean {
  const today = startOfDay(new Date());
  const tournamentEndDate = tournament.endDate
    ? parseISO(tournament.endDate)
    : parseISO(tournament.startDate);
  return isBefore(startOfDay(tournamentEndDate), today);
}

const HomePage: React.FC = () => {
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const { trainingSessions, equipmentSets, addTrainingSession, defaultEquipmentSetId } =
    useLocalData();
  const theme = useTheme();
  const navigate = useNavigate();
  const { lang } = useParams();

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [formInitial, setFormInitial] = useState<Partial<LocalTrainingSession> | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [upcomingApps, setUpcomingApps] = useState<TournamentApplicationDto[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [bowPromptDismissTick, setBowPromptDismissTick] = useState(0);

  const showBowSetupPrompt = useMemo(
    () =>
      equipmentSets.length === 0 && !isBowSetupPromptDismissed() && !user?.onboardingCompletedAt,
    [equipmentSets.length, bowPromptDismissTick, user?.onboardingCompletedAt],
  );

  const stats = useMemo(
    () => computeLocalStats(trainingSessions, equipmentSets),
    [trainingSessions, equipmentSets],
  );
  const recentSessions = useMemo(
    () => getRecentTrainingSessions(trainingSessions, 3),
    [trainingSessions],
  );
  const lastLogged = useMemo(() => getLastLoggedSession(trainingSessions), [trainingSessions]);

  const sessionDefaults = useMemo(
    () =>
      lastLogged
        ? toSessionFormDefaults(lastLogged, defaultEquipmentSetId)
        : defaultEquipmentSetId
          ? { equipmentSetId: defaultEquipmentSetId }
          : undefined,
    [lastLogged, defaultEquipmentSetId],
  );

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

  const openForm = (initial?: Partial<LocalTrainingSession>) => {
    setFormInitial(initial);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const handleOpenAdd = () => openForm(sessionDefaults);
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

  const formatSessionDateTime = (session: LocalTrainingSession): string => {
    try {
      const datePart = format(parseISO(session.date), 'dd MMM yyyy');
      const timePart = format(parseISO(session.createdAt), 'HH:mm');
      return `${datePart}, ${timePart}`;
    } catch {
      return session.date;
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

  const handleDismissBowPrompt = () => {
    dismissBowSetupPrompt();
    setBowPromptDismissTick((t) => t + 1);
  };

  const fmt = (n: number): string => n.toLocaleString();

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('dashboard.title')}
      </Typography>

      <LocalDataBanner showSyncStatus />

      {showBowSetupPrompt && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 2,
            mb: 1,
            border: `1px solid ${theme.palette.primary.light}`,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.50',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <ArchitectureOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('dashboard.bowSetupPrompt.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.bowSetupPrompt.subtitle')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained" size="small" onClick={handleOpenAdd}>
              {t('dashboard.bowSetupPrompt.logSession')}
            </Button>
            <Button variant="text" size="small" onClick={handleDismissBowPrompt}>
              {t('dashboard.bowSetupPrompt.dismiss')}
            </Button>
          </Box>
        </Paper>
      )}

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
                {t('dashboard.logTodaysSession')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 3,
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
          {t('dashboard.recentSessions')}
        </Typography>
        {recentSessions.length > 0 && (
          <Button size="small" sx={{ px: 0 }} onClick={() => navigate(`/${lang}/trainings`)}>
            {t('dashboard.viewAllTrainings')}
          </Button>
        )}
      </Box>

      {recentSessions.length === 0 ? (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
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
                {t('dashboard.logTodaysSession')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          {recentSessions.map((session, index) => {
            const tint = getSessionCardTint(theme, index);
            return (
              <Card
                key={session.id}
                variant="outlined"
                sx={{ bgcolor: tint.bgcolor, borderColor: tint.borderColor }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <TrackChangesIcon color="primary" sx={{ mt: 0.25, fontSize: 20 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {formatSessionDateTime(session)}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                        {session.shotsCount !== undefined && (
                          <Typography variant="body2" color="text.secondary">
                            {t('trainings.shotsCount')}:{' '}
                            <Box component="span" fontWeight="bold">
                              {session.shotsCount}
                            </Box>
                          </Typography>
                        )}
                        {session.distance && (
                          <Typography variant="body2" color="text.secondary">
                            {t('trainings.distance')}:{' '}
                            <Box component="span" fontWeight="bold">
                              {Number.parseFloat(session.distance).toFixed(1)}m
                            </Box>
                          </Typography>
                        )}
                        {session.targetType && (
                          <Typography variant="body2" color="text.secondary">
                            {t('trainings.targetType')}:{' '}
                            <Box component="span" fontWeight="bold">
                              {session.targetType}
                            </Box>
                          </Typography>
                        )}
                        {session.equipmentSetId && (
                          <Typography variant="body2" color="text.secondary">
                            {t('trainings.equipmentSet')}:{' '}
                            <Box component="span" fontWeight="bold">
                              {getEquipmentSetName(session.equipmentSetId, equipmentSets) ??
                                session.equipmentSetId}
                            </Box>
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t('dashboard.sameAsLastTime')}
          </Button>
        </Box>
      )}

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

      <TrainingSessionDialog
        open={formOpen}
        onClose={handleClose}
        title={t('trainings.add')}
        initial={formInitial}
        formKey={formKey}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </Box>
  );
};

export default HomePage;
