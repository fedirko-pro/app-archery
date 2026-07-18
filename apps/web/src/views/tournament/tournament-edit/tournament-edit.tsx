import { ArrowBack, Save } from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import BannerUploader from '../../../components/BannerUploader/BannerUploader';
import FileAttachments, {
  FileAttachment,
} from '../../../components/FileAttachments/FileAttachments';
import { COUNTRIES, DEFAULT_COUNTRY_CODE } from '../../../config/countries';
import apiService from '../../../services/api';
import type { RuleDto, TournamentDto } from '../../../services/types';

const TournamentEdit: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId, lang } = useParams<{ tournamentId: string; lang: string }>();
  const { t } = useTranslation('common');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [rules, setRules] = useState<RuleDto[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);

  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    address: '',
    country: DEFAULT_COUNTRY_CODE,
    ruleCode: '',
    targetCount: 18,
    allowMultipleApplications: false,
    collectFeedback: true,
    banner: '',
    attachments: [] as FileAttachment[],
  });

  useEffect(() => {
    const loadRules = async () => {
      setLoadingRules(true);
      try {
        const data = await apiService.getRules();
        setRules(data);
      } catch (error) {
        console.error('Failed to load rules:', error);
      } finally {
        setLoadingRules(false);
      }
    };
    loadRules();
  }, []);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId) return;
      try {
        setLoading(true);
        const data = await apiService.getTournament(tournamentId);
        setTournament(data);
        setPendingBannerFile(null);
        setFormData({
          title: data.title,
          description: data.description || '',
          startDate: data.startDate.split('T')[0],
          endDate: data.endDate.split('T')[0],
          applicationDeadline: data.applicationDeadline
            ? data.applicationDeadline.split('T')[0]
            : '',
          address: data.address || '',
          country: data.country || DEFAULT_COUNTRY_CODE,
          ruleCode: data.ruleCode || '',
          targetCount: data.targetCount || 18,
          allowMultipleApplications: data.allowMultipleApplications ?? false,
          collectFeedback: data.collectFeedback ?? true,
          banner: data.banner || '',
          attachments: data.attachments || [],
        });
      } catch (error) {
        setError(t('pages.tournaments.fetchError', 'Failed to fetch tournament'));
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !tournamentId) {
      setError(t('pages.tournaments.updateError', 'Failed to update tournament'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let bannerUrl = formData.banner;
      if (pendingBannerFile) {
        const uploaded = await apiService.uploadImage(pendingBannerFile, 'banner', {
          entityId: tournamentId,
          quality: 85,
        });
        bannerUrl = uploaded.url;
      } else if (bannerUrl.startsWith('blob:') || bannerUrl.startsWith('data:')) {
        // Local preview without a pending file — keep the previously saved banner.
        bannerUrl = tournament?.banner || '';
      }

      const { banner: _localBanner, ...tournamentPayload } = formData;
      await apiService.updateTournament(tournamentId, {
        ...tournamentPayload,
        banner: bannerUrl,
      });
      navigate(`/${lang}/tournaments/${tournamentId}`);
    } catch (error) {
      setError(t('pages.tournaments.updateError', 'Failed to update tournament'));
      console.error('Error updating tournament:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !tournament) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/${lang}/tournaments`)}
          sx={{ mt: 2 }}
        >
          {t('common.backToList', 'Back to list')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/${lang}/tournaments/${tournamentId}`)}
        sx={{ mb: 2 }}
      >
        {t('common.back', 'Back')}
      </Button>

      <Typography variant="h4" gutterBottom>
        {t('pages.tournaments.editDialogTitle', 'Edit Tournament')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('pages.tournaments.form.basicInfo', 'Basic Information')}
            </Typography>

            <FormControl fullWidth margin="normal" required disabled={loadingRules}>
              <InputLabel>{t('pages.tournaments.form.rules', 'Rules')}</InputLabel>
              <Select
                value={formData.ruleCode}
                label={t('pages.tournaments.form.rules', 'Rules')}
                onChange={(e) => setFormData({ ...formData, ruleCode: e.target.value })}
                required
              >
                <MenuItem value="">
                  <em>{t('pages.tournaments.form.selectRules', 'Select Rules')}</em>
                </MenuItem>
                {rules.map((rule) => (
                  <MenuItem key={rule.ruleCode} value={rule.ruleCode}>
                    {rule.ruleCode} - {rule.ruleName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t('pages.tournaments.form.title')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label={t('pages.tournaments.form.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />

            <TextField
              label={t('pages.tournaments.form.startDate')}
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              fullWidth
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label={t('pages.tournaments.form.endDate')}
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              helperText={t('pages.tournaments.form.endDateHelper')}
            />

            <TextField
              label={t('pages.tournaments.form.applicationDeadline')}
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              helperText={t('pages.tournaments.form.applicationDeadlineHelper')}
            />

            <TextField
              label={t('pages.tournaments.form.address')}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              margin="normal"
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('pages.tournaments.form.country', 'Country')}</InputLabel>
              <Select
                value={formData.country}
                label={t('pages.tournaments.form.country', 'Country')}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                {COUNTRIES.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t('pages.tournaments.form.targetCount', 'Number of Targets')}
              type="number"
              value={formData.targetCount}
              onChange={(e) =>
                setFormData({ ...formData, targetCount: parseInt(e.target.value) || 18 })
              }
              fullWidth
              margin="normal"
              inputProps={{ min: 1, max: 100 }}
              helperText={t(
                'pages.tournaments.form.targetCountHelper',
                'Number of targets/patrols for the tournament',
              )}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allowMultipleApplications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowMultipleApplications: e.target.checked,
                    })
                  }
                />
              }
              label={t('pages.tournaments.form.allowMultipleLabel')}
              sx={{ mt: 2 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.collectFeedback}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collectFeedback: e.target.checked,
                    })
                  }
                />
              }
              label={t('pages.tournaments.form.collectFeedbackLabel')}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>

        <Box sx={{ mb: 2 }}>
          <BannerUploader
            value={formData.banner}
            onPendingFileChange={setPendingBannerFile}
            onChange={(dataUrl) => {
              setFormData({ ...formData, banner: dataUrl || '' });
            }}
            width={500}
            height={167}
            outputWidth={1200}
            outputHeight={400}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FileAttachments
            value={formData.attachments}
            onChange={(files) => {
              setFormData({ ...formData, attachments: files });
            }}
            tournamentId={tournamentId || ''}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/${lang}/tournaments/${tournamentId}`)}
            disabled={submitting}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={submitting}>
            {submitting
              ? t('pages.tournaments.updating', 'Updating...')
              : t('common.update', 'Update')}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TournamentEdit;
