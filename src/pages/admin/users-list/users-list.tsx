import { Edit, Email, Visibility, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
} from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ROLE_LABEL_KEYS } from '../../../config/roles';
import type { User } from '../../../contexts/types';
import apiService from '../../../services/api';

interface UsersListProps {
  onEditUser: (user: User) => void;
  onViewProfile: (userId: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({ onEditUser, onViewProfile }) => {
  const { t } = useTranslation('common');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(
    null,
  );
  const [sortConfig, setSortConfig] = useState<{
    field: string | null;
    direction: 'asc' | 'desc';
  }>({ field: null, direction: 'asc' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await apiService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    try {
      setResettingPassword(userId);
      setError(null);

      await apiService.adminResetUserPassword(userId);

      setSuccess(`Password reset email sent to ${userEmail}`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setError('Failed to send password reset email');
      console.error('Error resetting password:', error);
    } finally {
      setResettingPassword(null);
    }
  };

  const handleEditUser = (user: User) => {
    onEditUser(user);
  };

  const handleViewProfile = (userId: string) => {
    onViewProfile(userId);
  };

  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedUsers = useMemo(() => {
    if (!sortConfig.field) return users;

    return [...users].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'name':
          aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'gender':
          aValue = (a.gender || '').toUpperCase();
          bValue = (b.gender || '').toUpperCase();
          break;
        case 'club':
          aValue = (a.club?.name || '').toLowerCase();
          bValue = (b.club?.name || '').toLowerCase();
          break;
        case 'role':
          aValue = (a.role || '').toLowerCase();
          bValue = (b.role || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortConfig]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Users Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table
          sx={{
            '& .MuiTableCell-root': {
              padding: '8px',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }}></TableCell>
              <TableCell
                onClick={() => handleSort('name')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Name
                  </Typography>
                  {sortConfig.field === 'name' &&
                    (sortConfig.direction === 'asc' ? (
                      <ArrowUpward fontSize="small" />
                    ) : (
                      <ArrowDownward fontSize="small" />
                    ))}
                </Box>
              </TableCell>
              <TableCell
                onClick={() => handleSort('email')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Email
                  </Typography>
                  {sortConfig.field === 'email' &&
                    (sortConfig.direction === 'asc' ? (
                      <ArrowUpward fontSize="small" />
                    ) : (
                      <ArrowDownward fontSize="small" />
                    ))}
                </Box>
              </TableCell>
              <TableCell
                onClick={() => handleSort('gender')}
                align="center"
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Gender
                  </Typography>
                  {sortConfig.field === 'gender' &&
                    (sortConfig.direction === 'asc' ? (
                      <ArrowUpward fontSize="small" />
                    ) : (
                      <ArrowDownward fontSize="small" />
                    ))}
                </Box>
              </TableCell>
              <TableCell
                onClick={() => handleSort('club')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Club
                  </Typography>
                  {sortConfig.field === 'club' &&
                    (sortConfig.direction === 'asc' ? (
                      <ArrowUpward fontSize="small" />
                    ) : (
                      <ArrowDownward fontSize="small" />
                    ))}
                </Box>
              </TableCell>
              <TableCell
                onClick={() => handleSort('role')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {t('accessControl.role', 'Role')}
                  </Typography>
                  {sortConfig.field === 'role' &&
                    (sortConfig.direction === 'asc' ? (
                      <ArrowUpward fontSize="small" />
                    ) : (
                      <ArrowDownward fontSize="small" />
                    ))}
                </Box>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Avatar
                    src={user.picture}
                    alt={`${user.firstName} ${user.lastName}`}
                    sx={{ width: 32, height: 32 }}
                  >
                    {!user.picture &&
                      `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : 'Not set'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {user.gender ? (
                    <Chip
                      label={user.gender}
                      size="small"
                      variant="outlined"
                      color={user.gender === 'M' ? 'info' : user.gender === 'F' ? 'secondary' : 'default'}
                      sx={{ height: 20, minWidth: 28, '& .MuiChip-label': { px: 0.5 } }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.disabled">-</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                    {user.club?.name || <span style={{ color: '#999' }}>-</span>}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(ROLE_LABEL_KEYS[user.role] ?? 'accessControl.roleUser', user.role)}
                    size="small"
                    variant="outlined"
                    color={user.role === 'general_admin' ? 'primary' : 'default'}
                    sx={{ fontSize: '0.75rem' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}
                  >
                    <Tooltip title="View Profile">
                      <IconButton
                        size="small"
                        onClick={() => handleViewProfile(user.id)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit Profile">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Reset Password">
                      <IconButton
                        size="small"
                        onClick={() => handleResetPassword(user.id, user.email)}
                        disabled={resettingPassword === user.id}
                        color="secondary"
                      >
                        <Email />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UsersList;
