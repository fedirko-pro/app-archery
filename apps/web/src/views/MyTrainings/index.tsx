import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import LocalDataBanner from '../../components/LocalDataBanner/LocalDataBanner';
import LocalSyncChip from '../../components/LocalSyncChip/LocalSyncChip';
import { useLocalData, type LocalTrainingSession } from '../../contexts/local-data-context';
import { useGuardedStartTraining } from '../../hooks/use-guarded-start-training';
import { getEquipmentSetName, isBowSetupPromptDismissed } from '../../utils/equipment-utils';
import { getSessionCardTint } from '../../utils/session-card-tints';
import { getStartedSession } from '../../utils/training-session-utils';
import { getLastLoggedSession, toSessionFormDefaults } from '../../utils/training-stats';
import { TRAINING_TEMPLATES, type TrainingTemplate } from '../../utils/training-templates';
import ActiveSessionCard from './ActiveSessionCard';
import ConfirmReplaceActiveSessionDialog from './ConfirmReplaceActiveSessionDialog';
import FinishSessionDialog from './FinishSessionDialog';
import { MoodIcon } from './MoodPicker';
import TrainingSessionDialog from './TrainingSessionDialog';

const MyTrainingsPage: React.FC = () => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { lang } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const {
    trainingSessions,
    equipmentSets,
    editTrainingSession,
    removeTrainingSession,
    defaultEquipmentSetId,
  } = useLocalData();

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editTarget, setEditTarget] = useState<LocalTrainingSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);

  const activeSession = useMemo(() => getStartedSession(trainingSessions), [trainingSessions]);
  const finishedSessions = useMemo(
    () => trainingSessions.filter((s) => s.status !== 'started'),
    [trainingSessions],
  );

  const lastLogged = useMemo(() => getLastLoggedSession(finishedSessions), [finishedSessions]);

  const buildStartDefaults = useCallback(
    (template?: Partial<LocalTrainingSession>): Partial<LocalTrainingSession> => {
      const fromLast = lastLogged
        ? toSessionFormDefaults(lastLogged, defaultEquipmentSetId)
        : defaultEquipmentSetId
          ? { equipmentSetId: defaultEquipmentSetId }
          : {};
      return { ...fromLast, ...template };
    },
    [lastLogged, defaultEquipmentSetId],
  );

  const {
    requestStart,
    confirmStartNew,
    editCurrent,
    dialogOpen: replaceDialogOpen,
    submitting: startSubmitting,
  } = useGuardedStartTraining();

  const handleStartTraining = useCallback(
    async (template?: Partial<LocalTrainingSession>) => {
      await requestStart(buildStartDefaults(template));
    },
    [requestStart, buildStartDefaults],
  );

  const handleOpenAdd = () => {
    void handleStartTraining();
  };

  const handleOpenWithTemplate = (template: TrainingTemplate) => {
    void handleStartTraining(template.defaults);
  };

  const didAutoOpenRef = useRef(false);

  useEffect(() => {
    if (didAutoOpenRef.current) return;

    const fromOnboarding = (location.state as { openAddForm?: boolean } | null)?.openAddForm;
    const fromQuery = searchParams.get('add') === '1';
    if (!fromOnboarding && !fromQuery) return;

    didAutoOpenRef.current = true;
    void handleStartTraining();

    if (fromQuery) {
      const next = new URLSearchParams(searchParams);
      next.delete('add');
      setSearchParams(next, { replace: true });
    }
  }, [location.state, searchParams, setSearchParams, handleStartTraining]);

  const handleOpenEdit = (session: LocalTrainingSession) => {
    setEditTarget(session);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = async (
    data: Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
  ) => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await editTrainingSession(editTarget.id, { ...data, isSynced: false });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    try {
      await removeTrainingSession(id);
    } catch {
      setDeleteError(t('trainings.deleteError'));
    }
  };

  const showBowSetupAlert = equipmentSets.length === 0 && !isBowSetupPromptDismissed();

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const sortedFinished = [...finishedSessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1">
          {t('trainings.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          disabled={submitting || startSubmitting}
        >
          {t('trainings.add')}
        </Button>
      </Box>

      <LocalDataBanner showSyncStatus />

      {showBowSetupAlert && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`/${lang}/equipment?add=1`)}
            >
              {t('equipment.addSet')}
            </Button>
          }
        >
          {t('dashboard.bowSetupPrompt.subtitle')}
        </Alert>
      )}

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}

      {activeSession && (
        <Box sx={{ mb: 1.5 }}>
          <ActiveSessionCard session={activeSession} onFinish={() => setFinishOpen(true)} />
        </Box>
      )}

      {sortedFinished.length === 0 && !activeSession ? (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography color="text.secondary" gutterBottom>
                {t('trainings.emptyState.intro')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: 'center',
                  my: 2,
                }}
              >
                {TRAINING_TEMPLATES.map((template) => (
                  <Chip
                    key={template.id}
                    label={t(template.labelKey)}
                    clickable
                    color="primary"
                    variant="outlined"
                    onClick={() => handleOpenWithTemplate(template)}
                  />
                ))}
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
                disabled={submitting || startSubmitting}
              >
                {t('trainings.emptyState.orBlank')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sortedFinished.map((session, index) => {
            const tint = getSessionCardTint(theme, index);
            return (
              <Card
                key={session.id}
                variant="outlined"
                sx={{ bgcolor: tint.bgcolor, borderColor: tint.borderColor }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrackChangesIcon color="primary" />
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {formatDate(session.date)}
                    </Typography>
                    {!session.isSynced && <LocalSyncChip />}
                    {session.mood && <MoodIcon mood={session.mood} />}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('trainings.shotsCount')}:{' '}
                        <Box component="span" fontWeight="bold">
                          {session.shotsCount ?? 0}
                        </Box>
                      </Typography>
                      {session.distance && (
                        <Typography variant="body2" color="text.secondary">
                          {t('trainings.distance')}:{' '}
                          <Box component="span" fontWeight="bold">
                            {parseFloat(session.distance).toFixed(1)}m
                          </Box>
                        </Typography>
                      )}
                      {session.scoreTotal !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          {t('trainings.scoreTotal')}:{' '}
                          <Box component="span" fontWeight="bold">
                            {session.scoreTotal}
                          </Box>
                        </Typography>
                      )}
                    </Box>
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
                    {session.notes && (
                      <Typography variant="body2" color="text.secondary">
                        {t('trainings.notes')}:{' '}
                        <Box component="span" fontWeight="bold">
                          {session.notes}
                        </Box>
                      </Typography>
                    )}
                  </Box>

                  {session.customFields && session.customFields.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {session.customFields.map((f) => (
                        <Typography key={f.key} variant="body2" color="text.secondary">
                          {f.key}:{' '}
                          <Box component="span" fontWeight="bold">
                            {f.value}
                          </Box>
                        </Typography>
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEdit(session)}
                  >
                    {t('common.update')}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => void handleDelete(session.id)}
                  >
                    {t('common.delete')}
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      <FinishSessionDialog
        open={finishOpen}
        session={activeSession}
        onClose={() => setFinishOpen(false)}
      />

      <ConfirmReplaceActiveSessionDialog
        open={replaceDialogOpen}
        submitting={startSubmitting}
        onEditCurrent={editCurrent}
        onStartNew={() => void confirmStartNew()}
      />

      <TrainingSessionDialog
        open={formOpen}
        onClose={handleClose}
        title={t('trainings.session')}
        initial={editTarget ?? undefined}
        useDefaultEquipment={false}
        formKey={formKey}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </Box>
  );
};

export default MyTrainingsPage;
