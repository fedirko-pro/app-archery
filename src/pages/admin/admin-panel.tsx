import './admin-panel.scss';

import { Box, Typography, Alert } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import UsersList from './users-list/users-list';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleEditUser = (user: any) => {
    navigate(`/admin/users/${user.id}/edit`);
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/admin/users/${userId}/profile`);
  };

  return (
    <Box className="admin-panel">
      <Typography variant="h3" gutterBottom>
        Admin Panel
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage users, view profiles, and reset passwords. Only administrators
        can access this panel.
      </Alert>

      <UsersList
        onEditUser={handleEditUser}
        onViewProfile={handleViewProfile}
      />
    </Box>
  );
};

export default AdminPanel;
