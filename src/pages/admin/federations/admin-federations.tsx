import { Add, Delete, Edit } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography, Alert } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import apiService from '../../../services/api';
import type { FederationDto } from '../../../services/types';

const AdminFederations: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const [federations, setFederations] = useState<FederationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getFederations();
      setFederations(data as FederationDto[]);
    } catch (e) {
      setError(t('admin.federations.loadError', 'Failed to load federations'));
      if (import.meta.env.DEV) console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    navigate(`/${lang}/admin/federations/create`);
  };

  const openEdit = (fed: FederationDto) => {
    navigate(`/${lang}/admin/federations/${fed.id}/edit`);
  };

  const handleDelete = async (fed: FederationDto) => {
    if (!globalThis.confirm(t('admin.federations.deleteConfirm', 'Delete this federation?'))) {
      return;
    }
    try {
      await apiService.deleteFederation(fed.id);
      await load();
    } catch (e) {
      setError(t('admin.federations.deleteError', 'Failed to delete federation'));
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
        <Typography variant="h4">{t('admin.federations.title', 'Federations')}</Typography>
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
        {federations.map((fed) => (
          <Card key={fed.id}>
            <CardContent>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {fed.logo ? (
                    <Box
                      component="img"
                      src={fed.logo}
                      alt={`${fed.name} logo`}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'contain',
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.paper',
                        color: 'text.disabled',
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        p: 1,
                      }}
                    >
                      {t('admin.federations.noLogo', 'No logo')}
                    </Box>
                  )}

                  <Box>
                    <Typography variant="h6">
                      {fed.name} <span style={{ opacity: 0.7 }}>({fed.shortCode})</span>
                    </Typography>
                    {fed.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {fed.description}
                      </Typography>
                    )}
                    {fed.url && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <strong>URL:</strong> {fed.url}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => openEdit(fed)}
                  >
                    {t('common.edit', 'Edit')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(fed)}
                  >
                    {t('common.delete', 'Delete')}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default AdminFederations;
