import { Edit, Email, Visibility } from '@mui/icons-material';
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
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import type { User } from '@/contexts/types';
import apiService from '@/services/api';
import { formatDate } from '@/utils/date-utils';

interface UsersListProps {
  onEditUser: (user: User) => void;
  onViewProfile: (userId: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({ onEditUser, onViewProfile }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(
    null,
  );

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
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Auth Provider</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : 'Not set'}
                  </Typography>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        user.role === 'admin' ? 'error.main' : 'text.primary',
                      fontWeight: user.role === 'admin' ? 'bold' : 'normal',
                    }}
                  >
                    {user.role}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        user.authProvider === 'google'
                          ? 'primary.main'
                          : 'text.primary',
                    }}
                  >
                    {user.authProvider}
                  </Typography>
                </TableCell>
                <TableCell>
                  {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
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
