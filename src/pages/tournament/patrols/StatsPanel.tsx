import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

import type { Participant, Patrol, PatrolStats } from './types';

interface StatsPanelProps {
  stats: PatrolStats | null;
  patrols: Patrol[];
  participants: Map<string, Participant>;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  stats,
  patrols,
  participants,
}) => {
  if (!stats) return null;

  const formatPercentage = (value: number) => `${Math.round(value)}%`;

  const getStatusIcon = (value: number, threshold: number = 70) => {
    if (value >= threshold) {
      return <CheckCircleIcon color="success" fontSize="small" />;
    }
    if (value >= 50) {
      return <WarningIcon color="warning" fontSize="small" />;
    }
    return <ErrorIcon color="error" fontSize="small" />;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Statistics
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="info" fontSize="small" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Participants
                </Typography>
                <Typography variant="h6">
                  {stats.totalParticipants}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="info" fontSize="small" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Average Patrol Size
                </Typography>
                <Typography variant="h6">
                  {stats.averagePatrolSize.toFixed(1)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(stats.clubDiversityScore, 70)}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Club Diversity
                </Typography>
                <Typography variant="h6">
                  {formatPercentage(stats.clubDiversityScore)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round((patrols.length * stats.clubDiversityScore) / 100)}/
                  {patrols.length} patrols
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(stats.homogeneityScores.division, 80)}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Division Homogeneity
                </Typography>
                <Typography variant="h6">
                  {formatPercentage(stats.homogeneityScores.division)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(stats.homogeneityScores.sex, 60)}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Gender Homogeneity
                </Typography>
                <Typography variant="h6">
                  {formatPercentage(stats.homogeneityScores.sex)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StatsPanel;
