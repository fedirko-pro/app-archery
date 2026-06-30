import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { useLocalData } from '../../contexts/local-data-context';
import { BOW_TYPES } from '../../utils/equipment-utils';
import type { LocalEquipmentSet } from '../../utils/local-data-storage';

interface EquipmentSetMiniFormProps {
  onCreated: (set: LocalEquipmentSet) => void;
  onCancel: () => void;
  showCancel?: boolean;
}

const EquipmentSetMiniForm: React.FC<EquipmentSetMiniFormProps> = ({
  onCreated,
  onCancel,
  showCancel = true,
}) => {
  const { t } = useTranslation('common');
  const { addEquipmentSet } = useLocalData();
  const { lang } = useParams();

  const [name, setName] = useState('');
  const [bowType, setBowType] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t('equipment.nameRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const created = await addEquipmentSet({
        name: name.trim(),
        bowType: bowType || undefined,
      });
      onCreated(created);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 1, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}
    >
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
        size="small"
        sx={{ mb: 1.5 }}
      />

      <TextField
        select
        label={t('equipment.bowType')}
        value={bowType}
        onChange={(e) => setBowType(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 1.5 }}
      >
        <MenuItem value="">&mdash;</MenuItem>
        {BOW_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {t(`equipment.${type}`)}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button component={Link} to={`/${lang}/equipment`} size="small" sx={{ mr: 'auto' }}>
          {t('trainings.equipment.addFullDetails')}
        </Button>
        {showCancel && (
          <Button size="small" onClick={onCancel} disabled={submitting}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" variant="contained" size="small" disabled={submitting}>
          {submitting ? t('common.saving') : t('trainings.equipment.createSetup')}
        </Button>
      </Box>
    </Box>
  );
};

export default EquipmentSetMiniForm;
