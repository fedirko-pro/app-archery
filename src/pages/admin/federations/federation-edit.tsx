import { ArrowBack } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import LogoUploader from '../../../components/LogoUploader/LogoUploader';
import { canManageReferenceData } from '../../../config/roles';
import { useAuth } from '../../../contexts/auth-context';
import { useNotification } from '../../../contexts/error-feedback-context';
import apiService from '../../../services/api';
import type { CountryDto, FederationDto } from '../../../services/types';

/**
 * Admin-only federation editor.
 * Allows creating new federations or editing existing ones.
 */
const FederationEdit: React.FC = () => {
  const { id, lang } = useParams<{ id: string; lang: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { showWarning, showError, showSuccess } = useNotification();

  const isCreate = !id || id === 'create';

  type FederationForm = Omit<FederationDto, 'countryCode'> & {
    // The API model uses optional fields, but the admin form requires this to be a string.
    countryCode: string;
  };

  const [form, setForm] = useState<FederationForm>({
    id: isCreate ? '' : id || '',
    name: '',
    shortCode: '',
    description: '',
    logo: '',
    url: '',
    countryCode: '',
  });

  const [countries, setCountries] = useState<CountryDto[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const isAdmin = user && canManageReferenceData(user.role);

  useEffect(() => {
    if (!isAdmin) {
      navigate(`/${lang}/signin`);
      return;
    }

    const loadCountries = async () => {
      try {
        const data = await apiService.getCountries();
        setCountries(data);
      } catch (error) {
        console.error('Failed to load countries:', error);
      }
    };

    const loadFederation = async () => {
      if (isCreate) return;

      setLoading(true);
      try {
        const data = await apiService.getFederationById(id!);
        if (data) {
          setForm({
            id: data.id,
            name: data.name,
            shortCode: data.shortCode,
            description: data.description || '',
            logo: data.logo || '',
            url: data.url || '',
            countryCode: data.country?.code || data.countryCode || '',
          });
        }
      } catch (error) {
        console.error('Failed to load federation:', error);
        showError(t('admin.federations.loadError', 'Failed to load federation'));
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
    loadFederation();
  }, [id, isAdmin, isCreate, navigate, lang, showError, t]);

  useEffect(() => {
    if (isCreate) {
      setForm({
        id: '',
        name: '',
        shortCode: '',
        description: '',
        logo: '',
        url: '',
        countryCode: '',
      });
    }
  }, [isCreate]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.shortCode.trim() || !form.countryCode.trim()) {
      showWarning(t('admin.federations.validation', 'Name, Short Code, and Country are required'));
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        shortCode: form.shortCode.trim(),
        countryCode: form.countryCode.trim(),
        description: form.description?.trim() || undefined,
        logo: form.logo?.trim() || undefined,
        url: form.url?.trim() || undefined,
      };

      if (isCreate) {
        await apiService.createFederation(payload);
        showSuccess(t('admin.federations.createSuccess', 'Federation created successfully'));
      } else {
        await apiService.updateFederation(id!, payload);
        showSuccess(t('admin.federations.updateSuccess', 'Federation updated successfully'));
      }

      navigate(`/${lang}/admin/federations`);
    } catch (error) {
      console.error('Failed to save federation:', error);
      showError(
        error instanceof Error
          ? error.message
          : t('admin.federations.saveError', 'Failed to save federation. Please try again.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${lang}/admin/federations`);
  };

  return (
    <section>
      <div className="container">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/${lang}/admin/federations`)}
          sx={{ mb: 2 }}
        >
          {t('common.back', 'Back')}
        </Button>

        <Typography variant="h4" gutterBottom>
          {isCreate
            ? t('admin.federations.create', 'Create Federation')
            : t('admin.federations.edit', 'Edit Federation')}
        </Typography>

        <Box sx={{ maxWidth: 600 }}>
          <Stack spacing={3}>
            <TextField
              label={t('admin.federations.name', 'Federation Name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label={t('admin.federations.shortCode', 'Short Code')}
              value={form.shortCode}
              onChange={(e) => setForm({ ...form, shortCode: e.target.value })}
              placeholder="e.g. WAF for World Archery Federation"
              fullWidth
              helperText={t(
                'admin.federations.shortCodeHelp',
                'Used for identification (e.g. 3–5 letters)',
              )}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>{t('admin.federations.country', 'Country')}</InputLabel>
              <Select
                value={form.countryCode}
                label={t('admin.federations.country', 'Country')}
                onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
              >
                <MenuItem value="">
                  <em>{t('common.select', 'Select...')}</em>
                </MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.flagEmoji} {country.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {t('admin.federations.countryHelp', 'The country this federation belongs to')}
              </FormHelperText>
            </FormControl>

            <TextField
              label={t('admin.federations.description', 'Description')}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              minRows={4}
              fullWidth
            />

            <LogoUploader
              value={form.logo}
              onChange={(url) => setForm({ ...form, logo: url || '' })}
              entityId={form.id || undefined}
            />

            <TextField
              label={t('admin.federations.url', 'Website URL')}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com"
              fullWidth
              helperText={t('admin.federations.urlHelp', 'Official federation website (optional)')}
            />

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleSave} disabled={loading}>
                {loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
              </Button>
              <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                {t('common.cancel', 'Cancel')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </div>
    </section>
  );
};

export default FederationEdit;
