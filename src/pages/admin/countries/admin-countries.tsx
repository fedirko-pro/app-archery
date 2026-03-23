import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import apiService from '../../../services/api';
import type { CountryDto } from '../../../services/types';

type CountryForm = {
  code: string;
  name: string;
  flagEmoji?: string;
  enabled: boolean;
};

const emptyForm: CountryForm = { code: 'PT', name: 'Portugal', flagEmoji: '🇵🇹', enabled: true };

const AdminCountries: React.FC = () => {
  const { t } = useTranslation('common');
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CountryDto | null>(null);
  const [form, setForm] = useState<CountryForm>(emptyForm);

  const title = useMemo(
    () =>
      editing
        ? t('admin.countries.edit', 'Edit Country')
        : t('admin.countries.create', 'Create Country'),
    [editing, t],
  );

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCountries();
      setCountries(data);
    } catch (e) {
      setError(t('admin.countries.loadError', 'Failed to load countries'));
      if (import.meta.env.DEV) console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: CountryDto) => {
    setEditing(c);
    setForm({
      code: c.code,
      name: c.name,
      flagEmoji: c.flagEmoji || '',
      enabled: c.enabled,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setError(null);
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        flagEmoji: form.flagEmoji?.trim() || undefined,
        enabled: form.enabled,
      };
      if (!payload.code || payload.code.length !== 2 || !payload.name) {
        setError(t('admin.countries.validation', 'Code (2 letters) and name are required'));
        return;
      }
      if (editing) {
        await apiService.updateCountry(editing.code, {
          name: payload.name,
          flagEmoji: payload.flagEmoji,
          enabled: payload.enabled,
        });
      } else {
        await apiService.createCountry(payload);
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(t('admin.countries.saveError', 'Failed to save country'));
      if (import.meta.env.DEV) console.error(e);
    }
  };

  const handleDelete = async (c: CountryDto) => {
    if (!globalThis.confirm(t('admin.countries.deleteConfirm', 'Delete this country?'))) {
      return;
    }
    try {
      await apiService.deleteCountry(c.code);
      await load();
    } catch (e) {
      setError(t('admin.countries.deleteError', 'Failed to delete country'));
      if (import.meta.env.DEV) console.error(e);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>{t('common.loading', 'Loading...')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('admin.countries.title', 'Countries')}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          {t('common.create', 'Create')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 2 }}>
        {countries.map((c) => (
          <Card key={c.code}>
            <CardContent>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
              >
                <Box>
                  <Typography variant="h6">
                    {c.flagEmoji ? `${c.flagEmoji} ` : ''}
                    {c.name} <span style={{ opacity: 0.7 }}>({c.code})</span>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.enabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => openEdit(c)}
                  >
                    {t('common.edit', 'Edit')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(c)}
                  >
                    {t('common.delete', 'Delete')}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('admin.countries.code', 'ISO2 Code')}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().slice(0, 2) })}
            fullWidth
            margin="normal"
            required
            disabled={!!editing}
          />
          <TextField
            label={t('admin.countries.name', 'Name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label={t('admin.countries.flagEmoji', 'Flag (emoji)')}
            value={form.flagEmoji}
            onChange={(e) => setForm({ ...form, flagEmoji: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              />
            }
            label={t('admin.countries.enabled', 'Enabled')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
          <Button onClick={handleSave} variant="contained">
            {t('common.save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCountries;
