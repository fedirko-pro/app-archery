import './profile.scss';

import { Box, CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';

import ProfileCard from './profile-card/profile-card';
import type { ProfileData } from './types';
import { useAuth } from '@/contexts/auth-context';
import type { User } from '@/contexts/types';

interface ProfileProps {
  userOverride?: User;
  isAdminView?: boolean;
}

const Profile: React.FC<ProfileProps> = ({
  userOverride,
  isAdminView = false,
}) => {
  const { user: authUser } = useAuth();
  const user = userOverride || authUser;

  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    picture: '',
    federationNumber: '',
    categories: [],
  });

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/auth/google/test`,
        );
        if (!response.ok) {
          console.error('Backend health check failed:', response.status);
        }
      } catch (error) {
        console.error('Backend health check error:', error);
      }
    };

    checkBackendHealth();
  }, []);

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
        federationNumber: user.federationNumber || '',
        categories: user.categories || [],
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
        federationNumber: user?.federationNumber || '',
        categories: user?.categories || [],
      });
    }
    setIsEditing(!isEditing);
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

  if (!user) {
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

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <ProfileCard
        profileData={profileData}
        user={user}
        isEditing={false}
        isAdminView={isAdminView}
        onEditToggle={handleEditToggle}
        getFullName={getFullName}
        getJoinDate={getJoinDate}
      />
    </Box>
  );
};

export default Profile;
