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
            cursor={{ fill: alpha('#000000', 0.04) }}
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
