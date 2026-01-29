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
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import apiService from '../../services/api';
import type { DivisionDto } from '../../services/types';

/**
 * Divisions page displays all divisions grouped by rule.
 * Admins can create, edit, and delete divisions.
 */
const Divisions: React.FC = () => {
  const [divisions, setDivisions] = useState<DivisionDto[]>([]);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t: _t } = useTranslation('common');
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDivisions();
        setDivisions(data);
      } catch (error) {
        console.error('Failed to load divisions:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (divisionId: string) => {
    if (!confirm('Are you sure you want to delete this division?')) {
      return;
    }

    try {
      await apiService.deleteDivision(divisionId);
      setDivisions(divisions.filter((d) => d.id !== divisionId));
    } catch (error) {
      console.error('Failed to delete division:', error);
      alert('Failed to delete division. This is a stub for now.');
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4">Divisions</Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/${lang}/admin/divisions/create`)}
            >
              Create Division
            </Button>
          )}
        </Box>

        {divisions.map((division) => (
          <Accordion
            key={division.id}
            sx={{ mb: 1 }}
            expanded={expanded === division.id}
            onChange={(_, isExpanded) =>
              setExpanded(isExpanded ? division.id! : false)
            }
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                display="flex"
                alignItems="center"
                width="100%"
                gap={2}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {division.name}
                </Typography>
                {division.rule_code && (
                  <Chip
                    label={division.rule_code}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {isAdmin && (
                  <Box sx={{ ml: 'auto', opacity: 0.5 }}>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/${lang}/admin/divisions/${division.id}/edit`
                        );
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(division.id!);
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
                {division.description || 'No description available'}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {divisions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No divisions found.{' '}
              {isAdmin && 'Click "Create Division" to add one.'}
            </Typography>
          </Box>
        )}
      </div>
    </section>
  );
};

export default Divisions;
