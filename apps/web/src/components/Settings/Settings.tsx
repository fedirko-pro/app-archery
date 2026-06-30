// TODO: Settings component is temporarily disabled
// Password change functionality has been moved to Profile component
// This component will be re-enabled when additional settings features are needed

/*
import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Button,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Security, Lock } from '@mui/icons-material';
import { useAuth } from '@/contexts/auth-context';
import type { PasswordChangeForm, PasswordValidation } from './types';
import './settings.scss';

const Settings: React.FC = () => {
  const { changePassword, error, clearError } = useAuth();
  
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    currentPasswordError: false,
    currentPasswordMessage: '',
    newPasswordError: false,
    newPasswordMessage: '',
    confirmPasswordError: false,
    confirmPasswordMessage: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordChange = (field: keyof PasswordChangeForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    
    setPasswordValidation(prev => ({
      ...prev,
      [`${field}Error`]: false,
      [`${field}Message`]: ''
    }));
    
    setPasswordSuccess(false);
  };

  const validatePasswordForm = (): boolean => {
    const validation: PasswordValidation = {
      currentPasswordError: false,
      currentPasswordMessage: '',
      newPasswordError: false,
      newPasswordMessage: '',
      confirmPasswordError: false,
      confirmPasswordMessage: ''
    };

    let isValid = true;

    if (!passwordForm.currentPassword) {
      validation.currentPasswordError = true;
      validation.currentPasswordMessage = 'Current password is required';
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      validation.newPasswordError = true;
      validation.newPasswordMessage = 'New password is required';
      isValid = false;
    } else if (passwordForm.newPassword.length < 8) {
      validation.newPasswordError = true;
      validation.newPasswordMessage = 'Password must be at least 8 characters long';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      validation.newPasswordError = true;
      validation.newPasswordMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      isValid = false;
    }

    if (!passwordForm.confirmPassword) {
      validation.confirmPasswordError = true;
      validation.confirmPasswordMessage = 'Please confirm your new password';
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      validation.confirmPasswordError = true;
      validation.confirmPasswordMessage = 'Passwords do not match';
      isValid = false;
    }

    if (passwordForm.currentPassword && passwordForm.newPassword && 
        passwordForm.currentPassword === passwordForm.newPassword) {
      validation.newPasswordError = true;
      validation.newPasswordMessage = 'New password must be different from current password';
      isValid = false;
    }

    setPasswordValidation(validation);
    return isValid;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    clearError();

    try {
      await changePassword(passwordForm);
      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswords({ current: false, new: false, confirm: false });
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' };
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;
    
    const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length + 
                  (length >= 8 ? 1 : 0) + (length >= 12 ? 1 : 0);
    
    if (score <= 2) return { strength: 'Weak', color: '#f44336' };
    if (score <= 4) return { strength: 'Fair', color: '#ff9800' };
    if (score <= 6) return { strength: 'Good', color: '#2196f3' };
    return { strength: 'Strong', color: '#4caf50' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your account security and preferences
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}
      
      {passwordSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess(false)}>
          Password changed successfully!
        </Alert>
      )}

      <Card>
        <CardHeader
          avatar={<Security color="primary" />}
          title="Change Password"
          subheader="Update your password to keep your account secure"
        />
        <CardContent>
          <Box component="form" onSubmit={handlePasswordSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
              error={passwordValidation.currentPasswordError}
              helperText={passwordValidation.currentPasswordMessage}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={handlePasswordChange('newPassword')}
              error={passwordValidation.newPasswordError}
              helperText={passwordValidation.newPasswordMessage}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {passwordForm.newPassword && (
              <Typography 
                variant="caption" 
                sx={{ color: passwordStrength.color, display: 'block', mt: 1 }}
              >
                Password strength: {passwordStrength.strength}
              </Typography>
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
              error={passwordValidation.confirmPasswordError}
              helperText={passwordValidation.confirmPasswordMessage}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isChangingPassword}
                startIcon={isChangingPassword ? <CircularProgress size={20} /> : null}
                fullWidth
              >
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Card>
        <CardHeader
          title="Security Tips"
          subheader="Best practices for keeping your account secure"
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Use a strong, unique password that you don't use elsewhere
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Enable two-factor authentication if available
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Never share your password with anyone
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Change your password regularly
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
*/

import './Settings.scss';

// Temporary placeholder component
const Settings: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Settings</h2>
      <p>Settings functionality has been moved to the Profile page.</p>
      <p>Please use the Profile page to manage your account settings.</p>
    </div>
  );
};

export default Settings;
