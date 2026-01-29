import { Button, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';
import type { CategoryDto } from '../../../services/types';

/**
 * Admin-only category editor.
 * Uses simple inputs (no WYSIWYG). Save is a stub until backend exists.
 */
const CategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<CategoryDto>({
    id: id || '',
    code: '',
    name: '',
    description_en: '',
    description_pt: '',
    description_it: '',
    description_uk: '',
    description_es: '',
    rule_reference: '',
    rule_citation: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiService.getCategoryById(id);
        if (data) setForm(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/signin');
    }
  }, [isAdmin, navigate]);

  // no WYSIWYG modules, using simple multiline text

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiService.upsertCategory(form);
    } catch (e) {
      // FE stub shows no-op
      console.warn(e);
    } finally {
      setLoading(false);
      navigate('/categories');
    }
  };

  return (
    <section>
      <div className="container">
        <Typography variant="h5" gutterBottom>Edit category</Typography>
        <Stack spacing={2}>
          <TextField
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            inputProps={{ maxLength: 10 }}
          />
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Description (EN)"
            value={form.description_en || ''}
            onChange={(e) => setForm({ ...form, description_en: e.target.value })}
            multiline
            minRows={3}
          />
          <TextField
            label="Description (PT)"
            value={form.description_pt || ''}
            onChange={(e) => setForm({ ...form, description_pt: e.target.value })}
            multiline
            minRows={3}
          />
          <TextField
            label="Description (IT)"
            value={form.description_it || ''}
            onChange={(e) => setForm({ ...form, description_it: e.target.value })}
            multiline
            minRows={3}
          />
          <TextField
            label="Description (UA)"
            value={form.description_uk || ''}
            onChange={(e) => setForm({ ...form, description_uk: e.target.value })}
            multiline
            minRows={3}
          />
          <TextField
            label="Description (ES)"
            value={form.description_es || ''}
            onChange={(e) => setForm({ ...form, description_es: e.target.value })}
            multiline
            minRows={3}
          />
          <TextField
            label="Rule reference"
            value={form.rule_reference || ''}
            onChange={(e) => setForm({ ...form, rule_reference: e.target.value })}
          />
          <TextField
            label="Rule citation (link text)"
            value={form.rule_citation || ''}
            onChange={(e) => setForm({ ...form, rule_citation: e.target.value })}
          />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleSave} disabled={loading}>Save</Button>
            <Button variant="outlined" onClick={() => navigate('/categories')}>Cancel</Button>
          </Stack>
        </Stack>
      </div>
    </section>
  );
};

export default CategoryEdit;


