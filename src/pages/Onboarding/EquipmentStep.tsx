import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { setDefaultEquipmentSetId } from '../../utils/equipment-utils';
import type { LocalEquipmentSet } from '../../utils/local-data-storage';
import EquipmentSetMiniForm from '../MyEquipment/EquipmentSetMiniForm';

interface EquipmentStepProps {
  equipmentAdded: boolean;
  onEquipmentAdded: () => void;
}

const EquipmentStep: React.FC<EquipmentStepProps> = ({ equipmentAdded, onEquipmentAdded }) => {
  const { t } = useTranslation('common');
  const [showForm, setShowForm] = useState(!equipmentAdded);

  const handleCreated = (set: LocalEquipmentSet) => {
    setDefaultEquipmentSetId(set.id);
    onEquipmentAdded();
    setShowForm(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {t('onboarding.steps.equipmentExplanation')}
      </Typography>

      {equipmentAdded && !showForm && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
          <CheckCircleOutlineIcon fontSize="small" />
          <Typography variant="body2">{t('onboarding.equipmentAdded')}</Typography>
        </Box>
      )}

      {showForm && (
        <EquipmentSetMiniForm
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
          showCancel={equipmentAdded}
        />
      )}

      {equipmentAdded && !showForm && (
        <Typography
          component="button"
          type="button"
          variant="body2"
          color="primary"
          sx={{ border: 0, background: 'none', cursor: 'pointer', p: 0, textAlign: 'left' }}
          onClick={() => setShowForm(true)}
        >
          {t('onboarding.addAnotherSetup')}
        </Typography>
      )}
    </Box>
  );
};

export default EquipmentStep;
