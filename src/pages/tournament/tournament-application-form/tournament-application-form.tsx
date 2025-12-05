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
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import apiService from '../../../services/api';
import type { BowCategory, DivisionDto } from '../../../services/types';

interface TournamentApplicationFormProps {
  tournamentId: string;
  tournamentTitle: string;
  tournamentRuleCode?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TournamentApplicationForm: React.FC<TournamentApplicationFormProps> = ({
  tournamentId,
  tournamentTitle,
  tournamentRuleCode,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BowCategory[]>([]);
  const [divisions, setDivisions] = useState<DivisionDto[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState({
    nationality: '',
    sex: '',
    division: '',
    category: '',
    notes: '',
  });

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [categoriesData, divisionsData] = await Promise.all([
          apiService.getBowCategories(),
          tournamentRuleCode
            ? apiService.getDivisionsByRule(tournamentRuleCode)
            : apiService.getDivisions(),
        ]);
        setCategories(categoriesData);
        setDivisions(divisionsData);
      } catch (error) {
        console.error('Failed to load options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, [tournamentRuleCode]);

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
                  <TextField
                    label={t('pages.applicationForm.nationality', 'Nationality')}
                    value={formData.nationality}
                    onChange={(e) =>
                      handleInputChange('nationality', e.target.value)
                    }
                    fullWidth
                    required
                    placeholder="e.g. Ukrainian"
                  />
                </Box>

                <Box sx={{ flex: '1 1 300px' }}>
                  <FormControl fullWidth required>
                    <InputLabel>{t('pages.applicationForm.sex', 'Sex')}</InputLabel>
                    <Select
                      value={formData.sex}
                      label={t('pages.applicationForm.sex', 'Sex')}
                      onChange={(e) =>
                        handleInputChange('sex', e.target.value)
                      }
                    >
                      <MenuItem value="M">{t('pages.applicationForm.opts.male', 'Male')}</MenuItem>
                      <MenuItem value="F">{t('pages.applicationForm.opts.female', 'Female')}</MenuItem>
                      <MenuItem value="Other">{t('pages.applicationForm.opts.other', 'Other')}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <FormControl fullWidth required disabled={loadingOptions}>
                    <InputLabel>{t('pages.applicationForm.division', 'Division')}</InputLabel>
                    <Select
                      value={formData.division}
                      label={t('pages.applicationForm.division', 'Division')}
                      onChange={(e) =>
                        handleInputChange('division', e.target.value)
                      }
                    >
                      {divisions.map((division) => (
                        <MenuItem key={division.id} value={division.id}>
                          {division.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 300px' }}>
                  <FormControl fullWidth required disabled={loadingOptions}>
                    <InputLabel>{t('pages.applicationForm.category', 'Bow Category')}</InputLabel>
                    <Select
                      value={formData.category}
                      label={t('pages.applicationForm.category', 'Bow Category')}
                      onChange={(e) =>
                        handleInputChange('category', e.target.value)
                      }
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.code} value={category.code}>
                          {category.code} - {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

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
