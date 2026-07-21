import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalData, type LocalTrainingSession } from '../../contexts/local-data-context';
import {
  isNonNegativeDecimalInput,
  isNonNegativeIntegerInput,
} from '../../utils/non-negative-number';
import { DEFAULT_ARROWS_PER_SET } from '../../utils/training-session-utils';
import { formatTrainingSessionDateTime } from '../../utils/training-stats';

const TARGET_TYPES = ['WA_5_ring', 'WA_10_ring', 'IFAA_Field', 'NFAA_Indoor', 'custom'];

interface ActiveSessionCardProps {
  session: LocalTrainingSession;
  onFinish: () => void;
}

const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({ session, onFinish }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { equipmentSets, editTrainingSession, incrementSessionShots } = useLocalData();

  const [arrowsPerSet, setArrowsPerSet] = useState(
    String(session.arrowsPerSet ?? DEFAULT_ARROWS_PER_SET),
  );

  const shots = session.shotsCount ?? 0;
  const setSize = Number.parseInt(arrowsPerSet, 10) || DEFAULT_ARROWS_PER_SET;

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

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: 'primary.main',
        borderWidth: 2,
        ...(isMobile && {
          mx: { xs: -1, sm: 0 },
          borderRadius: { xs: 2, sm: 1 },
        }),
      }}
    >
      <CardContent
        sx={{
          pt: 2,
          px: 2,
          pb: 1,
          '&:last-child': { pb: 1 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Chip label={t('trainings.inProgress')} color="primary" size="small" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            {formatTrainingSessionDateTime(session)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            my: isMobile ? 2 : 1.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
            <IconButton
              aria-label={t('trainings.removeShot')}
              onClick={handleRemoveShot}
              disabled={shots <= 0}
              size="large"
              sx={{
                width: isMobile ? 56 : undefined,
                height: isMobile ? 56 : undefined,
              }}
            >
              <RemoveIcon fontSize="inherit" />
            </IconButton>
          </Box>
          <Typography
            variant={isMobile ? 'h2' : 'h3'}
            fontWeight={700}
            textAlign="center"
            sx={{ lineHeight: 1.1 }}
          >
            {shots}
          </Typography>
          <Box />
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 1.5 }}>
          {t('trainings.shotsCount')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
          <TextField
            label={t('trainings.arrowsPerSet')}
            type="number"
            size="small"
            value={arrowsPerSet}
            onChange={(e) => {
              const val = e.target.value;
              if (isNonNegativeIntegerInput(val)) setArrowsPerSet(val);
            }}
            onBlur={() => {
              const parsed = Number.parseInt(arrowsPerSet, 10);
              if (parsed >= 1 && parsed !== session.arrowsPerSet) {
                void editTrainingSession(session.id, { arrowsPerSet: parsed });
              } else if (!(parsed >= 1)) {
                setArrowsPerSet(String(session.arrowsPerSet ?? DEFAULT_ARROWS_PER_SET));
              }
            }}
            inputProps={{ min: 1, inputMode: 'numeric' }}
            sx={{ width: 120 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexDirection: isMobile ? 'column' : 'row' }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleAddShot}
            sx={{ minHeight: isMobile ? 48 : undefined }}
          >
            {t('trainings.addShot')}
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleAddSet}
            sx={{ minHeight: isMobile ? 48 : undefined }}
          >
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
              if (isNonNegativeDecimalInput(val)) handleFieldChange('distance', val);
            }}
            inputProps={{ min: 0.01, step: 0.01, inputMode: 'decimal' }}
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
      <CardActions
        sx={{
          justifyContent: isMobile ? 'stretch' : 'flex-end',
          px: 2,
          pt: 0,
          pb: 1.5,
          gap: 0,
        }}
      >
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckIcon />}
          onClick={onFinish}
          fullWidth={isMobile}
          size={isMobile ? 'large' : 'medium'}
          sx={{ minHeight: isMobile ? 48 : undefined, my: 2, mx: 0 }}
        >
          {t('trainings.finishSession')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ActiveSessionCard;
