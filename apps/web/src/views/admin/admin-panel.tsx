import './admin-panel.scss';

import { Box, Typography, Alert } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import type { User } from '../../contexts/types';
import UsersList from './users-list/users-list';

const AdminPanel: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { lang } = useParams();

  const handleEditUser = (user: User) => {
    navigate(`/${lang}/admin/users/${user.id}/edit`);
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/${lang}/admin/users/${userId}/profile`);
  };

  return (
    <Box className="admin-panel">
      <Typography variant="h3" gutterBottom>
        {t('pages.admin.panelTitle')}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t('pages.admin.panelDescription')}
      </Alert>

      <UsersList onEditUser={handleEditUser} onViewProfile={handleViewProfile} />
    </Box>
  );
};

export default AdminPanel;
