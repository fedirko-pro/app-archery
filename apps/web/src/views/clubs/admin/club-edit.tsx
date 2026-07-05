import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import LogoUploader from '../../../components/LogoUploader/LogoUploader';
import { COUNTRIES } from '../../../config/countries';
import { canManageReferenceData } from '../../../config/roles';
import { useAuth } from '../../../contexts/auth-context';
import { useNotification } from '../../../contexts/error-feedback-context';
import apiService from '../../../services/api';
import type { ClubDto } from '../../../services/types';

/**
 * Admin-only club editor.
 * Allows creating new clubs or editing existing ones.
 */
const ClubEdit: React.FC = () => {
  const { id, lang } = useParams<{ id: string; lang: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { showWarning, showError, showSuccess } = useNotification();

  const [form, setForm] = useState<ClubDto>({
    id: id === 'create' ? undefined : id,
    name: '',
    shortCode: '',
    description: '',
    country: '',
    city: '',
    visibility: 'public',
    clubLogo: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const isAdmin = user && canManageReferenceData(user.role);

  useEffect(() => {
    if (!isAdmin) {
      navigate(`/${lang}/signin`);
      return;
    }

    if (!id || id === 'create') return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await apiService.getClubById(id);
        if (data) setForm(data);
      } catch (error) {
        console.error('Failed to load club:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAdmin, navigate, lang]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      showWarning(t('pages.clubs.nameRequired', 'Club name is required'));
      return;
    }

    try {
      setLoading(true);
      await apiService.upsertClub(form);
      showSuccess(t('pages.clubs.saveSuccess', 'Club saved successfully'));
      navigate(`/${lang}/clubs`);
    } catch (error) {
      console.error('Failed to save club:', error);
      showError(
        error instanceof Error
          ? error.message
          : t('pages.clubs.saveError', 'Failed to save club. Please try again.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${lang}/clubs`);
  };

  return (
    <section>
      <div className="container">
        <Typography variant="h4" gutterBottom>
          {id === 'create'
            ? t('pages.clubs.create', 'Create Club')
            : t('pages.clubs.edit', 'Edit Club')}
        </Typography>

        <Box sx={{ maxWidth: 600 }}>
          <Stack spacing={3}>
            <TextField
              label={t('pages.clubs.name', 'Club Name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label={t('pages.clubs.shortCode', 'Short Code')}
              value={form.shortCode || ''}
              onChange={(e) => setForm({ ...form, shortCode: e.target.value })}
              placeholder="e.g. KSP"
              fullWidth
              helperText={t('pages.clubs.shortCodeHelp', 'Used on score cards (3–5 letters)')}
            />

            <FormControl fullWidth>
              <InputLabel>{t('forms.country', 'Country')}</InputLabel>
              <Select
                value={form.country || ''}
                label={t('forms.country', 'Country')}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              >
                <MenuItem value="">
                  <em>{t('forms.none', 'None')}</em>
                </MenuItem>
                {COUNTRIES.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t('pages.clubs.city', 'City')}
              value={form.city || ''}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.visibility === 'public'}
                  onChange={(e) =>
                    setForm({ ...form, visibility: e.target.checked ? 'public' : 'private' })
                  }
                />
              }
              label={t('pages.clubs.publicClub', 'Public club (visible in directory)')}
            />

            <TextField
              label={t('pages.clubs.description', 'Description')}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              minRows={4}
              fullWidth
            />

            <LogoUploader
              value={form.clubLogo}
              onChange={(url) => setForm({ ...form, clubLogo: url || '' })}
              entityId={form.id}
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

export default ClubEdit;
