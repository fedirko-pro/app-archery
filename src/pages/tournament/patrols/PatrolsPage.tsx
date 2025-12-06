import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import env from '../../../config/env';
import apiService from '../../../services/api';
import PatrolCard from './PatrolCard';
import StatsPanel from './StatsPanel';
import { canDropMember } from './validation';
import { recalculateWarnings } from './warnings';
import type { Participant, Patrol, PatrolStats, Warning } from './types';

/**
 * Main patrols management page for tournament admins.
 * Allows drag-and-drop of participants between patrols.
 */
const PatrolsPage: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();

  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map(),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<PatrolStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Load patrols on mount
  useEffect(() => {
    if (tournamentId) {
      loadPatrols();
    }
  }, [tournamentId]);

  // Recalculate warnings when patrols change
  useEffect(() => {
    const newWarnings = recalculateWarnings(patrols, participants);
    setWarnings(newWarnings);
  }, [patrols, participants]);

  const loadPatrols = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiService.getPatrolsByTournament(tournamentId!);

      // Mock data for now
      const mockData = generateMockData();
      setPatrols(mockData.patrols);
      setParticipants(mockData.participants);
      setStats(mockData.stats);
    } catch (error) {
      console.error('Failed to load patrols:', error);
      setError('Failed to load patrols. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      // await apiService.updatePatrols(tournamentId!, patrols);

      // Mock save for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsDirty(false);
      setSnackbar({
        open: true,
        message: 'Patrols saved successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to save:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save patrols. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMemberDrop = (
    memberId: string,
    sourcePatrolId: string,
    targetPatrolId: string,
  ) => {
    // Validate move
    const validation = canDropMember(
      memberId,
      sourcePatrolId,
      targetPatrolId,
      patrols,
      participants,
    );

    if (!validation.allowed) {
      setSnackbar({
        open: true,
        message: validation.reason || 'Cannot move member',
        severity: 'error',
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn('Move warnings:', validation.warnings);
    }

    // Update patrols
    const newPatrols = patrols.map((patrol) => {
      if (patrol.id === sourcePatrolId) {
        return {
          ...patrol,
          members: patrol.members.filter((id) => id !== memberId),
          // If moved member was leader/judge, need to reassign
          leaderId: patrol.leaderId === memberId ? null : patrol.leaderId,
          judgeIds: patrol.judgeIds.filter((id) => id !== memberId),
        };
      }
      if (patrol.id === targetPatrolId) {
        return {
          ...patrol,
          members: [...patrol.members, memberId],
        };
      }
      return patrol;
    });

    setPatrols(newPatrols);
    setIsDirty(true);
  };

  const handleRoleChange = (
    patrolId: string,
    memberId: string,
    role: string,
  ) => {
    const newPatrols = patrols.map((patrol) => {
      if (patrol.id !== patrolId) return patrol;

      if (role === 'leader') {
        return { ...patrol, leaderId: memberId };
      }

      if (role === 'judge') {
        // Add to judges (max 2)
        if (patrol.judgeIds.length < 2 && !patrol.judgeIds.includes(memberId)) {
          return {
            ...patrol,
            judgeIds: [...patrol.judgeIds, memberId],
          };
        }
        return patrol;
      }

      if (role === 'remove') {
        return {
          ...patrol,
          leaderId: patrol.leaderId === memberId ? null : patrol.leaderId,
          judgeIds: patrol.judgeIds.filter((id) => id !== memberId),
        };
      }

      return patrol;
    });

    setPatrols(newPatrols);
    setIsDirty(true);
  };

  const handleExportPDF = async () => {
    if (!tournamentId) return;

    try {
      // Construct the full URL to the PDF endpoint based on backend structure
      const url = `${env.API_BASE_URL}/patrols/tournaments/${tournamentId}/pdf`;

      // Open in a new tab
      window.open(url, '_blank');

      setSnackbar({
        open: true,
        message: 'Opening PDF export...',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export PDF. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleRegenerate = async () => {
    if (
      !confirm(
        'This will discard all changes and regenerate patrols. Continue?',
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await apiService.generatePatrols(tournamentId!);

      // Mock regenerate for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockData = generateMockData();
      setPatrols(mockData.patrols);
      setParticipants(mockData.participants);
      setStats(mockData.stats);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to regenerate:', error);
      setSnackbar({
        open: true,
        message: 'Failed to regenerate patrols',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={loadPatrols} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4">Patrol Management</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
            {isDirty && ' *'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPDF}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<RefreshIcon />}
            onClick={handleRegenerate}
          >
            Regenerate
          </Button>
        </Box>
      </Box>

      <StatsPanel stats={stats} patrols={patrols} participants={participants} />

      <Grid container spacing={2}>
        {patrols.map((patrol) => (
          <Grid item xs={12} sm={6} md={4} key={patrol.id}>
            <PatrolCard
              patrol={patrol}
              participants={participants}
              warnings={warnings.filter((w) => w.patrolId === patrol.id)}
              onMemberDrop={handleMemberDrop}
              onRoleChange={handleRoleChange}
            />
          </Grid>
        ))}
      </Grid>

      {patrols.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No patrols found. Click "Regenerate" to create patrols.
          </Typography>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

// Mock data generator for development
function generateMockData() {
  const participants = new Map<string, Participant>();
  const patrols: Patrol[] = [];

  // Generate mock participants
  const clubs = ['Club A', 'Club B', 'Club C', 'Club D'];
  const divisions = ['cub', 'junior', 'adult', 'veteran'];
  const genders = ['M', 'F'];

  for (let i = 1; i <= 50; i++) {
    participants.set(`p${i}`, {
      id: `p${i}`,
      name: `Participant ${i}`,
      club: clubs[Math.floor(Math.random() * clubs.length)],
      division: divisions[Math.floor(Math.random() * divisions.length)],
      gender: genders[Math.floor(Math.random() * genders.length)],
    });
  }

  // Generate mock patrols
  const participantIds = Array.from(participants.keys());
  let participantIndex = 0;

  for (let i = 1; i <= 10; i++) {
    const members: string[] = [];
    for (let j = 0; j < 5; j++) {
      if (participantIndex < participantIds.length) {
        members.push(participantIds[participantIndex]);
        participantIndex++;
      }
    }

    patrols.push({
      id: `patrol${i}`,
      targetNumber: i,
      members,
      leaderId: members[0] || null,
      judgeIds: members.slice(1, 3),
    });
  }

  const stats: PatrolStats = {
    totalParticipants: participants.size,
    averagePatrolSize: participants.size / patrols.length,
    clubDiversityScore: 85,
    homogeneityScores: {
      division: 90,
      gender: 70,
    },
  };

  return { participants, patrols, stats };
}

export default PatrolsPage;
