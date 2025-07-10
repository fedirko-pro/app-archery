import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
} from '@mui/material';
import './profile.scss';
import { useAuth } from '../../contexts/auth-context';
import ProfileCard from './profile-card/profile-card';
import type { ProfileData, PasswordChangeForm } from './types';
import type { User } from '../../contexts/types';

interface ProfileProps {
  userOverride?: User;
  isAdminView?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ userOverride, isAdminView = false }) => {
  const { user: authUser } = useAuth();
  
  const user = userOverride || authUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [setError] = useState<string | null>(null);
  const [setSuccess] = useState<string | null>(null);
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

  const [passwordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  
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
