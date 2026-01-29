import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../../contexts/auth-context';
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BowCategory[]>([]);
  const [divisions, setDivisions] = useState<DivisionDto[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState({
    nationality: user?.nationality || 'Portuguesa',
    gender: user?.gender || 'M',
    division: '',
    category: '',
    notes: '',
  });

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [categoriesData, divisionsData] = await Promise.all([
          tournamentRuleCode
            ? apiService.getBowCategoriesByRule(tournamentRuleCode)
            : apiService.getBowCategories(),
          tournamentRuleCode
            ? apiService.getDivisionsByRule(tournamentRuleCode)
            : apiService.getDivisions(),
        ]);
        setCategories(categoriesData);
        
        // Remove duplicates by id to prevent showing duplicate divisions
        const uniqueDivisions = Array.from(
          new Map(divisionsData.map((d) => [d.id, d])).values()
        );
        setDivisions(uniqueDivisions);
      } catch (error) {
        console.error('Failed to load options:', error);
        setCategories([]);
        setDivisions([]);
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
                  <FormControl fullWidth required>
                    <InputLabel>{t('pages.applicationForm.nationality', 'Nationality')}</InputLabel>
                    <Select
                      value={formData.nationality}
                      label={t('pages.applicationForm.nationality', 'Nationality')}
                      onChange={(e) =>
                        handleInputChange('nationality', e.target.value)
                      }
                    >
                      <MenuItem value="Portuguesa">Portuguesa</MenuItem>
                      <MenuItem value="Outro">Outro</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 300px' }}>
                  <FormControl fullWidth required>
                    <InputLabel>{t('pages.applicationForm.gender', 'Gender')}</InputLabel>
                    <Select
                      value={formData.gender}
                      label={t('pages.applicationForm.gender', 'Gender')}
                      onChange={(e) =>
                        handleInputChange('gender', e.target.value)
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
                      {divisions
                        .filter((division, index, self) => 
                          // Remove duplicates by id
                          index === self.findIndex((d) => d.id === division.id)
                        )
                        .map((division) => (
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
