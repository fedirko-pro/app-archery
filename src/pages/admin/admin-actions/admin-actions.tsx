import { Edit, Email } from '@mui/icons-material';
import { Box, Button, Alert } from '@mui/material';
import React, { useState } from 'react';

import apiService from '@/services/api';

interface AdminActionsProps {
  userId: string;
  userEmail: string;
  onEditUser: () => void;
}

const AdminActions: React.FC<AdminActionsProps> = ({
  userId,
  userEmail,
  onEditUser,
}) => {
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

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Edit />}
          onClick={onEditUser}
        >
          Edit Profile
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<Email />}
          onClick={handleResetPassword}
          disabled={resettingPassword}
        >
          {resettingPassword ? 'Sending...' : 'Reset Password'}
        </Button>
      </Box>
    </Box>
  );
};

export default AdminActions;
