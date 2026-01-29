import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link as MuiLink,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

import apiService from '../../services/api';
import type { RuleDto } from '../../services/types';
import { useAuth } from '../../contexts/auth-context';
import { normalizeAppLang, pickLocalizedDescription } from '../../utils/i18n-lang';

/**
 * Rules page shows a list of rule documents with description and links.
 * Supports hash-based expansion: /rules#IFAA opens IFAA rule.
 */
const Rules: React.FC = () => {
  const [rules, setRules] = useState<RuleDto[]>([]);
  const { t } = useTranslation('common');
  const [expanded, setExpanded] = useState<string | false>(false);
  const { hash } = useLocation();
  const { lang } = useParams();
  const appLang = normalizeAppLang(lang);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleDto | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<RuleDto | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<RuleDto>>({
    ruleCode: '',
    ruleName: '',
    edition: '',
    descriptionEn: '',
    descriptionPt: '',
    descriptionIt: '',
    descriptionUk: '',
    descriptionEs: '',
    link: '',
    downloadLink: ''
  });

  // Feedback states
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await apiService.getRules();
      setRules(data);
    };
    load();
  }, []);

  useEffect(() => {
    const anchor = decodeURIComponent((hash || '').replace(/^#/, ''));
    if (!anchor) return;
    // If anchor matches ruleCode or part of citation, expand it
    const match = rules.find((r) => r.ruleCode.toLowerCase() === anchor.toLowerCase());
    if (match) {
      setExpanded(match.ruleCode);
      // Scroll into view after expansion paints
      requestAnimationFrame(() => {
        const el = document.getElementById(`rule-${match.ruleCode}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }, [hash, rules]);

  const buildDownloadHref = (downloadLink?: string) => {
    if (!downloadLink) return undefined;
    // Prefer files served from public/pdf/rules
    if (downloadLink.startsWith('http')) return downloadLink;
    return `/pdf/rules/${downloadLink.replace(/^\/+/, '')}`;
  };

  const handleOpenCreateDialog = () => {
    setEditingRule(null);
    setFormData({
      ruleCode: '',
      ruleName: '',
      edition: '',
      descriptionEn: '',
      descriptionPt: '',
      descriptionIt: '',
      descriptionUk: '',
      descriptionEs: '',
      link: '',
      downloadLink: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (rule: RuleDto) => {
    setEditingRule(rule);
    setFormData({
      ruleCode: rule.ruleCode,
      ruleName: rule.ruleName,
      edition: rule.edition || '',
      descriptionEn: rule.descriptionEn || '',
      descriptionPt: rule.descriptionPt || '',
      descriptionIt: rule.descriptionIt || '',
      descriptionUk: rule.descriptionUk || '',
      descriptionEs: rule.descriptionEs || '',
      link: rule.link || '',
      downloadLink: rule.downloadLink || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRule(null);
  };

  const handleFormChange = (field: keyof RuleDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveRule = async () => {
    if (!formData.ruleCode || !formData.ruleName) {
      setSnackbar({ open: true, message: 'Rule code and name are required', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (editingRule && editingRule.id) {
        // Update existing rule
        await apiService.updateRule(editingRule.id, formData as any);
        setSnackbar({ open: true, message: 'Rule updated successfully', severity: 'success' });
      } else {
        // Create new rule
        await apiService.createRule(formData as any);
        setSnackbar({ open: true, message: 'Rule created successfully', severity: 'success' });
      }

      // Reload rules
      const data = await apiService.getRules();
      setRules(data);
      handleCloseDialog();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to save rule', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteConfirm = (rule: RuleDto) => {
    setRuleToDelete(rule);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setRuleToDelete(null);
  };

  const handleDeleteRule = async () => {
    if (!ruleToDelete || !ruleToDelete.id) return;

    setLoading(true);
    try {
      await apiService.deleteRule(ruleToDelete.id);
      setSnackbar({ open: true, message: 'Rule deleted successfully', severity: 'success' });

      // Reload rules
      const data = await apiService.getRules();
      setRules(data);
      handleCloseDeleteConfirm();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete rule. It may have related divisions or bow categories.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <section>
      <div className="container">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">{t('pages.rules.title')}</Typography>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              {t('pages.rules.createRule') || 'Create Rule'}
            </Button>
          )}
        </Box>

        {rules.map((rule) => (
          <Accordion
            key={rule.ruleCode}
            expanded={expanded === rule.ruleCode}
            onChange={(_, isExpanded) => {
              setExpanded(isExpanded ? rule.ruleCode : false);
              if (isExpanded) {
                requestAnimationFrame(() => {
                  const el = document.getElementById(`rule-${rule.ruleCode}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
              }
            }}
            sx={{ mb: 1 }}
          >
            <AccordionSummary id={`rule-${rule.ruleCode}`} expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {rule.ruleCode}
                </Typography>
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {rule.ruleName}
                </Typography>
                {isAdmin && (
                  <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEditDialog(rule)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleOpenDeleteConfirm(rule)}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {rule.edition && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  {rule.edition}
                </Typography>
              )}
              <Box sx={{ whiteSpace: 'pre-wrap' }}>{pickLocalizedDescription(rule as unknown as Record<string, unknown>, appLang) || ''}</Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {rule.link && (
                  <MuiLink href={rule.link} target="_blank" rel="noopener noreferrer">
                    {t('pages.rules.openOfficialPage')}
                  </MuiLink>
                )}
                {buildDownloadHref(rule.downloadLink) && (
                  <Button variant="outlined" component="a" href={buildDownloadHref(rule.downloadLink)} download>
                    {t('pages.rules.downloadPdf')}
                  </Button>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingRule ? t('pages.rules.editRule') || 'Edit Rule' : t('pages.rules.createRule') || 'Create Rule'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label={t('pages.rules.ruleCode') || 'Rule Code'}
                value={formData.ruleCode}
                onChange={(e) => handleFormChange('ruleCode', e.target.value)}
                required
                disabled={!!editingRule}
                fullWidth
              />
              <TextField
                label={t('pages.rules.ruleName') || 'Rule Name'}
                value={formData.ruleName}
                onChange={(e) => handleFormChange('ruleName', e.target.value)}
                required
                fullWidth
              />
              <TextField
                label={t('pages.rules.edition') || 'Edition'}
                value={formData.edition}
                onChange={(e) => handleFormChange('edition', e.target.value)}
                fullWidth
              />
              <TextField
                label={t('pages.rules.descriptionEn') || 'Description (English)'}
                value={formData.descriptionEn}
                onChange={(e) => handleFormChange('descriptionEn', e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label={t('pages.rules.descriptionPt') || 'Description (Portuguese)'}
                value={formData.descriptionPt}
                onChange={(e) => handleFormChange('descriptionPt', e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label={t('pages.rules.descriptionIt') || 'Description (Italian)'}
                value={formData.descriptionIt}
                onChange={(e) => handleFormChange('descriptionIt', e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label={t('pages.rules.descriptionUk') || 'Description (Ukrainian)'}
                value={formData.descriptionUk}
                onChange={(e) => handleFormChange('descriptionUk', e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label={t('pages.rules.descriptionEs') || 'Description (Spanish)'}
                value={formData.descriptionEs}
                onChange={(e) => handleFormChange('descriptionEs', e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label={t('pages.rules.link') || 'Official Page Link'}
                value={formData.link}
                onChange={(e) => handleFormChange('link', e.target.value)}
                fullWidth
              />
              <TextField
                label={t('pages.rules.downloadLink') || 'Download Link'}
                value={formData.downloadLink}
                onChange={(e) => handleFormChange('downloadLink', e.target.value)}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('common.cancel') || 'Cancel'}</Button>
            <Button onClick={handleSaveRule} variant="contained" disabled={loading}>
              {loading ? t('common.saving') || 'Saving...' : t('common.save') || 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
          <DialogTitle>{t('pages.rules.deleteConfirmTitle') || 'Delete Rule?'}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('pages.rules.deleteConfirmMessage') || 'Are you sure you want to delete this rule?'}
            </Typography>
            {ruleToDelete && (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                {ruleToDelete.ruleCode} - {ruleToDelete.ruleName}
              </Typography>
            )}
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t('pages.rules.deleteWarning') || 'This rule cannot be deleted if it has related divisions or bow categories.'}
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteConfirm}>{t('common.cancel') || 'Cancel'}</Button>
            <Button onClick={handleDeleteRule} color="error" variant="contained" disabled={loading}>
              {loading ? t('common.deleting') || 'Deleting...' : t('common.delete') || 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </section>
  );
};

export default Rules;


