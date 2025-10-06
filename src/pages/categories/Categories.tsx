import { Accordion, AccordionDetails, AccordionSummary, Box, Icon, IconButton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { normalizeAppLang, pickLocalizedDescription } from '../../utils/i18n-lang';
import { useTranslation } from 'react-i18next';

import apiService from '../../services/api';
import type { CategoryDto } from '../../services/types';
import { useAuth } from '../../contexts/auth-context';
import { SpaceBarRounded } from '@mui/icons-material';

/**
 * Categories page renders a single-expandable MUI accordion with bow categories.
 * Regular users see only the accordion. Admins also see edit/delete actions.
 */
const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [expanded, setExpanded] = useState<string | false>(false);
  const navigate = useNavigate();
  const { lang } = useParams();
  const appLang = normalizeAppLang(lang);
  const { t } = useTranslation('common');
  const { user } = useAuth();

  // Load categories once on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getCategories();
        // Sort categories alphabetically by code
        const sortedCategories = data.sort((a, b) => 
          (a.code || '').localeCompare(b.code || '')
        );
        setCategories(sortedCategories);
      } catch (e) {
        // no-op for FE stub
        console.error(e);
      }
    };
    load();
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <section>
      <div className="container">
        <Typography variant="h4" gutterBottom>{t('pages.categories.title')}</Typography>

        {categories.map((category) => (
          <Accordion
            key={(category.id || category.code).toLowerCase()}
            sx={{ mb: 1 }}
            expanded={expanded === (category.id || category.code)}
            onChange={(_, isExpanded) => setExpanded(isExpanded ? (category.id || category.code) : false)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" width="100%" gap={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 64 }}>
                  {category.code}
                </Typography>
                <Typography variant="subtitle1">{category.name}</Typography>
                {isAdmin && (
                  <Box sx={{ ml: 'auto', opacity: 0.5 }}>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${lang}/admin/categories/${category.id || category.code.toLowerCase()}/edit`);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${lang}/admin/categories/${category.id || category.code.toLowerCase()}/edit`);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </span>
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                {pickLocalizedDescription(category as any, appLang) || ''}
              </Box>
              {(category.rule_reference || category.rule_citation) && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {t('pages.categories.ruleReference')}: {category.rule_reference}
                  {category.rule_citation && (
                    <>
                      {category.rule_reference ? ' — ' : ''}
                      <a href={`/${lang}/rules#${encodeURIComponent(category.rule_reference || category.rule_citation)}`}>
                        {category.rule_citation}
                      </a>
                    </>
                  )}
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </section>
  );
};

export default Categories;


