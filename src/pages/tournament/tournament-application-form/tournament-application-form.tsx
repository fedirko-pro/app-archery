import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import apiService from '../../../services/api';

interface TournamentApplicationFormProps {
  tournamentId: string;
  tournamentTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TournamentApplicationForm: React.FC<TournamentApplicationFormProps> = ({
  tournamentId,
  tournamentTitle,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    division: '',
    equipment: '',
    notes: '',
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.createTournamentApplication({
        tournamentId,
        ...formData,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t('pages.applicationForm.submitError'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t('pages.applicationForm.title', { title: tournamentTitle })}
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('pages.applicationForm.category')}</InputLabel>
                    <Select
                      value={formData.category}
                      label={t('pages.applicationForm.category')}
                      onChange={(e) =>
                        handleInputChange('category', e.target.value)
                      }
                    >
                      <MenuItem value="recurve">{t('pages.applicationForm.opts.recurve')}</MenuItem>
                      <MenuItem value="compound">{t('pages.applicationForm.opts.compound')}</MenuItem>
                      <MenuItem value="barebow">{t('pages.applicationForm.opts.barebow')}</MenuItem>
                      <MenuItem value="traditional">{t('pages.applicationForm.opts.traditional')}</MenuItem>
                      <MenuItem value="longbow">{t('pages.applicationForm.opts.longbow')}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('pages.applicationForm.division')}</InputLabel>
                    <Select
                      value={formData.division}
                      label={t('pages.applicationForm.division')}
                      onChange={(e) =>
                        handleInputChange('division', e.target.value)
                      }
                    >
                      <MenuItem value="men">{t('pages.applicationForm.opts.men')}</MenuItem>
                      <MenuItem value="women">{t('pages.applicationForm.opts.women')}</MenuItem>
                      <MenuItem value="mixed">{t('pages.applicationForm.opts.mixed')}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <FormControl fullWidth>
                <InputLabel>{t('pages.applicationForm.equipment')}</InputLabel>
                <Select
                  value={formData.equipment}
                  label={t('pages.applicationForm.equipment')}
                  onChange={(e) =>
                    handleInputChange('equipment', e.target.value)
                  }
                >
                  <MenuItem value="olympic">{t('pages.applicationForm.opts.olympic')}</MenuItem>
                  <MenuItem value="compound">{t('pages.applicationForm.opts.compoundBow')}</MenuItem>
                  <MenuItem value="barebow">{t('pages.applicationForm.opts.barebow')}</MenuItem>
                  <MenuItem value="traditional">{t('pages.applicationForm.opts.traditionalBow')}</MenuItem>
                  <MenuItem value="longbow">{t('pages.applicationForm.opts.longbow')}</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={t('pages.applicationForm.notes')}
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder={t('pages.applicationForm.notesPlaceholder')}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {onCancel && (
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    {t('common.cancel')}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? t('pages.applicationForm.submitting') : t('pages.applicationForm.submit')}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TournamentApplicationForm;
