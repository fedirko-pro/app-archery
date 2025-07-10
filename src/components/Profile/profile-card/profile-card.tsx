import React from 'react';
import {
  Avatar,
  Typography,
  Box,
  Grid,
  Button,
} from '@mui/material';
import type { ProfileData } from '../types';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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
              {!isAdminView && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/profile/edit')}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          ) : null}
        </Grid>
      </Grid>
    </div>
  );
};

export default ProfileCard; 