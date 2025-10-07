import { Avatar, Typography, Box, Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { ProfileData } from '../types';

interface ProfileCardProps {
  profileData: ProfileData;
  user: any;
  isEditing: boolean;
  isAdminView?: boolean;
  onEditToggle?: () => void;
  getFullName: () => string;
  getJoinDate: () => string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profileData,
  user,
  isEditing,
  isAdminView = false,
  getFullName,
  getJoinDate,
}) => {
  console.log('profileData', profileData);
  console.log('user', user);
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  return (
    <div className="profile-container">
      <Box className="profile-hero" />
      <Box
        className="profile-info"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
        }}
      >
        <Box className="profile-avatar-container" sx={{ flexShrink: 0 }}>
          <Avatar
            className="profile-avatar"
            alt={getFullName()}
            src={profileData.picture || user.picture}
            sx={{ width: 120, height: 120 }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
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
                  🌐{' '}
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profileData.website}
                  </a>
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {getJoinDate()}
              </Typography>
              {!isAdminView && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/profile/edit')}
                  sx={{ mt: 2 }}
                >
                  {t('profile.editProfile')}
                </Button>
              )}
            </div>
          ) : null}
        </Box>
      </Box>
    </div>
  );
};

export default ProfileCard;
