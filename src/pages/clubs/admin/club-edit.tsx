import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import LogoUploader from '../../../components/LogoUploader/LogoUploader';
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
    location: '',
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
      showError(error instanceof Error ? error.message : t('pages.clubs.saveError', 'Failed to save club. Please try again.'));
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
          {id === 'create' ? 'Create Club' : 'Edit Club'}
        </Typography>

        <Box sx={{ maxWidth: 600 }}>
          <Stack spacing={3}>
            <TextField
              label="Club Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Short code"
              value={form.shortCode || ''}
              onChange={(e) => setForm({ ...form, shortCode: e.target.value })}
              placeholder="e.g. KSP for Kyiv Sport Club"
              fullWidth
              helperText="Used on score cards and lists (e.g. 3–5 letters)"
            />

            <TextField
              label="Location"
              value={form.location || ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Kyiv, Ukraine"
              fullWidth
            />

            <TextField
              label="Description"
              value={form.description || ''}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
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
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </div>
    </section>
  );
};

export default ClubEdit;
