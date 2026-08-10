import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { canManageReferenceData } from '../../../config/roles';
import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';
import type { CreateBowCategoryDto, RuleDto, UpdateBowCategoryDto } from '../../../services/types';

/**
 * Admin-only category editor.
 * Uses simple inputs (no WYSIWYG). Supports both create and update operations.
 */
const CategoryEdit: React.FC = () => {
  const { id, lang } = useParams<{ id?: string; lang: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const isEditMode = !!id;

  const [form, setForm] = useState<CreateBowCategoryDto & { id?: string }>({
    code: '',
    name: '',
    descriptionEn: '',
    descriptionPt: '',
    descriptionIt: '',
    descriptionUk: '',
    descriptionEs: '',
    descriptionDe: '',
    ruleReference: '',
    ruleCitation: '',
    ruleId: '',
  });
  const [rules, setRules] = useState<RuleDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load rules for the dropdown
  useEffect(() => {
    const loadRules = async () => {
      try {
        const rulesData = await apiService.getRules();
        setRules(rulesData);
      } catch (e) {
        console.error('Failed to load rules:', e);
      }
    };
    loadRules();
  }, []);

  // Load category data if editing
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiService.getBowCategoryById(id);
        if (data) {
          setForm({
            id: data.id,
            code: data.code,
            name: data.name,
            descriptionEn: data.descriptionEn || '',
            descriptionPt: data.descriptionPt || '',
            descriptionIt: data.descriptionIt || '',
            descriptionUk: data.descriptionUk || '',
            descriptionEs: data.descriptionEs || '',
            descriptionDe: data.descriptionDe || '',
            ruleReference: data.ruleReference || '',
            ruleCitation: data.ruleCitation || '',
            ruleId: data.rule?.id || '',
          });
        }
      } catch (e) {
        console.error('Failed to load category:', e);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const isAdmin = user != null && canManageReferenceData(user.role);

  useEffect(() => {
    if (!isAdmin) {
      navigate(`/${lang}/signin`);
    }
  }, [isAdmin, lang, navigate]);

  const handleSave = async () => {
    if (!form.code || !form.name || !form.ruleId) {
      setError('Code, name, and rule are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode && id) {
        // Update existing category
        const updateData: UpdateBowCategoryDto = {
          code: form.code,
          name: form.name,
          descriptionEn: form.descriptionEn || undefined,
          descriptionPt: form.descriptionPt || undefined,
          descriptionIt: form.descriptionIt || undefined,
          descriptionUk: form.descriptionUk || undefined,
          descriptionEs: form.descriptionEs || undefined,
          descriptionDe: form.descriptionDe || undefined,
          ruleReference: form.ruleReference || undefined,
          ruleCitation: form.ruleCitation || undefined,
          ruleId: form.ruleId || undefined,
        };
        await apiService.updateBowCategory(id, updateData);
      } else {
        // Create new category
        const createData: CreateBowCategoryDto = {
          code: form.code,
          name: form.name,
          descriptionEn: form.descriptionEn || undefined,
          descriptionPt: form.descriptionPt || undefined,
          descriptionIt: form.descriptionIt || undefined,
          descriptionUk: form.descriptionUk || undefined,
          descriptionEs: form.descriptionEs || undefined,
          descriptionDe: form.descriptionDe || undefined,
          ruleReference: form.ruleReference || undefined,
          ruleCitation: form.ruleCitation || undefined,
          ruleId: form.ruleId,
        };
        await apiService.createBowCategory(createData);
      }

      navigate(`/${lang}/categories`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save category';
      setError(errorMessage);
      console.error('Failed to save category:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="container">
        <Typography variant="h5" gutterBottom>
          {isEditMode ? t('pages.categories.editTitle') : t('pages.categories.createTitle')}
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Stack spacing={2}>
          <TextField
            label={t('pages.categories.code')}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            inputProps={{ maxLength: 10 }}
            required
            disabled={loading}
          />
          <TextField
            label={t('pages.categories.name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            disabled={loading}
          />
          <FormControl required disabled={loading}>
            <InputLabel>{t('pages.categories.rule')}</InputLabel>
            <Select
              value={form.ruleId}
              label={t('pages.categories.rule')}
              onChange={(e) => setForm({ ...form, ruleId: e.target.value })}
            >
              {rules.map((rule) => (
                <MenuItem key={rule.id} value={rule.id}>
                  {rule.ruleCode} - {rule.ruleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('pages.categories.descriptionEn')}
            value={form.descriptionEn || ''}
            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
            multiline
            minRows={3}
            disabled={loading}
          />
          <TextField
            label={t('pages.categories.descriptionPt')}
            value={form.descriptionPt || ''}
            onChange={(e) => setForm({ ...form, descriptionPt: e.target.value })}
            multiline
            minRows={3}
            disabled={loading}
          />
          <TextField
            label={t('pages.categories.descriptionIt')}
            value={form.descriptionIt || ''}
            onChange={(e) => setForm({ ...form, descriptionIt: e.target.value })}
            multiline
            minRows={3}
            disabled={loading}
          />
          <TextField
            label={t('pages.categories.descriptionUk')}
            value={form.descriptionUk || ''}
            onChange={(e) => setForm({ ...form, descriptionUk: e.target.value })}
            multiline
            minRows={3}
            disabled={loading}
          />
          <TextField
            label={t('pages.categories.descriptionEs')}
            value={form.descriptionEs || ''}
            onChange={(e) => setForm({ ...form, descriptionEs: e.target.value })}
            multiline
            minRows={3}
            disabled={loading}
          />
          <TextField
            label={t('pages.categories.descriptionDe')}
            value={form.descriptionDe || ''}
            onChange={(e) => setForm({ ...form, descriptionDe: e.target.value })}
            multiline
            minRows={3}
            disabled={loading}
          />
          <TextField
            label={t('pages.categories.ruleReference')}
            value={form.ruleReference || ''}
            onChange={(e) => setForm({ ...form, ruleReference: e.target.value })}
            disabled={loading}
          />
          <TextField
            label={t('pages.categories.ruleCitation')}
            value={form.ruleCitation || ''}
            onChange={(e) => setForm({ ...form, ruleCitation: e.target.value })}
            disabled={loading}
          />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleSave} disabled={loading}>
              {loading ? t('common.saving') : t('common.save')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/${lang}/categories`)}
              disabled={loading}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </div>
    </section>
  );
};

export default CategoryEdit;
