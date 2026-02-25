import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useAuth } from '../../contexts/auth-context';
import { useLocalData } from '../../contexts/local-data-context';
import type { LocalTrainingSession } from '../../contexts/local-data-context';
import apiService from '../../services/api';
import type { ApplicationStatsForUser, MonthlyDataPoint } from '../../services/types';

// ─── Local stats computation ─────────────────────────────────────────────────

interface LocalTrainingStats {
  totalSessions: number;
  currentStreakWeeks: number;
  shots: { total: number; thisWeek: number; thisMonth: number; thisYear: number };
  metersTraveled: { total: number; thisMonth: number; thisYear: number };
  avgShotsPerSession: number;
  mostUsedDistance: string | null;
  mostUsedTargetType: string | null;
  shotsByMonth: MonthlyDataPoint[];
  sessionsByMonth: MonthlyDataPoint[];
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getIsoWeekString(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(((d.getTime() - week1.getTime()) / 86_400_000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-${weekNum.toString().padStart(2, '0')}`;
}

function getMostFrequent(map: Record<string, number>): string | null {
  const entries = Object.entries(map);
  if (entries.length === 0) return null;
  return [...entries].sort(([, a], [, b]) => b - a)[0][0];
}

interface PeriodAccumulator {
  totalShots: number;
  shotsWeek: number;
  shotsMonth: number;
  shotsYear: number;
  totalMeters: number;
  metersMonth: number;
  metersYear: number;
  distanceCount: Record<string, number>;
  targetTypeCount: Record<string, number>;
  weekSet: Set<string>;
}

function accumulateSession(acc: PeriodAccumulator, s: LocalTrainingSession): void {
  const d = new Date(s.date + 'T00:00:00');
  const now = new Date();
  const weekStart = getStartOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const shots = s.shotsCount ?? 0;
  const dist = s.distance ? Number.parseFloat(s.distance) : 0;
  const meters = !Number.isNaN(dist) && dist > 0 ? shots * dist * 2 : 0;

  acc.totalShots += shots;
  acc.totalMeters += meters;
  acc.weekSet.add(getIsoWeekString(d));

  if (d >= weekStart) acc.shotsWeek += shots;
  if (d >= monthStart) {
    acc.shotsMonth += shots;
    acc.metersMonth += meters;
  }
  if (d >= yearStart) {
    acc.shotsYear += shots;
    acc.metersYear += meters;
  }
  if (s.distance) acc.distanceCount[s.distance] = (acc.distanceCount[s.distance] ?? 0) + 1;
  if (s.targetType)
    acc.targetTypeCount[s.targetType] = (acc.targetTypeCount[s.targetType] ?? 0) + 1;
}

function computeStreak(weekSet: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  while (weekSet.has(getIsoWeekString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

function buildMonthlyPoints(
  sessions: LocalTrainingSession[],
  type: 'shots' | 'sessions',
): MonthlyDataPoint[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const m = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const count = sessions
      .filter((s) => s.date.slice(0, 7) === m)
      .reduce((sum, s) => sum + (type === 'shots' ? (s.shotsCount ?? 0) : 1), 0);
    return { month: m, count };
  });
}

function computeLocalStats(sessions: LocalTrainingSession[]): LocalTrainingStats {
  const acc: PeriodAccumulator = {
    totalShots: 0,
    shotsWeek: 0,
    shotsMonth: 0,
    shotsYear: 0,
    totalMeters: 0,
    metersMonth: 0,
    metersYear: 0,
    distanceCount: {},
    targetTypeCount: {},
    weekSet: new Set(),
  };

  for (const s of sessions) accumulateSession(acc, s);

  return {
    totalSessions: sessions.length,
    currentStreakWeeks: computeStreak(acc.weekSet),
    shots: {
      total: acc.totalShots,
      thisWeek: acc.shotsWeek,
      thisMonth: acc.shotsMonth,
      thisYear: acc.shotsYear,
    },
    metersTraveled: {
      total: Math.round(acc.totalMeters),
      thisMonth: Math.round(acc.metersMonth),
      thisYear: Math.round(acc.metersYear),
    },
    avgShotsPerSession: sessions.length > 0 ? Math.round(acc.totalShots / sessions.length) : 0,
    mostUsedDistance: getMostFrequent(acc.distanceCount),
    mostUsedTargetType: getMostFrequent(acc.targetTypeCount),
    shotsByMonth: buildMonthlyPoints(sessions, 'shots'),
    sessionsByMonth: buildMonthlyPoints(sessions, 'sessions'),
  };
}

// ─── Components ──────────────────────────────────────────────────────────────

const formatMonthTick = (month: string): string => {
  const [year, m] = month.split('-');
  return format(new Date(Number.parseInt(year), Number.parseInt(m) - 1, 1), "MMM ''yy");
};

const fmt = (n: number): string => n.toLocaleString();

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtitle, loading = false }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width="60%" height={40} />
      ) : (
        <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
          {value}
        </Typography>
      )}
      {subtitle && !loading && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

interface ChartCardProps {
  title: string;
  data: MonthlyDataPoint[];
  color: string;
  dataLabel: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, color, dataLabel }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
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
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(value) => [fmt(Number(value ?? 0)), dataLabel]}
            labelFormatter={(label) => formatMonthTick(String(label))}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
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
  const { trainingSessions } = useLocalData();
  const navigate = useNavigate();
  const { lang } = useParams();
  const theme = useTheme();

  const [appStats, setAppStats] = useState<ApplicationStatsForUser | null>(null);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);

  // Computed reactively from local training data — updates immediately on any training change
  const stats = useMemo(() => computeLocalStats(trainingSessions), [trainingSessions]);

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

      {/* Charts */}
      <SectionTitle>{t('statistics.shotsByMonth')}</SectionTitle>
      <ChartCard
        title={t('statistics.shotsByMonth')}
        data={stats.shotsByMonth}
        color={theme.palette.primary.main}
        dataLabel={t('statistics.arrows')}
      />

      <SectionTitle>{t('statistics.sessionsByMonth')}</SectionTitle>
      <ChartCard
        title={t('statistics.sessionsByMonth')}
        data={stats.sessionsByMonth}
        color={theme.palette.success.main}
        dataLabel={t('statistics.sessions')}
      />
    </Box>
  );
};

export default MyStatisticsPage;
