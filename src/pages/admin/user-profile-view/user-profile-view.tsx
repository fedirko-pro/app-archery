import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Alert, CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import type { User } from '../../../contexts/types';
import apiService from '../../../services/api';
import ProfileCard from '../../profile/profile-card/profile-card';
import ProfileEditForm from '../../profile/profile-edit-form/profile-edit-form';
import type { ProfileData } from '../../profile/types';
import AdminActions from '../admin-actions/admin-actions';
import { useTranslation } from 'react-i18next';
import { getCurrentI18nLang } from '../../../utils/i18n-lang';

const UserProfileView: React.FC = () => {
  const { userId, lang } = useParams<{ userId: string; lang: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('common');

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    picture: '',
    categories: [],
  });

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
      setProfileData({
        firstName: foundUser.firstName || '',
        lastName: foundUser.lastName || '',
        email: foundUser.email || '',
        bio: foundUser.bio || '',
        location: foundUser.location || '',
        picture: foundUser.picture || '',
        categories: Array.isArray((foundUser as any).categories) ? (foundUser as any).categories : [],
      });
    } catch (error) {
      setError('Failed to fetch user data');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setProfileData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        bio: user?.bio || '',
        location: user?.location || '',
        picture: user?.picture || '',
        categories: Array.isArray((user as any)?.categories) ? (user as any).categories : [],
      });
    }
    setIsEditing(!isEditing);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedUser = await apiService.adminUpdateUser(
        user.id,
        profileData,
      );
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoriesChange = (categories: string[]) => {
    setProfileData((prev) => ({
      ...prev,
      categories: Array.isArray(categories) ? categories : [],
    }));
  };

  const handleEditUser = () => {
    navigate(`/${lang}/admin/users/${userId}/edit`);
  };

  const handleBack = () => {
    navigate(`/${lang}/admin/users`);
  };

  const getFullName = () => {
    const firstName = profileData.firstName || user?.firstName || '';
    const lastName = profileData.lastName || user?.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  };

  const getJoinDate = () => {
    if (user?.createdAt) {
      const date = new Date(user.createdAt);
      const locale = getCurrentI18nLang();
      const formatted = date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
      });
      return `${t('profile.joined', 'Joined')} ${formatted}`;
    }
    return t('profile.recentlyJoined', 'Recently joined');
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
        {!isEditing ? (
          <>
            <ProfileCard
              profileData={profileData}
              user={user}
              isEditing={isEditing}
              isAdminView={true}
              getFullName={getFullName}
              getJoinDate={getJoinDate}
            />
            <AdminActions
              userId={user.id}
              userEmail={user.email}
              onEditUser={handleEditUser}
            />
          </>
        ) : (
          <ProfileEditForm
            profileData={profileData}
            isSaving={isSaving}
            isAdminView={true}
            onSave={handleSave}
            onCancel={handleEditToggle}
            onChange={handleChange}
            onCategoriesChange={handleCategoriesChange}
            onPictureChange={(dataUrl) => {
              setProfileData((prev) => ({ ...prev, picture: dataUrl || '' }));
            }}
          />
        )}
      </div>
    </section>
  );
};

export default UserProfileView;
