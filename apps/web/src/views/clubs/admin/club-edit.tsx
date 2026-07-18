import {
  Alert,
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
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import LogoUploader from '../../../components/LogoUploader/LogoUploader';
import { COUNTRIES } from '../../../config/countries';
import { canManageReferenceData } from '../../../config/roles';
import { useAuth } from '../../../contexts/auth-context';
import { useNotification } from '../../../contexts/error-feedback-context';
import apiService from '../../../services/api';
import type { ClubDto } from '../../../services/types';
import ClubLinksEditor from '../ClubLinksEditor';

const ClubEdit: React.FC = () => {
  const { id: routeId, lang } = useParams<{ id: string; lang: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { showWarning, showError, showSuccess } = useNotification();

  const isMyClubEdit = location.pathname.endsWith('/my-club/edit');
  const isCreate = !isMyClubEdit && (!routeId || routeId === 'create');
  const [clubId, setClubId] = useState<string | undefined>(
    isCreate ? undefined : isMyClubEdit ? undefined : routeId,
  );

  const [form, setForm] = useState<ClubDto>({
    name: '',
    shortCode: '',
    description: '',
    country: '',
    city: '',
    visibility: 'public',
    clubLogo: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    otherInfo: '',
    links: [],
  });
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const pendingLogoFileRef = useRef<File | null>(null);
  const [savedLogoUrl, setSavedLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const setPendingLogo = (file: File | null) => {
    pendingLogoFileRef.current = file;
    setPendingLogoFile(file);
  };

  const isGeneralAdmin = user && canManageReferenceData(user.role);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate(`/${lang}/signin`);
        return;
      }

      if (isCreate) {
        if (!isGeneralAdmin) {
          navigate(`/${lang}/signin`);
          return;
        }
        setCanEdit(true);
        return;
      }

      if (isMyClubEdit) {
        const adminClub = await apiService.getMyAdminClub();
        if (!adminClub?.id) {
          navigate(`/${lang}/my-club`);
          return;
        }
        setClubId(adminClub.id);
        setCanEdit(true);
        return;
      }

      if (isGeneralAdmin && routeId) {
        setClubId(routeId);
        setCanEdit(true);
        return;
      }

      navigate(`/${lang}/signin`);
    };

    void checkAccess();
  }, [user, routeId, isGeneralAdmin, isCreate, isMyClubEdit, navigate, lang]);

  useEffect(() => {
    if (!canEdit || isCreate || !clubId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await apiService.getClubById(clubId);
        if (data) {
          setPendingLogo(null);
          setSavedLogoUrl(data.clubLogo || '');
          setForm({
            ...data,
            links: data.links || [],
          });
        }
      } catch (error) {
        console.error('Failed to load club:', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [clubId, canEdit, isCreate]);

  const handleSave = async () => {
    if (isGeneralAdmin && !form.name.trim()) {
      showWarning(t('pages.clubs.nameRequired', 'Club name is required'));
      return;
    }

    try {
      setLoading(true);

      const links = (form.links || []).filter((link) => link.label.trim() && link.url.trim());
      const pendingFile = pendingLogoFileRef.current || pendingLogoFile;
      const preview = form.clubLogo || '';
      const isLocalPreview = preview.startsWith('blob:') || preview.startsWith('data:');

      // Never send local preview URLs to the API.
      let logoUrl = '';
      if (pendingFile) {
        logoUrl = '';
      } else if (isLocalPreview) {
        logoUrl = savedLogoUrl;
      } else {
        logoUrl = preview;
      }

      const saved = await apiService.upsertClub({
        ...form,
        id: clubId,
        clubLogo: logoUrl || undefined,
        contactEmail: form.contactEmail?.trim() || undefined,
        links,
      });

      const savedId = saved.id || clubId;
      if (!savedId) {
        throw new Error(t('pages.clubs.saveError', 'Failed to save club. Please try again.'));
      }

      if (pendingFile) {
        const uploaded = await apiService.uploadImage(pendingFile, 'logo', {
          entityId: savedId,
          quality: 85,
        });
        // Patch only the logo URL — avoid re-sending the full club payload.
        await apiService.upsertClub({
          id: savedId,
          name: saved.name || form.name,
          clubLogo: uploaded.url,
        });
        setPendingLogo(null);
        setSavedLogoUrl(uploaded.url);
      }

      showSuccess(t('pages.clubs.saveSuccess', 'Club saved successfully'));
      navigate(isMyClubEdit ? `/${lang}/my-club` : `/${lang}/clubs`);
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

  if (!canEdit) {
    return null;
  }

  return (
    <section>
      <div className="container">
        <Typography variant="h4" gutterBottom>
          {isCreate
            ? t('pages.clubs.create', 'Create Club')
            : isMyClubEdit
              ? t('pages.clubs.editMyClub', 'Edit club profile')
              : t('pages.clubs.edit', 'Edit Club')}
        </Typography>

        <Box sx={{ maxWidth: 600 }}>
          <Stack spacing={3}>
            {!isGeneralAdmin && !isCreate && (
              <Alert severity="info">
                {t(
                  'pages.clubs.clubAdminEditHint',
                  'You can update public contact details and links for your club here.',
                )}
              </Alert>
            )}

            {isGeneralAdmin && (
              <>
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
              </>
            )}

            <TextField
              label={t('pages.clubs.description', 'Description')}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              minRows={4}
              fullWidth
            />

            <Typography variant="h6">{t('pages.clubs.contacts', 'Contacts')}</Typography>

            <TextField
              label={t('pages.clubs.contactPerson', 'Contact person')}
              value={form.contactPerson || ''}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              fullWidth
            />

            <TextField
              label={t('pages.clubs.contactEmail', 'Contact email')}
              type="email"
              value={form.contactEmail || ''}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              fullWidth
            />

            <TextField
              label={t('pages.clubs.contactPhone', 'Contact phone')}
              value={form.contactPhone || ''}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              fullWidth
            />

            <TextField
              label={t('pages.clubs.address', 'Address')}
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />

            <ClubLinksEditor
              value={form.links || []}
              onChange={(links) => setForm({ ...form, links })}
            />

            <TextField
              label={t('pages.clubs.otherInfo', 'Other information')}
              value={form.otherInfo || ''}
              onChange={(e) => setForm({ ...form, otherInfo: e.target.value })}
              multiline
              minRows={3}
              fullWidth
            />

            {isGeneralAdmin && (
              <LogoUploader
                value={form.clubLogo}
                onPendingFileChange={setPendingLogo}
                onChange={(url) => {
                  setForm((prev) => ({ ...prev, clubLogo: url || '' }));
                  if (!url) {
                    setSavedLogoUrl('');
                  }
                }}
              />
            )}

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleSave} disabled={loading}>
                {loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(isMyClubEdit ? `/${lang}/my-club` : `/${lang}/clubs`)}
                disabled={loading}
              >
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
