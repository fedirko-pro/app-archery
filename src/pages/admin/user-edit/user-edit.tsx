import '../../profile/profile.scss';

import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Alert, CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import type { User } from '@/contexts/types';
import ProfileEditForm from '@/pages/profile/profile-edit-form/profile-edit-form';
import apiService from '@/services/api';

const UserEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    picture: '',
    role: '',
    federationNumber: '',
    categories: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const allUsers = await apiService.getAllUsers();
      const foundUser = allUsers.find((u) => u.id === userId);

      if (!foundUser) {
        setError('User not found');
        return;
      }

      setUser(foundUser);
      setFormData({
        firstName: foundUser.firstName || '',
        lastName: foundUser.lastName || '',
        email: foundUser.email || '',
        bio: foundUser.bio || '',
        location: foundUser.location || '',
        website: foundUser.website || '',
        picture: foundUser.picture || '',
        role: foundUser.role || 'user',
        federationNumber: foundUser.federationNumber || '',
        categories: foundUser.categories ? foundUser.categories.join(', ') : '',
      });
    } catch (error) {
      setError('Failed to fetch user data');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const submitData = {
      ...formData,
      categories: formData.categories
        ? formData.categories
            .split(',')
            .map((cat) => cat.trim())
            .filter(Boolean)
        : [],
    };

    try {
      const updatedUser = await apiService.adminUpdateUser(user.id, submitData);
      setSuccess('User updated successfully!');
      setUser(updatedUser);

      setTimeout(() => {
        navigate(`/admin/users/${userId}/profile`);
      }, 2000);
    } catch (error) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/users/${userId}/profile`);
  };

  const handleBack = () => {
    navigate('/admin/users');
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

  if (error) {
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

  // Приводимо formData до формату ProfileData для ProfileEditForm
  const profileData = {
    ...formData,
    categories:
      typeof formData.categories === 'string'
        ? formData.categories
            .split(',')
            .map((cat) => cat.trim())
            .filter(Boolean)
        : formData.categories,
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          maxWidth: '900px',
          margin: '32px auto 0 auto',
          width: '100%',
          px: 2,
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ minWidth: 0 }}
        >
          Back to Admin Panel
        </Button>
      </Box>
      <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
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
          profileData={profileData}
          isSaving={saving}
          isAdminView={true}
          onChange={handleChange}
          onSave={() => handleSubmit({} as React.FormEvent)}
          onCancel={handleCancel}
        />
      </Box>
    </>
  );
};

export default UserEdit;
