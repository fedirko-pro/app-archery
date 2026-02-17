import { Edit, Email, Delete } from '@mui/icons-material';
import { Box, Button, Alert } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import apiService from '../../../services/api';

interface AdminActionsProps {
  userId: string;
  userEmail: string;
  onEditUser: () => void;
  /** When provided, show Delete user button (Federation Admin, General Admin). */
  onDeleteUser?: () => void;
}

const AdminActions: React.FC<AdminActionsProps> = ({
  userId,
  userEmail,
  onEditUser,
  onDeleteUser,
}) => {
  const { t } = useTranslation('common');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResetPassword = async () => {
    try {
      setResettingPassword(true);
      setError(null);

      await apiService.adminResetUserPassword(userId);

      setSuccess(`Password reset email sent to ${userEmail}`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setError('Failed to send password reset email');
      console.error('Error resetting password:', error);
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
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

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Edit />}
          onClick={onEditUser}
        >
          {t('admin.editProfile', 'Edit Profile')}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<Email />}
          onClick={handleResetPassword}
          disabled={resettingPassword}
        >
          {resettingPassword ? t('admin.sending', 'Sending...') : t('admin.resetPassword', 'Reset Password')}
        </Button>

        {onDeleteUser && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={onDeleteUser}
          >
            {t('admin.deleteUser', 'Delete User')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AdminActions;
