import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalData } from '../../contexts/local-data-context';
import type { LocalTrainingSession, CustomField } from '../../utils/local-data-storage';

interface TrainingSessionFormProps {
  initial?: Partial<LocalTrainingSession>;
  onSubmit: (
    data: Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
  ) => void;
  onCancel: () => void;
  submitting?: boolean;
}

const TARGET_TYPES = ['WA_5_ring', 'WA_10_ring', 'IFAA_Field', 'NFAA_Indoor', 'custom'];

const TrainingSessionForm: React.FC<TrainingSessionFormProps> = ({
  initial = {},
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const { t } = useTranslation('common');
  const { equipmentSets } = useLocalData();

  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(initial.date ?? today);
  const [shotsCount, setShotsCount] = useState(
    initial.shotsCount !== undefined ? String(initial.shotsCount) : '',
  );
  const [distance, setDistance] = useState(initial.distance ?? '');
  const [targetType, setTargetType] = useState(initial.targetType ?? '');
  const [equipmentSetId, setEquipmentSetId] = useState(initial.equipmentSetId ?? '');
  const [customFields, setCustomFields] = useState<CustomField[]>(initial.customFields ?? []);

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: value };
    setCustomFields(updated);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedShots = shotsCount ? parseInt(shotsCount, 10) : undefined;

    onSubmit({
      date,
      shotsCount: parsedShots,
      distance: distance.trim() || undefined,
      targetType: targetType || undefined,
      equipmentSetId: equipmentSetId || undefined,
      customFields: customFields.filter((f) => f.key.trim()),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <TextField
        label={t('trainings.date')}
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label={t('trainings.shotsCount')}
          type="number"
          value={shotsCount}
          onChange={(e) => setShotsCount(e.target.value)}
          fullWidth
          inputProps={{ min: 1 }}
        />
        <TextField
          label={t('trainings.distance')}
          type="number"
          value={distance}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*(\.\d{0,2})?$/.test(val)) setDistance(val);
          }}
          fullWidth
          inputProps={{ min: 0, step: 0.01 }}
          placeholder="18.5"
        />
      </Box>

      <TextField
        select
        label={t('trainings.targetType')}
        value={targetType}
        onChange={(e) => setTargetType(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="">&mdash;</MenuItem>
        {TARGET_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label={t('trainings.equipmentSet')}
        value={equipmentSetId}
        onChange={(e) => setEquipmentSetId(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="">{t('trainings.noEquipment')}</MenuItem>
        {equipmentSets.map((set) => (
          <MenuItem key={set.id} value={set.id}>
            {set.name}
            {set.bowType ? ` (${set.bowType})` : ''}
          </MenuItem>
        ))}
      </TextField>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t('trainings.customFields')}
      </Typography>

      {customFields.map((field, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            label={t('trainings.fieldKey')}
            value={field.key}
            onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            label={t('trainings.fieldValue')}
            value={field.value}
            onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <IconButton onClick={() => handleRemoveCustomField(index)} size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      <Button startIcon={<AddIcon />} onClick={handleAddCustomField} size="small" sx={{ mb: 2 }}>
        {t('trainings.addCustomField')}
      </Button>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
        <Button onClick={onCancel} disabled={submitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? t('common.saving') : t('common.save')}
        </Button>
      </Box>
    </Box>
  );
};

export default TrainingSessionForm;
