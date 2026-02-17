import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Box,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Collapse,
  Checkbox,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ROLES, ROLE_LABEL_KEYS, canChangeRole } from '../../../config/roles';
import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';

const ROLE_ORDER = [ROLES.User, ROLES.ClubAdmin, ROLES.FederationAdmin, ROLES.GeneralAdmin];

/** API row: permissionKey (e.g. permCreateEditTournament), roles string[]. */
type MatrixRow = { permissionKey: string; roles: string[] };

const AccessControl: React.FC = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<{ role: string; permissionKey: string } | null>(null);
  const [permissionsExpanded, setPermissionsExpanded] = useState(true);

  const canEdit = Boolean(user && canChangeRole(user.role));

  useEffect(() => {
    fetchMatrix();
  }, []);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRolePermissions();
      setMatrix(data);
    } catch {
      setError(t('accessControl.fetchError', 'Failed to fetch permissions'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (role: string, permissionKey: string, enabled: boolean) => {
    if (!canEdit) return;
    try {
      setUpdating({ role, permissionKey });
      setError(null);
      await apiService.updateRolePermission({ role, permissionKey, enabled });
      setMatrix((prev) =>
        prev.map((row) =>
          row.permissionKey === permissionKey
            ? {
                ...row,
                roles: enabled
                  ? [...row.roles, role].filter((r, i, a) => a.indexOf(r) === i)
                  : row.roles.filter((r) => r !== role),
              }
            : row,
        ),
      );
    } catch {
      setError(t('accessControl.updateError', 'Failed to update permission'));
    } finally {
      setUpdating(null);
    }
  };

  const hasPermission = (row: MatrixRow, role: string) => row.roles.includes(role);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {t('accessControl.title', 'Access Control')}
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        {canEdit
          ? t(
              'accessControl.descriptionEdit',
              'Manage permissions per role. Only General Admin can edit. Other admins can view only.',
            )
          : t(
              'accessControl.descriptionView',
              'View permissions per role. Only General Admin can edit.',
            )}
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={() => setPermissionsExpanded((e) => !e)}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {t('accessControl.rolesAndPermissions', 'Roles & Permissions')}
          </Typography>
          <IconButton size="small" aria-label={permissionsExpanded ? 'collapse' : 'expand'}>
            {permissionsExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Collapse in={permissionsExpanded}>
          <TableContainer>
            <Table
              size="small"
              sx={{ '& td, & th': { borderBottom: '1px solid', borderColor: 'divider' } }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t('accessControl.permission', 'Permission')}
                  </TableCell>
                  {ROLE_ORDER.map((role) => (
                    <TableCell
                      key={role}
                      align="center"
                      sx={{ fontWeight: 600, minWidth: 100 }}
                    >
                      {t(ROLE_LABEL_KEYS[role], role)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {matrix.map((row) => (
                  <TableRow key={row.permissionKey}>
                    <TableCell>
                      {t(`accessControl.${row.permissionKey}`, row.permissionKey)}
                    </TableCell>
                    {ROLE_ORDER.map((role) => {
                      const checked = hasPermission(row, role);
                      const isUpdating =
                        updating?.role === role && updating?.permissionKey === row.permissionKey;
                      let cellContent: React.ReactNode;
                      if (canEdit) {
                        cellContent = (
                          <Checkbox
                            size="small"
                            checked={checked}
                            disabled={!!updating}
                            onChange={() =>
                              handleToggle(role, row.permissionKey, !checked)
                            }
                            sx={{ p: 0 }}
                          />
                        );
                      } else if (checked) {
                        cellContent = <CheckBox color="primary" fontSize="small" />;
                      } else {
                        cellContent = (
                          <CheckBoxOutlineBlank
                            fontSize="small"
                            sx={{ color: 'action.disabled' }}
                          />
                        );
                      }
                      return (
                        <TableCell key={role} align="center">
                          {cellContent}
                          {isUpdating && (
                            <CircularProgress
                              size={16}
                              sx={{ ml: 0.5, verticalAlign: 'middle' }}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default AccessControl;
