import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalData, type LocalTrainingSession } from '../../contexts/local-data-context';
import { DEFAULT_ARROWS_PER_SET } from '../../utils/training-session-utils';

const TARGET_TYPES = ['WA_5_ring', 'WA_10_ring', 'IFAA_Field', 'NFAA_Indoor', 'custom'];

interface ActiveSessionCardProps {
  session: LocalTrainingSession;
  onFinish: () => void;
}

const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({ session, onFinish }) => {
  const { t } = useTranslation('common');
  const { equipmentSets, editTrainingSession, incrementSessionShots, isSessionPersisting } =
    useLocalData();

  const [arrowsPerSet, setArrowsPerSet] = useState(
    String(session.arrowsPerSet ?? DEFAULT_ARROWS_PER_SET),
  );

  const shots = session.shotsCount ?? 0;
  const setSize = Number.parseInt(arrowsPerSet, 10) || DEFAULT_ARROWS_PER_SET;

  const isPersisting = isSessionPersisting(session.id);

  const handleAddShot = () => {
    void incrementSessionShots(session.id, 1);
  };

  const handleRemoveShot = () => {
    if (shots <= 0) return;
    void incrementSessionShots(session.id, -1);
  };

  const handleAddSet = () => {
    void incrementSessionShots(session.id, setSize, { arrowsPerSet: setSize });
  };

  const handleFieldChange = (field: keyof LocalTrainingSession, value: string) => {
    if (field === 'distance') {
      void editTrainingSession(session.id, { distance: value.trim() || undefined });
    } else if (field === 'targetType') {
      void editTrainingSession(session.id, { targetType: value || undefined });
    } else if (field === 'equipmentSetId') {
      void editTrainingSession(session.id, { equipmentSetId: value || undefined });
    }
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

  return (
    <Card variant="outlined" sx={{ borderColor: 'primary.main', borderWidth: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip label={t('trainings.inProgress')} color="primary" size="small" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            {formatDate(session.date)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            my: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
            <IconButton
              aria-label={t('trainings.removeShot')}
              onClick={handleRemoveShot}
              disabled={isPersisting || shots <= 0}
              size="large"
            >
              <RemoveIcon fontSize="inherit" />
            </IconButton>
          </Box>
          <Typography variant="h3" fontWeight={700} textAlign="center">
            {shots}
          </Typography>
          <Box />
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
          {t('trainings.shotsCount')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <TextField
            label={t('trainings.arrowsPerSet')}
            type="number"
            size="small"
            value={arrowsPerSet}
            onChange={(e) => setArrowsPerSet(e.target.value)}
            onBlur={() => {
              const parsed = Number.parseInt(arrowsPerSet, 10);
              if (parsed >= 1 && parsed !== session.arrowsPerSet) {
                void editTrainingSession(session.id, { arrowsPerSet: parsed });
              }
            }}
            inputProps={{ min: 1 }}
            sx={{ width: 120 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant="outlined" fullWidth onClick={handleAddShot} disabled={isPersisting}>
            {t('trainings.addShot')}
          </Button>
          <Button variant="contained" fullWidth onClick={handleAddSet} disabled={isPersisting}>
            {t('trainings.addSet')} (+{setSize})
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label={t('trainings.distance')}
            type="number"
            size="small"
            value={session.distance ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*(\.\d{0,2})?$/.test(val)) handleFieldChange('distance', val);
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            select
            label={t('trainings.targetType')}
            size="small"
            value={session.targetType ?? ''}
            onChange={(e) => handleFieldChange('targetType', e.target.value)}
          >
            <MenuItem value="">&mdash;</MenuItem>
            {TARGET_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          {equipmentSets.length > 0 && (
            <TextField
              select
              label={t('trainings.equipmentSet')}
              size="small"
              value={session.equipmentSetId ?? ''}
              onChange={(e) => handleFieldChange('equipmentSetId', e.target.value)}
            >
              <MenuItem value="">{t('trainings.noEquipment')}</MenuItem>
              {equipmentSets.map((set) => (
                <MenuItem key={set.id} value={set.id}>
                  {set.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={onFinish}>
          {t('trainings.finishSession')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ActiveSessionCard;
