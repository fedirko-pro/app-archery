import '../../profile/profile.scss';

import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Alert, CircularProgress } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import type { User } from '../../../contexts/types';
import type { ProfileData } from '../../profile/types';
import apiService from '../../../services/api';
import ProfileEditForm from '../../profile/profile-edit-form/profile-edit-form';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserEdit: React.FC = () => {
  const { userId, lang } = useParams<{ userId: string; lang: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    picture: '',
    role: 'user',
    federationNumber: '',
    categories: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const foundUser = await apiService.getUserById(userId);

      setUser(foundUser);
      setFormData({
        firstName: foundUser.firstName || '',
        lastName: foundUser.lastName || '',
        email: foundUser.email || '',
        bio: foundUser.bio || '',
        location: foundUser.location || '',
        picture: foundUser.picture || '',
        role: foundUser.role || 'user',
        federationNumber: foundUser.federationNumber || '',
        nationality: foundUser.nationality || 'Portuguesa',
        gender: foundUser.gender || 'M',
        clubId: foundUser.clubId || '',
        categories: foundUser.categories || [],
        appLanguage: (foundUser as any).appLanguage || 'pt',
      });
    } catch (error) {
      setError('Failed to fetch user data');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) {
      return 'First name is required';
    }
    if (!formData.lastName.trim()) {
      return 'Last name is required';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (!EMAIL_REGEX.test(formData.email)) {
      return 'Invalid email format';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleCategoriesChange = (categories: string[]) => {
    setFormData((prev) => ({
      ...prev,
      categories,
    }));
  };

  const handlePictureChange = (dataUrl: string | null) => {
    setFormData((prev) => ({
      ...prev,
      picture: dataUrl || '',
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await apiService.adminUpdateUser(user.id, formData);
      setSuccess('User updated successfully!');
      setUser(updatedUser);

      // Navigate after showing success message
      setTimeout(() => {
        navigate(`/${lang}/admin/users/${userId}/profile`);
      }, 1500);
    } catch (error) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${lang}/admin/users/${userId}/profile`);
  };

  const handleBack = () => {
    navigate(`/${lang}/admin/users`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Back to Admin Panel
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Back to Admin Panel
        </Button>
        <Alert severity="error">User not found</Alert>
      </Box>
    );
  }

  return (
    <section>
      <div className="container">
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ minWidth: 0 }}
          >
            Back to Admin Panel
          </Button>
        </Box>
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
        <ProfileEditForm
          profileData={formData}
          isSaving={saving}
          isAdminView={true}
          onChange={handleChange}
          onCategoriesChange={handleCategoriesChange}
          onPictureChange={handlePictureChange}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </section>
  );
};

export default UserEdit;
