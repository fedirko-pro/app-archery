import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Security, Lock } from '@mui/icons-material';
import './profile.scss';
import { useAuth } from '../../contexts/auth-context';
import apiService from '../../services/api';
import type { ProfileData, PasswordChangeForm, PasswordValidation } from './types';

const Profile = () => {
  const { user, updateUser, changePassword, setPassword, error: authError, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    picture: '',
  });

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
        website: user.website || '',
        picture: user.picture || '',
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      setProfileData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        bio: user?.bio || '',
        location: user?.location || '',
        website: user?.website || '',
        picture: user?.picture || '',
      });
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await apiService.updateProfile(profileData);
      
      updateUser(updatedUser);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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

    if (user?.password && passwordForm.currentPassword && passwordForm.newPassword && 
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
      if (shouldShowSetPassword) {
        await setPassword(passwordForm.newPassword, passwordForm.confirmPassword);
      } else {
        await changePassword(passwordForm);
      }
      
      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswords({ current: false, new: false, confirm: false });
    } catch {
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

  const getFullName = () => {
    const firstName = profileData.firstName || user?.firstName || '';
    const lastName = profileData.lastName || user?.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  };

  const getJoinDate = () => {
    if (user?.createdAt) {
      const date = new Date(user.createdAt);
      return `Joined ${date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })}`;
    }
    return 'Recently joined';
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="profile-container">
      <Box className="profile-hero" />

      <Grid container className="profile-info">
        <Grid item xs={12} sm={4} className="profile-avatar-container">
          <Avatar
            className="profile-avatar"
            alt="Profile Avatar"
            src={profileData.picture || user.picture}
            sx={{ width: 120, height: 120 }}
          />
        </Grid>

        <Grid item xs={12} sm={8}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {!isEditing ? (
            <div className="profile-details">
              <Typography variant="h4">{getFullName()}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {profileData.email || user.email}
              </Typography>
              {profileData.bio && (
                <Typography variant="body1" className="profile-bio">
                  {profileData.bio}
                </Typography>
              )}
              {profileData.location && (
                <Typography variant="body2" color="text.secondary">
                  📍 {profileData.location}
                </Typography>
              )}
              {profileData.website && (
                <Typography variant="body2">
                  🌐 <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                    {profileData.website}
                  </a>
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {getJoinDate()}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditToggle}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="profile-edit">
              <TextField
                label="First Name"
                name="firstName"
                value={profileData.firstName}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={profileData.lastName}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled
                helperText="Email cannot be changed"
              />
              <TextField
                label="Bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                placeholder="Tell us about yourself..."
              />
              <TextField
                label="Location"
                name="location"
                value={profileData.location}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="City, Country"
              />
              <TextField
                label="Website"
                name="website"
                value={profileData.website}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="https://your-website.com"
              />
              <TextField
                label="Profile Picture URL"
                name="picture"
                value={profileData.picture}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="https://example.com/avatar.jpg"
              />
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? <CircularProgress size={20} /> : 'Save Profile'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Card>
                <CardHeader
                  avatar={<Security color="primary" />}
                  title={shouldShowSetPassword ? "Set Password" : "Change Password"}
                  subheader={
                    shouldShowSetPassword 
                      ? "Set a password to enable email/password login"
                      : "Update your password to keep your account secure"
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
                        ? "Password set successfully! You can now login with email/password."
                        : "Password changed successfully!"
                      }
                    </Alert>
                  )}
                  
                  {shouldShowSetPassword ? (
                    <Box component="form" onSubmit={handlePasswordSubmit}>
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
                          {isChangingPassword ? 'Setting Password...' : 'Set Password'}
                        </Button>
                      </Box>
                    </Box>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Profile;
