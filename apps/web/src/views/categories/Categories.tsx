import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Link,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { AdminActions } from '../../components/ui/AdminActions';
import { canManageReferenceData } from '../../config/roles';
import { useAuth } from '../../contexts/auth-context';
import { useNotification } from '../../contexts/error-feedback-context';
import apiService from '../../services/api';
import type { BowCategory } from '../../services/types';
import { normalizeAppLang, pickLocalizedDescription } from '../../utils/i18n-lang';

interface GroupedCategory {
  code: string;
  items: BowCategory[];
}

const groupByCode = (categories: BowCategory[]): GroupedCategory[] => {
  const map = new Map<string, BowCategory[]>();
  for (const cat of categories) {
    const existing = map.get(cat.code) || [];
    existing.push(cat);
    map.set(cat.code, existing);
  }
  return Array.from(map.entries())
    .map(([code, items]) => ({ code, items }))
    .sort((a, b) => a.code.localeCompare(b.code));
};

const Categories: React.FC = () => {
  const [grouped, setGrouped] = useState<GroupedCategory[]>([]);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { lang } = useParams();
  const appLang = normalizeAppLang(lang);
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const isAdmin = user != null && canManageReferenceData(user.role);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.getBowCategories();
        setGrouped(groupByCode(data));
      } catch (e) {
        console.error('Failed to load categories:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (categoryId: string) => {
    if (
      !window.confirm(
        t('pages.categories.confirmDelete') || 'Are you sure you want to delete this category?',
      )
    ) {
      return;
    }
    try {
      await apiService.deleteBowCategory(categoryId);
      const data = await apiService.getBowCategories();
      setGrouped(groupByCode(data));
      showSuccess(t('pages.categories.deleteSuccess', 'Category deleted successfully'));
    } catch (error) {
      console.error('Failed to delete category:', error);
      showError(
        error instanceof Error
          ? error.message
          : t('pages.categories.deleteError', 'Failed to delete category'),
      );
    }
  };

  if (loading) {
    return (
      <section>
        <div className="container">
          <Typography>Loading...</Typography>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container">
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
              {t('pages.categories.title')}
            </Typography>
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
          <Typography variant="body2" component="h2" color="text.secondary">
            {t('pages.categories.description')}
          </Typography>
        </Box>

        {grouped.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No categories found. {isAdmin && 'Click "Create Category" to add one.'}
            </Typography>
          </Box>
        ) : (
          grouped.map((group) => {
            const descriptions = group.items.map((c) =>
              pickLocalizedDescription(c as unknown as Record<string, unknown>, appLang),
            );
            const allSame = descriptions.every((d) => d === descriptions[0]);

            return (
              <Accordion
                key={group.code}
                sx={{ mb: 1 }}
                expanded={expanded === group.code}
                onChange={(_, isExpanded) => setExpanded(isExpanded ? group.code : false)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%" gap={2} flexWrap="wrap">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 64 }}>
                      {group.code}
                    </Typography>
                    <Typography variant="subtitle1">{group.items[0]?.name}</Typography>
                    {group.items.map(
                      (item) =>
                        item.rule?.ruleCode && (
                          <Chip
                            key={item.id}
                            label={item.rule.ruleCode}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ),
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {allSame && descriptions[0] ? (
                    <Box sx={{ py: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {descriptions[0]}
                      </Typography>
                      {group.items.filter((c) => c.ruleReference || c.ruleCitation).length > 0 && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                          {t('pages.categories.ruleReference')}:{' '}
                          {group.items
                            .filter((c) => c.ruleReference || c.ruleCitation)
                            .map((item, idx) => (
                              <span key={item.id}>
                                {idx > 0 && ', '}
                                <Link
                                  href={`/${lang}/rules#${item.rule?.ruleCode}~${encodeURIComponent(item.ruleReference || '')}`}
                                  underline="hover"
                                >
                                  {item.ruleReference}
                                </Link>
                                {item.ruleCitation && ` — ${item.ruleCitation}`}
                              </span>
                            ))}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1 }}>
                        {group.items.map((item) => (
                          <span key={item.id}>
                            <AdminActions
                              item={item}
                              onEdit={(itemId) =>
                                navigate(`/${lang}/admin/categories/${itemId}/edit`)
                              }
                              onDelete={handleDelete}
                            />
                          </span>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    group.items.map((item) => {
                      const desc = pickLocalizedDescription(
                        item as unknown as Record<string, unknown>,
                        appLang,
                      );
                      return (
                        <Box key={item.id} sx={{ py: 0.5 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: 'pre-wrap' }}
                          >
                            {item.rule?.ruleCode && (
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{ fontWeight: 600, mr: 0.5 }}
                              >
                                {item.rule.ruleCode}:
                              </Typography>
                            )}
                            {desc || ''}
                          </Typography>
                          {(item.ruleReference || item.ruleCitation) && (
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                              {item.ruleReference}
                              {item.ruleCitation && (
                                <>
                                  {item.ruleReference ? ' — ' : ''}
                                  <Link
                                    href={`/${lang}/rules#${item.rule?.ruleCode}~${encodeURIComponent(item.ruleReference || item.ruleCitation)}`}
                                    underline="hover"
                                  >
                                    {item.ruleCitation}
                                  </Link>
                                </>
                              )}
                            </Typography>
                          )}
                          <Box sx={{ mt: 0.5 }}>
                            <AdminActions
                              item={item}
                              onEdit={(itemId) =>
                                navigate(`/${lang}/admin/categories/${itemId}/edit`)
                              }
                              onDelete={handleDelete}
                            />
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Categories;
