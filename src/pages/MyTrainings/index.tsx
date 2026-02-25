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
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import LocalDataBanner from '../../components/LocalDataBanner/LocalDataBanner';
import LocalSyncChip from '../../components/LocalSyncChip/LocalSyncChip';
import { useLocalData, type LocalTrainingSession } from '../../contexts/local-data-context';
import TrainingSessionForm from './TrainingSessionForm';

const MyTrainingsPage: React.FC = () => {
  const { t } = useTranslation('common');
  const {
    trainingSessions,
    equipmentSets,
    addTrainingSession,
    editTrainingSession,
    removeTrainingSession,
  } = useLocalData();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LocalTrainingSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (session: LocalTrainingSession) => {
    setEditTarget(session);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditTarget(null);
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

  const getEquipmentName = (equipmentSetId?: string): string | undefined => {
    if (!equipmentSetId) return undefined;
    const set = equipmentSets.find((s) => s.id === equipmentSetId);
    return set?.name;
  };

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

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}

      {sorted.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {t('trainings.empty')}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sorted.map((session) => (
            <Card key={session.id} variant="outlined">
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
          ))}
        </Box>
      )}

      <Dialog open={formOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? t('trainings.session') : t('trainings.add')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TrainingSessionForm
              initial={editTarget ?? undefined}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              submitting={submitting}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MyTrainingsPage;
