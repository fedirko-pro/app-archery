import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ARROW_MATERIALS,
  BOW_TYPES,
  resolveArrowMaterialFormState,
  serializeArrowMaterial,
} from '../../utils/equipment-utils';
import type { LocalEquipmentSet, CustomField } from '../../utils/local-data-storage';
import {
  isNonNegativeDecimalInput,
  isNonNegativeIntegerInput,
  parsePositiveFloat,
  parsePositiveInt,
} from '../../utils/non-negative-number';

interface EquipmentSetFormProps {
  initial?: Partial<LocalEquipmentSet>;
  onSubmit: (data: Omit<LocalEquipmentSet, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  submitting?: boolean;
}

const EquipmentSetForm: React.FC<EquipmentSetFormProps> = ({
  initial = {},
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const { t } = useTranslation('common');

  const initialMaterial = resolveArrowMaterialFormState(initial.arrowMaterial);

  const [name, setName] = useState(initial.name ?? '');
  const [bowType, setBowType] = useState(initial.bowType ?? '');
  const [manufacturer, setManufacturer] = useState(initial.manufacturer ?? '');
  const [model, setModel] = useState(initial.model ?? '');
  const [drawWeight, setDrawWeight] = useState(
    initial.drawWeight == null ? '' : String(initial.drawWeight),
  );
  const [arrowLength, setArrowLength] = useState(initial.arrowLength ?? '');
  const [arrowSpine, setArrowSpine] = useState(initial.arrowSpine ?? '');
  const [arrowWeight, setArrowWeight] = useState(initial.arrowWeight ?? '');
  const [arrowMaterialPreset, setArrowMaterialPreset] = useState(initialMaterial.preset);
  const [customArrowMaterial, setCustomArrowMaterial] = useState(initialMaterial.custom);
  const [customFields, setCustomFields] = useState<CustomField[]>(initial.customFields ?? []);
  const [nameError, setNameError] = useState('');

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

  const handleMaterialChange = (value: string) => {
    setArrowMaterialPreset(value);
    if (value !== 'custom') {
      setCustomArrowMaterial('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError(t('equipment.nameRequired'));
      return;
    }

    const length = parsePositiveFloat(arrowLength);
    const spine = parsePositiveInt(arrowSpine);
    const weight = parsePositiveFloat(arrowWeight);

    onSubmit({
      name: name.trim(),
      bowType: bowType || undefined,
      manufacturer: manufacturer.trim() || undefined,
      model: model.trim() || undefined,
      drawWeight: parsePositiveFloat(drawWeight),
      arrowLength: length !== undefined ? String(length) : undefined,
      arrowSpine: spine !== undefined ? String(spine) : undefined,
      arrowWeight: weight !== undefined ? String(weight) : undefined,
      arrowMaterial: serializeArrowMaterial(arrowMaterialPreset, customArrowMaterial),
      customFields: customFields.filter((f) => f.key.trim()),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <TextField
        label={t('equipment.setName')}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setNameError('');
        }}
        error={!!nameError}
        helperText={nameError}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      <TextField
        select
        label={t('equipment.bowType')}
        value={bowType}
        onChange={(e) => setBowType(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="">&mdash;</MenuItem>
        {BOW_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {t(`equipment.${type}`)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label={t('equipment.manufacturer')}
        value={manufacturer}
        onChange={(e) => setManufacturer(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label={t('equipment.model')}
        value={model}
        onChange={(e) => setModel(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label={t('equipment.drawWeight')}
        value={drawWeight}
        onChange={(e) => {
          const val = e.target.value;
          if (isNonNegativeDecimalInput(val, 2)) setDrawWeight(val);
        }}
        type="number"
        fullWidth
        sx={{ mb: 2 }}
        placeholder="40"
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">lbs</InputAdornment>,
          },
          htmlInput: { min: 0.5, step: 0.5, inputMode: 'decimal' },
        }}
      />

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t('equipment.arrowGroup')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label={t('equipment.arrowLength')}
          value={arrowLength}
          onChange={(e) => {
            const val = e.target.value;
            if (isNonNegativeDecimalInput(val, 2)) setArrowLength(val);
          }}
          type="number"
          fullWidth
          placeholder="30"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">in</InputAdornment>,
            },
            htmlInput: { min: 0.01, step: 0.01, inputMode: 'decimal' },
          }}
        />
        <TextField
          label={t('equipment.arrowSpine')}
          value={arrowSpine}
          onChange={(e) => {
            const val = e.target.value;
            if (isNonNegativeIntegerInput(val)) setArrowSpine(val);
          }}
          type="number"
          fullWidth
          placeholder="400"
          slotProps={{
            htmlInput: { min: 1, step: 1, inputMode: 'numeric' },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          label={t('equipment.arrowWeight')}
          value={arrowWeight}
          onChange={(e) => {
            const val = e.target.value;
            if (isNonNegativeDecimalInput(val, 2)) setArrowWeight(val);
          }}
          type="number"
          fullWidth
          placeholder="350"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">gr</InputAdornment>,
            },
            htmlInput: { min: 0.01, step: 1, inputMode: 'decimal' },
          }}
        />
        <TextField
          select
          label={t('equipment.arrowMaterial')}
          value={arrowMaterialPreset}
          onChange={(e) => handleMaterialChange(e.target.value)}
          fullWidth
        >
          <MenuItem value="">&mdash;</MenuItem>
          {ARROW_MATERIALS.map((material) => (
            <MenuItem key={material} value={material}>
              {t(`equipment.arrowMaterials.${material}`)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {arrowMaterialPreset === 'custom' && (
        <TextField
          label={t('equipment.customArrowMaterial')}
          value={customArrowMaterial}
          onChange={(e) => setCustomArrowMaterial(e.target.value)}
          fullWidth
          autoFocus
          sx={{ mb: 2 }}
          placeholder={t('equipment.customArrowMaterialPlaceholder')}
        />
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t('equipment.customFields')}
      </Typography>

      {customFields.map((field, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            label={t('equipment.fieldKey')}
            value={field.key}
            onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            label={t('equipment.fieldValue')}
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
        {t('equipment.addCustomField')}
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

export default EquipmentSetForm;
