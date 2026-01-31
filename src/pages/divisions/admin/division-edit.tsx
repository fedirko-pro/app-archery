import {
  Box,
  Button,
  FormControl,
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

import { useAuth } from '../../../contexts/auth-context';
import { useNotification } from '../../../contexts/error-feedback-context';
import apiService from '../../../services/api';
import type { DivisionDto, RuleDto } from '../../../services/types';

/**
 * Admin-only division editor.
 * Allows creating new divisions or editing existing ones.
 */
const DivisionEdit: React.FC = () => {
  const { id, lang } = useParams<{ id: string; lang: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { showWarning, showError, showSuccess } = useNotification();

  const [form, setForm] = useState<DivisionDto>({
    id: id === 'create' ? undefined : id,
    name: '',
    description: '',
    rule_code: '',
  });
  const [rules, setRules] = useState<RuleDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate(`/${lang}/signin`);
      return;
    }

    const loadRules = async () => {
      try {
        const data = await apiService.getRules();
        setRules(data);
      } catch (error) {
        console.error('Failed to load rules:', error);
      }
    };
    loadRules();

    if (!id || id === 'create') return;

    const loadDivision = async () => {
      setLoading(true);
      try {
        const data = await apiService.getDivisionById(id);
        if (data) setForm(data);
      } catch (error) {
        console.error('Failed to load division:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDivision();
  }, [id, isAdmin, navigate, lang]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      showWarning(t('pages.divisions.nameRequired', 'Division name is required'));
      return;
    }

    if (!form.rule_code) {
      showWarning(t('pages.divisions.ruleRequired', 'Please select a rule'));
      return;
    }

    try {
      setLoading(true);
      await apiService.upsertDivision(form);
      showSuccess(t('pages.divisions.saveSuccess', 'Division saved successfully'));
      navigate(`/${lang}/divisions`);
    } catch (error) {
      console.error('Failed to save division:', error);
      showError(error instanceof Error ? error.message : t('pages.divisions.saveError', 'Failed to save division'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${lang}/divisions`);
  };

  return (
    <section>
      <div className="container">
        <Typography variant="h4" gutterBottom>
          {id === 'create' ? 'Create Division' : 'Edit Division'}
        </Typography>

        <Box sx={{ maxWidth: 600 }}>
          <Stack spacing={3}>
            <TextField
              label="Division Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Adult, Junior, Veteran"
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Rule</InputLabel>
              <Select
                value={form.rule_code || ''}
                label="Rule"
                onChange={(e) =>
                  setForm({ ...form, rule_code: e.target.value })
                }
              >
                <MenuItem value="">
                  <em>Select a rule</em>
                </MenuItem>
                {rules.map((rule) => (
                  <MenuItem key={rule.ruleCode} value={rule.ruleCode}>
                    {rule.ruleCode} - {rule.ruleName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={form.description || ''}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="e.g. Adult archers (typically 18-49 years)"
              multiline
              minRows={4}
              fullWidth
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

export default DivisionEdit;
