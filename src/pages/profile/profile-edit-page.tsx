import { Visibility, VisibilityOff, Security, Lock } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  Divider,
  Typography,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import { useNotification } from '../../contexts/error-feedback-context';
import apiService from '../../services/api';
import { getAppLanguageFromUser } from '../../utils/i18n-lang';
import ProfileEditForm from './profile-edit-form/profile-edit-form';
import type { ProfileData } from './types';

const ProfileEditPage: React.FC = () => {
  const { user, updateUser, changePassword, setPassword, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const { lang } = useParams();
  const { t } = useTranslation('common');
  const { showSuccess } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordValidation, setPasswordValidation] = useState({
    currentPasswordError: false,
    currentPasswordMessage: '',
    newPasswordError: false,
    newPasswordMessage: '',
    confirmPasswordError: false,
    confirmPasswordMessage: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const isOAuthUser = user?.authProvider !== 'local';
  const hasNoPassword = !user?.password;
  const shouldShowSetPassword = isOAuthUser && hasNoPassword;

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        picture: user.picture || '',
        federationNumber: user.federationNumber || '',
        nationality: user.nationality || 'Portuguesa',
        gender: user.gender || 'M',
        clubId: user.clubId || '',
        categories: Array.isArray(user.categories) ? user.categories : [],
        appLanguage: getAppLanguageFromUser(user),
        syncTrainingsAndEquipment: user.syncTrainingsAndEquipment ?? false,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleCategoriesChange = (newValue: string[]) => {
    setProfileData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: Array.isArray(newValue) ? newValue : [],
      };
    });
  };

  const handleSave = async () => {
    if (!profileData) return;
    setIsSaving(true);
    setError(null);
    try {
      const updatedUser = await apiService.updateProfile(profileData);
      updateUser(updatedUser);
      showSuccess(t('profile.profileSaved', 'Profile saved successfully!'));
      navigate(`/${lang}/profile`);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setError(errorMessage);
      console.error('Profile update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${lang}/profile`);
  };

  // Password logic
  const handlePasswordChange =
    (field: keyof typeof passwordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPasswordForm((prev) => ({ ...prev, [field]: value }));
      setPasswordValidation((prev) => ({
        ...prev,
        [`${field}Error`]: false,
        [`${field}Message`]: '',
      }));
      setPasswordSuccess(false);
    };

  const validatePasswordForm = (): boolean => {
    const validation = {
      currentPasswordError: false,
      currentPasswordMessage: '',
      newPasswordError: false,
      newPasswordMessage: '',
      confirmPasswordError: false,
      confirmPasswordMessage: '',
    };
    let isValid = true;
    if (user?.password && user?.authProvider === 'local') {
      if (!passwordForm.currentPassword) {
        validation.currentPasswordError = true;
        validation.currentPasswordMessage = 'Current password is required';
        isValid = false;
      }
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
      validation.newPasswordMessage =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number';
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
    if (
      user?.password &&
      passwordForm.currentPassword &&
      passwordForm.newPassword &&
      passwordForm.currentPassword === passwordForm.newPassword
    ) {
      validation.newPasswordError = true;
      validation.newPasswordMessage = 'New password must be different from current password';
      isValid = false;
    }
    setPasswordValidation(validation);
    return isValid;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    setIsChangingPassword(true);
    clearError();
    try {
      if (shouldShowSetPassword) {
        await setPassword(passwordForm.newPassword, passwordForm.confirmPassword);
      } else {
        await changePassword(passwordForm);
      }
      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswords({ current: false, new: false, confirm: false });
    } catch {
      // Error is handled by AuthContext
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' };
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;
    const score =
      [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length +
      (length >= 8 ? 1 : 0) +
      (length >= 12 ? 1 : 0);
    if (score <= 2) return { strength: 'Weak', color: '#f44336' };
    if (score <= 4) return { strength: 'Fair', color: '#ff9800' };
    if (score <= 6) return { strength: 'Good', color: '#2196f3' };
    return { strength: 'Strong', color: '#4caf50' };
  };
  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  if (!profileData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <section>
      <div className="container">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <ProfileEditForm
          profileData={profileData}
          isSaving={isSaving}
          userId={user?.id}
          onChange={handleChange}
          onCategoriesChange={handleCategoriesChange}
          onSyncToggleChange={(value) => {
            setProfileData((prev) => {
              if (!prev) return prev;
              return { ...prev, syncTrainingsAndEquipment: value };
            });
          }}
          onPictureChange={(dataUrl) => {
            setProfileData((prev) => {
              if (!prev) return prev;
              return { ...prev, picture: dataUrl || '' };
            });
            // After avatar upload (new URL), update UI and persist to backend so it survives reload
            if (dataUrl && user && (dataUrl.startsWith('http') || dataUrl.startsWith('/'))) {
              updateUser({ ...user, picture: dataUrl });
              apiService
                .updateProfile({ picture: dataUrl })
                .then((updated) => {
                  updateUser(updated);
                })
                .catch((err) => {
                  console.error('Failed to persist avatar URL:', err);
                  setError(
                    err instanceof Error
                      ? err.message
                      : t('profile.avatarSaveFailed', 'Failed to save avatar'),
                  );
                });
            }
          }}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        <Divider sx={{ my: 4 }} />
        <Card>
          <CardHeader
            avatar={<Security color="primary" />}
            title={shouldShowSetPassword ? t('profile.setPassword') : t('profile.changePassword')}
            subheader={
              shouldShowSetPassword
                ? t('profile.setPasswordSubtitle')
                : t('profile.changePasswordSubtitle')
            }
          />
          <CardContent>
            {authError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                {authError}
              </Alert>
            )}
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess(false)}>
                {shouldShowSetPassword
                  ? t('profile.setPasswordSuccess')
                  : t('profile.changePasswordSuccess')}
              </Alert>
            )}
            <Box component="form" onSubmit={handlePasswordSubmit}>
              {!shouldShowSetPassword && (
                <TextField
                  fullWidth
                  margin="normal"
                  label={t('forms.currentPassword')}
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
                        <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                          {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              <TextField
                fullWidth
                margin="normal"
                label={t('forms.newPassword')}
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange('newPassword')}
                error={passwordValidation.newPasswordError}
                helperText={passwordValidation.newPasswordMessage}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {passwordForm.newPassword && (
                <Typography
                  variant="caption"
                  sx={{ color: passwordStrength.color, display: 'block', mt: 1 }}
                >
                  {t('reset.strength')}: {passwordStrength.strength}
                </Typography>
              )}
              <TextField
                fullWidth
                margin="normal"
                label={t('forms.confirmPassword')}
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                error={passwordValidation.confirmPasswordError}
                helperText={passwordValidation.confirmPasswordMessage}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
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
                  {isChangingPassword
                    ? shouldShowSetPassword
                      ? t('profile.settingPassword')
                      : t('profile.changingPassword')
                    : shouldShowSetPassword
                      ? t('profile.setPassword')
                      : t('profile.changePassword')}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProfileEditPage;
