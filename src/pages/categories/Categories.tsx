import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import apiService from '../../services/api';
import type { BowCategory } from '../../services/types';
import { normalizeAppLang, pickLocalizedDescription } from '../../utils/i18n-lang';

/**
 * Categories page renders a single-expandable MUI accordion with bow categories.
 * Regular users see only the accordion. Admins also see edit/delete actions.
 */
const Categories: React.FC = () => {
  const [categories, setCategories] = useState<BowCategory[]>([]);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { lang } = useParams();
  const appLang = normalizeAppLang(lang);
  const { t } = useTranslation('common');
  const { user } = useAuth();

  // Load categories once on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.getBowCategories();
        // Sort categories alphabetically by code
        const sortedCategories = data.sort((a, b) => 
          (a.code || '').localeCompare(b.code || '')
        );
        setCategories(sortedCategories);
      } catch (e) {
        console.error('Failed to load categories:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isAdmin = user?.role === 'admin';

  const handleDelete = async (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('pages.categories.confirmDelete') || 'Are you sure you want to delete this category?')) {
      return;
    }
    try {
      await apiService.deleteBowCategory(categoryId);
      // Reload categories
      const data = await apiService.getBowCategories();
      const sortedCategories = data.sort((a, b) => 
        (a.code || '').localeCompare(b.code || '')
      );
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <section>
        <div className="container">
          <Typography variant="h4" gutterBottom>{t('pages.categories.title')}</Typography>
          <Typography>Loading...</Typography>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container">
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">{t('pages.categories.title')}</Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/${lang}/admin/categories/create`)}
            >
              {t('pages.categories.create', 'Create Category')}
            </Button>
          )}
        </Box>

        {categories.length === 0 ? (
          <Typography>No categories found.</Typography>
        ) : (
          categories.map((category) => (
            <Accordion
              key={category.id}
              sx={{ mb: 1 }}
              expanded={expanded === category.id}
              onChange={(_, isExpanded) => setExpanded(isExpanded ? category.id : false)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%" gap={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 64 }}>
                    {category.code}
                  </Typography>
                  <Typography variant="subtitle1">{category.name}</Typography>
                  {isAdmin && (
                    <Box 
                      sx={{ 
                        ml: 'auto', 
                        display: 'flex', 
                        gap: 1, 
                        opacity: 0.7,
                        '& > *': {
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/${lang}/admin/categories/${category.id}/edit`);
                        }}
                        title="Edit category"
                      >
                        <EditIcon fontSize="small" />
                      </Box>
                      <Box
                        onClick={(e) => handleDelete(category.id, e)}
                        title="Delete category"
                      >
                        <DeleteIcon fontSize="small" />
                      </Box>
                    </Box>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ whiteSpace: 'pre-wrap' }}>
                  {pickLocalizedDescription(category as unknown as Record<string, unknown>, appLang) || ''}
                </Box>
                {(category.ruleReference || category.ruleCitation) && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    {t('pages.categories.ruleReference')}: {category.ruleReference}
                    {category.ruleCitation && (
                      <>
                        {category.ruleReference ? ' — ' : ''}
                        <a href={`/${lang}/rules#${encodeURIComponent(category.ruleReference || category.ruleCitation)}`}>
                          {category.ruleCitation}
                        </a>
                      </>
                    )}
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </div>
    </section>
  );
};

export default Categories;


