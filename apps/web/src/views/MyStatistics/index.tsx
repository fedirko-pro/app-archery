import AddIcon from '@mui/icons-material/Add';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import StatCard from '../../components/StatCard/StatCard';
import { useAuth } from '../../contexts/auth-context';
import { useLocalData } from '../../contexts/local-data-context';
import apiService from '../../services/api';
import type { ApplicationStatsForUser, MonthlyDataPoint } from '../../services/types';
import { computeLocalStats } from '../../utils/training-stats';

// ─── Components ──────────────────────────────────────────────────────────────

const formatMonthTick = (month: string): string => {
  const [year, m] = month.split('-');
  return format(new Date(Number.parseInt(year), Number.parseInt(m) - 1, 1), "MMM ''yy");
};

const fmt = (n: number): string => n.toLocaleString();

function buildGhostMonthlyPoints(counts: number[]): MonthlyDataPoint[] {
  const now = new Date();
  return counts.map((count, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const m = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    return { month: m, count };
  });
}

const GHOST_SHOTS_COUNTS = [120, 180, 150, 200, 160, 190, 210, 175, 165, 185, 195, 170];
const GHOST_SESSIONS_COUNTS = [4, 6, 5, 7, 5, 6, 8, 5, 5, 6, 7, 5];

interface ChartCardProps {
  title: string;
  data: MonthlyDataPoint[];
  color: string;
  dataLabel: string;
  ghost?: boolean;
  ghostTitle?: string;
  ghostSubtitle?: string;
  ghostCtaLabel?: string;
  onGhostCta?: () => void;
  disableAnimation?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  color,
  dataLabel,
  ghost = false,
  ghostTitle,
  ghostSubtitle,
  ghostCtaLabel,
  onGhostCta,
  disableAnimation = false,
}) => (
  <Card variant="outlined" sx={{ mb: 2 }}>
    <CardContent sx={{ position: 'relative' }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Box sx={{ position: 'relative', pointerEvents: ghost ? 'none' : 'auto' }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonthTick}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            {!ghost && (
              <Tooltip
                formatter={(value) => [fmt(Number(value ?? 0)), dataLabel]}
                labelFormatter={(label) => formatMonthTick(String(label))}
                cursor={{ fill: alpha('#000000', 0.04) }}
              />
            )}
            <Bar
              dataKey="count"
              fill={ghost ? alpha(color, 0.2) : color}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              isAnimationActive={!ghost && !disableAnimation}
            />
          </BarChart>
        </ResponsiveContainer>
        {ghost && ghostTitle && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              px: 2,
              pointerEvents: 'auto',
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {ghostTitle}
            </Typography>
            {ghostSubtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 280 }}>
                {ghostSubtitle}
              </Typography>
            )}
            {ghostCtaLabel && onGhostCta && (
              <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={onGhostCta}>
                {ghostCtaLabel}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="subtitle1" fontWeight={600} color="text.secondary" sx={{ mt: 3, mb: 1 }}>
    {children}
  </Typography>
);

const DASH = '—';

// ─── Page ─────────────────────────────────────────────────────────────────────

const MyStatisticsPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const { trainingSessions, equipmentSets } = useLocalData();
  const navigate = useNavigate();
  const { lang } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const disableChartAnimation = isMobile || prefersReducedMotion;

  const [appStats, setAppStats] = useState<ApplicationStatsForUser | null>(null);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);

  // Computed reactively from local training data — updates immediately on any training change
  const stats = useMemo(
    () => computeLocalStats(trainingSessions, equipmentSets, t('trainings.equipment.unspecified')),
    [trainingSessions, equipmentSets, t],
  );

  const hasNamedEquipmentStats = stats.byEquipment.some((e) => e.equipmentSetId !== null);
  const hasTrainingData = trainingSessions.length > 0;

  const ghostShotsByMonth = useMemo(() => buildGhostMonthlyPoints(GHOST_SHOTS_COUNTS), []);
  const ghostSessionsByMonth = useMemo(() => buildGhostMonthlyPoints(GHOST_SESSIONS_COUNTS), []);

  const handleLogSession = () => navigate(`/${lang}/trainings?add=1`);

  // Tournament applications — server-only, fetched once per login session
  useEffect(() => {
    if (!isAuthenticated) return;
    setAppsLoading(true);
    setAppsError(null);
    apiService
      .getMyApplications()
      .then((apps) => {
        setAppStats({
          total: apps.length,
          approved: apps.filter((a) => a.status === 'approved').length,
          pending: apps.filter((a) => a.status === 'pending').length,
          rejected: apps.filter((a) => a.status === 'rejected').length,
          withdrawn: apps.filter((a) => a.status === 'withdrawn').length,
        });
      })
      .catch((err: Error) => setAppsError(err.message))
      .finally(() => setAppsLoading(false));
  }, [isAuthenticated]);

  const regDate = (): string => {
    if (!isAuthenticated || !user?.createdAt) return DASH;
    try {
      return format(parseISO(user.createdAt), 'dd MMM yyyy');
    } catch {
      return DASH;
    }
  };

  const val = (n: number | undefined): string => fmt(n ?? 0);

  const str = (s: string | null | undefined): string => s ?? DASH;

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('statistics.title')}
      </Typography>

      {/* Banner for unauthenticated users */}
      {!isAuthenticated && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: `1px solid ${theme.palette.primary.light}`,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.50',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <EmojiEventsOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('statistics.signInBanner.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('statistics.signInBanner.subtitle')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained" size="small" onClick={() => navigate(`/${lang}/signin`)}>
              {t('statistics.signInBanner.signIn')}
            </Button>
            <Button variant="outlined" size="small" onClick={() => navigate(`/${lang}/signup`)}>
              {t('statistics.signInBanner.createAccount')}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Activity overview */}
      <SectionTitle>{t('statistics.sections.activity')}</SectionTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label={t('statistics.memberSince')} value={regDate()} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard label={t('statistics.totalSessions')} value={fmt(stats.totalSessions)} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard
            label={t('statistics.currentStreak')}
            value={fmt(stats.currentStreakWeeks)}
            subtitle={t('statistics.weeks')}
          />
        </Grid>
      </Grid>

      {/* Arrows */}
      <SectionTitle>{t('statistics.sections.arrows')}</SectionTitle>
      <Grid container spacing={2}>
        {(['thisWeek', 'thisMonth', 'thisYear', 'total'] as const).map((period) => (
          <Grid key={period} size={{ xs: 6, sm: 3 }}>
            <StatCard label={t(`statistics.${period}`)} value={val(stats.shots[period])} />
          </Grid>
        ))}
      </Grid>

      {/* Distance */}
      <SectionTitle>{t('statistics.sections.distance')}</SectionTitle>
      <Grid container spacing={2}>
        {(['thisMonth', 'thisYear', 'total'] as const).map((period) => (
          <Grid key={period} size={{ xs: 6, sm: 4 }}>
            <StatCard
              label={t(`statistics.${period}`)}
              value={val(stats.metersTraveled[period])}
              subtitle={t('statistics.meters')}
            />
          </Grid>
        ))}
      </Grid>

      {/* Weight lifted */}
      <SectionTitle>{t('statistics.sections.lifted')}</SectionTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label={t('statistics.totalLifted')}
            value={val(stats.kilogramsLifted)}
            subtitle={t('statistics.kilograms')}
          />
        </Grid>
      </Grid>

      {/* Habits + Tournaments */}
      <Grid container spacing={2} sx={{ mt: 0 }}>
        {/* Training habits */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionTitle>{t('statistics.sections.habits')}</SectionTitle>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: t('statistics.avgShotsPerSession'), value: fmt(stats.avgShotsPerSession) },
                { label: t('statistics.topDistance'), value: str(stats.mostUsedDistance) },
                { label: t('statistics.topTargetType'), value: str(stats.mostUsedTargetType) },
                { label: t('statistics.mostUsedEquipment'), value: str(stats.mostUsedEquipment) },
              ].map(({ label, value }, i, arr) => (
                <React.Fragment key={label}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {value}
                    </Typography>
                  </Box>
                  {i < arr.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Tournaments */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionTitle>{t('statistics.sections.tournaments')}</SectionTitle>
          {appsError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {t('statistics.loadError')}
            </Alert>
          )}
          <Grid container spacing={2}>
            {(['total', 'approved', 'rejected'] as const).map((key) => (
              <Grid key={key} size={{ xs: 4 }}>
                <StatCard
                  label={t(`statistics.${key}`)}
                  value={isAuthenticated ? val(appStats?.[key]) : DASH}
                  loading={isAuthenticated && appsLoading}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <SectionTitle>{t('statistics.sections.scoring')}</SectionTitle>
      {stats.scoring.avgScore !== null ? (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <StatCard label={t('statistics.avgScore')} value={String(stats.scoring.avgScore)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 8 }}>
              <StatCard
                label={t('statistics.bestSession')}
                value={
                  stats.scoring.bestSession
                    ? `${stats.scoring.bestSession.score}${
                        stats.scoring.bestSession.distance
                          ? ` @ ${stats.scoring.bestSession.distance}m`
                          : ''
                      }`
                    : DASH
                }
                subtitle={
                  stats.scoring.bestSession
                    ? format(parseISO(stats.scoring.bestSession.date), 'dd MMM yyyy')
                    : undefined
                }
              />
            </Grid>
          </Grid>
          {stats.scoring.avgScoreByDistance.length > 0 && (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {t('statistics.scoreByDistance')}
                </Typography>
                {stats.scoring.avgScoreByDistance.map((entry, i, arr) => (
                  <React.Fragment key={entry.distance}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {entry.distance}m ({entry.count})
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {entry.avgScore}
                      </Typography>
                    </Box>
                    {i < arr.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('statistics.noScoringData')}
        </Typography>
      )}

      <SectionTitle>{t('statistics.sections.equipment')}</SectionTitle>
      {hasNamedEquipmentStats ? (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {stats.byEquipment
              .filter((e) => e.equipmentSetId !== null)
              .map((entry, i, arr) => (
                <React.Fragment key={entry.equipmentSetId ?? entry.name}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {entry.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[
                        {
                          label: t('statistics.byEquipment.sessions'),
                          value: fmt(entry.sessions),
                        },
                        { label: t('statistics.byEquipment.arrows'), value: fmt(entry.shots) },
                        {
                          label: t('statistics.byEquipment.avgShots'),
                          value: fmt(entry.avgShotsPerSession),
                        },
                      ].map(({ label, value }) => (
                        <Box
                          key={label}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {label}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  {i < arr.length - 1 && <Divider />}
                </React.Fragment>
              ))}
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('statistics.byEquipment.empty')}
        </Typography>
      )}

      {/* Charts */}
      {!hasTrainingData && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
          {t('statistics.emptyState.chartsIntro')}
        </Typography>
      )}

      <SectionTitle>{t('statistics.shotsByMonth')}</SectionTitle>
      <ChartCard
        title={t('statistics.shotsByMonth')}
        data={hasTrainingData ? stats.shotsByMonth : ghostShotsByMonth}
        color={theme.palette.primary.main}
        dataLabel={t('statistics.arrows')}
        ghost={!hasTrainingData}
        ghostTitle={t('statistics.emptyState.ghostTitle')}
        ghostSubtitle={t('statistics.emptyState.ghostSubtitle')}
        ghostCtaLabel={t('statistics.emptyState.logSession')}
        onGhostCta={handleLogSession}
        disableAnimation={disableChartAnimation}
      />

      <SectionTitle>{t('statistics.sessionsByMonth')}</SectionTitle>
      <ChartCard
        title={t('statistics.sessionsByMonth')}
        data={hasTrainingData ? stats.sessionsByMonth : ghostSessionsByMonth}
        color={theme.palette.success.main}
        dataLabel={t('statistics.sessions')}
        ghost={!hasTrainingData}
        ghostTitle={t('statistics.emptyState.ghostTitle')}
        ghostSubtitle={t('statistics.emptyState.ghostSubtitle')}
        ghostCtaLabel={t('statistics.emptyState.logSession')}
        onGhostCta={handleLogSession}
        disableAnimation={disableChartAnimation}
      />
    </Box>
  );
};

export default MyStatisticsPage;
