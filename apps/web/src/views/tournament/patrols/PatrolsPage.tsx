import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import { Alert, Box, Button, CircularProgress, Grid, Snackbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import env from '../../../config/env';
import apiService from '../../../services/api';
import { formatDate } from '../../../utils/date-utils';
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
  const { t } = useTranslation('common');
  const { tournamentId, lang } = useParams<{
    tournamentId: string;
    lang?: string;
  }>();

  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [isDirty, setIsDirty] = useState(false);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<PatrolStats | null>(null);
  const [tournamentInfo, setTournamentInfo] = useState<{
    title: string;
    address?: string;
    startDate?: string;
    endDate?: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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

  /** Transform backend patrol list to component format (shared helper shape) */
  const transformBackendPatrols = (
    backendPatrols: Array<{
      id: string;
      name?: string;
      members?: Array<{
        user?: {
          id: string;
          firstName?: string;
          lastName?: string;
          email?: string;
          club?: { name: string };
          division?: string;
          bowCategory?: string;
          gender?: string;
        };
        role: string;
      }>;
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
              t('pages.patrols.unknown'),
            club: user.club?.name || t('pages.patrols.noClub'),
            division: user.division || t('pages.patrols.unknown'),
            bowCategory: user.bowCategory || t('pages.patrols.unknown'),
            gender: user.gender || t('forms.genderOther'),
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

  const applyPatrolData = (
    backendPatrols: Array<{
      id: string;
      name?: string;
      members?: Array<{
        user?: {
          id: string;
          firstName?: string;
          lastName?: string;
          email?: string;
          club?: { name: string };
          division?: string;
          bowCategory?: string;
          gender?: string;
        };
        role: string;
      }>;
    }>,
    backendStats?: unknown,
  ) => {
    const { participantsMap, transformedPatrols } = transformBackendPatrols(backendPatrols);
    setPatrols(transformedPatrols);
    setParticipants(participantsMap);

    if (backendStats && typeof backendStats === 'object' && 'totalParticipants' in backendStats) {
      setStats(backendStats as PatrolStats);
    } else {
      const totalParticipants = participantsMap.size;
      const averagePatrolSize =
        transformedPatrols.length > 0 ? totalParticipants / transformedPatrols.length : 0;
      setStats({
        totalParticipants,
        averagePatrolSize,
        clubDiversityScore: 0,
        homogeneityScores: { category: 0, division: 0, gender: 0 },
      });
    }
  };

  const loadPatrols = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const backendPatrols = await apiService.getPatrolsByTournament(tournamentId!);

      if (tournamentId) {
        const tournament = await apiService.getTournament(tournamentId);
        setTournamentInfo({
          title: tournament.title,
          address: tournament.address,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
        });
      }

      applyPatrolData(backendPatrols);
      setIsDirty(false);
    } catch (error: unknown) {
      console.error('Failed to load patrols:', error);
      setError(error instanceof Error ? error.message : t('pages.patrols.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tournamentId) return;

    setIsSaving(true);
    try {
      const payload = patrols.map((patrol) => ({
        id: patrol.id,
        members: patrol.members.map((memberId) => {
          let role = 'member';
          if (memberId === patrol.leaderId) {
            role = 'leader';
          } else if (patrol.judgeIds.includes(memberId)) {
            role = 'judge';
          }
          return { userId: memberId, role };
        }),
      }));

      await apiService.batchSavePatrols(tournamentId, payload);

      setIsDirty(false);
      setSnackbar({
        open: true,
        message: t('pages.patrols.saveSuccess'),
        severity: 'success',
      });
    } catch (error: unknown) {
      console.error('Failed to save:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : t('pages.patrols.saveError'),
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMemberDrop = (memberId: string, sourcePatrolId: string, targetPatrolId: string) => {
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
        message: validation.reason
          ? t(validation.reason, validation.reasonParams)
          : t('pages.patrols.cannotMove'),
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

  const handleRoleChange = (patrolId: string, memberId: string, role: string) => {
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

  const handleGeneratePatrols = async () => {
    if (!tournamentId) return;

    if (!confirm(t('pages.patrols.confirmGenerate'))) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiService.generateAndSavePatrols(tournamentId);
      applyPatrolData(response.patrols, response.stats);
      setIsDirty(false);
      setSnackbar({
        open: true,
        message: t('pages.patrols.generateSuccess'),
        severity: 'success',
      });
    } catch (error: unknown) {
      console.error('Failed to generate patrols:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : t('pages.patrols.generateError'),
        severity: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePatrolsList = async () => {
    if (!tournamentId) return;

    try {
      const url = `${env.API_BASE_URL}/patrols/tournaments/${tournamentId}/pdf`;
      window.open(url, '_blank');
      setSnackbar({
        open: true,
        message: t('pages.patrols.openingListPdf'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to generate patrols list:', error);
      setSnackbar({
        open: true,
        message: t('pages.patrols.listPdfError'),
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
        message: t('pages.patrols.openingScoreCardsPdf'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to generate score cards:', error);
      setSnackbar({
        open: true,
        message: t('pages.patrols.scoreCardsPdfError'),
        severity: 'error',
      });
    }
  };

  const handleDeleteAndRedistribute = async (patrolId: string) => {
    if (!confirm(t('pages.patrols.confirmDeleteRedistribute'))) {
      return;
    }

    setIsLoading(true);
    try {
      const backendPatrols = await apiService.deletePatrolAndRedistribute(patrolId);
      const { participantsMap, transformedPatrols } = transformBackendPatrols(backendPatrols);

      setPatrols(transformedPatrols);
      setParticipants(participantsMap);
      setIsDirty(false);

      const totalParticipants = participantsMap.size;
      const averagePatrolSize =
        transformedPatrols.length > 0 ? totalParticipants / transformedPatrols.length : 0;
      setStats({
        totalParticipants,
        averagePatrolSize,
        clubDiversityScore: 0,
        homogeneityScores: { category: 0, division: 0, gender: 0 },
      });

      setSnackbar({
        open: true,
        message: t('pages.patrols.deleteRedistributeSuccess'),
        severity: 'success',
      });
    } catch (error: unknown) {
      console.error('Failed to delete and redistribute:', error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : t('pages.patrols.deleteRedistributeError'),
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm(t('pages.patrols.confirmRegenerate'))) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.regeneratePatrols(tournamentId!);
      applyPatrolData(response.patrols, response.stats);
      setIsDirty(false);

      setSnackbar({
        open: true,
        message: t('pages.patrols.regenerateSuccess'),
        severity: 'success',
      });
    } catch (error: unknown) {
      console.error('Failed to regenerate:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : t('pages.patrols.regenerateError'),
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={loadPatrols} sx={{ mt: 2 }}>
          {t('pages.patrols.retry')}
        </Button>
      </Box>
    );
  }

  let locationAndDate: string | false = false;
  if (tournamentInfo && (tournamentInfo.address || tournamentInfo.startDate)) {
    let dateStr: string | null = null;
    if (tournamentInfo.startDate) {
      dateStr =
        tournamentInfo.endDate && tournamentInfo.endDate !== tournamentInfo.startDate
          ? `${formatDate(tournamentInfo.startDate)} – ${formatDate(tournamentInfo.endDate)}`
          : formatDate(tournamentInfo.startDate);
    }
    locationAndDate = [tournamentInfo.address, dateStr].filter(Boolean).join(' · ');
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
        <Box>
          <Typography variant="h4">{t('pages.patrols.title')}</Typography>
          {tournamentInfo && (
            <>
              <Typography
                variant="h5"
                component={Link}
                to={lang ? `/${lang}/tournaments/${tournamentId}` : `../`}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': { textDecoration: 'underline', color: 'text.secondary' },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 'inherit' }} />
                {tournamentInfo.title}
              </Typography>
              {locationAndDate && (
                <Typography
                  variant="h6"
                  color="text.secondary"
                  component="p"
                  sx={{ fontWeight: 400, mt: 0.5 }}
                >
                  {locationAndDate}
                </Typography>
              )}
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? t('pages.patrols.saving') : t('pages.patrols.saveChanges')}
            {isDirty && ' *'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleGeneratePatrolsList}
          >
            {t('pages.patrols.generateList')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={handleGenerateScoreCards}
          >
            {t('pages.patrols.generateScoreCards')}
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<RefreshIcon />}
            onClick={handleRegenerate}
            disabled={patrols.length === 0 || isLoading || isGenerating}
          >
            {t('pages.patrols.regenerate')}
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
                allPatrols={patrols.map((p) => ({ id: p.id, targetNumber: p.targetNumber }))}
                onMemberDrop={handleMemberDrop}
                onRoleChange={handleRoleChange}
                onDeleteAndRedistribute={handleDeleteAndRedistribute}
              />
            </Grid>
          ))}
      </Grid>

      {patrols.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {t('pages.patrols.empty')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AutoFixHighIcon />}
            onClick={handleGeneratePatrols}
            disabled={isGenerating || isLoading}
          >
            {isGenerating ? t('pages.patrols.generating') : t('pages.patrols.generate')}
          </Button>
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
