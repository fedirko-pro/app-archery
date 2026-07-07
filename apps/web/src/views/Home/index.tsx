import AddIcon from '@mui/icons-material/Add';
import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import AchievementMedallion from '../../components/achievements/AchievementMedallion';
import LocalDataBanner from '../../components/LocalDataBanner/LocalDataBanner';
import LocalSyncChip from '../../components/LocalSyncChip/LocalSyncChip';
import StatCard from '../../components/StatCard/StatCard';
import { useAuth } from '../../contexts/auth-context';
import { useLocalData, type LocalTrainingSession } from '../../contexts/local-data-context';
import { useAchievements } from '../../hooks/use-achievements';
import apiService from '../../services/api';
import type {
  ApplicationStatus,
  PendingTournamentFeedbackDto,
  TournamentApplicationDto,
  TournamentDto,
} from '../../services/types';
import { resolveDefaultCountryCode } from '../../utils/country-default';
import {
  dismissBowSetupPrompt,
  getEquipmentSetName,
  isBowSetupPromptDismissed,
} from '../../utils/equipment-utils';
import {
  dismissMonthlySummary,
  dismissStreakAtRisk,
  isMonthlySummaryDismissed,
  isMonthlySummaryWindow,
  isStreakAtRiskDismissed,
} from '../../utils/re-engagement-utils';
import { getSessionCardTint } from '../../utils/session-card-tints';
import {
  dismissTournamentFeedback,
  isTournamentFeedbackDismissed,
} from '../../utils/tournament-feedback-utils';
import {
  buildWeekSetFromSessions,
  computeLocalStats,
  computePriorMonthSummary,
  getLastLoggedSession,
  getRecentTrainingSessions,
  getStreakAtRiskState,
  toSessionFormDefaults,
} from '../../utils/training-stats';

interface MergedTournamentCard {
  tournament: TournamentDto;
  applicationStatus?: ApplicationStatus;
}

