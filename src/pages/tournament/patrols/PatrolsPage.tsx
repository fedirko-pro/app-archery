import AssignmentIcon from '@mui/icons-material/Assignment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import env from '../../../config/env';
import apiService from '../../../services/api';
import PatrolCard from './PatrolCard';
import StatsPanel from './StatsPanel';
import type { Participant, Patrol, PatrolStats, Warning } from './types';
import { canDropMember } from './validation';
import { recalculateWarnings } from './warnings';

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
      // Get existing patrols or auto-generate if none exist
      const response = await apiService.getOrGeneratePatrols(tournamentId!);
      
      // Transform backend data to component format
      const { patrols: backendPatrols, stats: backendStats, isNewlyGenerated } = response;
      
      // Build participants map from patrol members
      const participantsMap = new Map<string, Participant>();
      const transformedPatrols: Patrol[] = [];
      
      for (const bp of backendPatrols) {
        const memberIds: string[] = [];
        const judgeIds: string[] = [];
        let leaderId: string | null = null;
        
        // Process members
        if (bp.members && Array.isArray(bp.members)) {
          for (const member of bp.members) {
            const user = member.user;
            if (!user) continue;
            
            // Add to participants map
            participantsMap.set(user.id, {
              id: user.id,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
              club: user.club?.name || 'No Club',
              division: user.division || 'Unknown',
              bowCategory: user.bowCategory || 'Unknown',
              gender: user.gender || 'Other',
            });
            
            memberIds.push(user.id);
            
            // Track roles
            if (member.role === 'leader') {
              leaderId = user.id;
            } else if (member.role === 'judge') {
              judgeIds.push(user.id);
            }
          }
        }
        
        // Extract target number from name (e.g., "Target 1" -> 1)
        const targetMatch = bp.name?.match(/\d+/);
        const targetNumber = targetMatch ? parseInt(targetMatch[0], 10) : transformedPatrols.length + 1;
        
        transformedPatrols.push({
          id: bp.id,
          targetNumber,
          members: memberIds,
          leaderId,
          judgeIds,
        });
      }
      
      setPatrols(transformedPatrols);
      setParticipants(participantsMap);
      
      // Set stats if available (API returns compatible shape)
      if (backendStats && typeof backendStats === 'object' && 'totalParticipants' in backendStats) {
        setStats(backendStats as PatrolStats);
      } else {
        // Calculate basic stats from patrols
        const totalParticipants = participantsMap.size;
        const averagePatrolSize = transformedPatrols.length > 0 
          ? totalParticipants / transformedPatrols.length 
          : 0;
        setStats({
          totalParticipants,
          averagePatrolSize,
          clubDiversityScore: 0,
          homogeneityScores: { category: 0, division: 0, gender: 0 },
        });
      }
      
      if (isNewlyGenerated) {
        setSnackbar({
          open: true,
          message: 'Patrols generated automatically from approved applications',
          severity: 'success',
        });
      }
    } catch (error: any) {
      console.error('Failed to load patrols:', error);
      setError(error.message || 'Failed to load patrols. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update each patrol's members and roles on the backend
      for (const patrol of patrols) {
        // Update patrol members - this would need a batch update endpoint
        // For now, we'll update role assignments
        for (const memberId of patrol.members) {
          let role = 'member';
          if (memberId === patrol.leaderId) {
            role = 'leader';
          } else if (patrol.judgeIds.includes(memberId)) {
            role = 'judge';
          }
          
          // Update member role
          try {
            await apiService.addPatrolMember(patrol.id, memberId, role);
          } catch {
            // Member might already exist, continue
          }
        }
      }

      setIsDirty(false);
      setSnackbar({
        open: true,
        message: 'Patrols saved successfully!',
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Failed to save:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save patrols. Please try again.',
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

  const handleGeneratePatrolsList = async () => {
    if (!tournamentId) return;

    try {
      const url = `${env.API_BASE_URL}/patrols/tournaments/${tournamentId}/pdf`;
      window.open(url, '_blank');
      setSnackbar({
        open: true,
        message: 'Opening patrols list PDF...',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to generate patrols list:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate patrols list. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleGenerateScoreCards = async () => {
    if (!tournamentId) return;

    try {
      const url = `${env.API_BASE_URL}/patrols/tournaments/${tournamentId}/score-cards-pdf`;
      window.open(url, '_blank');
      setSnackbar({
        open: true,
        message: 'Opening score cards PDF...',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to generate score cards:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate score cards. Please try again.',
        severity: 'error',
      });
    }
  };

  /** Transform backend patrol list to component format (shared helper shape) */
  const transformBackendPatrols = (
    backendPatrols: Array<{
      id: string;
      name?: string;
      members?: Array<{ user?: { id: string; firstName?: string; lastName?: string; email?: string; club?: { name: string }; division?: string; bowCategory?: string; gender?: string }; role: string }>;
    }>,
  ) => {
    const participantsMap = new Map<string, Participant>();
    const transformedPatrols: Patrol[] = [];

    for (const bp of backendPatrols) {
      const memberIds: string[] = [];
      const judgeIds: string[] = [];
      let leaderId: string | null = null;

      if (bp.members && Array.isArray(bp.members)) {
        for (const member of bp.members) {
          const user = member.user;
          if (!user) continue;

          participantsMap.set(user.id, {
            id: user.id,
            name:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              user.email ||
              'Unknown',
            club: user.club?.name || 'No Club',
            division: user.division || 'Unknown',
            bowCategory: user.bowCategory || 'Unknown',
            gender: user.gender || 'Other',
          });

          memberIds.push(user.id);

          if (member.role === 'leader') {
            leaderId = user.id;
          } else if (member.role === 'judge') {
            judgeIds.push(user.id);
          }
        }
      }

      const targetMatch = bp.name?.match(/\d+/);
      const targetNumber = targetMatch
        ? parseInt(targetMatch[0], 10)
        : transformedPatrols.length + 1;

      transformedPatrols.push({
        id: bp.id,
        targetNumber,
        members: memberIds,
        leaderId,
        judgeIds,
      });
    }

    return { participantsMap, transformedPatrols };
  };

  const handleDeleteAndRedistribute = async (patrolId: string) => {
    if (
      !confirm('Видалити патруль і перерозпреділити людей?')
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const backendPatrols = await apiService.deletePatrolAndRedistribute(patrolId);
      const { participantsMap, transformedPatrols } =
        transformBackendPatrols(backendPatrols);

      setPatrols(transformedPatrols);
      setParticipants(participantsMap);
      setIsDirty(false);

      const totalParticipants = participantsMap.size;
      const averagePatrolSize =
        transformedPatrols.length > 0
          ? totalParticipants / transformedPatrols.length
          : 0;
      setStats({
        totalParticipants,
        averagePatrolSize,
        clubDiversityScore: 0,
        homogeneityScores: { category: 0, division: 0, gender: 0 },
      });

      setSnackbar({
        open: true,
        message: 'Патруль видалено, учасників перерозподілено.',
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Failed to delete and redistribute:', error);
      setSnackbar({
        open: true,
        message:
          error.message || 'Не вдалося видалити патруль і перерозподілити.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (
      !confirm(
        'This will DELETE all existing patrols and regenerate new ones from approved applications. Continue?',
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // Delete existing and generate new patrols
      const response = await apiService.regeneratePatrols(tournamentId!);
      
      // Transform backend data to component format (same as loadPatrols)
      const { patrols: backendPatrols, stats: backendStats } = response;
      
      const participantsMap = new Map<string, Participant>();
      const transformedPatrols: Patrol[] = [];
      
      for (const bp of backendPatrols) {
        const memberIds: string[] = [];
        const judgeIds: string[] = [];
        let leaderId: string | null = null;
        
        if (bp.members && Array.isArray(bp.members)) {
          for (const member of bp.members) {
            const user = member.user;
            if (!user) continue;
            
            participantsMap.set(user.id, {
              id: user.id,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
              club: user.club?.name || 'No Club',
              division: user.division || 'Unknown',
              bowCategory: user.bowCategory || 'Unknown',
              gender: user.gender || 'Other',
            });
            
            memberIds.push(user.id);
            
            if (member.role === 'leader') {
              leaderId = user.id;
            } else if (member.role === 'judge') {
              judgeIds.push(user.id);
            }
          }
        }
        
        const targetMatch = bp.name?.match(/\d+/);
        const targetNumber = targetMatch ? parseInt(targetMatch[0], 10) : transformedPatrols.length + 1;
        
        transformedPatrols.push({
          id: bp.id,
          targetNumber,
          members: memberIds,
          leaderId,
          judgeIds,
        });
      }
      
      setPatrols(transformedPatrols);
      setParticipants(participantsMap);
      if (backendStats && typeof backendStats === 'object' && 'totalParticipants' in backendStats) {
        setStats(backendStats as PatrolStats);
      }
      setIsDirty(false);
      
      setSnackbar({
        open: true,
        message: 'Patrols regenerated successfully!',
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Failed to regenerate:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to regenerate patrols',
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
            onClick={handleGeneratePatrolsList}
          >
            Generate patrols list
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={handleGenerateScoreCards}
          >
            Generate score cards
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
        {[...patrols]
          .sort((a, b) => a.targetNumber - b.targetNumber)
          .map((patrol) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={patrol.id}>
              <PatrolCard
                patrol={patrol}
                participants={participants}
                warnings={warnings.filter((w) => w.patrolId === patrol.id)}
                onMemberDrop={handleMemberDrop}
                onRoleChange={handleRoleChange}
                onDeleteAndRedistribute={handleDeleteAndRedistribute}
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

export default PatrolsPage;
