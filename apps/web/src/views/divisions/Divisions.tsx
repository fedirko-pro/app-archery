import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  IconButton,
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
import type { DivisionDto, GroupedDivision } from '../../services/types';

const groupDivisions = (divisions: DivisionDto[]): GroupedDivision[] => {
  const map = new Map<string, DivisionDto[]>();
  for (const d of divisions) {
    const existing = map.get(d.name) || [];
    existing.push(d);
    map.set(d.name, existing);
  }
  return Array.from(map.entries())
    .map(([name, items]) => ({
      name,
      description: items.find((i) => i.description)?.description,
      items,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const Divisions: React.FC = () => {
  const [grouped, setGrouped] = useState<GroupedDivision[]>([]);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const isAdmin = user != null && canManageReferenceData(user.role);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDivisions();
        setGrouped(groupDivisions(data));
      } catch (error) {
        console.error('Failed to load divisions:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (divisionId: string) => {
    if (
      !window.confirm(
        t('pages.divisions.deleteConfirm', 'Are you sure you want to delete this division?'),
      )
    ) {
      return;
    }

    try {
      await apiService.deleteDivision(divisionId);
      setGrouped((prev) =>
        groupDivisions(prev.flatMap((g) => g.items.filter((d) => d.id !== divisionId))),
      );
      showSuccess(t('pages.divisions.deleteSuccess', 'Division deleted successfully'));
    } catch (error) {
      console.error('Failed to delete division:', error);
      showError(
        error instanceof Error
          ? error.message
          : t('pages.divisions.deleteError', 'Failed to delete division'),
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
              {t('pages.divisions.title')}
            </Typography>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/${lang}/admin/divisions/create`)}
              >
                {t('pages.divisions.create', 'Create Division')}
              </Button>
            )}
          </Box>
          <Typography variant="body2" component="h2" color="text.secondary">
            {t('pages.divisions.description')}
          </Typography>
        </Box>

        {grouped.map((group) => (
          <Accordion
            key={group.name}
            sx={{ mb: 1 }}
            expanded={expanded === group.name}
            onChange={(_, isExpanded) => setExpanded(isExpanded ? group.name : false)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" width="100%" gap={2} flexWrap="wrap">
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {group.name}
                </Typography>
                {group.items.map(
                  (item) =>
                    item.rule_code && (
                      <Chip
                        key={item.id}
                        label={item.rule_code}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ),
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {(() => {
                const descriptions = group.items.map((d) => d.description);
                const allSame = descriptions.every((d) => d === descriptions[0]);

                if (allSame) {
                  return (
                    <Box display="flex" alignItems="center" gap={1} sx={{ py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {group.items[0]?.description || 'No description available'}
                      </Typography>
                      <Box sx={{ ml: 'auto' }}>
                        {group.items.map((item) => (
                          <span key={item.id}>
                            <AdminActions
                              item={item}
                              onEdit={(itemId) =>
                                navigate(`/${lang}/admin/divisions/${itemId}/edit`)
                              }
                              onDelete={handleDelete}
                            />
                          </span>
                        ))}
                      </Box>
                    </Box>
                  );
                }

                return group.items.map((item) => (
                  <Box key={item.id} display="flex" alignItems="center" gap={1} sx={{ py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.rule_code && `${item.rule_code}: `}
                      {item.description || 'No description available'}
                    </Typography>
                    {isAdmin && (
                      <Box sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/${lang}/admin/divisions/${item.id}/edit`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(item.id!)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                ));
              })()}
            </AccordionDetails>
          </Accordion>
        ))}

        {grouped.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No divisions found. {isAdmin && 'Click "Create Division" to add one.'}
            </Typography>
          </Box>
        )}
      </div>
    </section>
  );
};

export default Divisions;
