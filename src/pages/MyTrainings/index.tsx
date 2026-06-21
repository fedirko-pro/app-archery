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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';

import LocalDataBanner from '../../components/LocalDataBanner/LocalDataBanner';
import LocalSyncChip from '../../components/LocalSyncChip/LocalSyncChip';
import { useLocalData, type LocalTrainingSession } from '../../contexts/local-data-context';
import { getEquipmentSetName, isBowSetupPromptDismissed } from '../../utils/equipment-utils';
import { getSessionCardTint } from '../../utils/session-card-tints';
import { getLastLoggedSession, toSessionFormDefaults } from '../../utils/training-stats';
import { TRAINING_TEMPLATES, type TrainingTemplate } from '../../utils/training-templates';
import TrainingSessionDialog from './TrainingSessionDialog';

const MyTrainingsPage: React.FC = () => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const {
    trainingSessions,
    equipmentSets,
    addTrainingSession,
    editTrainingSession,
    removeTrainingSession,
    defaultEquipmentSetId,
  } = useLocalData();

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editTarget, setEditTarget] = useState<LocalTrainingSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [templateDefaults, setTemplateDefaults] = useState<Partial<LocalTrainingSession> | null>(
    null,
  );

  const lastLogged = useMemo(() => getLastLoggedSession(trainingSessions), [trainingSessions]);
  const addDefaults = useMemo(
    () =>
      lastLogged
        ? toSessionFormDefaults(lastLogged, defaultEquipmentSetId)
        : defaultEquipmentSetId
          ? { equipmentSetId: defaultEquipmentSetId }
          : undefined,
    [lastLogged, defaultEquipmentSetId],
  );

  const handleOpenAdd = () => {
    setEditTarget(null);
    setTemplateDefaults(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const handleOpenWithTemplate = (template: TrainingTemplate) => {
    setEditTarget(null);
    const defaults = { ...template.defaults };
    if (defaultEquipmentSetId && !defaults.equipmentSetId) {
      defaults.equipmentSetId = defaultEquipmentSetId;
    }
    setTemplateDefaults(defaults);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const didAutoOpenRef = useRef(false);

  useEffect(() => {
    if (didAutoOpenRef.current) return;

    const fromOnboarding = (location.state as { openAddForm?: boolean } | null)?.openAddForm;
    const fromQuery = searchParams.get('add') === '1';
    if (!fromOnboarding && !fromQuery) return;

    didAutoOpenRef.current = true;
    setEditTarget(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);

    if (fromQuery) {
      const next = new URLSearchParams(searchParams);
      next.delete('add');
      setSearchParams(next, { replace: true });
    }
  }, [location.state, searchParams, setSearchParams]);

  const handleOpenEdit = (session: LocalTrainingSession) => {
    setEditTarget(session);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditTarget(null);
    setTemplateDefaults(null);
  };

  const handleSubmit = async (
    data: Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
  ) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        editTrainingSession(editTarget.id, { ...data, isSynced: false });
      } else {
        await addTrainingSession(data);
      }
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

  const getEquipmentName = (equipmentSetId?: string): string | undefined =>
    getEquipmentSetName(equipmentSetId, equipmentSets);

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

  const sorted = [...trainingSessions].sort(
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          {t('trainings.add')}
        </Button>
      </Box>

      <LocalDataBanner showSyncStatus />

      {showBowSetupAlert && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button variant="contained" size="small" onClick={handleOpenAdd}>
              {t('dashboard.bowSetupPrompt.logSession')}
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

      {sorted.length === 0 ? (
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
              >
                {t('trainings.emptyState.orBlank')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sorted.map((session, index) => {
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
                    <Typography variant="h6">{formatDate(session.date)}</Typography>
                    {!session.isSynced && <LocalSyncChip />}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {(session.shotsCount !== undefined || session.distance) && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
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
                              {parseFloat(session.distance).toFixed(1)}m
                            </Box>
                          </Typography>
                        )}
                      </Box>
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
                          {getEquipmentName(session.equipmentSetId) ?? session.equipmentSetId}
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
                    onClick={() => handleDelete(session.id)}
                  >
                    {t('common.delete')}
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      <TrainingSessionDialog
        open={formOpen}
        onClose={handleClose}
        title={editTarget ? t('trainings.session') : t('trainings.add')}
        initial={editTarget ?? templateDefaults ?? addDefaults}
        useDefaultEquipment={!editTarget}
        formKey={formKey}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </Box>
  );
};

export default MyTrainingsPage;
