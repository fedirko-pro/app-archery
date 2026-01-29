import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { useMemo } from 'react';

import type { Participant, Patrol, PatrolStats } from './types';

interface StatsPanelProps {
  stats: PatrolStats | null;
  patrols: Patrol[];
  participants: Map<string, Participant>;
}

/**
 * Calculate statistics from patrol and participant data
 */
function calculateStats(
  patrols: Patrol[],
  participants: Map<string, Participant>,
): PatrolStats {
  if (patrols.length === 0) {
    return {
      totalParticipants: participants.size,
      averagePatrolSize: 0,
      clubDiversityScore: 0,
      homogeneityScores: { category: 0, division: 0, gender: 0 },
    };
  }

  const totalParticipants = participants.size;
  const averagePatrolSize = totalParticipants / patrols.length;

  // Club Diversity: % of patrols where judges are from different clubs
  let diverseClubPatrols = 0;
  for (const patrol of patrols) {
    if (patrol.judgeIds.length >= 2) {
      const judge1 = participants.get(patrol.judgeIds[0]);
      const judge2 = participants.get(patrol.judgeIds[1]);
      if (judge1 && judge2 && judge1.club !== judge2.club) {
        diverseClubPatrols++;
      }
    } else if (patrol.judgeIds.length === 1) {
      // Only one judge, check if different from leader
      const judge = participants.get(patrol.judgeIds[0]);
      const leader = patrol.leaderId ? participants.get(patrol.leaderId) : null;
      if (judge && leader && judge.club !== leader.club) {
        diverseClubPatrols++;
      }
    }
  }
  const clubDiversityScore = (diverseClubPatrols / patrols.length) * 100;

  // Category Homogeneity: % of patrols where all members have the same bow category
  let homogeneousCategoryPatrols = 0;
  for (const patrol of patrols) {
    const categories = patrol.members
      .map((id) => participants.get(id)?.bowCategory)
      .filter(Boolean);
    if (categories.length > 0 && new Set(categories).size === 1) {
      homogeneousCategoryPatrols++;
    }
  }
  const categoryHomogeneity = (homogeneousCategoryPatrols / patrols.length) * 100;

  // Division Homogeneity: % of patrols where all members have the same division
  let homogeneousDivisionPatrols = 0;
  for (const patrol of patrols) {
    const divisions = patrol.members
      .map((id) => participants.get(id)?.division)
      .filter(Boolean);
    if (divisions.length > 0 && new Set(divisions).size === 1) {
      homogeneousDivisionPatrols++;
    }
  }
  const divisionHomogeneity = (homogeneousDivisionPatrols / patrols.length) * 100;

  // Gender Homogeneity: % of patrols where all members have the same gender
  let homogeneousGenderPatrols = 0;
  for (const patrol of patrols) {
    const genders = patrol.members
      .map((id) => participants.get(id)?.gender)
      .filter(Boolean);
    if (genders.length > 0 && new Set(genders).size === 1) {
      homogeneousGenderPatrols++;
    }
  }
  const genderHomogeneity = (homogeneousGenderPatrols / patrols.length) * 100;

  return {
    totalParticipants,
    averagePatrolSize,
    clubDiversityScore,
    homogeneityScores: {
      category: categoryHomogeneity,
      division: divisionHomogeneity,
      gender: genderHomogeneity,
    },
  };
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  stats: providedStats,
  patrols,
  participants,
}) => {
  // Calculate stats from actual data, using provided stats as fallback for some values
  const stats = useMemo(() => {
    const calculated = calculateStats(patrols, participants);
    
    // If provided stats have non-zero values, prefer them (they come from backend generation)
    if (providedStats && providedStats.clubDiversityScore > 0) {
      return providedStats;
    }
    
    return calculated;
  }, [patrols, participants, providedStats]);

  if (patrols.length === 0) return null;

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
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="info" fontSize="small" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Participants
                </Typography>
                <Typography variant="h6">
                  {stats.totalParticipants}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="info" fontSize="small" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Avg Size
                </Typography>
                <Typography variant="h6">
                  {stats.averagePatrolSize.toFixed(1)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(stats.homogeneityScores.category || 0, 70)}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Category Match
                </Typography>
                <Typography variant="h6">
                  {formatPercentage(stats.homogeneityScores.category || 0)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(stats.clubDiversityScore, 70)}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Club Diversity
                </Typography>
                <Typography variant="h6">
                  {formatPercentage(stats.clubDiversityScore)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(stats.homogeneityScores.division, 50)}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Division Match
                </Typography>
                <Typography variant="h6">
                  {formatPercentage(stats.homogeneityScores.division)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(stats.homogeneityScores.gender, 50)}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Gender Match
                </Typography>
                <Typography variant="h6">
                  {formatPercentage(stats.homogeneityScores.gender)}
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
