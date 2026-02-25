import AddIcon from '@mui/icons-material/Add';
import BowIcon from '@mui/icons-material/ArchitectureOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
import { useLocalData, type LocalEquipmentSet } from '../../contexts/local-data-context';
import EquipmentSetForm from './EquipmentSetForm';

const isNumericOnly = (val: string) => /^\d+(\.\d+)?$/.test(val.trim());
const withUnit = (val: string, unit: string) => (isNumericOnly(val) ? `${val} ${unit}` : val);

const MyEquipmentPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { equipmentSets, addEquipmentSet, editEquipmentSet, removeEquipmentSet } = useLocalData();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LocalEquipmentSet | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (set: LocalEquipmentSet) => {
    setEditTarget(set);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = async (
    data: Omit<LocalEquipmentSet, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
  ) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        editEquipmentSet(editTarget.id, { ...data, isSynced: false });
      } else {
        await addEquipmentSet(data);
      }
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    try {
      await removeEquipmentSet(id);
    } catch {
      setDeleteError(t('equipment.deleteError'));
    }
  };

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
          {t('equipment.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          {t('equipment.addSet')}
        </Button>
      </Box>

      <LocalDataBanner showSyncStatus />

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}

      {equipmentSets.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {t('equipment.empty')}
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {equipmentSets.map((set) => (
            <Card key={set.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BowIcon color="primary" />
                  <Typography variant="h6">{set.name}</Typography>
                  {!set.isSynced && <LocalSyncChip />}
                </Box>

                {/* rows container: larger gap between rows, smaller gap between items within a row */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
                  {set.bowType && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('equipment.bowType')}:{' '}
                        <Box component="span" fontWeight="bold">
                          {t(`equipment.${set.bowType}`)}
                        </Box>
                      </Typography>
                    </Box>
                  )}

                  {set.manufacturer && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('equipment.manufacturer')}:{' '}
                        <Box component="span" fontWeight="bold">
                          {set.manufacturer}
                        </Box>
                      </Typography>
                    </Box>
                  )}

                  {(set.model || set.drawWeight) && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {set.model && (
                        <Typography variant="body2" color="text.secondary">
                          {t('equipment.model')}:{' '}
                          <Box component="span" fontWeight="bold">
                            {set.model}
                          </Box>
                        </Typography>
                      )}
                      {set.drawWeight && (
                        <Typography variant="body2" color="text.secondary">
                          {t('equipment.drawWeight')}:{' '}
                          <Box component="span" fontWeight="bold">
                            {withUnit(set.drawWeight, 'lbs')}
                          </Box>
                        </Typography>
                      )}
                    </Box>
                  )}

                  {(set.arrowLength || set.arrowSpine || set.arrowWeight || set.arrowMaterial) && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                      >
                        {t('equipment.arrowGroup')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.25 }}>
                        {set.arrowLength && (
                          <Typography variant="body2" color="text.secondary">
                            {t('equipment.length')}:{' '}
                            <Box component="span" fontWeight="bold">
                              {withUnit(set.arrowLength, 'inch')}
                            </Box>
                          </Typography>
                        )}
                        {set.arrowSpine && (
                          <Typography variant="body2" color="text.secondary">
                            {t('equipment.arrowSpine')}:{' '}
                            <Box component="span" fontWeight="bold">
                              {set.arrowSpine}
                            </Box>
                          </Typography>
                        )}
                        {set.arrowWeight && (
                          <Typography variant="body2" color="text.secondary">
                            {t('equipment.weight')}:{' '}
                            <Box component="span" fontWeight="bold">
                              {set.arrowWeight}
                            </Box>
                          </Typography>
                        )}
                        {set.arrowMaterial && (
                          <Typography variant="body2" color="text.secondary">
                            {t('equipment.material')}:{' '}
                            <Box component="span" fontWeight="bold">
                              {set.arrowMaterial}
                            </Box>
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {set.customFields && set.customFields.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {set.customFields.map((f) => (
                        <Typography key={f.key} variant="body2" color="text.secondary">
                          {f.key}:{' '}
                          <Box component="span" fontWeight="bold">
                            {f.value}
                          </Box>
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenEdit(set)}>
                  {t('common.update')}
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(set.id)}
                >
                  {t('common.delete')}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={formOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? t('equipment.editSet') : t('equipment.addSet')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <EquipmentSetForm
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

export default MyEquipmentPage;
