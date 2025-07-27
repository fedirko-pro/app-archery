import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Alert, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ProfileCard from '../../profile/profile-card/profile-card';
import ProfileEditForm from '../../profile/profile-edit-form/profile-edit-form';
import AdminActions from '../admin-actions/admin-actions';
import apiService from '../../../services/api';
import type { User } from '../../../contexts/types';
import type { ProfileData } from '../../profile/types';

const UserProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    picture: '',
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
        website: foundUser.website || '',
        picture: foundUser.picture || '',
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
        website: user?.website || '',
        picture: user?.picture || '',
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

  const handleEditUser = () => {
    navigate(`/admin/users/${userId}/edit`);
  };

  const handleBack = () => {
    navigate('/admin/users');
  };

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
        month: 'long',
      })}`;
    }
    return 'Recently joined';
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
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          maxWidth: '900px',
          margin: '32px auto 24px auto',
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
      <div className="profile-container admin-profile-container">
        <Box sx={{ px: 0 }}>
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
            />
          )}
        </Box>
      </div>
    </>
  );
};

export default UserProfileView;
