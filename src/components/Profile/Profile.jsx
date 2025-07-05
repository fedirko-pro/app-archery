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
} from '@mui/material';
import './Profile.scss';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    picture: '',
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
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
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
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
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
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
                  {isSaving ? <CircularProgress size={20} /> : 'Save'}
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
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Profile;