const HomePage: React.FC = () => {
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const { trainingSessions, equipmentSets, startTrainingSession, defaultEquipmentSetId } =
    useLocalData();
  const theme = useTheme();
  const navigate = useNavigate();
  const { lang } = useParams();

  const [submitting, setSubmitting] = useState(false);
  const [mergedTournaments, setMergedTournaments] = useState<MergedTournamentCard[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [tournamentsError, setTournamentsError] = useState<string | null>(null);
  const [defaultCountry, setDefaultCountry] = useState('PT');
  const [bowPromptDismissTick, setBowPromptDismissTick] = useState(0);
  const [streakDismissTick, setStreakDismissTick] = useState(0);
  const [monthlySummaryDismissTick, setMonthlySummaryDismissTick] = useState(0);
  const [pendingFeedback, setPendingFeedback] = useState<PendingTournamentFeedbackDto[]>([]);
  const [feedbackDismissTick, setFeedbackDismissTick] = useState(0);

  const visiblePendingFeedback = useMemo(
    () => pendingFeedback.filter((item) => !isTournamentFeedbackDismissed(item.id)),
    [pendingFeedback, feedbackDismissTick],
  );

  const showBowSetupPrompt = useMemo(
    () =>
      equipmentSets.length === 0 && !isBowSetupPromptDismissed() && !user?.onboardingCompletedAt,
    [equipmentSets.length, bowPromptDismissTick, user?.onboardingCompletedAt],
  );

  const { earned } = useAchievements();

  const lastAchievement = useMemo(() => {
    if (earned.length === 0) return null;
    return (
      earned
        .filter((a) => a.earnedAt)
        .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())[0] ??
      null
    );
  }, [earned]);

  const stats = useMemo(
    () => computeLocalStats(trainingSessions, equipmentSets),
    [trainingSessions, equipmentSets],
  );
  const streakAtRisk = useMemo(
    () => getStreakAtRiskState(buildWeekSetFromSessions(trainingSessions)),
    [trainingSessions],
  );
  const priorMonthSummary = useMemo(
    () => computePriorMonthSummary(trainingSessions),
    [trainingSessions],
  );
  const showStreakAtRisk = useMemo(
    () => streakAtRisk.isAtRisk && !isStreakAtRiskDismissed() && !showBowSetupPrompt,
    [streakAtRisk, showBowSetupPrompt, streakDismissTick],
  );
  const showMonthlySummary = useMemo(
    () =>
      isMonthlySummaryWindow() &&
      priorMonthSummary !== null &&
      !isMonthlySummaryDismissed(priorMonthSummary.monthKey),
    [priorMonthSummary, monthlySummaryDismissTick],
  );
  const priorMonthLabel = useMemo(() => {
    if (!priorMonthSummary) return '';
    const [year, month] = priorMonthSummary.monthKey.split('-').map(Number);
    return format(new Date(year, month - 1, 1), 'MMMM yyyy');
  }, [priorMonthSummary]);
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
    let cancelled = false;

    const loadUpcomingTournaments = async () => {
      setTournamentsLoading(true);
      setTournamentsError(null);
      try {
        const country = await resolveDefaultCountryCode(user);
        if (cancelled) return;
        setDefaultCountry(country);

        const [tournaments, applications] = await Promise.all([
          apiService.getAllTournaments({ country, upcoming: true }),
          isAuthenticated ? apiService.getMyApplications() : Promise.resolve([]),
        ]);

        const appByTournamentId = new Map<string, TournamentApplicationDto>();
        for (const app of applications) {
          if (!appByTournamentId.has(app.tournament.id)) {
            appByTournamentId.set(app.tournament.id, app);
          }
        }

        const merged: MergedTournamentCard[] = tournaments
          .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
          .map((tournament) => {
            const app = appByTournamentId.get(tournament.id);
            return {
              tournament,
              applicationStatus: app?.status,
            };
          });

        if (!cancelled) setMergedTournaments(merged);
      } catch (err: unknown) {
        if (!cancelled) {
          setTournamentsError(
            err instanceof Error ? err.message : t('pages.tournaments.fetchError'),
          );
        }
      } finally {
        if (!cancelled) setTournamentsLoading(false);
      }
    };

    void loadUpcomingTournaments();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user, t]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPendingFeedback([]);
      return;
    }

    let cancelled = false;

    const loadPendingFeedback = async () => {
      try {
        const data = await apiService.getPendingTournamentFeedback();
        if (!cancelled) setPendingFeedback(data);
      } catch {
        if (!cancelled) setPendingFeedback([]);
      }
    };

    void loadPendingFeedback();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleOpenAdd = async () => {
    setSubmitting(true);
    try {
      await startTrainingSession(sessionDefaults);
      navigate(`/${lang}/trainings`);
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

  const handleDismissStreakAtRisk = () => {
    dismissStreakAtRisk();
    setStreakDismissTick((t) => t + 1);
  };

  const handleDismissMonthlySummary = () => {
    if (priorMonthSummary) dismissMonthlySummary(priorMonthSummary.monthKey);
    setMonthlySummaryDismissTick((t) => t + 1);
  };

  const handleDismissTournamentFeedback = (tournamentId: string) => {
    dismissTournamentFeedback(tournamentId);
    setFeedbackDismissTick((t) => t + 1);
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

      {showStreakAtRisk && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 2,
            mb: 1,
            border: `1px solid ${theme.palette.warning.light}`,
            borderRadius: 2,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'warning.dark'
                : alpha(theme.palette.warning.main, 0.08),
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <LocalFireDepartmentOutlinedIcon
            sx={{ fontSize: 40, color: 'warning.main', flexShrink: 0 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('dashboard.streakAtRisk.title', { count: streakAtRisk.priorStreakWeeks })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.streakAtRisk.subtitle')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained" color="warning" size="small" onClick={handleOpenAdd}>
              {t('dashboard.streakAtRisk.logSession')}
            </Button>
            <Button variant="text" size="small" onClick={handleDismissStreakAtRisk}>
              {t('dashboard.streakAtRisk.dismiss')}
            </Button>
          </Box>
        </Paper>
      )}

      {visiblePendingFeedback.map((item) => (
        <Paper
          key={item.id}
          elevation={0}
          sx={{
            p: 3,
            mt: 2,
            mb: 1,
            border: `1px solid ${theme.palette.info.light}`,
            borderRadius: 2,
            bgcolor:
              theme.palette.mode === 'dark' ? 'info.dark' : alpha(theme.palette.info.main, 0.08),
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <RateReviewOutlinedIcon sx={{ fontSize: 40, color: 'info.main', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('dashboard.tournamentFeedback.title', { title: item.title })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.tournamentFeedback.subtitle')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button
              variant="contained"
              color="info"
              size="small"
              component={Link}
              to={`/${lang}/tournaments/${item.id}/feedback`}
            >
              {t('dashboard.tournamentFeedback.leaveFeedback')}
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => handleDismissTournamentFeedback(item.id)}
            >
              {t('dashboard.tournamentFeedback.dismiss')}
            </Button>
          </Box>
        </Paper>
      ))}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard label={t('dashboard.thisWeekArrows')} value={fmt(stats.shots.thisWeek)} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard
            label={t('dashboard.currentStreak')}
            value={fmt(
              streakAtRisk.isAtRisk ? streakAtRisk.priorStreakWeeks : stats.currentStreakWeeks,
            )}
            subtitle={
              streakAtRisk.isAtRisk
                ? t('dashboard.streakAtRisk.statSubtitle')
                : t('statistics.weeks')
            }
            valueColor={streakAtRisk.isAtRisk ? 'warning.main' : undefined}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => void handleOpenAdd()}
                disabled={submitting}
              >
                {t('dashboard.logTodaysSession')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {lastAchievement && (
        <Box
          sx={{
            mt: 2,
            width: { xs: '100%', md: '50%' },
          }}
        >
          <Card
            variant="outlined"
            component={Link}
            to={`/${lang}/achievements`}
            sx={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&:hover': {
                textDecoration: 'none',
                borderColor: 'primary.main',
                boxShadow: 2,
              },
            }}
          >
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AchievementMedallion
                  icon={lastAchievement.icon}
                  rarity={lastAchievement.rarity as 'common' | 'rare' | 'epic' | 'legendary'}
                  size={48}
                  showGlow
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    textTransform="uppercase"
                  >
                    {t('dashboard.lastAchievement.title')}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {t(lastAchievement.titleKey)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {t(lastAchievement.descriptionKey)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('dashboard.lastAchievement.earnedOn', {
                      date: format(parseISO(lastAchievement.earnedAt!), 'dd MMM yyyy'),
                    })}
                  </Typography>
                </Box>
                <Typography variant="caption" color="primary" sx={{ flexShrink: 0 }}>
                  {t('dashboard.lastAchievement.viewAll')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {showMonthlySummary && priorMonthSummary && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <BarChartOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('dashboard.monthlySummary.title', { month: priorMonthLabel })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.monthlySummary.sessions', { count: priorMonthSummary.sessions })}
              {' · '}
              {t('dashboard.monthlySummary.arrows', { count: priorMonthSummary.shots })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button component={Link} to={`/${lang}/statistics`} variant="contained" size="small">
              {t('dashboard.monthlySummary.viewStatistics')}
            </Button>
            <Button variant="text" size="small" onClick={handleDismissMonthlySummary}>
              {t('dashboard.monthlySummary.dismiss')}
            </Button>
          </Box>
        </Paper>
      )}

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
                      {!session.isSynced && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          <LocalSyncChip />
                        </Box>
                      )}
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

      {(tournamentsLoading || tournamentsError || mergedTournaments.length > 0) && (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mt: 2,
              mb: 1,
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                {t('dashboard.upcomingTournaments')}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {t('dashboard.discoveryDisclaimer')}
              </Typography>
            </Box>
            {mergedTournaments.length > 0 && (
              <Button
                component={Link}
                to={`/${lang}/tournaments?country=${defaultCountry}`}
                size="small"
                endIcon={<ChevronRightIcon />}
                sx={{ flexShrink: 0 }}
              >
                {t('dashboard.browseAllTournaments')}
              </Button>
            )}
          </Box>

          {tournamentsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {tournamentsError}
            </Alert>
          )}

          {tournamentsLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {mergedTournaments.slice(0, 5).map(({ tournament, applicationStatus }) => (
                <Card
                  key={tournament.id}
                  variant="outlined"
                  component={Link}
                  to={`/${lang}/tournaments/${tournament.id}`}
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
                          {tournament.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTournamentDates(tournament.startDate, tournament.endDate)}
                        </Typography>
                      </Box>
                      {applicationStatus && (
                        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                          {t(`pages.adminApplications.status.${applicationStatus}`)}
                        </Typography>
                      )}
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
    </Box>
  );
};

export default HomePage;
